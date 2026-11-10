"""Config flow for the DABSTRACTER EVSE."""

from __future__ import annotations

from collections.abc import Mapping
import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_HOST
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

try:  # HA 2025.1+
    from homeassistant.helpers.service_info.zeroconf import ZeroconfServiceInfo
except ImportError:  # pragma: no cover
    from homeassistant.components.zeroconf import ZeroconfServiceInfo  # type: ignore[attr-defined]

from .api import (
    DabstracterApi,
    DabstracterAuthError,
    DabstracterConnectionError,
    DabstracterError,
    normalize_host,
    probe,
)
from .const import CONF_PASSWORD, CONF_TOKEN, CONF_USERNAME, DEFAULT_USERNAME, DOMAIN, USERNAMES

_LOGGER = logging.getLogger(__name__)

_PASSWORD = TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))
_USER_SEL = SelectSelector(
    SelectSelectorConfig(options=list(USERNAMES), mode=SelectSelectorMode.DROPDOWN, translation_key="username")
)


def _cred_schema(defaults: Mapping[str, Any]) -> dict[Any, Any]:
    return {
        vol.Optional(CONF_TOKEN, default=defaults.get(CONF_TOKEN, "")): _PASSWORD,
        vol.Optional(CONF_USERNAME, default=defaults.get(CONF_USERNAME, DEFAULT_USERNAME)): _USER_SEL,
        vol.Optional(CONF_PASSWORD, default=defaults.get(CONF_PASSWORD, "")): _PASSWORD,
    }


def _clean(data: Mapping[str, Any]) -> dict[str, Any]:
    out = {k: v.strip() if isinstance(v, str) else v for k, v in data.items()}
    if not out.get(CONF_TOKEN):
        out.pop(CONF_TOKEN, None)
    if not out.get(CONF_PASSWORD):
        out.pop(CONF_PASSWORD, None)
        out.pop(CONF_USERNAME, None)
    return out


class DabstracterConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow."""

    VERSION = 1

    def __init__(self) -> None:
        """Init."""
        self._host: str | None = None
        self._name: str | None = None

    async def _validate(self, data: Mapping[str, Any]) -> tuple[dict[str, Any], dict[str, str]]:
        """Try the credentials. Returns (status json, errors)."""
        api = DabstracterApi(
            async_get_clientsession(self.hass),
            data[CONF_HOST],
            token=data.get(CONF_TOKEN),
            username=data.get(CONF_USERNAME),
            password=data.get(CONF_PASSWORD),
        )
        try:
            if api.has_password:
                await api.login()  # password checked even when a token is given too
            status = await api.get_status()
        except DabstracterAuthError:
            return {}, {"base": "invalid_auth"}
        except DabstracterConnectionError:
            return {}, {"base": "cannot_connect"}
        except DabstracterError:
            _LOGGER.exception("Unexpected answer from %s", data[CONF_HOST])
            return {}, {"base": "unknown"}
        if "dlm" not in status or "ev" not in status:
            return {}, {"base": "not_dabstracter"}
        role = (status.get("auth") or {}).get("role")
        if role not in ("user", "admin"):
            # viewer password: reading works, START / STOP / mode would answer 403
            return {}, {"base": "role_too_low"}
        return status, {}

    @staticmethod
    def _unique_id(status: Mapping[str, Any], host: str) -> str:
        name = ((status.get("wifi") or {}).get("host") or host).strip().lower()
        return name.removesuffix(".local")

    # ------------------------------------------------------------------ user
    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Manual setup: host + display token and / or password."""
        errors: dict[str, str] = {}
        if user_input is not None:
            data = _clean(user_input)
            data[CONF_HOST] = normalize_host(data[CONF_HOST])
            status, errors = await self._validate(data)
            if not errors:
                await self.async_set_unique_id(self._unique_id(status, data[CONF_HOST]))
                self._abort_if_unique_id_configured(updates={CONF_HOST: data[CONF_HOST]})
                return self.async_create_entry(title=self._title(status, data[CONF_HOST]), data=data)
        defaults = user_input or {}
        schema = vol.Schema(
            {vol.Required(CONF_HOST, default=defaults.get(CONF_HOST, self._host or "")): str, **_cred_schema(defaults)}
        )
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    @staticmethod
    def _title(status: Mapping[str, Any], host: str) -> str:
        return f"DABSTRACTER {(status.get('wifi') or {}).get('host') or host}"

    # ------------------------------------------------------------------ zeroconf
    async def async_step_zeroconf(self, discovery_info: ZeroconfServiceInfo) -> ConfigFlowResult:
        """A _http._tcp host whose name matched the manifest filter."""
        host = discovery_info.host
        if discovery_info.port and discovery_info.port != 80:
            host = f"{host}:{discovery_info.port}"
        if not await probe(async_get_clientsession(self.hass), host):
            return self.async_abort(reason="not_dabstracter")
        name = (discovery_info.hostname or discovery_info.name or host).split(".")[0].lower()
        await self.async_set_unique_id(name)
        self._abort_if_unique_id_configured(updates={CONF_HOST: host})
        self._host, self._name = host, name
        self.context["title_placeholders"] = {"name": name}
        return await self.async_step_zeroconf_confirm()

    async def async_step_zeroconf_confirm(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Ask for the credentials of a discovered charger."""
        assert self._host
        errors: dict[str, str] = {}
        if user_input is not None:
            data = _clean(user_input)
            data[CONF_HOST] = self._host
            status, errors = await self._validate(data)
            if not errors:
                return self.async_create_entry(title=self._title(status, self._host), data=data)
        return self.async_show_form(
            step_id="zeroconf_confirm",
            data_schema=vol.Schema(_cred_schema(user_input or {})),
            errors=errors,
            description_placeholders={"name": self._name or self._host, "host": self._host},
        )

    # ------------------------------------------------------------------ reauth
    async def async_step_reauth(self, entry_data: Mapping[str, Any]) -> ConfigFlowResult:
        """Credentials stopped working."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """New token / password."""
        entry = self._get_reauth_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            data = _clean(user_input)
            data[CONF_HOST] = entry.data[CONF_HOST]
            _status, errors = await self._validate(data)
            if not errors:
                return self.async_update_reload_and_abort(entry, data=data)
        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=vol.Schema(_cred_schema({CONF_USERNAME: entry.data.get(CONF_USERNAME, DEFAULT_USERNAME)})),
            errors=errors,
            description_placeholders={"host": entry.data[CONF_HOST]},
        )

    # ------------------------------------------------------------------ reconfigure
    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Change host / credentials."""
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            data = _clean(user_input)
            data[CONF_HOST] = normalize_host(data[CONF_HOST])
            status, errors = await self._validate(data)
            if not errors:
                await self.async_set_unique_id(self._unique_id(status, data[CONF_HOST]))
                self._abort_if_unique_id_mismatch(reason="wrong_device")
                return self.async_update_reload_and_abort(entry, data=data)
        schema = vol.Schema(
            {
                vol.Required(CONF_HOST, default=entry.data[CONF_HOST]): str,
                **_cred_schema({CONF_USERNAME: entry.data.get(CONF_USERNAME, DEFAULT_USERNAME)}),
            }
        )
        return self.async_show_form(step_id="reconfigure", data_schema=schema, errors=errors)
