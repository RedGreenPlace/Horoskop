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

Die Hauptansicht ist ein durchgehender Klartext ohne Fachbegriffe (was hochwill, was es zurückhält, wann es sich löst, Tagesverlauf mit Uhrzeiten). Die astrologischen Grundlagen stehen aufklappbar darunter.

Nur zur Unterhaltung, keine Beratung.

## Rückblick-Test (Lebensphasen)

`node tools/rueckblick.js 1996-03-02 03:15 51.5364 7.2228 Europe/Berlin 5 2026-09-29` rechnet für zwölf Themen (`js/lifeevents.js`), wann langsame Planeten die dazugehörigen Geburtspunkte und Häuser berühren, und nennt die stärksten Phasen. Mit `--check 2023-05-14:partnership` lässt sich prüfen, wie stark ein Thema an einem bekannten Datum war. Berücksichtigt werden langsame Transite, Sonnen- und Mondfinsternisse (an 33 bekannten Terminen 2018–2026 geprüft), die fortgeschriebenen Geburtsplaneten (Sekundärprogression) und der Mondknoten; jede Phase bekommt eine psychologische Leitfrage. Der Scanner zeigt Phasen erhöhter Intensität, keine konkreten Ereignisse. Nicht enthalten: Chiron, Solar Return, Mond ohne Kurs. `node test/lifeevents.test.js` prüft ihn.
