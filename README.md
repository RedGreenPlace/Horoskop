# Mein Tageshoroskop

Persönliches Tageshoroskop aus Geburtsdatum, -zeit und -ort. Reine Browser-App ohne Build und ohne Abhängigkeiten.

## Starten

`index.html` im Browser öffnen (oder `python3 -m http.server` im Ordner und `http://localhost:8000` aufrufen).

## Wie es funktioniert

1. **Ort → Koordinaten + Zeitzone** über die Open-Meteo-Geocoding-API (kein API-Key). Alternativ manuell eintragbar.
2. **Geburtszeit → UTC** inkl. historischer Sommerzeit (`Intl`-Zeitzonendaten).
3. **Geburtshoroskop:** Planetenpositionen (Bahnelemente nach P. Schlyter), Aszendent, MC, Whole-Sign-Häuser (`js/astro.js`).
4. **Tageshoroskop:** Planetenstände des gewählten Tages werden mit dem Geburtshoroskop verglichen (Aspekte: Konjunktion, Sextil, Quadrat, Trigon, Opposition). Aus Aspekt, laufendem Planet und betroffenem Geburtspunkt entsteht der Text (`js/interpret.js`).

Ohne Geburtszeit werden Aszendent, Häuser und MC weggelassen.

## Tests

`node test/astro.test.js` prüft die Planetenberechnung gegen bekannte Referenzwerte.

Nur zur Unterhaltung, keine Beratung.
