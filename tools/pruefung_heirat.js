#!/usr/bin/env node
/*
 * Prüfung nach docs/pruefplan.md: Liegt der Partnerschafts-Wert des Scanners am Heiratstag für das eigene
 * Geburtsdatum höher als für zufällig verschobene Geburtsdaten?
 *
 * Aufruf: node tools/pruefung_heirat.js <rohdaten.tsv> [--n 300] [--kontrollen 100] [--saat 20260929]
 * Rohdaten: Ausgabe von tools/wikidata_ehen.sh (Q-Nummer, Geburtsdatum, Heiratsdatum je Zeile).
 * Schreibt die Stichprobe nach data/heirat_stichprobe.tsv, BEVOR ausgewertet wird.
 */
const fs = require('fs');
const path = require('path');
const A = require('../js/astro.js');
global.Astro = A;
const L = require('../js/lifeevents.js');

const args = process.argv.slice(2);
const file = args[0];
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? +args[i + 1] : def; };
const N = opt('--n', 300);
const K = opt('--kontrollen', 100);
const SEED = opt('--saat', 20260929);
if (!file) { console.error('Aufruf: siehe Kopfzeile dieser Datei.'); process.exit(1); }

// ---------- Zufall mit festem Saatkorn ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(SEED);
const DAY = 86400000;
const parse = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12, 0));
  return d.getUTCMonth() === +m[2] - 1 ? d : null; // ungültige Kalendertage aussortieren
};
const iso = (d) => d.toISOString().slice(0, 10);

// ---------- Daten einlesen und nach Plan filtern ----------
const byPerson = new Map();
fs.readFileSync(file, 'utf8').split('\n').forEach((line) => {
  const [q, b, w] = line.split('\t');
  if (!q || !b || !w) return;
  const bd = parse(b);
  const wd = parse(w);
  if (!bd || !wd) return;
  if (!byPerson.has(q)) byPerson.set(q, { births: new Set(), weddings: [] });
  const p = byPerson.get(q);
  p.births.add(iso(bd));
  p.weddings.push(wd);
});
let stats = { personen: byPerson.size, mehrereGeburtsdaten: 0, keineGueltigeHeirat: 0 };
const events = [];
[...byPerson.keys()].sort().forEach((q) => {
  const p = byPerson.get(q);
  if (p.births.size !== 1) { stats.mehrereGeburtsdaten++; return; }
  const bd = parse([...p.births][0]);
  const ok = p.weddings
    .filter((w) => {
      const age = (w - bd) / (365.2425 * DAY);
      return bd.getUTCFullYear() >= 1880 && bd.getUTCFullYear() <= 1995 && age >= 16 && age <= 80 && w <= new Date(Date.UTC(2024, 11, 31));
    })
    .sort((x, y) => x - y);
  if (!ok.length) { stats.keineGueltigeHeirat++; return; }
  events.push({ q, birth: bd, wedding: ok[0] });
});
console.log('Rohdaten:', JSON.stringify(stats), '| Ereignisse nach Filter:', events.length);

// ---------- Stichprobe ziehen (zufällig, festes Saatkorn) und speichern ----------
for (let i = events.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [events[i], events[j]] = [events[j], events[i]]; }
const sample = events.slice(0, N);
const outDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'heirat_stichprobe.tsv'), sample.map((e) => `${e.q}\t${iso(e.birth)}\t${iso(e.wedding)}`).join('\n') + '\n');
console.log(`Stichprobe: ${sample.length} Ereignisse gespeichert in data/heirat_stichprobe.tsv (Saatkorn ${SEED})`);

// ---------- Bewertung ----------
const TOPIC = 'partnership';
function score(birth, date, ctxBase) {
  const natal = A.natalChart(birth, 0, 0, false); // ohne Geburtszeit: keine Häuser und Winkel
  const pts = L.natalPoints(natal).filter((p) => p.key !== 'moon');
  const c = L.contributions(natal, ctxBase.pos, pts, { eclipses: ctxBase.eclipses, date, skipProgMoon: true });
  return c[TOPIC].total;
}
function context(date) {
  return { pos: A.planetPositions(date), eclipses: A.eclipses(new Date(date.getTime() - 95 * DAY), new Date(date.getTime() + 95 * DAY)) };
}
function rankOf(own, controls) {
  let lower = 0;
  let equal = 0;
  controls.forEach((c) => { if (c < own - 1e-12) lower++; else if (Math.abs(c - own) <= 1e-12) equal++; });
  return (lower + 0.5 * equal) / controls.length;
}
function eventRank(birth, date) {
  const ctx = context(date);
  const own = score(birth, date, ctx);
  const controls = [];
  for (let k = 0; k < K; k++) {
    let shift = 0;
    while (shift === 0) shift = Math.floor(rand() * 731) - 365;
    controls.push(score(new Date(birth.getTime() + shift * DAY), date, ctx));
  }
  return { own, r: rankOf(own, controls) };
}

// ---------- Statistik ----------
function summarize(label, rs) {
  const n = rs.length;
  const mean = rs.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(rs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
  const se = sd / Math.sqrt(n);
  const z = (mean - 0.5) / se;
  const phi = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
  const p = 2 * (1 - phi(Math.abs(z)));
  // Bootstrap-Konfidenzintervall
  const means = [];
  const brand = rng(SEED + 1);
  for (let b = 0; b < 10000; b++) { let s = 0; for (let i = 0; i < n; i++) s += rs[Math.floor(brand() * n)]; means.push(s / n); }
  means.sort((x, y) => x - y);
  const hi = rs.filter((x) => x >= 0.9).length;
  const pb = 1 - phi((hi - 0.1 * n - 0.0) / Math.sqrt(n * 0.1 * 0.9)); // einseitig, Normalnäherung
  console.log(`\n${label}`);
  console.log(`  n = ${n}, mittlerer Rang = ${mean.toFixed(3)} (Erwartung ohne Zusammenhang: 0,500), sd = ${sd.toFixed(3)}`);
  console.log(`  95%-Bootstrap-Intervall: ${means[250].toFixed(3)} bis ${means[9750].toFixed(3)} | z = ${z.toFixed(2)}, p (zweiseitig) = ${p.toFixed(3)}`);
  console.log(`  Ereignisse mit Rang >= 0,90: ${hi} von ${n} (${(100 * hi / n).toFixed(1)} %, erwartet 10 %), p (einseitig) ≈ ${pb.toFixed(3)}`);
  const bins = [0, 0, 0, 0, 0];
  rs.forEach((x) => { bins[Math.min(4, Math.floor(x * 5))]++; });
  console.log(`  Verteilung der Ränge (Fünftel, gleichverteilt wäre ${(n / 5).toFixed(0)} je Fünftel): ${bins.join(' | ')}`);
  return { mean, p, hi, n };
}
function erf(x) {
  const s = Math.sign(x);
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}

const t0 = Date.now();
const real = sample.map((e) => eventRank(e.birth, e.wedding).r);
summarize('ERGEBNIS: echte Heiratstermine', real);

// Nullkalibrierung: dieselbe Auswertung mit zufälligen Tagen im Alter von 20 bis 60 (kein Zusammenhang möglich)
const nullRs = sample.map((e) => {
  const age = 20 + rand() * 40;
  return eventRank(e.birth, new Date(e.birth.getTime() + age * 365.2425 * DAY)).r;
});
summarize('KONTROLLE (Nullkalibrierung): zufällige Tage statt Heirat – muss um 0,500 liegen', nullRs);

// Positivkontrolle: am Tag mit dem höchsten Partnerschafts-Wert im Zeitraum ±2 Jahre um die Heirat (Empfindlichkeitstest)
const posRs = sample.slice(0, Math.min(60, sample.length)).map((e) => {
  let bestD = e.wedding;
  let bestS = -1;
  for (let off = -730; off <= 730; off += 7) {
    const d = new Date(e.wedding.getTime() + off * DAY);
    const s = score(e.birth, d, context(d));
    if (s > bestS) { bestS = s; bestD = d; }
  }
  return eventRank(e.birth, bestD).r;
});
summarize('KONTROLLE (Positivkontrolle): Tage mit dem höchsten Wert – muss deutlich über 0,500 liegen', posRs);
console.log(`\nRechenzeit: ${((Date.now() - t0) / 1000).toFixed(0)} s`);
