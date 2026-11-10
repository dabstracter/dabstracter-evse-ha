"""Sensors for the DABSTRACTER EVSE."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import (
    PERCENTAGE,
    SIGNAL_STRENGTH_DECIBELS_MILLIWATT,
    EntityCategory,
    UnitOfElectricCurrent,
    UnitOfEnergy,
    UnitOfPower,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import EV_STATUS, EV_STATUS_OPTIONS
from .coordinator import DabstracterConfigEntry, DabstracterData
from .entity import DabstracterEntity

PARALLEL_UPDATES = 0


def _kwh(wh: Any) -> float | None:
    return None if wh is None else round(float(wh) / 1000.0, 3)


def _num(value: Any) -> float | None:
    try:
        return None if value is None else float(value)
    except (TypeError, ValueError):
        return None


def _ev_status(d: DabstracterData) -> str | None:
    st = d.mini.get("st")
    if st is None:
        return None
    if d.mini.get("ok") is False and d.mini.get("stTxt") == "NINCS ADAT":
        return "unknown"
    return EV_STATUS.get(int(st), "unknown")


def _session_kwh(d: DabstracterData) -> float | None:
    if "sessWh" in d.mini:
        return _kwh(d.mini["sessWh"])
    cur = d.energy.get("cur") or {}
    return _kwh(cur.get("wh", 0))


def _band_pct(d: DabstracterData) -> float | None:
    used, limit = d.cost.get("usedWh"), d.cost.get("limitWh")
    if used is None or not limit:
        return None
    return round(float(used) / float(limit) * 100.0, 1)


@dataclass(frozen=True, kw_only=True)
class DabSensorDescription(SensorEntityDescription):
    """Sensor with a value function."""

    value_fn: Callable[[DabstracterData], Any]
    available_fn: Callable[[DabstracterData], bool] = lambda d: True
    attrs_fn: Callable[[DabstracterData], dict[str, Any]] | None = None


SENSORS: tuple[DabSensorDescription, ...] = (
    DabSensorDescription(
        key="charging_power",
        translation_key="charging_power",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
        suggested_display_precision=0,
        value_fn=lambda d: _num(d.mini.get("pW")),
    ),
    DabSensorDescription(
        key="charging_current",
        translation_key="charging_current",
        device_class=SensorDeviceClass.CURRENT,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfElectricCurrent.AMPERE,
        suggested_display_precision=1,
        value_fn=lambda d: _num(d.mini.get("a")),
    ),
    DabSensorDescription(
        key="set_current",
        translation_key="set_current",
        device_class=SensorDeviceClass.CURRENT,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfElectricCurrent.AMPERE,
        entity_registry_enabled_default=False,
        value_fn=lambda d: v if (v := _num(d.mini.get("setA"))) is not None and v >= 0 else None,
    ),
    DabSensorDescription(
        key="ev_status",
        translation_key="ev_status",
        device_class=SensorDeviceClass.ENUM,
        options=EV_STATUS_OPTIONS,
        value_fn=_ev_status,
        attrs_fn=lambda d: {"code": d.mini.get("st"), "text": d.mini.get("stTxt"), "full": d.status_path("ev", "full")},
    ),
    DabSensorDescription(
        key="mode",
        translation_key="mode_sensor",
        entity_registry_enabled_default=False,
        value_fn=lambda d: ("MAN", "PV", "PV ECO", "FAST")[m] if isinstance(m := d.mini.get("mode"), int) and 0 <= m <= 3 else None,
    ),
    DabSensorDescription(
        key="session_energy",
        translation_key="session_energy",
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL_INCREASING,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=2,
        value_fn=_session_kwh,
        attrs_fn=lambda d: {"duration_s": d.mini.get("sessS"), "cost": d.mini.get("sessFt")},
    ),
    DabSensorDescription(
        key="total_energy",
        translation_key="total_energy",
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL_INCREASING,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
        value_fn=lambda d: _kwh(d.energy.get("total")),
        attrs_fn=lambda d: {"solar_kwh": _kwh(d.energy.get("totalSolar")), "battery_kwh": _kwh(d.energy.get("totalBat"))},
    ),
    DabSensorDescription(
        key="today_energy",
        translation_key="today_energy",
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL_INCREASING,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=2,
        value_fn=lambda d: _kwh(d.today_wh),
    ),
    DabSensorDescription(
        key="month_energy",
        translation_key="month_energy",
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL_INCREASING,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
        value_fn=lambda d: _kwh(d.month_wh),
    ),
    DabSensorDescription(
        key="price",
        translation_key="price",
        native_unit_of_measurement="HUF/kWh",
        suggested_display_precision=2,
        available_fn=lambda d: bool(d.cost.get("on")),
        value_fn=lambda d: _num(d.cost.get("price")),
        attrs_fn=lambda d: {"tier": d.cost.get("tier"), "low": d.cost.get("low"), "high": d.cost.get("high")},
    ),
    DabSensorDescription(
        key="band_used",
        translation_key="band_used",
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL_INCREASING,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
        available_fn=lambda d: bool(d.cost.get("on")),
        value_fn=lambda d: _kwh(d.cost.get("usedWh")),
        attrs_fn=lambda d: {
            "percent": _band_pct(d),
            "tier": d.cost.get("tier"),
            "period": d.cost.get("period"),
            "monthly": d.cost.get("monthly"),
            "partial": d.cost.get("partial"),
        },
    ),
    DabSensorDescription(
        key="band_limit",
        translation_key="band_limit",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=0,
        available_fn=lambda d: bool(d.cost.get("on")),
        value_fn=lambda d: _kwh(d.cost.get("limitWh")),
    ),
    DabSensorDescription(
        key="pv_power",
        translation_key="pv_power",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
        value_fn=lambda d: _num(d.mini.get("pv")),
    ),
    DabSensorDescription(
        key="grid_power",
        translation_key="grid_power",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
        value_fn=lambda d: _num(d.mini.get("grid")),
    ),
    DabSensorDescription(
        key="house_power",
        translation_key="house_power",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
        value_fn=lambda d: _num(d.mini.get("house")),
    ),
    DabSensorDescription(
        key="battery_power",
        translation_key="battery_power",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
        value_fn=lambda d: _num(d.mini.get("batW")),
    ),
    DabSensorDescription(
        key="battery_soc",
        translation_key="battery_soc",
        device_class=SensorDeviceClass.BATTERY,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
        value_fn=lambda d: _num(d.mini.get("soc")),
    ),
    DabSensorDescription(
        key="wifi_rssi",
        translation_key="wifi_rssi",
        device_class=SensorDeviceClass.SIGNAL_STRENGTH,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=SIGNAL_STRENGTH_DECIBELS_MILLIWATT,
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda d: _num(d.mini.get("rssi")),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DabstracterConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add sensors."""
    coordinator = entry.runtime_data
    async_add_entities(DabSensor(coordinator, desc) for desc in SENSORS)


class DabSensor(DabstracterEntity, SensorEntity):
    """One value of the charger."""

    entity_description: DabSensorDescription

    def __init__(self, coordinator, description: DabSensorDescription) -> None:
        """Init."""
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def available(self) -> bool:
        """Coordinator OK and the value makes sense."""
        return super().available and self.entity_description.available_fn(self.coordinator.data)

    @property
    def native_value(self) -> Any:
        """Current value."""
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Extra attributes."""
        if self.entity_description.attrs_fn is None:
            return None
        return self.entity_description.attrs_fn(self.coordinator.data)
