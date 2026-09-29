#!/usr/bin/env node
/*
 * Rückblick-Test: node tools/rueckblick.js <Geburtsdatum> <Uhrzeit> <Breite> <Länge> <Zeitzone> [Jahre] [Enddatum]
 * Beispiel:       node tools/rueckblick.js 1996-03-02 03:15 51.5364 7.2228 Europe/Berlin 5 2026-09-29
 * Prüfung:        ... --check 2023-05-14:partnership   (Rang eines Tages im Zeitraum)
 */
const A = require('../js/astro.js');
const L = require('../js/lifeevents.js');

const argv = process.argv.slice(2);
const checks = [];
for (let i = argv.length - 1; i >= 0; i--) if (argv[i] === '--check') { checks.push(argv[i + 1]); argv.splice(i, 2); }
const [date, time, lat, lon, tz, yearsArg, endArg] = argv;
if (!date || !time || !lat || !lon || !tz) { console.error('Aufruf: siehe Kopfzeile dieser Datei.'); process.exit(1); }

function tzOffsetMs(utcMs) {
  const p = {};
  new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
    .formatToParts(new Date(utcMs)).forEach((x) => { p[x.type] = +x.value; });
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(utcMs / 1000) * 1000;
}
const [y, m, d] = date.split('-').map(Number);
const [h, mi] = time.split(':').map(Number);
const guess = Date.UTC(y, m - 1, d, h, mi);
let utc = guess - tzOffsetMs(guess);
utc = guess - tzOffsetMs(utc);
const natal = A.natalChart(new Date(utc), +lat, +lon, true);

const to = endArg ? new Date(endArg + 'T12:00:00Z') : new Date();
const from = new Date(to.getTime() - (+yearsArg || 5) * 365.25 * 86400000);
const fmt = (x) => x.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });

console.log(`Rückblick ${fmt(from)} bis ${fmt(to)} – Geburt ${date} ${time} (${tz})\n`);
const ch = L.chapters(natal, from, to, { limit: 12, perTopic: 2 }).sort((a, b) => a.peak - b.peak);
ch.forEach((c) => {
  const flag = (c.began ? ' (begann schon vorher)' : '') + (c.ongoing ? ' (läuft weiter)' : '');
  console.log(`${fmt(c.peak)}  ${c.label} – ${c.tone}  (Phase ${fmt(c.start)} bis ${fmt(c.end)}${flag}, Stärke ${c.strength.toFixed(2)})`);
  c.drivers.forEach((x) => console.log(`    · ${x.text}`));
  console.log(`    → Typisch (${c.signals.join(', ')}, keine Vorhersage): ${c.events.join(' oder ')}`);
  console.log(`    ? Innere Frage: ${c.psych}`);
});
checks.forEach((c) => {
  const [ds, tk] = c.split(':');
  const r = L.rankAt(natal, tk, new Date(ds + 'T12:00:00Z'), from, to);
  console.log(`\nPrüfung ${ds} / ${L.TOPICS[tk].label}: ${(r * 100).toFixed(0)} % der Tage im Zeitraum sind ruhiger.`);
});
