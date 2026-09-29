# Mein Tageshoroskop

Persönliches Tageshoroskop aus Geburtsdatum, -zeit und -ort. Reine Browser-App ohne Build und ohne Abhängigkeiten.

## Starten

`index.html` im Browser öffnen (oder `python3 -m http.server` im Ordner und `http://localhost:8000` aufrufen).

## Wie es funktioniert

1. **Ort → Koordinaten + Zeitzone** über die Open-Meteo-Geocoding-API (kein API-Key). Alternativ manuell eintragbar.
2. **Geburtszeit → UTC** inkl. historischer Sommerzeit (`Intl`-Zeitzonendaten).
3. **Geburtshoroskop:** Planetenpositionen (Bahnelemente nach P. Schlyter), Aszendent, MC, Whole-Sign-Häuser (`js/astro.js`).
4. **Tageshoroskop:** Planetenstände des gewählten Tages werden mit dem Geburtshoroskop verglichen (Aspekte: Konjunktion, Sextil, Quadrat, Trigon, Opposition). Für jede der 120 Kombinationen aus laufendem Planet und Geburtspunkt gibt es drei eigene Texte (leicht, angespannt, verschmelzend; `js/themes.js`, 360 Texte), dazu kommen Zeichen, Haus, Rückläufigkeit, Genauigkeit und eine regelbasierte Tagessynthese (`js/interpret.js`).

Die Deutung nutzt außerdem Aspekte innerhalb des Geburtshoroskops, den Aszendentherrscher (Transite darauf zählen stärker), die Element- und Qualitätenverteilung sowie die exakte Uhrzeit jedes Aspekts.

Ohne Geburtszeit werden Aszendent, Häuser und MC weggelassen.

## Tests

`node test/astro.test.js` prüft die Planetenberechnung gegen bekannte Referenzwerte, `node test/interpret.test.js`, dass sich die Deutung mit Geburtsdaten, Ort und Tag ändert.

Aus Bausteinen zusammengesetzt (keine einzeln geschriebenen Sätze): `js/feinheit.js` (Haus-, Zeichen- und Aspektnuancen, 1.200 Sätze aus ca. 130 Fragmenten) und `js/verflechtung.js` (Verknüpfung mehrerer Konstellationen: 45 handgeschriebene Auflösungssätze, 45 Paarkerne, Brücken und Muster). `node test/feinheit.test.js` und `node test/verflechtung.test.js` prüfen sie. `js/fragen.js` enthält 360 von Hand geschriebene Leitfragen (laufender Planet × Geburtspunkt × Tonart); der Klartext nennt Tageszeiten statt Uhrzeiten, exakte Zeiten stehen im aufklappbaren Fachteil.

Die Hauptansicht ist ein durchgehender Klartext ohne Fachbegriffe (was hochwill, was es zurückhält, wann es sich löst, Tagesverlauf mit Uhrzeiten). Die astrologischen Grundlagen stehen aufklappbar darunter.

Nur zur Unterhaltung, keine Beratung.

## Rückblick-Test (Lebensphasen)

`node tools/rueckblick.js 1996-03-02 05:14 51.5364 7.2228 Europe/Berlin 5 2026-09-29` rechnet für zwölf Themen (`js/lifeevents.js`), wann langsame Planeten die dazugehörigen Geburtspunkte und Häuser berühren, und nennt die stärksten Phasen. Mit `--check 2023-05-14:partnership` lässt sich prüfen, wie stark ein Thema an einem bekannten Datum war. Berücksichtigt werden langsame Transite, Sonnen- und Mondfinsternisse (an 33 bekannten Terminen 2018–2026 geprüft), die fortgeschriebenen Geburtsplaneten (Sekundärprogression) und der Mondknoten; jede Phase bekommt eine psychologische Leitfrage und „typisch für so eine Phase“-Ereignisse (Beginn, Festigung, Ende, Umbruch, Plötzliches, Auflösung je Thema; eigene Zuordnung, nicht geprüft). Der Scanner zeigt Phasen erhöhter Intensität, keine konkreten Ereignisse. Nicht enthalten: Chiron, Solar Return, Mond ohne Kurs. **Prüfung:** An 300 echten Heiratsterminen (Wikidata) lag der Partnerschafts-Wert nicht höher als bei verschobenen Geburtsdaten (mittlerer Rang 0,479, p = 0,21; Prüfplan und Ergebnis in `docs/`). Der Rückblick ist deshalb als Deutung zur Selbstreflexion zu verstehen, nicht als Vorhersage. `node test/lifeevents.test.js` prüft ihn.

## Genauigkeit und Empfindlichkeit

- `node tools/genauigkeit.js` vergleicht die Planetenberechnung mit 1.000 PyEphem-Referenzwerten (1900–2100, `data/ephem_referenz.json`, erzeugt mit `tools/referenz_erzeugen.py`): Abweichung im Mittel unter 0,03°, größter Wert Mond 0,10°. Pluto war zuvor bis 2° falsch (Sicht von der Sonne statt von der Erde) und ist korrigiert.
- `node tools/geburtszeit_empfindlichkeit.js` zeigt, wie oft sich die Deutung bei verschobener Geburtszeit ändert (bei ±15 Minuten ändert sich der erste Absatz an etwa 30–38 % der Tage, bei ±60 Minuten an mehr als der Hälfte).
- `node tools/orb_empfindlichkeit.js` verschiebt alle Planeten leicht und zählt, wie oft sich der Text ändert.
