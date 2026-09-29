const assert = require('assert');
const V = require('../js/verflechtung.js');
const A = require('../js/astro.js');
const I = require('../js/interpret.js');
const P = V.PLANETS;
const JARGON = /Aspekt|Transit|Quadrat|Trigon|Opposition|Konjunktion|Sextil|Haus\b|Aszendent|Radix/;
let n = 0;
for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
  const a = V.aufloesung(P[i], P[j]), b = V.aufloesung(P[j], P[i]);
  assert(a && a === b, `Auflösung fehlt: ${P[i]}|${P[j]}`);
  for (const c of ['FF', 'FH', 'HH']) for (let v = 0; v < 3; v++) {
    const s = V.pair(P[i], P[j], c, v);
    assert(s && !/undefined|\{/.test(s), s); assert(!JARGON.test(s), s); n++;
  }
  assert(!JARGON.test(a), a);
}
for (const r of Object.keys(V.BRIDGE)) for (const d of Object.keys(V.DOMAIN)) for (let v = 0; v < V.BRIDGE[r].length; v++) {
  const s = V.bridge(r, d, v); assert(!/undefined|\{/.test(s), s); assert(!JARGON.test(s), s); n++;
}
for (const k of Object.keys(V.PATTERNS)) for (const d of Object.keys(V.DOMAIN)) for (let v = 0; v < V.PATTERNS[k].length; v++) {
  const s = V.pattern(k, d, v); assert(!/undefined|\{/.test(s), s); assert(!JARGON.test(s), s); n++;
}
// Integration: Text über 60 Tage ohne Fehler und ohne Fachbegriffe
const natal = A.natalChart(new Date(Date.UTC(1996, 2, 2, 2, 15)), 51.5364, 7.2228, true);
for (let d = 0; d < 60; d++) {
  const w = new Date(Date.UTC(2026, 8, 1 + d, 17, 0));
  const h = I.dailyHoroscope(natal, A.planetPositions(w), `s${d}`, { when: w, timeZone: 'Europe/Berlin' });
  assert(!/undefined|NaN|\{[NA]\}/.test(h.plain.text), h.plain.text);
  assert(!JARGON.test(h.plain.text), h.plain.text);
}
console.log(`Verflechtungs-Tests bestanden: ${n} Sätze geprüft, 60 Tage ohne Fachbegriffe`);
