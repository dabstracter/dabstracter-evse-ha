"""Target-time charging: 'ready by' time (draft for the start button)."""

from __future__ import annotations

from datetime import time

from homeassistant.components.time import TimeEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .coordinator import DabstracterConfigEntry
from .entity import DabstracterEntity

PARALLEL_UPDATES = 1


def parse_hm(value: object) -> time | None:
    """'07:00' -> time(7, 0)."""
    try:
        h, m = str(value).split(":")[:2]
        return time(int(h), int(m))
    except (ValueError, TypeError):
        return None


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DabstracterConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the plan time."""
    async_add_entities([DabPlanTime(entry.runtime_data)])


class DabPlanTime(DabstracterEntity, TimeEntity, RestoreEntity):
    """While a plan is active: its deadline; otherwise the remembered draft (default 07:00)."""

    _attr_translation_key = "plan_time"

    def __init__(self, coordinator) -> None:
        """Init."""
        super().__init__(coordinator, "plan_time")

    async def async_added_to_hass(self) -> None:
        """Restore the draft."""
        await super().async_added_to_hass()
        if (last := await self.async_get_last_state()) and (t := parse_hm(last.state)):
            self.coordinator.plan_time = t

    @property
    def native_value(self) -> time | None:
        """Plan deadline or draft."""
        plan = self.coordinator.data.status.get("plan") or {}
        if plan.get("active") and (t := parse_hm(plan.get("deadlineHm"))):
            return t
        return self.coordinator.plan_time

    async def async_set_value(self, value: time) -> None:
        """Only stores the draft; the button sends it."""
        self.coordinator.plan_time = value.replace(second=0, microsecond=0)
        self.async_write_ha_state()
