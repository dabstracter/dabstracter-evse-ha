"""Binary sensors for the DABSTRACTER EVSE."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import CHARGING_STATES, CONNECTED_STATES
from .coordinator import DabstracterConfigEntry, DabstracterData
from .entity import DabstracterEntity

PARALLEL_UPDATES = 0


def _status(d: DabstracterData) -> int | None:
    st = d.mini.get("st")
    return int(st) if isinstance(st, int) else None


@dataclass(frozen=True, kw_only=True)
class DabBinaryDescription(BinarySensorEntityDescription):
    """Binary sensor with a value function."""

    value_fn: Callable[[DabstracterData], bool | None]


BINARY_SENSORS: tuple[DabBinaryDescription, ...] = (
    DabBinaryDescription(
        key="charging",
        translation_key="charging",
        device_class=BinarySensorDeviceClass.BATTERY_CHARGING,
        value_fn=lambda d: bool(d.mini.get("chg")) if "chg" in d.mini else (_status(d) in CHARGING_STATES),
    ),
    DabBinaryDescription(
        key="car_connected",
        translation_key="car_connected",
        device_class=BinarySensorDeviceClass.PLUG,
        value_fn=lambda d: None if _status(d) is None else _status(d) in CONNECTED_STATES,
    ),
    DabBinaryDescription(
        key="limit_active",
        translation_key="limit_active",
        value_fn=lambda d: bool(d.status_path("limit", "active")),
    ),
    DabBinaryDescription(
        key="plan_active",
        translation_key="plan_active",
        value_fn=lambda d: bool(d.status_path("plan", "active")),
    ),
    DabBinaryDescription(
        key="fail_safe",
        translation_key="fail_safe",
        device_class=BinarySensorDeviceClass.PROBLEM,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: bool(d.mini.get("failSafe") or d.mini.get("safety")),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DabstracterConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add binary sensors."""
    coordinator = entry.runtime_data
    async_add_entities(DabBinarySensor(coordinator, desc) for desc in BINARY_SENSORS)


class DabBinarySensor(DabstracterEntity, BinarySensorEntity):
    """On / off state of the charger."""

    entity_description: DabBinaryDescription

    def __init__(self, coordinator, description: DabBinaryDescription) -> None:
        """Init."""
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def is_on(self) -> bool | None:
        """State."""
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self):
        """Limit / plan details."""
        key = self.entity_description.key
        if key == "limit_active":
            return self.coordinator.data.status.get("limit") or None
        if key == "plan_active":
            plan = dict(self.coordinator.data.status.get("plan") or {})
            plan.pop("car", None)
            return plan or None
        return None
