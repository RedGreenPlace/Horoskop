const assert = require('assert');
const A = require('../js/astro.js');
global.Astro = A;
const L = require('../js/lifeevents.js');

const natal = A.natalChart(new Date(Date.UTC(1996, 2, 2, 2, 15)), 51.5364, 7.2228, true);
const from = new Date(Date.UTC(2021, 8, 29, 12));
const to = new Date(Date.UTC(2026, 8, 29, 12));

// Astronomie-Plausibilität: Saturn-Wiederkehr (Saturn trifft das eigene Geburts-Saturn) im Alter von ~29 Jahren
const ret = A.exactTime('saturn', natal.planets.saturn.lon, 0, new Date(Date.UTC(2025, 6, 1)), 24 * 365 / 2, 12);
assert(ret && ret >= new Date(Date.UTC(2025, 0, 1)) && ret <= new Date(Date.UTC(2026, 5, 30)), 'Saturn-Wiederkehr: ' + ret);
console.log('OK   Saturn-Wiederkehr um', ret.toISOString().slice(0, 10));

// Zwölf Themen, jedes mit Gewichten und Beispielen
assert.strictEqual(Object.keys(L.TOPICS).length, 12);
Object.values(L.TOPICS).forEach((t) => assert(t.label && t.examples && Object.keys(t.targets).length && Object.keys(t.houses).length));

// Kapitel: Struktur, Zeitraum, Reihenfolge, Determinismus, Laufzeit
const t0 = Date.now();
const ch = L.chapters(natal, from, to, { limit: 12, perTopic: 2 });
const ms = Date.now() - t0;
assert(ch.length > 0 && ch.length <= 12);
for (let i = 0; i < ch.length; i++) {
  const c = ch[i];
  assert(c.peak >= from && c.peak <= to && c.start <= c.peak && c.peak <= c.end, 'Phase ungültig');
  assert(['Rückenwind', 'Belastung oder Umbruch', 'Wendepunkt'].includes(c.tone));
  assert(c.drivers.length <= 2 && c.drivers.every((d) => d.text && d.text.length > 10));
  assert(c.strength >= 1);
  if (i) assert(ch[i - 1].strength >= c.strength, 'nicht nach Stärke sortiert');
}
assert.deepStrictEqual(JSON.stringify(L.chapters(natal, from, to, { limit: 12, perTopic: 2 })), JSON.stringify(ch), 'nicht deterministisch');
assert(ms < 5000, 'zu langsam: ' + ms + ' ms');
console.log(`OK   ${ch.length} Kapitel in ${ms} ms`);

// Themenauswahl schränkt ein
const only = L.chapters(natal, from, to, { topics: ['career'], perTopic: 3 });
assert(only.every((c) => c.topic === 'career'));

// Rang: der Höhepunkt eines Kapitels liegt im oberen Bereich des Zeitraums
const top = ch[0];
const r = L.rankAt(natal, top.topic, top.peak, from, to);
assert(r >= 0.85, 'Rang des Höhepunkts: ' + r);
console.log('OK   Rang des stärksten Kapitels:', (r * 100).toFixed(0), '%');

// Ohne Geburtszeit: läuft ohne Aszendent, MC und Häuser
const noTime = A.natalChart(new Date(Date.UTC(1996, 2, 2, 11, 0)), 51.5364, 7.2228, false);
const c2 = L.chapters(noTime, from, to, { limit: 5 });
assert(Array.isArray(c2));
const pts = L.natalPoints(noTime).map((p) => p.key);
assert(!pts.includes('asc') && !pts.includes('mc'));
console.log('Lebensereignis-Tests bestanden');
