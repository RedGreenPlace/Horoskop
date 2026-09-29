#!/usr/bin/env node
/*
 * Abgleich der Themen-Werte mit bekannten Lebensereignissen einer Person (Einzelfall, keine Prüfung).
 * Zuordnung VOR der Rechnung festgelegt: Heirat -> partnership, Geburt des ersten Kindes -> family.
 * Rang = Anteil der Vergleichs-Geburtsdaten (±365 Tage verschoben, gleiche Uhrzeit und Ort), deren Wert am Tag
 * niedriger ist als beim echten Geburtsdatum; zusätzlich Rang innerhalb des eigenen Zeitraums 2018–2026.
 * Aufruf: node tools/abgleich_ereignisse.js [JJJJ-MM-TT HH:MM lat lon zone]
 */
const A = require('../js/astro.js');
global.Astro = A;
const L = require('../js/lifeevents.js');
const [bd = '1996-03-02', bt = '05:14', lat = '51.5364', lon = '7.2228'] = process.argv.slice(2);
const [y, m, d] = bd.split('-').map(Number);
const [h, mi] = bt.split(':').map(Number);
const birth = new Date(Date.UTC(y, m - 1, d, h - 1, mi)); // Zone Europe/Berlin im März: UTC+1
const DAY = 86400000;
const events = [
  { label: 'Heirat (21.02.2020)', date: new Date(Date.UTC(2020, 1, 21, 11, 0)), topic: 'partnership' },
  { label: 'Heirat (29.02.2020)', date: new Date(Date.UTC(2020, 1, 29, 11, 0)), topic: 'partnership' },
  { label: 'Geburt des ersten Kindes (29.07.2024)', date: new Date(Date.UTC(2024, 6, 29, 11, 0)), topic: 'family' },
];
let rnd = 20260929; const rand = () => (rnd = (rnd * 1664525 + 1013904223) % 4294967296) / 4294967296;
const K = 400;
const natalOf = (b) => A.natalChart(b, +lat, +lon, true);
const scoresAt = (natal, date, ctx) => L.contributions(natal, A.planetPositions(date), L.natalPoints(natal), { ...ctx, date });
const ecl = (date) => ({ eclipses: A.eclipses(new Date(date.getTime() - 95 * DAY), new Date(date.getTime() + 95 * DAY)) });
const own = natalOf(birth);
const shifts = Array.from({ length: K }, () => { let s = 0; while (s === 0) s = Math.floor(rand() * 731) - 365; return s; });
const controlNatals = shifts.map((s) => natalOf(new Date(birth.getTime() + s * DAY)));
const series = L.scan(own, new Date(Date.UTC(2018, 0, 1)), new Date(Date.UTC(2026, 8, 29)), 2).series;
console.log(`Geburt ${bd} ${bt} (Europe/Berlin), ${K} Vergleichs-Geburtsdaten (±365 Tage), Zeitraum 2018–2026\n`);
const out = [];
events.forEach((ev) => {
  const ctx = ecl(ev.date);
  const c = scoresAt(own, ev.date, ctx);
  const ctrl = controlNatals.map((n) => scoresAt(n, ev.date, ctx));
  const rows = L.TOPICS && Object.keys(L.TOPICS).map((k) => {
    const v = c[k].total;
    const rc = ctrl.filter((x) => x[k].total < v).length / K;
    const rs = series[k].filter((x) => x < v).length / series[k].length;
    return { k, label: L.TOPICS[k].label, v, rc, rs };
  });
  const target = rows.find((r) => r.k === ev.topic);
  const order = rows.slice().sort((a, b) => b.rc - a.rc);
  console.log(`${ev.label}: Thema „${target.label}“ – Rang gegen Vergleichsdaten ${target.rc.toFixed(2)}, Rang im eigenen Zeitraum ${target.rs.toFixed(2)}, Platz ${order.findIndex((r) => r.k === ev.topic) + 1} von 12 Themen`);
  console.log('   Themen nach Rang gegen Vergleichsdaten: ' + order.map((r) => `${r.label} ${r.rc.toFixed(2)}`).join(' · '));
  const N = (k) => (A.PLANET_NAMES[k] || { asc: 'Aszendent', mc: 'MC', desc: 'Deszendent', ic: 'IC', node: 'Mondknoten' }[k] || k);
  c[ev.topic].items.slice().sort((a, b) => b.value - a.value).slice(0, 5).forEach((x) => {
    console.log(`   · ${x.kind === 'aspect' ? `${N(x.transit)} ${x.aspect.symbol} ${N(x.natal)}` : x.kind === 'eclipse' ? `${x.eclipseKind || 'Finsternis'} ${x.natal ? 'auf ' + N(x.natal) : ''}` : x.kind === 'progression' ? `fortgeschriebener ${N(x.prog || x.transit || '')} ${x.aspect ? x.aspect.symbol : ''} ${N(x.natal || '')}` : x.kind} (Gewicht ${x.value.toFixed(2)})`);
  });
  out.push({ ev, target });
});
