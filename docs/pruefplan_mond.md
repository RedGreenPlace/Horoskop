# Prüfplan: Verbessert der laufende Mond den Partnerschafts-Wert an Heiratstagen?

Festgelegt **vor** der Auswertung (Stand 29.09.2026). Ergebnisse werden unabhängig vom Ausgang berichtet.

## Anlass
Der Rückblick lässt den laufenden Mond weg, weil er alle 2,5 Tage das Zeichen wechselt. Am Geburtstag eines Kindes (Einzelfall, nicht Teil dieser Prüfung) stand der Mond genau auf dem IC. Geprüft wird, ob der laufende Mond die Trefferquote an Heiratsterminen verbessert.

## Frage
Liegt der Rang (Definition wie in `docs/pruefplan.md`) der Partnerschaft am Heiratstag mit laufendem Mond **höher** als ohne, und liegt er insgesamt über 0,5?

## Änderung gegenüber dem Grundwert
Genau eine: laufender Mond als zusätzlicher Transitplanet, Aspekte zu allen Geburtspunkten des Grundwerts (ohne Häuser), **Gewicht 0,2** (etwa die Hälfte von Mars, 0,35, weil der Mond an rund einem Fünftel der Tage im Orbis steht), Orbis 3° mal Aspekt-Faktor, Aspektgewichte wie bei den übrigen Transiten, neutrale Wertung bei Konjunktion. Das Gewicht wird **nicht** nachträglich verändert.

## Daten und Kontrolle
Dieselben 300 Heiratstermine (`data/heirat_stichprobe.tsv`), dieselben Kontrollen (100 Vergleichs-Geburtsdaten je Ereignis, ±365 Tage), Grundwert und Mondvariante mit denselben Kontrollverschiebungen. Ohne Geburtszeit (Geburtsmond fehlt als Ziel, weil seine Position unsicher ist).

## Auswertung
- Primär: Mittelwert der Ränge mit Mond gegen 0,5 (Bootstrap, 5 %-Niveau, wie bisher) **und** gepaarte Differenz (mit Mond – ohne Mond).
- Ein Signal gilt nur, wenn der Mittelwert mit Mond über 0,5 liegt, signifikant ist und die gepaarte Differenz positiv ist. Sonst: „kein Zusammenhang nachweisbar“.
- Nullkalibrierung mit zufälligen Tagen: muss um 0,5 liegen; sonst ist die Mondvariante verzerrt und das Ergebnis nicht verwertbar.
- Nur diese eine Variante wird geprüft; weitere schnelle Planeten (Sonne, Merkur, Venus) sind nicht Teil dieses Plans.

## Bekannte Schwächen (vorab)
Wie beim Grundwert (Prominente, Wikidata-Fehler, fehlende Geburtszeit). Zusätzlich: Ein einzelner Gewichtswert 0,2 ist eine Setzung.
