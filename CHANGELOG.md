# Változásnapló

## 0.2.0 – Kártya: limit, célidő, diagram, statisztika (2026-11-09)

- Energiafolyam: keskeny szeletnél nincs többé üres keret; közepes szeletnél az érték a sávban látszik;
  a nagyon kicsi értékek is látható csíkot kapnak.
- Új **diagram nézet** az energiafolyamhoz, a portállal és a töltő webes felületével azonos kereszt-elrendezésben
  (PV fent, hálózat balra, akku lent töltöttség-jelzővel, ház összesen jobbra, alatta az autó; önellátás %,
  a pontok sebessége a teljesítménnyel nő). Sáv / diagram kapcsoló, a böngésző megjegyzi.
- **Töltési limit** és **célidős töltés** gyorsgombokkal a kártyán (a `set_limit` / `set_plan` szolgáltatással).
- A fő kijelzőn a töltés ideje és költsége is látszik.
- Áram csúszkával is állítható a −/+ mellett.
- Mai / havi / összes kWh csempék.
- Lábléc: „Frissítve x mp-e”, kapcsolatvesztésnél piros figyelmeztetés (új `dabstracter/status` websocket-parancs).
- Javítás: HA 2026.10-ben a `device_id`-vel hívott szolgáltatás hibát adott (elavult `device.config_entries`).
- Javítás: a kártya regisztrálása nem hasal el, ha a `frontend` nincs betöltve.

## 0.1.0 – Első kiadás (2026-11-08)

- Home Assistant integráció a töltő helyi HTTP API-jához (nincs MQTT, nincs felhő).
- Beállítás: gépnév / IP + kijelző-token és / vagy user / admin jelszó; zeroconf felismerés
  (`devse*`, `dabstracter*`, `_dabstracter._tcp`); újra-bejelentkezés és utólagos átállítás.
- 28 entitás: teljesítmény, áram, EV állapot, munkamenet / összes / mai / havi kWh, ár, kedvezményes sáv,
  PV / hálózat / ház / házi akku, töltés, autó csatlakoztatva, limit / célidő aktív, fail-safe, üzemmód,
  max. áram, Start / Stop / CP-ébresztés.
- Szolgáltatások: `dabstracter.set_limit`, `dabstracter.set_plan`.
- Diagnosztika kitakart titkokkal, magyar és angol fordítás.
- `dabstracter-charger-card` Lovelace kártya vizuális szerkesztővel; az integráció automatikusan betölti.
- DABSTRACTER ikon és logó az integráció oldalán (`brand/` mappa).
