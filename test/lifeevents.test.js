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

// Neue Bausteine: Psychologie, Finsternisse, Progression, Mondknoten
ch.forEach((c) => assert(c.psych && c.psych.length > 20 && c.summary.includes('Innere Frage:'), 'Leitfrage fehlt'));
assert(ch.every((c) => typeof c.began === 'boolean' && typeof c.ongoing === 'boolean'));
assert(L.natalPoints(natal).some((p) => p.key === 'node'), 'Mondknoten fehlt');
const ctx = L.makeCtx(natal, from, to);
assert(ctx.eclipses.length >= 8, 'Finsternisse fehlen: ' + ctx.eclipses.length);
const kinds = new Set();
const pts2 = L.natalPoints(natal);
for (let t = from.getTime(); t <= to.getTime(); t += 5 * 864e5) {
  const d = new Date(t);
  const c = L.contributions(natal, A.planetPositions(d), pts2, { ...ctx, date: d });
  Object.values(c).forEach((x) => x.items.forEach((i) => kinds.add(i.kind)));
}
['aspect', 'eclipse', 'progression', 'house'].forEach((k) => assert(kinds.has(k), 'Beitragsart nie aufgetreten: ' + k));
Object.values(L.PSYCH).forEach((t) => assert(t.R && t.B && t.W));
assert.strictEqual(Object.keys(L.PSYCH).length, 12);
console.log('OK   Beitragsarten:', [...kinds].join(', '));

// Ereignis-Ebene: vollständige Tabelle, Signale, Kapitel mit konkreten Ereignissen
const SIGNALS = ['begin', 'commit', 'end', 'upheaval', 'sudden', 'dissolve'];
Object.keys(L.TOPICS).forEach((tk) => SIGNALS.forEach((sg) => assert(L.EVENTS[tk] && L.EVENTS[tk][sg] && L.EVENTS[tk][sg].length > 10, `Ereignis fehlt: ${tk}/${sg}`)));
const top1 = (items) => L.signalsOf(items)[0].signal;
assert.strictEqual(top1([{ kind: 'eclipse', eclipseKind: 'solar', tone: 'V', value: 1 }]), 'begin');
assert.strictEqual(top1([{ kind: 'eclipse', eclipseKind: 'lunar', tone: 'V', value: 1 }]), 'end');
assert.strictEqual(top1([{ kind: 'aspect', transit: 'saturn', tone: 'F', value: 1 }]), 'commit');
assert.strictEqual(top1([{ kind: 'aspect', transit: 'uranus', tone: 'V', value: 1 }]), 'sudden');
assert.strictEqual(top1([{ kind: 'aspect', transit: 'neptune', tone: 'V', value: 1 }]), 'dissolve');
assert.strictEqual(top1([{ kind: 'aspect', transit: 'jupiter', tone: 'F', value: 1 }]), 'begin');
assert.strictEqual(top1([{ kind: 'aspect', transit: 'mars', tone: 'H', value: 1 }]), 'upheaval');
assert.deepStrictEqual(L.signalsOf([{ kind: 'house', value: 5 }]), [], 'Haus-Beiträge zählen nicht als Signal');
ch.forEach((c) => {
  assert(c.events.length >= 1 && c.events.length <= 2 && c.events.every((e) => e.length > 10), 'Ereignisse fehlen');
  assert(c.signals.length === c.events.length);
  assert(c.summary.includes('Typisch für so eine Phase (keine Vorhersage):'));
});
// Eine Sonnenfinsternis als stärkster Treiber führt zu „Beginn“, eine Mondfinsternis zu „Ende“
const withEcl = L.chapters(natal, from, to, { limit: 40, perTopic: 3, minStrength: 0.8 });
withEcl.forEach((c) => {
  const first = c.drivers[0];
  if (first && first.kind === 'eclipse') assert(c.signals.includes('Beginn') || c.signals.includes('Ende') || c.signals.includes('Umbruch'), 'Finsternis ohne passendes Signal');
});
console.log('OK   Ereignis-Ebene:', ch.slice(0, 3).map((c) => `${c.label}: ${c.signals.join('+')}`).join(' | '));

// Ohne Geburtszeit: läuft ohne Aszendent, MC und Häuser
const noTime = A.natalChart(new Date(Date.UTC(1996, 2, 2, 11, 0)), 51.5364, 7.2228, false);
const c2 = L.chapters(noTime, from, to, { limit: 5 });
assert(Array.isArray(c2));
const pts = L.natalPoints(noTime).map((p) => p.key);
assert(!pts.includes('asc') && !pts.includes('mc'));
console.log('Lebensereignis-Tests bestanden');
