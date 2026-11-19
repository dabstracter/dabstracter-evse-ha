"""Data update coordinator for the DABSTRACTER EVSE."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, time, timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .api import DabstracterApi, DabstracterAuthError, DabstracterError
from .const import (
    CONF_ENERGY_INTERVAL,
    CONF_SCAN_INTERVAL,
    CONF_STATUS_INTERVAL,
    DOMAIN,
    ENERGY_INTERVAL,
    SCAN_INTERVAL,
    STATUS_INTERVAL,
)

_LOGGER = logging.getLogger(__name__)

type DabstracterConfigEntry = ConfigEntry[DabstracterCoordinator]


@dataclass
class DabstracterData:
    """Merged view of /api/mini (5 s), /api/status (30 s) and /api/energy (60 s)."""

    mini: dict[str, Any] = field(default_factory=dict)
    status: dict[str, Any] = field(default_factory=dict)
    energy: dict[str, Any] = field(default_factory=dict)

    # ---- helpers used by the entities
    def status_path(self, *keys: str) -> Any:
        """Nested lookup in /api/status, None when missing."""
        cur: Any = self.status
        for key in keys:
            if not isinstance(cur, dict):
                return None
            cur = cur.get(key)
        return cur

    def _bucket_wh(self, list_key: str, key_field: str) -> float | None:
        """Wh of today's / this month's record ([key, wh, whSolar, whBat, costC, saveC])."""
        key = self.energy.get(key_field)
        if not key:
            return None
        for rec in self.energy.get(list_key) or []:
            if isinstance(rec, list) and len(rec) > 1 and rec[0] == key:
                return float(rec[1])
        return 0.0

    @property
    def mini_has_energy(self) -> bool:
        """Firmware 2.8.110+ also sends today / month kWh in /api/mini."""
        return "todayWh" in self.mini

    @property
    def today_wh(self) -> float | None:
        """Energy charged today (Wh): /api/mini (5 s) when available, else /api/energy."""
        if self.mini_has_energy:
            return float(self.mini["todayWh"])
        return self._bucket_wh("days", "today")

    @property
    def month_wh(self) -> float | None:
        """Energy charged this month (Wh)."""
        if "monthWh" in self.mini:
            return float(self.mini["monthWh"])
        return self._bucket_wh("months", "month")

    @property
    def cost(self) -> dict[str, Any]:
        """energy.cost block (usedWh, limitWh, tier, price, on ...), fresher /api/mini values on top."""
        cost = dict(self.energy.get("cost") or {})
        if "bandUsedWh" in self.mini:
            cost.update(on=True, usedWh=self.mini["bandUsedWh"], limitWh=self.mini.get("bandLimitWh"))
            for key in ("tier", "price"):
                if key in self.mini:
                    cost[key] = self.mini[key]
        return cost

    @property
    def mac(self) -> str | None:
        """MAC address (firmware 2.8.110+)."""
        return (self.status.get("wifi") or {}).get("mac") or self.mini.get("mac")


class DabstracterCoordinator(DataUpdateCoordinator[DabstracterData]):
    """Polls one charger."""

    config_entry: DabstracterConfigEntry

    def __init__(
        self, hass: HomeAssistant, entry: DabstracterConfigEntry, api: DabstracterApi
    ) -> None:
        """Init."""
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN} {api.host}",
            update_interval=timedelta(seconds=entry.options.get(CONF_SCAN_INTERVAL, SCAN_INTERVAL.seconds)),
        )
        self._status_every = timedelta(seconds=entry.options.get(CONF_STATUS_INTERVAL, STATUS_INTERVAL.seconds))
        self._energy_every = timedelta(seconds=entry.options.get(CONF_ENERGY_INTERVAL, ENERGY_INTERVAL.seconds))
        self.api = api
        self._status_at: datetime | None = None
        self._energy_at: datetime | None = None
        self._force_slow = False
        self.last_ok: datetime | None = None  # time of the last successful poll (card footer)
        # target-time charging draft, set by the plan number / time entities (restored on restart)
        self.plan_kwh: float = 20.0
        self.plan_time: time = time(7, 0)

    def force_full_refresh(self) -> None:
        """Fetch /api/status and /api/energy on the next poll too (after a command)."""
        self._force_slow = True

    async def _async_update_data(self) -> DabstracterData:
        now = dt_util.utcnow()
        old = self.data or DabstracterData()
        data = DabstracterData(mini=old.mini, status=old.status, energy=old.energy)
        force = self._force_slow or not old.status
        self._force_slow = False
        try:
            data.mini = await self.api.get_mini()
            if force or self._status_at is None or now - self._status_at >= self._status_every:
                data.status = await self.api.get_status()
                self._status_at = now
            # with today / month kWh in /api/mini the big /api/energy is only needed for the totals
            energy_every = self._energy_every * 5 if data.mini_has_energy else self._energy_every
            if force or self._energy_at is None or now - self._energy_at >= energy_every:
                try:
                    data.energy = await self.api.get_energy()
                    self._energy_at = now
                except DabstracterAuthError:
                    raise
                except DabstracterError as err:
                    # big answer on a busy ESP32: keep the previous one, retry next poll
                    _LOGGER.debug("energy fetch failed, keeping old data: %s", err)
        except DabstracterAuthError as err:
            raise ConfigEntryAuthFailed(str(err)) from err
        except DabstracterError as err:
            raise UpdateFailed(str(err)) from err
        self.last_ok = dt_util.utcnow()
        return data
