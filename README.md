# Mein Tageshoroskop

Persönliches Tageshoroskop aus Geburtsdatum, -zeit und -ort. Reine Browser-App ohne Build und ohne Abhängigkeiten.

## Starten

`index.html` im Browser öffnen (oder `python3 -m http.server` im Ordner und `http://localhost:8000` aufrufen).

## Wie es funktioniert

1. **Ort → Koordinaten + Zeitzone** über die Open-Meteo-Geocoding-API (kein API-Key). Alternativ manuell eintragbar.
2. **Geburtszeit → UTC** inkl. historischer Sommerzeit (`Intl`-Zeitzonendaten).
3. **Geburtshoroskop:** Planetenpositionen (Bahnelemente nach P. Schlyter), Aszendent, MC, Whole-Sign-Häuser (`js/astro.js`).
4. **Tageshoroskop:** Planetenstände des gewählten Tages werden mit dem Geburtshoroskop verglichen (Aspekte: Konjunktion, Sextil, Quadrat, Trigon, Opposition). Für jede der 120 Kombinationen aus laufendem Planet und Geburtspunkt gibt es einen eigenen Text, dazu kommen Zeichen, Haus, Rückläufigkeit, Genauigkeit und eine regelbasierte Tagessynthese (`js/interpret.js`).

Die Deutung nutzt außerdem Aspekte innerhalb des Geburtshoroskops, den Aszendentherrscher (Transite darauf zählen stärker), die Element- und Qualitätenverteilung sowie die exakte Uhrzeit jedes Aspekts.

Ohne Geburtszeit werden Aszendent, Häuser und MC weggelassen.

## Tests

`node test/astro.test.js` prüft die Planetenberechnung gegen bekannte Referenzwerte, `node test/interpret.test.js`, dass sich die Deutung mit Geburtsdaten, Ort und Tag ändert.

Nur zur Unterhaltung, keine Beratung.
