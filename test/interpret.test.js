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
// Jede Kombination hat einen eigenen Text
A.PLANETS.forEach((t) => [...A.PLANETS, 'asc', 'mc'].forEach((nk) => ['F', 'H', 'V'].forEach((tone) => assert(I.themeFor(t, nk, tone) && I.themeFor(t, nk, tone).length > 20, `THEME ${t}>${nk}>${tone}`))));
// Tagessynthese vorhanden und tagesabhängig
assert(h.overview.length > 30);
assert.notStrictEqual(h.overview, I.dailyHoroscope(hamburg, tomorrow, 'a').overview, 'Synthese nicht tagesabhängig');
assert(/Uhr/.test(I.rhythm(0, 1, '14:20')));
// Verflochtene Tagesdeutung: Beispiel Herne, 27.09.2026 19:00 Berlin
const herne = A.natalChart(new Date(Date.UTC(1996, 2, 2, 2, 15)), 51.5364, 7.2228, true);
const when = new Date(Date.UTC(2026, 8, 27, 17, 0));
const hs = I.dailyHoroscope(herne, A.planetPositions(when), 'x', { when, timeZone: 'Europe/Berlin' });
assert(hs.story, 'Story fehlt');
assert(/Der Tag dreht sich um deinen Mond/.test(hs.story), hs.story);
assert(/Pluto in Opposition zu deinem Mond/.test(hs.story), hs.story);
assert(/Ausgelöst wird das durch Sonne im Sextil zu deinem Mond \(exakt um 21:22 Uhr\)/.test(hs.story), hs.story);
assert(!/undefined|NaN/.test(hs.story + hs.advice));
assert(hs.advice && hs.advice !== h.advice);
// Exaktheit nutzt den echten Zeitpunkt: Saturn □ Jupiter war schon am 26.9. exakt
const sj = hs.aspects.find((a) => a.title.startsWith('Saturn') && a.natal === 'jupiter');
assert(sj && sj.details.some((d) => /war am 26\.9\. um 05:27 Uhr exakt und klingt ab/.test(d)), JSON.stringify(sj && sj.details));
// Ohne opts weiterhin lauffähig
assert(typeof run(hamburg, 'a').story === 'string');
// Klartext-Modus: durchgehender Text ohne Fachbegriffe, mit Ursache, Auslöser und Uhrzeiten
const JARGON = /(Pluto|Saturn|Uranus|Neptun|Merkur|Jupiter|Sextil|Trigon|Quadrat|Opposition|Konjunktion|Aszendent|Medium Coeli|\d\. Haus|Transit)/;
A.PLANETS.forEach((t) => [...A.PLANETS, 'asc', 'mc'].forEach((nk) => ['F', 'H', 'V'].forEach((tone) => assert(!JARGON.test(I.themeFor(t, nk, tone)), `Fachbegriff in THEME ${t}>${nk}>${tone}`))));
// Die drei Tonarten eines Paares sind verschieden
A.PLANETS.forEach((t) => [...A.PLANETS, 'asc', 'mc'].forEach((nk) => assert(new Set(['F', 'H', 'V'].map((x) => I.themeFor(t, nk, x))).size === 3, `Tonarten gleich ${t}>${nk}`)));
assert(hs.plain && hs.plain.text.includes('\n\n'));
assert(!JARGON.test(hs.plain.headline + hs.plain.text + hs.moonPlain + hs.advice), 'Fachbegriff im Klartext');
assert(hs.plain.text.includes('Was raus will, ist das Bedürfnis nach Wärme, Anerkennung und Geborgenheit.'));
assert(hs.plain.text.includes('Zurückgehalten wird es von der Angst, die Kontrolle zu verlieren oder dich auszuliefern.'));
assert(hs.plain.text.includes('Um 21:22 Uhr wird es leichter'), hs.plain.text);
assert(/Um 06:55 Uhr: Worte und Zuwendung passen nicht zusammen/.test(hs.plain.text), hs.plain.text);
assert(/Ausblick: Am Mittwoch um 04:39 Uhr/.test(hs.plain.text), hs.plain.text);
assert(/Kurz nach Vollmond/.test(hs.moonPlain), hs.moonPlain);
// Am Folgetag liegt der Auslöser schon hinter dir und wird nicht als Zukunft dargestellt
const w2 = new Date(Date.UTC(2026, 8, 28, 10, 0));
const h2 = I.dailyHoroscope(herne, A.planetPositions(w2), 'x', { when: w2, timeZone: 'Europe/Berlin' });
assert(/Im Lauf des Tages wird es leichter/.test(h2.plain.text) && !/Am Sonntag/.test(h2.plain.text), h2.plain.text);
assert(/Um 21:28 Uhr/.test(h2.plain.text) && /Um 16:42 Uhr wechselt die Grundstimmung/.test(h2.plain.text), h2.plain.text);
assert(!/undefined|NaN/.test(h2.plain.text));
// Psychologische Leitfrage im Klartext (ohne Fachbegriffe)
assert(/Frage an dich: /.test(hs.plain.text) && /Frage an dich: /.test(h2.plain.text), 'Leitfrage fehlt');
assert(!JARGON.test(h2.plain.text), 'Fachbegriff im Klartext von heute');
console.log('Interpretationstests bestanden');
console.log(h.aspects[0].title, '\n ', h.aspects[0].text, '\n ', h.aspects[0].details.join('\n  '));
