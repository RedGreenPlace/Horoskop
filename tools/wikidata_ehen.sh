#!/usr/bin/env bash
# Holt aus Wikidata Menschen mit tagesgenauem Geburtsdatum und tagesgenauem Beginn einer Ehe (P26/P580).
# Nur gregorianische Daten. Pro Geburtsjahr eine Abfrage, damit die Abfragezeit nicht überschritten wird.
# Aufruf: tools/wikidata_ehen.sh <Ausgabedatei.tsv> [Startjahr] [Endjahr]
# Ausgabe: Q-Nummer <TAB> Geburtsdatum <TAB> Heiratsdatum
set -u
OUT="${1:?Ausgabedatei fehlt}"
FROM="${2:-1880}"
TO="${3:-1995}"
: > "$OUT"
for Y in $(seq "$FROM" "$TO"); do
  Q="SELECT ?p ?b ?d WHERE {
    ?p wdt:P31 wd:Q5.
    ?p p:P569 ?bs. ?bs psv:P569 ?bv. ?bv wikibase:timeValue ?b; wikibase:timePrecision 11; wikibase:timeCalendarModel wd:Q1985727.
    ?p p:P26 ?s. ?s pqv:P580 ?dv. ?dv wikibase:timeValue ?d; wikibase:timePrecision 11; wikibase:timeCalendarModel wd:Q1985727.
    FILTER(YEAR(?b) = $Y)
  }"
  for TRY in 1 2 3; do
    RES=$(curl -sS -m 90 -G "https://query.wikidata.org/sparql" --data-urlencode "query=$Q" \
      -H "Accept: text/tab-separated-values" -H "User-Agent: horoskop-pruefung/0.1 (Forschungstest; kein Massenabruf)" 2>/dev/null)
    if printf '%s' "$RES" | head -1 | grep -q '^?p'; then
      printf '%s\n' "$RES" | tail -n +2 | sed -e 's|<http://www.wikidata.org/entity/||' -e 's|>||g' -e 's|"||g' -e 's|\^\^xsd:dateTime||g' -e 's|\^\^<http://www.w3.org/2001/XMLSchema#dateTime||g' -e 's|T00:00:00Z||g' >> "$OUT"
      break
    fi
    sleep 5
  done
  sleep 2
done
echo "Zeilen: $(wc -l < "$OUT")"
