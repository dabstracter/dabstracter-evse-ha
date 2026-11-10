# DABSTRACTER EVSE – Home Assistant integration + charger card

Native Home Assistant integration for the DABSTRACTER EVSE wallbox. It talks to the charger over the
**local Wi-Fi HTTP API** — no MQTT, no cloud, works offline. The package includes a phone-first Lovelace
card (`dabstracter-charger-card`) that the integration loads automatically.

[Magyar leírás → README.hu.md](README.hu.md)

| | |
|---|---|
| Version | 0.2.4 ([changelog](CHANGELOG.md)) |
| Home Assistant | 2025.1 or newer (logo display needs 2026.x) |
| Charger firmware | 2.8.76 or newer (`/api/mini`) |
| Connection | local HTTP polling (`local_polling`) |
| License | [MIT](LICENSE) |

## Contents

- [MQTT or this integration?](#mqtt-or-this-integration-pick-one)
- [Installation](#installation) · [Setup](#setup) · [Entities](#entities) · [Services](#services)
- [Charger card](#charger-card) · [Troubleshooting](#troubleshooting) · [How it works](#how-it-works)

## MQTT or this integration? Pick one

The charger firmware can also publish **MQTT Home Assistant discovery** (Config → MQTT → “HA discovery”).
If you enable both, every measurement appears **twice** (two devices, duplicated entities).

| | This integration (HTTP) | MQTT discovery (firmware) |
|---|---|---|
| Needs | charger IP / hostname only | MQTT broker (e.g. Mosquitto add-on) |
| Updates | poll: 5 s live, 30 s status, 60 s energy | push, at the firmware publish rate |
| Control | START / STOP / CP wake, mode, current, **charge limit, deadline plan** | START / STOP, mode, current |
| Energy data | session, total, today, month kWh, price, discounted band | as published by firmware MQTT |
| Charger card | automatic, entity discovery | pick entities manually |
| Discovery | zeroconf (`devse*` / `dabstracter*` on `_http._tcp`) | MQTT discovery |

**Recommendation:** if you are not already on MQTT, use this integration. When switching, disable
*HA discovery* (or MQTT entirely) on the charger, then delete the old MQTT device in Home Assistant
(Settings → Devices → MQTT device → ⋮ → Delete).

## Installation

### With HACS
1. HACS → ⋮ → *Custom repositories* → URL: `https://github.com/dabstracter/dabstracter-evse-ha`, type: **Integration**.
2. Search for **DABSTRACTER EVSE** → *Download*.
3. Restart Home Assistant.

### Manual
1. Copy the full `custom_components/dabstracter` folder into your HA `config/custom_components/`
   (including `brand`, `translations`, and `www`). Correct path:
   `config/custom_components/dabstracter/manifest.json`.
2. Restart Home Assistant (Settings → System → power icon → *Restart*). Reloading YAML is not enough.
3. Hard-refresh the browser (Ctrl+F5) so the logo and card load.

To update: overwrite the folder the same way, then restart.

## Setup

### 1. Credentials from the charger
- **Display token:** on the charger web UI as **admin**: Config → Display. Generate one if needed.
  Enough for status, START / STOP, mode, and current.
- **Password:** `user` or `admin` password. **Required for charge limit and deadline plan** — the firmware
  does not allow those with the display token alone.
- You can provide both: polling uses the token; limit / plan use the password.
- If the charger has no admin password (open UI), leave the fields empty.
- A `viewer` password is rejected: it cannot control the charger.

### 2. Add the integration
*Settings → Devices & services → Add integration → DABSTRACTER EVSE.* If the charger hostname starts with
`devse…` or `dabstracter…`, Home Assistant may also offer it under “Discovered”.

| Field | Purpose |
|---|---|
| Hostname or IP | e.g. `192.168.1.50` or `devse.local`. IP is more reliable — reserve a DHCP lease |
| Display token | see above |
| Username + password | `user` or `admin` + password |

Later: integration ⋮ menu → *Reconfigure* (host, token, password). If the charger rejects stored credentials
(e.g. password or token change), Home Assistant prompts for re-authentication.

> **Why not Basic Auth?** The firmware requires a CSRF header on every POST, and when that header is
> present it rejects Basic Auth. With a password, the integration logs in once (`POST /api/login`,
> “remember me”, 30 days) and reuses the session cookie.

## Entities

One device, 28 entities. Entity IDs follow the Home Assistant language
(e.g. on a Hungarian HA: `sensor.dabstracter_devse_toltesi_teljesitmeny`).

### Sensors

| Name (EN) | Key | Unit | Source | Notes |
|---|---|---|---|---|
| Charging power | `charging_power` | W | `/api/mini` `pW` | |
| Charging current | `charging_current` | A | `/api/mini` `a` | |
| Applied current | `set_current` | A | `/api/mini` `setA` | hidden by default; last DLM-set current |
| EV status | `ev_status` | – | `/api/mini` `st` | ready, connected, charging, stopped, error… attrs: `code`, `text`, `full` |
| Mode | `mode_sensor` | – | `/api/mini` `mode` | hidden by default (use the select for UI; this is for automations) |
| Session energy | `session_energy` | kWh | `/api/mini` `sessWh` | attrs: `duration_s`, `cost` |
| Total energy | `total_energy` | kWh | `/api/energy` `total` | Energy dashboard compatible; attrs: PV / battery share |
| Today energy | `today_energy` | kWh | `/api/energy` `days` | |
| Month energy | `month_energy` | kWh | `/api/energy` `months` | |
| Current price | `price` | HUF/kWh | `/api/energy` `cost.price` | only if cost calculation is enabled; attrs: `tier`, `low`, `high` |
| Discount band used | `band_used` | kWh | `cost.usedWh` | attrs: `percent`, `tier`, `period`, `monthly`, `partial` |
| Discount band limit | `band_limit` | kWh | `cost.limitWh` | |
| PV power | `pv_power` | W | `/api/mini` `pv` | |
| Grid power | `grid_power` | W | `/api/mini` `grid` | + import, − export |
| House load | `house_power` | W | `/api/mini` `house` | excluding the car |
| Home battery power | `battery_power` | W | `/api/mini` `batW` | + discharge, − charge |
| Home battery | `battery_soc` | % | `/api/mini` `soc` | |
| Wi-Fi signal | `wifi_rssi` | dBm | `/api/mini` `rssi` | diagnostic, hidden by default |

Inputs that are not wired on the charger (e.g. no P1 meter or inverter) stay “unknown”.

### Other entities

| Type | Name (EN) | Key | Behaviour |
|---|---|---|---|
| binary_sensor | Charging | `charging` | EV status 5 or 6 |
| binary_sensor | Car connected | `car_connected` | EV status 3–6 |
| binary_sensor | Charge limit active | `limit_active` | limit details in attributes |
| binary_sensor | Deadline plan active | `plan_active` | plan details in attributes |
| binary_sensor | Fail-safe | `fail_safe` | diagnostic |
| select | Mode | `mode` | MAN / PV / PV ECO / FAST |
| number | Max current | `max_current` | manual current in MAN, upper cap otherwise; `minA`…32 A |
| button | Start | `start` | switches to MAN and starts with manual current |
| button | Stop | `stop` | |
| button | Wake car (CP) | `cpwake` | CP-relay wake if the car is asleep |

## Services

Both services **require a password** (see [Setup](#setup)) and return the charger response
(`response_variable`). With multiple chargers, pass `device_id`.

```yaml
# Stop at 80 % (current battery 45 %)
action: dabstracter.set_limit
data:
  type: soc        # soc | kwh
  value: 80
  start_soc: 45    # optional; use if you have no MQTT SOC
---
action: dabstracter.set_limit
data:
  clear: true
---
# Have 20 kWh by 07:00
action: dabstracter.set_plan
data:
  type: kwh        # kwh | km | soc
  value: 20
  time: "07:00"
---
action: dabstracter.set_plan
data:
  cancel: true
```

Example automation: when the discounted band is exhausted, switch to PV ECO.

```yaml
triggers:
  - trigger: state
    entity_id: sensor.dabstracter_devse_kedvezmenyes_sav_felhasznalt
    attribute: tier
    to: high
actions:
  - action: select.select_option
    target:
      entity_id: select.dabstracter_devse_uzemmod
    data:
      option: pv_eco
```

## Charger card

The integration serves the card (`/dabstracter/dabstracter-charger-card.js`) and loads it on every
dashboard — **no manual resource entry**. Edit dashboard → *Add card* → **DABSTRACTER charger**.
In the visual editor, pick the charger device; entities are discovered automatically and can be overridden.

```yaml
type: custom:dabstracter-charger-card
device_id: <charger device id>   # optional if you have only one charger
title: Garage                    # optional
show_limits: true                # charge limit + deadline plan quick actions
show_band: true                  # monthly discounted band
show_stats: true                 # today / month / total kWh
show_flow: true                  # energy flow
flow_view: bar                   # bar | diagram; switchable on the card, remembered in the browser
entities:                        # optional per-role overrides
  power: sensor.some_other_power
```

Overridable roles: `status`, `power`, `current`, `session`, `mode`, `amps`, `start`, `stop`, `cpwake`,
`band`, `band_limit`, `price`, `pv`, `grid`, `house`, `battery`, `soc`, `charging`, `limit`, `plan`,
`today`, `month`, `total`.

Top to bottom:
- status (coloured dot, pulses while charging) + mode + power; then current, session kWh, session
  duration and cost (if cost calculation is enabled on the charger), plus active limit / plan;
- **START** and **STOP** side by side; CP wake under “More”;
- mode segments with short explanations;
- current with −/+ and a slider (debounced so multi-step changes become one command);
- **charge limit** (collapsible): 80 / 90 / 100 %, 10 / 20 / 30 kWh, “Clear limit”;
- **deadline plan** (collapsible): how much (10 / 20 / 30 kWh) + by when (06:00 / 07:00 / 08:00) → Set;
  “Cancel” when active, ETA in the header. Both need a password in the integration;
- monthly discounted band: green → yellow from 75 % → orange from 90 % → red above the limit, with price;
- today / month / total kWh tiles;
- energy flow in bar or diagram view;
- footer: “Updated 4 s ago”, or a red “No connection to charger” warning.

The card is Hungarian when the HA language is Hungarian, otherwise English. No CDN / external loads.

## Troubleshooting

| Symptom | What to do |
|---|---|
| Integration not found | Wrong folder: `manifest.json` must be at `config/custom_components/dabstracter/`. Restart required. |
| “Charger did not respond” | Check host/IP in a browser (`http://<host>/`); try IP instead of `.local`. |
| “Invalid token or password” | After five failures the charger locks for 30 s. Re-copy the token from the admin UI. |
| “View-only credentials” | You entered a `viewer` password; use the token or `user` password. |
| Limit / plan errors | Password required (Reconfigure → password). |
| Duplicate entities | MQTT discovery is still enabled on the charger (see above). |
| “Discovered: devse2” | Second charger, or the same one under another mDNS name. Ignore via ⋮ if it is the same device. |
| No logo | Needs HA 2026.x, `brand/` present, restart + Ctrl+F5. |
| Card missing | Ctrl+F5 / clear mobile app cache; Settings → System → Logs, search `dabstracter`. |

For bug reports: device page → ⋮ → *Download diagnostics* (token, password, IPs, and SSID are redacted),
plus the log line from Settings → System → Logs. Issues: [GitHub Issues](https://github.com/dabstracter/dabstracter-evse-ha/issues).

## How it works

| Endpoint | When | Auth |
|---|---|---|
| `GET /api/mini` | every 5 s (~0.5 kB) | token / cookie |
| `GET /api/status` | every 30 s and after commands (~6 kB) | token / cookie |
| `GET /api/energy` | every 60 s and after commands | token / cookie |
| `POST /api/cmd` | buttons, mode, current | token / cookie |
| `POST /api/limit`, `POST /api/plan` | services | cookie only (password) |
| `POST /api/login` | first password request and once after 401 | password |

The card also uses a Home Assistant websocket command: `dabstracter/status` (`device_id`) →
`{ok, last_update, host}` for the footer timestamp.

- Every POST sends `X-Requested-With: DABSTRACTER` (firmware CSRF protection).
- Device unique id is the charger hostname (`wifi.host`).
- If the charger is unreachable, entities go unavailable and HA retries every 5 s.
- Zeroconf hits are verified against `/api/status` before they are offered.

## License

[MIT](LICENSE) © 2026 DABSTRACTER
