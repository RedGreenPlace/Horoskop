const assert = require('assert');
const A = require('../js/astro.js');
global.Astro = A;
const I = require('../js/interpret.js');

const day = new Date(Date.UTC(2026, 8, 28, 10, 0));
const transit = A.planetPositions(day);
const chart = (utc, lat, lon, known = true) => A.natalChart(utc, lat, lon, known);
const run = (natal, seed) => I.dailyHoroscope(natal, transit, seed);
const flat = (h) => JSON.stringify([h.intro, h.areas, h.aspects.map((a) => [a.title, a.text, a.details])]);

const hamburg = chart(new Date(Date.UTC(1990, 5, 15, 10, 30)), 53.55, 10, true);
const madrid = chart(new Date(Date.UTC(1990, 5, 15, 10, 30)), 40.4, -3.7, true);
const otherDay = chart(new Date(Date.UTC(1990, 5, 20, 10, 30)), 53.55, 10, true);
const noTime = chart(new Date(Date.UTC(1990, 5, 15, 12, 0)), 53.55, 10, false);

const h = run(hamburg, 'a');
// Jede Konstellation trägt Zeichen-, Haus- und Genauigkeitsangaben
h.aspects.forEach((a) => {
  assert(a.details.length >= 4, 'Details fehlen: ' + a.title);
  assert(a.details.some((d) => /Haus/.test(d)), 'Hausbezug fehlt: ' + a.title);
});
// Anderer Ort / anderer Tag / andere Zeit -> anderer Text
assert.notStrictEqual(flat(h), flat(run(madrid, 'a')), 'Ort ohne Wirkung');
assert.notStrictEqual(flat(h), flat(run(otherDay, 'a')), 'Geburtstag ohne Wirkung');
// Ohne Geburtszeit keine Hausaussagen, aber weiterhin ein Text
const n = run(noTime, 'a');
assert(n.aspects.every((a) => a.details.every((d) => !/Haus/.test(d))), 'Haus trotz unbekannter Zeit');
assert(n.intro.length > 0);
// Anderer Tag -> andere Konstellationen
const tomorrow = A.planetPositions(new Date(Date.UTC(2026, 9, 5, 10, 0)));
assert.notStrictEqual(flat(h), flat(I.dailyHoroscope(hamburg, tomorrow, 'a')), 'Datum ohne Wirkung');
// Aszendentherrscher-, Geburtsaspekt- und Profilzeilen
const prof = I.natalProfile(hamburg);
assert(prof.some((l) => /Aszendentherrscher/.test(l.heading || '')), 'Herrscher fehlt im Profil');
assert(!I.natalProfile(noTime).some((l) => /Aszendentherrscher/.test(l.heading || '')));
const nal = I.natalAspectLines(hamburg);
assert(nal.length > 0 && nal.every((l) => l.text && l.title));
assert(h.aspects.some((a) => a.details.some((d) => /im Geburtshoroskop/.test(d))), 'Geburtsaspekt-Bezug fehlt');
assert(h.aspects.every((a) => typeof a.natalLon === 'number'));
console.log('Interpretationstests bestanden');
console.log(h.aspects[0].title, '\n ', h.aspects[0].text, '\n ', h.aspects[0].details.join('\n  '));
