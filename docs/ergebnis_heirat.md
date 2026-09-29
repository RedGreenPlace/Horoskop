# Ergebnis: Heirats-Test nach Prüfplan (29.09.2026)

Ausgewertet nach `docs/pruefplan.md` (Commit `c0d813d`, vor der Auswertung). Aufruf: `node tools/pruefung_heirat.js <rohdaten> --n 300 --kontrollen 100 --saat 20260929`. Stichprobe: `data/heirat_stichprobe.tsv`.

## Daten
- Wikidata, tagesgenaue Geburts- und Heiratsdaten, gregorianisch.
- **Abweichung vom Prüfplan (Aufwand):** Statt aller 116 Geburtsjahre (1880–1995) wurden mit festem Saatkorn (20260929) 36 Geburtsjahre gezogen und nur diese abgerufen (18.940 Zeilen, 16.458 Personen). Daraus wurden nach den Filtern des Plans 16.262 Ereignisse; die Stichprobe von 300 wurde zufällig gezogen und vor der Auswertung gespeichert.
- 102 Personen mit widersprüchlichen Geburtsdaten und 94 ohne gültige Heirat (Alter 16–80, vor 2025) entfielen.

## Ergebnis (n = 300)
| | mittlerer Rang | 95-%-Bootstrap | Ereignisse mit Rang ≥ 0,90 |
|---|---|---|---|
| **Echte Heiratstermine** | **0,479** | 0,447 bis 0,512 | 26 von 300 (8,7 %, erwartet 10 %) |
| Nullkalibrierung (zufällige Tage) | 0,507 | 0,475 bis 0,538 | 31 von 300 (10,3 %) |
| Positivkontrolle (Tage mit höchstem Wert, n = 60) | 0,977 | 0,969 bis 0,983 | 59 von 60 |

Primärer Test (Mittelwert gegen 0,5, zweiseitig): z = −1,25, p = 0,21 → **kein Zusammenhang nachweisbar**. Die Ränge verteilen sich gleichmäßig auf die Fünftel (63, 64, 68, 53, 52).

## Einordnung
- Die Nullkalibrierung liegt bei 0,5, die Positivkontrolle bei 0,98: Die Auswertung erzeugt kein Signal aus dem Nichts, und sie würde eines erkennen.
- Das Konfidenzintervall schließt einen mittleren Rangvorteil über etwa +0,012 aus. Sehr kleine Effekte oder Effekte in Teilgruppen sind damit nicht ausgeschlossen.
- Der Partnerschafts-Wert des Scanners unterscheidet den eigenen Geburtstag an echten Heiratstagen nicht von zufällig verschobenen Geburtstagen.

## Grenzen
- Ohne Geburtszeit und -ort: Aszendent, Deszendent, MC, IC, Häuser und der Geburtsmond fehlten, obwohl sie für Beziehungen zentral sind. Ein negatives Ergebnis widerlegt daher nicht die Methode mit Geburtszeit.
- Nur Heirat, nur ein Themenwert, unverändert in der Gewichtung. Andere Techniken (Solar Arc, Solar Return, andere Gewichte) und andere Themen (Kindergeburt, Beruf, …) wurden nicht getestet.
- Prominente sind nicht repräsentativ; Wikidata-Angaben können fehlerhaft sein.
- Drei persönliche Ereignisse (Heirat 2020, Kindergeburt 2024) lagen ebenfalls auf Zufallsniveau; das stimmt mit diesem Ergebnis überein.
