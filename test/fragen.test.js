const assert = require('assert');
const F = require('../js/fragen.js');
const A = require('../js/astro.js');
const JARGON = /(Pluto|Saturn|Uranus|Neptun|Merkur|Jupiter|Sextil|Trigon|Quadrat|Opposition|Konjunktion|Aszendent|Medium Coeli|Haus\b|Transit|Planet)/;
const natals = [...A.PLANETS, 'asc', 'mc'];
const all = [];
A.PLANETS.forEach((t) => natals.forEach((n) => ['F', 'H', 'V'].forEach((tone) => {
  const q = F.questionFor(t, n, tone);
  assert(typeof q === 'string' && q.endsWith('?'), `Frage fehlt/ohne Fragezeichen: ${t}>${n}>${tone}`);
  assert(!JARGON.test(q), `Fachbegriff: ${q}`);
  assert(!/undefined|\{|  /.test(q), q);
  all.push(q);
})));
assert.strictEqual(all.length, 360);
// Die drei Tonarten eines Paares sind verschieden
A.PLANETS.forEach((t) => natals.forEach((n) => assert(new Set(['F', 'H', 'V'].map((x) => F.questionFor(t, n, x))).size === 3, `Tonarten gleich ${t}>${n}`)));
const distinct = new Set(all).size;
console.log(`Fragen-Tests bestanden: 360 Fragen, davon ${distinct} verschiedene`);
