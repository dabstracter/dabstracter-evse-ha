"""Buttons: START / STOP / CP wake, start / cancel target-time charging."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity, ButtonEntityDescription
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import DabstracterConfigEntry
from .entity import DabstracterEntity
from .helpers import run_api, run_command

PARALLEL_UPDATES = 1

BUTTONS: tuple[ButtonEntityDescription, ...] = (
    ButtonEntityDescription(key="start", translation_key="start"),
    ButtonEntityDescription(key="stop", translation_key="stop"),
    ButtonEntityDescription(key="cpwake", translation_key="cpwake"),
    ButtonEntityDescription(key="plan_start", translation_key="plan_start"),
    ButtonEntityDescription(key="plan_cancel", translation_key="plan_cancel"),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DabstracterConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add buttons."""
    async_add_entities(DabButton(entry.runtime_data, desc) for desc in BUTTONS)


class DabButton(DabstracterEntity, ButtonEntity):
    """One /api/cmd command, or a target-time charging action."""

    def __init__(self, coordinator, description: ButtonEntityDescription) -> None:
        """Init."""
        super().__init__(coordinator, description.key)
        self.entity_description = description

    async def async_press(self) -> None:
        """Send the command."""
        key = self.entity_description.key
        coord = self.coordinator
        if key == "plan_start":
            payload = {"type": "kwh", "value": coord.plan_kwh, "time": coord.plan_time.strftime("%H:%M")}
            await run_api(coord, coord.api.set_plan, payload)
        elif key == "plan_cancel":
            await run_api(coord, coord.api.set_plan, {"cancel": True})
        else:
            await run_command(coord, key)
