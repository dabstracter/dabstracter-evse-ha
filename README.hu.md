# DABSTRACTER EVSE – Home Assistant integráció + töltőkártya

Natív Home Assistant integráció a DABSTRACTER EVSE fali töltőhöz. **Közvetlenül a helyi Wi-Fi hálózaton**
beszél a töltő HTTP API-jával: nincs MQTT, nincs felhő, internet nélkül is működik. A csomagban van egy
telefonra tervezett Lovelace kártya is (`dabstracter-charger-card`), amit az integráció automatikusan betölt.

[English documentation → README.md](README.md)

| | |
|---|---|
| Verzió | 0.2.4 ([változásnapló](CHANGELOG.md)) |
| Home Assistant | 2025.1 vagy újabb (a logó megjelenítéséhez 2026.x) |
| Töltő firmware | 2.8.76 vagy újabb (`/api/mini`) |
| Kapcsolat | helyi HTTP, lekérdezéses (`local_polling`) |
| Licenc | [MIT](LICENSE) |

## Tartalom

- [MQTT vagy integráció?](#mqtt-vagy-integráció-válassz-egyet)
- [Telepítés](#telepítés) · [Beállítás](#beállítás) · [Entitások](#entitások) · [Szolgáltatások](#szolgáltatások)
- [Töltőkártya](#töltőkártya) · [Hibaelhárítás](#hibaelhárítás) · [Hogyan működik](#hogyan-működik)

## MQTT vagy integráció? Válassz egyet!

A töltő firmware-je már most is küld **MQTT Home Assistant discovery** üzeneteket (Config → MQTT →
„HA discovery”). Ha mindkettőt bekapcsolod, minden mérés **kétszer** jelenik meg (két eszköz, duplikált
entitások).

| | Ez az integráció (HTTP) | MQTT discovery (firmware) |
|---|---|---|
| Kell hozzá | csak a töltő IP-címe / neve | MQTT bróker (pl. Mosquitto add-on) |
| Frissítés | lekérdezés: 5 s élő adat, 30 s állapot, 60 s energia | push, a firmware küldési ütemében |
| Vezérlés | START / STOP / CP-ébresztés, üzemmód, áram, **töltési limit, célidős töltés** | START / STOP, üzemmód, áram |
| Energia-adatok | munkamenet, összes, mai, havi kWh, ár, kedvezményes sáv | a firmware MQTT-adatai szerint |
| Töltőkártya | automatikusan, entitás-felismeréssel | kézzel kell entitásokat választani |
| Felismerés | zeroconf (`devse*` / `dabstracter*` nevű `_http._tcp`) | MQTT discovery |

**Javaslat:** ha még nem használsz MQTT-t, ezt az integrációt válaszd. Ha átállsz rá, a töltőn kapcsold ki a
*HA discovery*-t (vagy az egész MQTT-t), és a Home Assistantban töröld a régi MQTT-s eszközt
(Beállítások → Eszközök → az MQTT-s eszköz → ⋮ → Törlés).

## Telepítés

### HACS-szal
1. HACS → ⋮ → *Custom repositories* → URL: `https://github.com/dabstracter/dabstracter-evse-ha`, típus: **Integration**.
2. Keresd meg: **DABSTRACTER EVSE** → *Download*.
3. Indítsd újra a Home Assistantot.

### Kézzel
1. Másold a teljes `custom_components/dabstracter` mappát a HA `config/custom_components/` mappájába
   (a `brand`, `translations` és `www` almappával együtt). Helyes útvonal:
   `config/custom_components/dabstracter/manifest.json`.
2. Indítsd újra a Home Assistantot (Beállítások → Rendszer → bekapcsoló ikon → *Újraindítás*). A
   „YAML újratöltése” nem elég.
3. Frissítsd a böngészőt (Ctrl+F5), hogy a logó és a kártya betöltődjön.

Frissítésnél ugyanígy: a mappa felülírása, majd újraindítás.

## Beállítás

### 1. Belépési adat a töltőből
- **Kijelző-token:** a töltő webes felületén, **admin**ként: Config → Kijelző. Ha még nincs, ott generálható.
  Elég az állapothoz, START / STOP-hoz, üzemmódhoz és áramhoz.
- **Jelszó:** a `user` (vagy `admin`) jelszava. **A töltési limithez és a célidős töltéshez kell**, mert
  azokat a firmware tokennel nem engedi.
- Megadhatod mindkettőt: ilyenkor a lekérdezés a tokennel megy, a limit / célidő a jelszóval.
- Ha a töltőn nincs admin jelszó (nyitott felület), a mezők üresen hagyhatók.
- A `viewer` jelszót az integráció elutasítja: azzal nem lehet vezérelni.

### 2. Integráció hozzáadása
*Beállítások → Eszközök és szolgáltatások → Integráció hozzáadása → DABSTRACTER EVSE.* Ha a töltő neve
`devse…` vagy `dabstracter…`, a HA magától is felajánlja a „Felfedezve” sorban.

| Mező | Mire jó |
|---|---|
| Gépnév vagy IP | pl. `192.168.1.50` vagy `devse.local`. Az IP megbízhatóbb: foglalj neki fix címet a routerben |
| Kijelző-token | lásd fent |
| Felhasználó + jelszó | `user` vagy `admin` + jelszó |

Utólag: az integráció ⋮ menüjében *Újrakonfigurálás* (cím, token, jelszó). Ha a töltő elutasítja a tárolt
adatot (pl. jelszócsere vagy új token), a HA magától kéri az újra-bejelentkezést.

> **Miért nem Basic Auth?** A firmware minden POST-hoz CSRF-fejlécet kér, és ha ez a fejléc ott van, a Basic
> Auth-ot nem fogadja el. Ezért jelszavas módban az integráció egyszer bejelentkezik (`POST /api/login`,
> „emlékezz rám”, 30 nap), és a munkamenet-sütit használja. A töltő eseménynaplójában ez egy
> „Bejelentkezes: user” sor.

## Entitások

Egy eszköz, 28 entitás. Az entitás-azonosítók a HA nyelvén generálódnak (pl. magyar HA-ban
`sensor.dabstracter_devse_toltesi_teljesitmeny`).

### Szenzorok

| Név (HU) | Kulcs | Egység | Forrás | Megjegyzés |
|---|---|---|---|---|
| Töltési teljesítmény | `charging_power` | W | `/api/mini` `pW` | |
| Töltőáram | `charging_current` | A | `/api/mini` `a` | |
| Alkalmazott áram | `set_current` | A | `/api/mini` `setA` | alapból rejtett; a DLM utoljára beállított árama |
| EV állapot | `ev_status` | – | `/api/mini` `st` | lista: kész, csatlakoztatva, töltés, leállítva, hiba… attribútum: `code`, `text`, `full` |
| Üzemmód | `mode_sensor` | – | `/api/mini` `mode` | alapból rejtett (a választó helyett automatizmusokhoz) |
| Munkamenet energia | `session_energy` | kWh | `/api/mini` `sessWh` | attribútum: `duration_s`, `cost` (Ft) |
| Összes energia | `total_energy` | kWh | `/api/energy` `total` | Energia-irányítópultra tehető; attribútum: napelemes / akkus rész |
| Mai energia | `today_energy` | kWh | `/api/energy` `days` | |
| Havi energia | `month_energy` | kWh | `/api/energy` `months` | |
| Aktuális ár | `price` | HUF/kWh | `/api/energy` `cost.price` | csak bekapcsolt költségszámításnál; attribútum: `tier`, `low`, `high` |
| Kedvezményes sáv felhasznált | `band_used` | kWh | `cost.usedWh` | attribútum: `percent`, `tier`, `period`, `monthly`, `partial` |
| Kedvezményes sáv határa | `band_limit` | kWh | `cost.limitWh` | |
| PV teljesítmény | `pv_power` | W | `/api/mini` `pv` | |
| Hálózati teljesítmény | `grid_power` | W | `/api/mini` `grid` | + vételezés, − betáplálás |
| Ház fogyasztás | `house_power` | W | `/api/mini` `house` | az autó nélkül |
| Házi akku teljesítmény | `battery_power` | W | `/api/mini` `batW` | + kisütés, − töltés |
| Házi akku | `battery_soc` | % | `/api/mini` `soc` | |
| Wi-Fi jelerősség | `wifi_rssi` | dBm | `/api/mini` `rssi` | diagnosztikai, alapból rejtett |

Ami a töltőn nincs bekötve (pl. nincs P1 mérő vagy inverter), az „ismeretlen” marad.

### Egyéb entitások

| Típus | Név (HU) | Kulcs | Működés |
|---|---|---|---|
| binary_sensor | Töltés | `charging` | EV állapot 5 vagy 6 |
| binary_sensor | Autó csatlakoztatva | `car_connected` | EV állapot 3–6 |
| binary_sensor | Töltési limit aktív | `limit_active` | attribútumban a limit részletei (`type`, `value`, `remainWh`, `etaS`…) |
| binary_sensor | Célidős töltés aktív | `plan_active` | attribútumban a terv (`deadlineHm`, `etaHm`, `reachable`…) |
| binary_sensor | Fail-safe / biztonsági leállás | `fail_safe` | diagnosztikai |
| select | Üzemmód | `mode` | MAN / PV / PV ECO / FAST |
| number | Max. áram | `max_current` | MAN-ban a kézi áram, más módban a felső korlát (mint a töltő +/- gombja); `minA`…32 A |
| button | Start | `start` | a firmware-ben MAN módba vált, kézi árammal indít (mint a helyi gomb) |
| button | Stop | `stop` | |
| button | Autó ébresztése (CP) | `cpwake` | CP-relés ébresztés, ha az autó alszik |

## Szolgáltatások

Mindkét szolgáltatás **jelszót igényel** (lásd [Beállítás](#beállítás)), és visszaadja a töltő válaszát
(`response_variable`). Több töltőnél add meg a `device_id`-t is.

```yaml
# 80 %-nál álljon le (a mostani akku 45 %)
action: dabstracter.set_limit
data:
  type: soc        # soc | kwh
  value: 80
  start_soc: 45    # opcionális; MQTT-s SOC nélkül ebből számol
---
action: dabstracter.set_limit
data:
  clear: true
---
# reggel 7-re legyen benne 20 kWh
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

Példa-automatizmus: ha a kedvezményes sáv elfogyott, váltson PV ECO-ra.

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

## Töltőkártya

Az integráció a kártyát maga szolgálja ki (`/dabstracter/dabstracter-charger-card.js`) és minden dashboardon
betölti, **nem kell kézzel erőforrást felvenni**. Dashboard szerkesztése → *Kártya hozzáadása* →
**DABSTRACTER charger**. A vizuális szerkesztőben elég a töltő eszközt kiválasztani; az entitásokat
magától megtalálja, és egyenként felülírhatók.

```yaml
type: custom:dabstracter-charger-card
device_id: <a töltő eszköz-azonosítója>   # elhagyható, ha csak egy töltő van
title: Garázs                              # opcionális
show_limits: true                          # töltési limit és célidős töltés gyorsgombokkal
show_band: true                            # havi kedvezményes sáv
show_stats: true                           # mai / havi / összes kWh
show_flow: true                            # energiafolyam
flow_view: bar                             # bar (sáv) | diagram; a kártyán átváltható, a böngésző megjegyzi
entities:                                  # opcionális felülírás szerepenként
  power: sensor.valami_mas_teljesitmeny
```

Felülírható szerepek: `status`, `power`, `current`, `session`, `mode`, `amps`, `start`, `stop`, `cpwake`,
`band`, `band_limit`, `price`, `pv`, `grid`, `house`, `battery`, `soc`, `charging`, `limit`, `plan`,
`today`, `month`, `total`.

Tartalom, felülről lefelé:
- állapot (színes pont, töltésnél pulzál) + üzemmód + teljesítmény; alatta áram, munkamenet kWh, a töltés
  ideje és költsége (ha a töltőn be van kapcsolva a költségszámítás), valamint az aktív limit / célidő;
- **START** és **STOP** egymás mellett; a „Továbbiak” alatt CP-ébresztés;
- üzemmód-szegmensek rövid magyarázattal;
- áram −/+ gombokkal és csúszkával (rövid szünet után küldi, így több lépés egy parancs);
- **töltési limit** (összecsukható): 80 / 90 / 100 %, 10 / 20 / 30 kWh egy érintéssel, „Limit törlése”;
- **célidős töltés** (összecsukható): mennyit (10 / 20 / 30 kWh) + mikorra (06:00 / 07:00 / 08:00) → Beállítás,
  aktívnál „Megszakítás”, a fejlécben a várható befejezés. Mindkettőhöz jelszó kell az integrációban;
- havi kedvezményes sáv: zöld → 75 %-tól sárga → 90 %-tól narancs → a határ felett piros, mellette az ár;
- mai / havi / összes kWh három kis csempén;
- energiafolyam két nézetben (sáv vagy diagram);
- lábléc: „Frissítve 4 mp-e”, vagy pirosan „Nincs kapcsolat a töltővel”.

A kártya magyarul jelenik meg, ha a HA nyelve magyar, egyébként angolul. Nincs külső betöltés (CDN).

## Hibaelhárítás

| Jelenség | Teendő |
|---|---|
| Nem található az integráció | Rossz mappa: a `manifest.json`-nak itt kell lennie: `config/custom_components/dabstracter/`. Újraindítás kell. |
| „A töltő nem válaszolt” | Cím / IP ellenőrzése böngészőben (`http://<cím>/`); `.local` név helyett próbáld az IP-t. |
| „Hibás token vagy jelszó” | Öt hibás próbálkozás után a töltő 30 mp-re zárol. Tokennél admin felületről másold újra. |
| „Ezzel csak megtekinteni lehet” | `viewer` jelszót adtál meg; használd a tokent vagy a `user` jelszót. |
| A limit / célidő hibát ad | Jelszó kell hozzá (Újrakonfigurálás → jelszó). |
| Duplikált entitások | Az MQTT discovery is be van kapcsolva a töltőn (lásd fent). |
| „Felfedezve: devse2” | Vagy egy második töltő, vagy ugyanaz a töltő mDNS-névütközés miatt más néven. Ha ugyanaz, a ⋮ menüben hagyd figyelmen kívül. |
| Nincs logó | HA 2026.x kell, a `brand` mappának ott kell lennie, újraindítás és Ctrl+F5. |
| Nem jelenik meg a kártya | Ctrl+F5 / telefonos appban gyorsítótár ürítése; Beállítások → Rendszer → Naplók, keresés: `dabstracter`. |

Hibabejelentéshez: eszköz oldal → ⋮ → *Diagnosztika letöltése* (a token, a jelszó, az IP-címek és az SSID ki
van takarva), és a naplósor a Rendszer → Naplók oldalról. Issue: [GitHub Issues](https://github.com/dabstracter/dabstracter-evse-ha/issues).

## Hogyan működik

**Használt végpontok:**

| Végpont | Mikor | Jogosultság |
|---|---|---|
| `GET /api/mini` | 5 s-onként (~0,5 kB) | token / süti |
| `GET /api/status` | 30 s-onként és parancs után (~6 kB) | token / süti |
| `GET /api/energy` | 60 s-onként és parancs után | token / süti |
| `POST /api/cmd` | gombok, mód, áram | token / süti |
| `POST /api/limit`, `POST /api/plan` | szolgáltatások | csak süti (jelszó) |
| `POST /api/login` | első jelszavas kérésnél és 401 után egyszer | jelszó |

A kártya a HA felé egy saját websocket-parancsot is használ: `dabstracter/status` (`device_id`) →
`{ok, last_update, host}` – az utolsó sikeres lekérdezés ideje a lábléchez.

- Minden POST-ban `X-Requested-With: DABSTRACTER` fejléc (a firmware CSRF-védelme).
- Az eszköz egyedi azonosítója a töltő gépneve (`wifi.host`).
- Ha a töltő nem érhető el, az entitások „nem elérhető” állapotba kerülnek, és a HA 5 s-onként újrapróbál.
- A zeroconf-találatot az integráció a `/api/status` válaszával ellenőrzi, mielőtt felajánlja.

## Licenc

[MIT](LICENSE) © 2026 DABSTRACTER
