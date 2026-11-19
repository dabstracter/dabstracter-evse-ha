"""Warn (Repairs) when the same charger is also in Home Assistant through MQTT discovery.

The firmware's MQTT HA discovery creates a device with the identifier ("mqtt", "devse_<mac>")
(11_mqtt.ino). Running both gives every value twice, so we raise a Repairs warning while such a
device exists. Firmware 2.8.110+ reports its devId, then only that exact device counts; with older
firmware any devse_* MQTT device does.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, issue_registry as ir

from .const import DOMAIN
from .coordinator import DabstracterConfigEntry


def _dev_id(entry: DabstracterConfigEntry) -> str | None:
    data = entry.runtime_data.data
    return data.status.get("devId") or data.mini.get("devId")


def find_mqtt_duplicate(hass: HomeAssistant, entry: DabstracterConfigEntry) -> dr.DeviceEntry | None:
    """The MQTT discovery device of this charger, if any."""
    want = _dev_id(entry)
    reg = dr.async_get(hass)
    # HA 2026.10+: iterating `devices` gives the entries; before it was a dict of id -> entry
    devices: list[Any] = list(reg.devices)
    if devices and isinstance(devices[0], str):
        devices = list(reg.devices.values())
    for device in devices:
        for domain, ident in device.identifiers:
            if domain == "mqtt" and isinstance(ident, str) and ident.startswith("devse_") and (not want or ident == want):
                return device
    return None


@callback
def async_track_mqtt_duplicate(hass: HomeAssistant, entry: DabstracterConfigEntry) -> None:
    """Check now and whenever the device registry changes."""
    issue_id = f"mqtt_duplicate_{entry.entry_id}"

    @callback
    def _check(_event: Event[Any] | None = None) -> None:
        device = find_mqtt_duplicate(hass, entry)
        if device is None:
            ir.async_delete_issue(hass, DOMAIN, issue_id)
            return
        ir.async_create_issue(
            hass,
            DOMAIN,
            issue_id,
            is_fixable=False,
            is_persistent=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key="mqtt_duplicate",
            translation_placeholders={
                "mqtt_name": device.name_by_user or device.name or "DABSTRACTER EVSE",
                "name": entry.title,
            },
        )

    _check()
    entry.async_on_unload(hass.bus.async_listen(dr.EVENT_DEVICE_REGISTRY_UPDATED, _check))
    entry.async_on_unload(lambda: ir.async_delete_issue(hass, DOMAIN, issue_id))
