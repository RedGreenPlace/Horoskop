# Ergebnis: laufender Mond im Partnerschafts-Wert (Heiratstermine)

Prüfplan: `docs/pruefplan_mond.md` (vor der Auswertung festgelegt und gepusht). Rohausgabe: `docs/ergebnis_mond_rohausgabe.txt`. 300 Heiratstermine (Wikidata), je 100 Kontrollen (Geburtsdatum ±365 Tage), Mond mit Gewicht 0,2.

| | mittlerer Rang | 95 %-Intervall | p (zweiseitig) | Rang ≥ 0,9 |
|---|---|---|---|---|
| ohne Mond (bisher) | 0,484 | 0,451–0,515 | 0,31 | 7,7 % (erwartet 10 %) |
| mit Mond | 0,486 | 0,454–0,518 | 0,38 | 8,7 % |
| Nullkalibrierung mit Mond (zufällige Tage) | 0,478 | 0,445–0,511 | 0,18 | 10,0 % |

Gepaarte Differenz (mit Mond – ohne Mond): +0,003 (z = 1,24).

**Ergebnis: kein Zusammenhang nachweisbar. Der Test ist aber schwach, weil die Wikidata-Personen keine Geburtszeit haben (siehe Einschränkung).** Der Rang liegt mit Mond bei 0,486, also nicht über 0,5. Die Verbesserung gegenüber dem Grundwert (+0,003) ist praktisch null. Die Nullkalibrierung liegt bei 0,478 und damit im erwarteten Bereich, die Auswertung ist verwertbar.

Der Mond wird auf dieser Grundlage nicht in den Rückblick übernommen; das ist keine Widerlegung. Der Einzelfall (Mond auf dem IC am Geburtstag eines Kindes) bleibt eine Beobachtung ohne Nachweis.

Einschränkung: getestet wurde nur Heirat ohne Geburtszeit, mit einem einzigen Gewicht (0,2). Andere Gewichte oder Themen wurden nicht ausprobiert.

Wichtig: Ohne Geburtszeit fehlen genau die Punkte, die für Partnerschaft und für den Mond zentral sind (Geburtsmond, Deszendent, Häuser). Der Test prüft daher nur einen Teil der Methode und kann sie mit Geburtszeit weder bestätigen noch widerlegen. Um das zu klären, bräuchte man Personen mit belegter Geburtszeit und Geburtsort (zum Beispiel Wikidata-Einträge mit minutengenauer Geburt oder eine geprüfte Sammlung wie die Astro-Databank).
