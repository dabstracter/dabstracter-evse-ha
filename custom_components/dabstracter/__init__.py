"""The DABSTRACTER EVSE integration (local HTTP API, no cloud, no MQTT)."""

from __future__ import annotations

import logging
from pathlib import Path
import re
from typing import Any

import voluptuous as vol

from homeassistant.const import CONF_HOST, Platform
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse, callback
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv, device_registry as dr
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.typing import ConfigType

from .api import DabstracterApi, DabstracterCommandError, DabstracterError, DabstracterForbiddenError
from .const import (
    ATTR_CANCEL,
    ATTR_CLEAR,
    ATTR_DEVICE_ID,
    ATTR_START_SOC,
    ATTR_TIME,
    ATTR_TYPE,
    ATTR_VALUE,
    CONF_PASSWORD,
    CONF_TOKEN,
    CONF_USERNAME,
    DOMAIN,
    SERVICE_SET_LIMIT,
    SERVICE_SET_PLAN,
)
from .coordinator import DabstracterConfigEntry, DabstracterCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.SENSOR,
]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_HM = re.compile(r"^([01]?\d|2[0-3]):[0-5]\d$")

SET_LIMIT_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_DEVICE_ID): cv.string,
        vol.Optional(ATTR_CLEAR, default=False): cv.boolean,
        vol.Optional(ATTR_TYPE, default="soc"): vol.In(["soc", "kwh"]),
        vol.Optional(ATTR_VALUE): vol.All(vol.Coerce(float), vol.Range(min=0.1, max=200)),
        vol.Optional(ATTR_START_SOC): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
    }
)
SET_PLAN_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_DEVICE_ID): cv.string,
        vol.Optional(ATTR_CANCEL, default=False): cv.boolean,
        vol.Optional(ATTR_TYPE, default="kwh"): vol.In(["kwh", "km", "soc"]),
        vol.Optional(ATTR_VALUE): vol.All(vol.Coerce(float), vol.Range(min=0.1, max=2000)),
        vol.Optional(ATTR_START_SOC): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
        vol.Optional(ATTR_TIME): cv.string,
    }
)


CARD_URL = "/dabstracter/dabstracter-charger-card.js"


async def _register_card(hass: HomeAssistant) -> None:
    """Serve the bundled Lovelace card and load it on every dashboard (no manual resource)."""
    card = Path(__file__).parent / "www" / "dabstracter-charger-card.js"
    if (
        not card.is_file()
        or not {"http", "frontend"} <= hass.config.components
        or getattr(hass, "http", None) is None
    ):
        return
    try:
        from homeassistant.components.frontend import add_extra_js_url
        from homeassistant.components.http import StaticPathConfig

        await hass.http.async_register_static_paths([StaticPathConfig(CARD_URL, str(card), True)])
        version = hass.data.setdefault(f"{DOMAIN}_card", card.stat().st_mtime_ns)
        add_extra_js_url(hass, f"{CARD_URL}?v={version}")
    except (ImportError, RuntimeError, KeyError) as err:  # pragma: no cover
        _LOGGER.warning("Could not register the DABSTRACTER card: %s", err)


def _device_entry_ids(device: dr.DeviceEntry) -> set[str]:
    """Config entry ids of a device: config_entry_id on HA 2026.10+, config_entries before."""
    if cid := getattr(device, "config_entry_id", None):
        return {cid}
    return set(device.config_entries)


def _register_websocket(hass: HomeAssistant) -> None:
    """dabstracter/status: last successful poll for the card footer (no recorder writes)."""
    if "websocket_api" not in hass.config.components:
        return
    from homeassistant.components import websocket_api

    @websocket_api.websocket_command({vol.Required("type"): "dabstracter/status", vol.Required("device_id"): str})
    @callback
    def ws_status(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
        device = dr.async_get(hass).async_get(msg["device_id"])
        for entry in hass.config_entries.async_loaded_entries(DOMAIN):
            if device and entry.entry_id in _device_entry_ids(device):
                coord: DabstracterCoordinator = entry.runtime_data
                connection.send_result(
                    msg["id"],
                    {
                        "ok": coord.last_update_success,
                        "last_update": coord.last_ok.isoformat() if coord.last_ok else None,
                        "host": coord.api.host,
                    },
                )
                return
        connection.send_error(msg["id"], "not_found", "Unknown DABSTRACTER device")

    websocket_api.async_register_command(hass, ws_status)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register the services, the websocket command and the card once."""
    await _register_card(hass)
    _register_websocket(hass)

    async def _set_limit(call: ServiceCall) -> ServiceResponse:
        coord = _coordinator_for_call(hass, call)
        if call.data[ATTR_CLEAR]:
            payload: dict[str, Any] = {"clear": True}
        else:
            if ATTR_VALUE not in call.data:
                raise ServiceValidationError(
                    translation_domain=DOMAIN, translation_key="value_required"
                )
            payload = {"type": call.data[ATTR_TYPE], "value": call.data[ATTR_VALUE]}
            if ATTR_START_SOC in call.data:
                payload["startSoc"] = call.data[ATTR_START_SOC]
        return await _run(coord, coord.api.set_limit, payload)

    async def _set_plan(call: ServiceCall) -> ServiceResponse:
        coord = _coordinator_for_call(hass, call)
        if call.data[ATTR_CANCEL]:
            payload: dict[str, Any] = {"cancel": True}
        else:
            if ATTR_VALUE not in call.data or ATTR_TIME not in call.data:
                raise ServiceValidationError(
                    translation_domain=DOMAIN, translation_key="value_time_required"
                )
            hm = str(call.data[ATTR_TIME])[:5]
            if not _HM.match(hm):
                raise ServiceValidationError(
                    translation_domain=DOMAIN, translation_key="bad_time"
                )
            payload = {"type": call.data[ATTR_TYPE], "value": call.data[ATTR_VALUE], "time": hm}
            if ATTR_START_SOC in call.data:
                payload["startSoc"] = call.data[ATTR_START_SOC]
        return await _run(coord, coord.api.set_plan, payload)

    hass.services.async_register(
        DOMAIN, SERVICE_SET_LIMIT, _set_limit, SET_LIMIT_SCHEMA, supports_response=SupportsResponse.OPTIONAL
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_PLAN, _set_plan, SET_PLAN_SCHEMA, supports_response=SupportsResponse.OPTIONAL
    )
    return True


async def _run(coord: DabstracterCoordinator, func: Any, payload: dict[str, Any]) -> dict[str, Any]:
    if not coord.api.has_password:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="password_required")
    try:
        result = await func(payload)
    except DabstracterForbiddenError as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN, translation_key="forbidden", translation_placeholders={"msg": str(err)}
        ) from err
    except DabstracterCommandError as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN, translation_key="rejected", translation_placeholders={"msg": str(err)}
        ) from err
    except DabstracterError as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN, translation_key="comm_error", translation_placeholders={"msg": str(err)}
        ) from err
    coord.force_full_refresh()
    await coord.async_request_refresh()
    return result if isinstance(result, dict) else {}


def _coordinator_for_call(hass: HomeAssistant, call: ServiceCall) -> DabstracterCoordinator:
    entries: list[DabstracterConfigEntry] = [
        e for e in hass.config_entries.async_loaded_entries(DOMAIN)
    ]
    device_id = call.data.get(ATTR_DEVICE_ID)
    if device_id:
        device = dr.async_get(hass).async_get(device_id)
        if device:
            for entry in entries:
                if entry.entry_id in _device_entry_ids(device):
                    return entry.runtime_data
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_device")
    if len(entries) == 1:
        return entries[0].runtime_data
    raise ServiceValidationError(translation_domain=DOMAIN, translation_key="device_required")


async def async_setup_entry(hass: HomeAssistant, entry: DabstracterConfigEntry) -> bool:
    """Set up a charger from a config entry."""
    api = DabstracterApi(
        async_get_clientsession(hass),
        entry.data[CONF_HOST],
        token=entry.data.get(CONF_TOKEN),
        username=entry.data.get(CONF_USERNAME),
        password=entry.data.get(CONF_PASSWORD),
    )
    coordinator = DabstracterCoordinator(hass, entry, api)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: DabstracterConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
