"""Mode select (MAN / PV / PV ECO / FAST)."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import MODE_OPTIONS
from .coordinator import DabstracterConfigEntry
from .entity import DabstracterEntity
from .helpers import run_command

PARALLEL_UPDATES = 1


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DabstracterConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the mode select."""
    async_add_entities([DabModeSelect(entry.runtime_data)])


class DabModeSelect(DabstracterEntity, SelectEntity):
    """Charging mode."""

    _attr_translation_key = "mode"
    _attr_options = list(MODE_OPTIONS)

    def __init__(self, coordinator) -> None:
        """Init."""
        super().__init__(coordinator, "mode_select")

    @property
    def current_option(self) -> str | None:
        """Mode from /api/mini."""
        mode = self.coordinator.data.mini.get("mode")
        if isinstance(mode, int) and 0 <= mode < len(MODE_OPTIONS):
            return MODE_OPTIONS[mode]
        return None

    async def async_select_option(self, option: str) -> None:
        """Send {cmd: mode}."""
        mode = MODE_OPTIONS.index(option)
        await run_command(self.coordinator, "mode", mode=mode)
        self.coordinator.data.mini["mode"] = mode  # optimistic until the next poll
        self.async_write_ha_state()
