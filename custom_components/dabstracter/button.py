"""START / STOP / CP wake buttons."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity, ButtonEntityDescription
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import DabstracterConfigEntry
from .entity import DabstracterEntity
from .helpers import run_command

PARALLEL_UPDATES = 1

BUTTONS: tuple[ButtonEntityDescription, ...] = (
    ButtonEntityDescription(key="start", translation_key="start"),
    ButtonEntityDescription(key="stop", translation_key="stop"),
    ButtonEntityDescription(key="cpwake", translation_key="cpwake"),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DabstracterConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add buttons."""
    async_add_entities(DabButton(entry.runtime_data, desc) for desc in BUTTONS)


class DabButton(DabstracterEntity, ButtonEntity):
    """One /api/cmd command."""

    def __init__(self, coordinator, description: ButtonEntityDescription) -> None:
        """Init."""
        super().__init__(coordinator, description.key)
        self.entity_description = description

    async def async_press(self) -> None:
        """Send the command."""
        await run_command(self.coordinator, self.entity_description.key)
