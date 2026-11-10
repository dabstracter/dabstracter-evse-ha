"""Diagnostics for the DABSTRACTER EVSE."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from .const import CONF_PASSWORD, CONF_TOKEN
from .coordinator import DabstracterConfigEntry

TO_REDACT = {
    CONF_TOKEN,
    CONF_PASSWORD,
    "ip",
    "gw",
    "dns",
    "mask",
    "bssid",
    "aps",
    "ssid",
    "serial",
    "deviceId",
    "pvIp",
    "mqttUri",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: DabstracterConfigEntry
) -> dict[str, Any]:
    """Config (secrets redacted) and the last answers of the charger."""
    coordinator = entry.runtime_data
    data = coordinator.data
    energy = dict(data.energy)
    for key in ("days", "months", "sessions"):  # keep it short: counts only
        if isinstance(energy.get(key), list):
            energy[key] = f"{len(energy[key])} records"
    return {
        "entry": async_redact_data(dict(entry.data), TO_REDACT),
        "auth": {"token": coordinator.api.has_token, "password": coordinator.api.has_password},
        "last_update_success": coordinator.last_update_success,
        "mini": async_redact_data(data.mini, TO_REDACT),
        "status": async_redact_data(data.status, TO_REDACT),
        "energy": async_redact_data(energy, TO_REDACT),
    }
