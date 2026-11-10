"""Constants for the DABSTRACTER EVSE integration."""

from __future__ import annotations

from datetime import timedelta
from typing import Final

DOMAIN: Final = "dabstracter"
MANUFACTURER: Final = "DABSTRACTER"
MODEL: Final = "EVSE wallbox"

CONF_TOKEN: Final = "token"  # X-Display-Token (user role, limited endpoints)
CONF_USERNAME: Final = "username"
CONF_PASSWORD: Final = "password"

DEFAULT_USERNAME: Final = "user"
USERNAMES: Final = ("user", "admin")

# Polling: /api/mini is ~0.5 kB (live values), /api/status ~6 kB (plan, limit, device
# info), /api/energy carries the day / month / session history.
SCAN_INTERVAL: Final = timedelta(seconds=5)
STATUS_INTERVAL: Final = timedelta(seconds=30)
ENERGY_INTERVAL: Final = timedelta(seconds=60)

REQUEST_TIMEOUT: Final = 8

MODE_OPTIONS: Final = ("man", "pv", "pv_eco", "fast")  # select option keys, index = firmware mode

# ev.status codes (firmware 14_vezerles.ino statusInfo)
EV_STATUS: Final = {
    0: "selftest",
    1: "ready",
    2: "init",
    3: "connected",
    4: "connected_b2",
    5: "charging",
    6: "charging_vent",
    7: "cp_pe_short",
    8: "rcmu_fault",
    9: "diode_short",
    10: "over_dlb",
    11: "fault",
    19: "stopped",
}
EV_STATUS_OPTIONS: Final = [*EV_STATUS.values(), "unknown"]
CHARGING_STATES: Final = (5, 6)
CONNECTED_STATES: Final = (3, 4, 5, 6)

SERVICE_SET_LIMIT: Final = "set_limit"
SERVICE_SET_PLAN: Final = "set_plan"
ATTR_DEVICE_ID: Final = "device_id"
ATTR_TYPE: Final = "type"
ATTR_VALUE: Final = "value"
ATTR_START_SOC: Final = "start_soc"
ATTR_TIME: Final = "time"
ATTR_CLEAR: Final = "clear"
ATTR_CANCEL: Final = "cancel"
