const assert = require('assert');
const A = require('../js/astro.js');
global.Astro = A;
const T = require('../js/themen.js');
const JARGON = /(Pluto|Saturn|Uranus|Neptun|Merkur|Jupiter|Sextil|Trigon|Quadrat|Opposition|Konjunktion|Aszendent|Haus\b|Transit|Planet)/;
T.TRANSIT.forEach((tp) => assert.strictEqual(T.VOCAB[tp].length, 3));
Object.values(T.TYPES).forEach((ty) => {
  ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].forEach((p) => assert(ty.meaning[p], `Bedeutung fehlt: ${ty.label} ${p}`));
  Object.values(ty.meaning).forEach((m) => assert(!JARGON.test(m), m));
});
Object.values(T.VOCAB).flat().forEach((s) => assert(!JARGON.test(s) && s.endsWith('.'), s));
// KI am 30.09.2026: Jupiter gegenüber Saturn des Thema-Horoskops (0,4°) ist die engste Berührung
const tr = A.planetPositions(new Date(Date.UTC(2026, 8, 30, 5, 0)));
const ki = T.lines({ type: 'ki' }, tr, 3);
assert(ki.length >= 1 && ki[0].transit === 'jupiter' && ki[0].natal === 'saturn' && ki[0].aspect.key === 'opposition', JSON.stringify(ki.map((x) => [x.transit, x.natal, x.aspect.key, x.orb])));
assert(/^KI – Regeln, Grenzen und Verlässlichkeit: Erwartungen und Versprechen/.test(ki[0].text), ki[0].text);
// Kind: Name wird eingesetzt, Datum kommt vom Nutzer
const kind = T.lines({ type: 'kind', name: 'Mila', date: new Date(Date.UTC(2024, 6, 29, 12, 0)) }, tr, 5);
kind.forEach((l) => { assert(l.text.startsWith('Mila – '), l.text); assert(!/undefined/.test(l.text)); });
assert.strictEqual(T.lines({ type: 'kind', name: 'Mila' }, tr).length, 0, 'ohne Datum keine Zeilen');
console.log(`Themen-Tests bestanden (KI: ${ki.length} Zeilen, Kind: ${kind.length} Zeilen am 30.09.2026)`);
