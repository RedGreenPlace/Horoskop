const assert = require('assert');
const F = require('../js/feinheit.js');

const JARGON = /(Pluto|Saturn|Uranus|Neptun|Merkur|Jupiter|Venus\b|Mars\b|Sextil|Trigon|Quadrat|Opposition|Konjunktion|Aszendent|Medium Coeli|\d\. Haus|Transit|Widder|Stier|Zwillinge|Krebs|Löwe|Jungfrau|Waage|Skorpion|Schütze|Steinbock|Wassermann|Fische)/;
const seen = new Set();
const add = (s, label) => {
  assert(typeof s === 'string' && s.length > 15, `Text fehlt: ${label}`);
  assert(!/undefined|NaN|null/.test(s), `Platzhalter im Text: ${label}: ${s}`);
  assert(!JARGON.test(s), `Fachbegriff: ${label}: ${s}`);
  assert(/[.?!]$/.test(s), `Kein Satzende: ${label}: ${s}`);
  assert(!seen.has(s), `Doppelter Satz: ${label}: ${s}`);
  seen.add(s);
};

let count = 0;
F.PLANETS.forEach((p) => {
  for (let h = 1; h <= 12; h++) for (const v of [0, 1]) { add(F.transitHouse(p, h, v), `transitHouse ${p} ${h} ${v}`); add(F.natalHouse(p, h, v), `natalHouse ${p} ${h} ${v}`); count += 2; }
  for (let s = 0; s < 12; s++) for (const v of [0, 1]) { add(F.transitSign(p, s, v), `transitSign ${p} ${s} ${v}`); add(F.natalSign(p, s, v), `natalSign ${p} ${s} ${v}`); count += 2; }
});
// Aspektart: 10 laufende Planeten × 12 Geburtspunkte × (Opposition, Sextil)
[...F.PLANETS, 'asc', 'mc'].forEach((n) => F.PLANETS.forEach((t) => {
  ['opposition', 'sextile'].forEach((k) => { add(F.aspectNuance(t, n, k), `nuance ${t} ${n} ${k}`); count++; });
}));
assert.strictEqual(F.aspectNuance('pluto', 'moon', 'trine'), null);
assert.strictEqual(F.aspectNuance('pluto', 'moon', 'square'), null);
assert.strictEqual(F.aspectNuance('pluto', 'moon', 'conjunction'), null);
assert.strictEqual(F.natalHouse('asc', 1, 0), null);
assert.strictEqual(F.natalSign('mc', 3, 0), null);
assert.strictEqual(F.LOC.length, 12);
assert.strictEqual(F.MANNER.length, 12);
console.log(`Feinheits-Tests bestanden: ${count} verschiedene Sätze erzeugt`);
