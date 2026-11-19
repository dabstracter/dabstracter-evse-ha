"""Numbers: max current, charging limit (% / kWh), target-time charging energy."""

from __future__ import annotations

from typing import Any

from homeassistant.components.number import NumberDeviceClass, NumberEntity, NumberMode, RestoreNumber
from homeassistant.const import PERCENTAGE, UnitOfElectricCurrent, UnitOfEnergy
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import DabstracterConfigEntry
from .entity import DabstracterEntity
from .helpers import run_api, run_command

PARALLEL_UPDATES = 1


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DabstracterConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the numbers."""
    coordinator = entry.runtime_data
    async_add_entities(
        [
            DabMaxCurrent(coordinator),
            DabLimit(coordinator, "soc"),
            DabLimit(coordinator, "kwh"),
            DabPlanEnergy(coordinator),
        ]
    )


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


class DabLimit(DabstracterEntity, NumberEntity):
    """Charging limit as a number: 0 = no limit, otherwise POST /api/limit {type, value}.

    The firmware keeps one limit; the % and the kWh entity show 0 when the other type is active.
    """

    _attr_mode = NumberMode.BOX
    _attr_native_min_value = 0

    def __init__(self, coordinator, kind: str) -> None:
        """Init: kind is "soc" or "kwh"."""
        super().__init__(coordinator, f"limit_{kind}")
        self._kind = kind
        self._attr_translation_key = f"limit_{kind}"
        if kind == "soc":
            self._attr_native_unit_of_measurement = PERCENTAGE
            self._attr_native_max_value = 100
            self._attr_native_step = 5
        else:
            self._attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
            self._attr_device_class = NumberDeviceClass.ENERGY
            self._attr_native_max_value = 150
            self._attr_native_step = 1

    @property
    def native_value(self) -> float | None:
        """Active limit of this type, else 0."""
        lim = self.coordinator.data.status.get("limit") or {}
        if lim.get("active") and lim.get("type") == self._kind:
            try:
                return float(lim.get("value"))
            except (TypeError, ValueError):
                return None
        return 0.0

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Remaining energy of an active limit."""
        lim = self.coordinator.data.status.get("limit") or {}
        if not (lim.get("active") and lim.get("type") == self._kind):
            return None
        return {"remaining_wh": lim.get("remainWh"), "eta_s": lim.get("etaS")}

    async def async_set_native_value(self, value: float) -> None:
        """0 clears the limit, anything else sets it."""
        payload: dict[str, Any] = {"clear": True} if value <= 0 else {"type": self._kind, "value": value}
        await run_api(self.coordinator, self.coordinator.api.set_limit, payload)


class DabPlanEnergy(DabstracterEntity, RestoreNumber):
    """kWh for target-time charging; used by the 'Start target-time charging' button.

    While a plan is active it shows the plan's value; otherwise the remembered draft.
    """

    _attr_translation_key = "plan_energy"
    _attr_device_class = NumberDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
    _attr_native_min_value = 1
    _attr_native_max_value = 150
    _attr_native_step = 1
    _attr_mode = NumberMode.BOX

    def __init__(self, coordinator) -> None:
        """Init."""
        super().__init__(coordinator, "plan_energy")

    async def async_added_to_hass(self) -> None:
        """Restore the draft value."""
        await super().async_added_to_hass()
        if (last := await self.async_get_last_number_data()) and last.native_value is not None:
            self.coordinator.plan_kwh = float(last.native_value)

    @property
    def native_value(self) -> float | None:
        """Active plan kWh, or the draft."""
        plan = self.coordinator.data.status.get("plan") or {}
        if plan.get("active") and plan.get("type") == "kwh" and plan.get("value") is not None:
            return float(plan["value"])
        return self.coordinator.plan_kwh

    async def async_set_native_value(self, value: float) -> None:
        """Only stores the draft; the button sends it."""
        self.coordinator.plan_kwh = float(value)
        self.async_write_ha_state()
