# Prüfplan: Trifft der Rückblick-Scanner echte Heiratstermine?

Festgelegt **vor** der Auswertung. Ergebnisse werden unabhängig vom Ausgang berichtet.

## Frage
Liegt das Thema „Partnerschaft“ des Scanners (`js/lifeevents.js`) am Tag einer Heirat für das **eigene** Geburtsdatum höher als für zufällig verschobene Geburtsdaten?

## Hintergrund (Recherche)
Astrologische Quellen nennen für den Heiratszeitpunkt: Sekundärprogressionen (fortgeschriebene Sonne, Mond, Venus auf Venus, Sonne, Mars, Deszendent), Transite von Jupiter, Saturn und Venus zu Venus und zum 7. Haus, Finsternisse und Neu-/Vollmonde, ergänzend Solar Arc und Solar Return. Progressionen: Orbis höchstens 1° um den Geburtsplaneten. Quellen: Wikipedia „Astrological progression“, Astrologie-Fachseiten (siehe Bericht). Diese Regeln sind Überlieferung, kein Beleg. Kontrollierte Studien zur Astrologie fanden bisher keine Vorhersagekraft (Carlson 1985, Nature; Helgertz & Scott 2020, Genus – dort zu Verträglichkeit und Scheidung, nicht zum Zeitpunkt).

## Daten
- Quelle: Wikidata (SPARQL), Menschen (`Q5`) mit Geburtsdatum und Ehe (`P26`) mit Beginn (`P580`).
- Nur **tagesgenaue** Angaben (Zeitpräzision 11) bei Geburt **und** Heirat; Platzhalterdaten wie „01.01.“ mit Jahrespräzision entfallen.
- Nur mit genau einer Geburtsdatum-Angabe (keine widersprüchlichen Einträge).
- Geburtsjahr 1880 bis 1995, Alter bei der Heirat 16 bis 80 Jahre.
- Pro Person **ein** Ereignis: die früheste Heirat, die die Bedingungen erfüllt.
- Zielgröße: mindestens 200 Ereignisse; Stichprobe zufällig aus allen Treffern, festes Zufallssaatkorn.

## Bewertung
- Der Partnerschafts-Wert des Scanners (`js/lifeevents.js`, Thema `partnership`), unverändert (Gewichte, Orbs, Zeitfenster wie im Repository-Stand vor der Auswertung).
- Geburtszeit und -ort sind unbekannt: Geburtstag um 12:00 UTC, **ohne** Aszendent, Deszendent, MC, IC und Häuser. Zusätzlich entfallen der Geburtsmond als Ziel und der fortgeschriebene Mond, weil ihre Position ohne Geburtszeit um bis zu ±6° unsicher ist. Weiter zählen Transite, Finsternisse, fortgeschriebene Sonne/Merkur/Venus/Mars und der Mondknoten.

## Kontrolle
Für jedes Ereignis wird der Wert am Heiratstag mit dem **eigenen** Geburtsdatum berechnet und mit 100 **Kontrollwerten** verglichen, bei denen das Geburtsdatum um eine gleichverteilte Zufallszahl von −365 bis +365 Tagen verschoben wird (ohne 0). Das Heiratsdatum, der Himmel an diesem Tag und das Lebensalter bleiben gleich; nur das Geburtshoroskop ändert sich. So fallen Effekte heraus, die alle Menschen im selben Alter oder am selben Kalendertag betreffen (zum Beispiel Saturn-Wiederkehr).

## Kennzahl
Rang je Ereignis `r` = Anteil der 100 Kontrollen mit kleinerem Wert als der eigene (Gleichstand zählt halb). Ohne Zusammenhang ist `r` gleichverteilt, der Mittelwert liegt bei 0,5.

## Entscheidungsregel
- Primär: Mittelwert von `r` gegen 0,5, zweiseitiger Test mit Bootstrap (10 000 Ziehungen), Signifikanzniveau 5 %.
- Sekundär (nur beschreibend): Anteil der Ereignisse mit `r ≥ 0,9` gegen die erwarteten 10 % (Binomialtest).
- Ein Signal gilt nur, wenn der Mittelwert über 0,5 liegt und der Test signifikant ist. Sonst wird „kein Zusammenhang nachweisbar“ berichtet.

## Bekannte Schwächen (vorab)
- Prominente sind nicht repräsentativ; Heiratstermine können bewusst (auch astrologisch) gewählt worden sein, was ein Signal erzeugen könnte.
- Ohne Geburtszeit fehlen Deszendent, Häuser und Mond, die für Beziehungen zentral sind: Ein negatives Ergebnis widerlegt nicht die Methode mit Geburtszeit.
- Wikidata-Angaben können fehlerhaft sein.
- Getestet wird nur die Heirat; die Kindergeburt bleibt ungetestet (Mond ist dafür zentral).
