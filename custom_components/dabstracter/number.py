"""Max current number (MAN: manual current, other modes: current cap)."""

from __future__ import annotations

from homeassistant.components.number import NumberDeviceClass, NumberEntity, NumberMode
from homeassistant.const import UnitOfElectricCurrent
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import DabstracterConfigEntry
from .entity import DabstracterEntity
from .helpers import run_command

PARALLEL_UPDATES = 1


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DabstracterConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the current number."""
    async_add_entities([DabMaxCurrent(entry.runtime_data)])


class DabMaxCurrent(DabstracterEntity, NumberEntity):
    """The firmware's maxA command: manual current in MAN, cap in PV / PV ECO / FAST."""

    _attr_translation_key = "max_current"
    _attr_device_class = NumberDeviceClass.CURRENT
    _attr_native_unit_of_measurement = UnitOfElectricCurrent.AMPERE
    _attr_native_step = 1
    _attr_native_max_value = 32
    _attr_mode = NumberMode.SLIDER

    def __init__(self, coordinator) -> None:
        """Init."""
        super().__init__(coordinator, "max_current")

    @property
    def native_min_value(self) -> float:
        """minA of the charger (default 6)."""
        return float(self.coordinator.data.mini.get("minA") or 6)

    @property
    def native_value(self) -> float | None:
        """manA in MAN mode, maxA otherwise."""
        m = self.coordinator.data.mini
        val = m.get("manA") if m.get("mode") == 0 else m.get("maxA")
        return None if val is None else float(val)

    @property
    def extra_state_attributes(self):
        """Both values, so a card can show what the slider means."""
        m = self.coordinator.data.mini
        return {"manual_current": m.get("manA"), "current_cap": m.get("maxA"), "fuse": m.get("fuse"), "phases": m.get("ph")}

    async def async_set_native_value(self, value: float) -> None:
        """Send {cmd: maxA}."""
        amps = int(round(value))
        await run_command(self.coordinator, "maxA", maxA=amps)
        m = self.coordinator.data.mini
        m["manA" if m.get("mode") == 0 else "maxA"] = amps
        self.async_write_ha_state()
