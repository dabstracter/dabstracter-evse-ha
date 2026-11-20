# Változásnapló

## 0.3.1 – Kompakt kártya (2026-11-20)

- A kártya alapból **kompakt nézetben** jelenik meg, a teljes nézet kb. negyedén: állapot és teljesítmény egy
  sorban, élő energiasín (honnan jön az áram, sáv %, limit, célidő), egyetlen START / STOP gomb az áram mellett,
  üzemmód. Minden más a „Részletek” alatt nyílik, a böngésző megjegyzi.
- A teljes nézet `view: full` beállítással érhető el (vizuális szerkesztő: Elrendezés), szorosabb térközökkel.
- Billentyűzetes fókusz minden gombon látható; a mozgás kikapcsol, ha a rendszer csökkentett mozgást kér.

## 0.3.0 – Limit és célidő entitásként, MQTT-figyelmeztetés, beállítható lekérdezés (2026-11-19)

- **Töltési limit entitásként:** „Töltési limit (akku %)” és „Töltési limit (kWh)” szám; 0 = nincs limit.
- **Célidős töltés entitásként:** energia (kWh) és „kész ekkorra” idő (megjegyzi), „Célidős töltés indítása” és
  „megszakítása” gomb. Így automatizmusból és a HA saját felületéről is állítható, szolgáltatáshívás nélkül.
- **Munkamenet időtartam** és **munkamenet költség** saját szenzorként (grafikon, statisztika).
- **Figyelmeztetés a Javítások alatt**, ha a töltő MQTT discovery-vel is fel van véve (duplikált entitások);
  magától eltűnik, ha az MQTT-s eszköz megszűnt.
- **Beállítható lekérdezési ütem** (integráció → Konfigurálás): élő értékek, állapot, energia-előzmények.
- **2.8.110-es firmware támogatása** (régebbivel is működik): a limithez és a célidőhöz elég a kijelző-token;
  a mai / havi kWh és a sáv adatai az 5 mp-es élő értékekkel jönnek, a nagy `/api/energy` ötször ritkábban kell;
  a MAC-cím az eszközhöz kerül.
- Régebbi firmware-en, csak tokennel, a limit / célidő érthető hibát ad („jelszó kell”).
- Fejlesztés: a privát repóban minden pushnál lefutnak a tesztek, és ellenőrzés figyeli, hogy a lefordított kártya
  egyezik-e a forrással.

## 0.2.4 – Kártyaverzió és Windows szinkron (2026-11-10)

- A kártya verziója 0.2.4, egyezik az integrációval. A közzétett csomag eddig 0.2.1-et írt ki.
- A public szinkron Windowsos, nem UTF-8 konzolon (például cp1250) a másolás után nem áll le, így a commit, a push és a release is lefut.

## 0.2.3 – Repository renamed to dabstracter-evse-ha (2026-11-10)

- Repository renamed to dabstracter-evse-ha ([`dabstracter/dabstracter-evse-ha`](https://github.com/dabstracter/dabstracter-evse-ha)). Documentation, issue tracker, README, and the charger card documentation URL follow the new name.

## 0.2.2 – Hassfest, kategória, repó (2026-11-10)

- `manifest.json` kulcsok sorrendje a hassfest szabály szerint: `domain`, `name`, majd ábécérend.
- HACS kategória: `energy.ev_charging`.
- GitHub Actions: `actions/checkout@v7`.
- A repó új neve [`dabstracter/dabstracter-evse-ha`](https://github.com/dabstracter/dabstracter-evse-ha); a documentation és az issue tracker URL-ek erre mutatnak.

## 0.2.1 – HACS-közzététel előkészítése (2026-11-10)

- Public HACS-repó: [`dabstracter-evse-ha`](https://github.com/dabstracter/dabstracter-evse-ha) (angol README + magyar `README.hu.md`).
- `manifest.json`: `codeowners`, documentation / issue_tracker a public repóra mutat.
- GitHub Actions: HACS validation + hassfest a public csomagon.

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
