"""Data update coordinator for the DABSTRACTER EVSE."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .api import DabstracterApi, DabstracterAuthError, DabstracterError
from .const import DOMAIN, ENERGY_INTERVAL, SCAN_INTERVAL, STATUS_INTERVAL

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
    def today_wh(self) -> float | None:
        """Energy charged today (Wh)."""
        return self._bucket_wh("days", "today")

    @property
    def month_wh(self) -> float | None:
        """Energy charged this month (Wh)."""
        return self._bucket_wh("months", "month")

    @property
    def cost(self) -> dict[str, Any]:
        """energy.cost block (usedWh, limitWh, tier, price, on ...)."""
        return self.energy.get("cost") or {}


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
            update_interval=SCAN_INTERVAL,
        )
        self.api = api
        self._status_at: datetime | None = None
        self._energy_at: datetime | None = None
        self._force_slow = False
        self.last_ok: datetime | None = None  # time of the last successful poll (card footer)

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
            if force or self._status_at is None or now - self._status_at >= STATUS_INTERVAL:
                data.status = await self.api.get_status()
                self._status_at = now
            if force or self._energy_at is None or now - self._energy_at >= ENERGY_INTERVAL:
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
