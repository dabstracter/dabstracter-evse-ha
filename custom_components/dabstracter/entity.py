"""Base entity for the DABSTRACTER EVSE."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, MANUFACTURER, MODEL
from .coordinator import DabstracterCoordinator


class DabstracterEntity(CoordinatorEntity[DabstracterCoordinator]):
    """Common device info and unique id."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: DabstracterCoordinator, key: str) -> None:
        """Init."""
        super().__init__(coordinator)
        uid = coordinator.config_entry.unique_id or coordinator.config_entry.entry_id
        self._attr_unique_id = f"{uid}_{key}"
        data = coordinator.data
        fw = (data.status.get("health") or {}).get("firmware") or data.mini.get("fw")
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, uid)},
            manufacturer=MANUFACTURER,
            model=MODEL,
            name=f"DABSTRACTER {(data.status.get('wifi') or {}).get('host') or coordinator.api.host}",
            sw_version=fw,
            hw_version=(data.status.get("health") or {}).get("board"),
            configuration_url=coordinator.api.base_url,
        )
