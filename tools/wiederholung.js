// Misst die Wiederholung der Klartexte über 60 aufeinanderfolgende Tage.
const A = require('../js/astro.js');
const I = require('../js/interpret.js');
const natal = A.natalChart(new Date(Date.UTC(1996, 2, 2, 2, 15)), 51.5364, 7.2228, true);
const N = 60, texts = [], firsts = [], heads = [];
for (let i = 0; i < N; i++) {
  const w = new Date(Date.UTC(2026, 8, 1 + i, 17, 0));
  const h = I.dailyHoroscope(natal, A.planetPositions(w), `${w.toISOString().slice(0, 10)}`, { when: w, timeZone: 'Europe/Berlin' });
  texts.push(h.plain.text); firsts.push(h.plain.text.split('\n\n')[0]); heads.push(h.plain.headline);
}
// Sätze ohne Uhrzeitpräfix, damit „Um 09:30 Uhr: X“ und „Um 10:10 Uhr: X“ als gleicher Satz zählen
const sents = (t) => t.split(/\n\n|(?<=[.!?])\s+/).map((s) => s.replace(/^(Um|Am \w+ um) \d\d:\d\d Uhr( wird es leichter| wechselt die Grundstimmung)?:?\s*/, '').trim()).filter((s) => s.length > 25 && !s.startsWith('Frage an dich'));
let same = 0, tot = 0, sameFirst = 0;
for (let i = 1; i < N; i++) {
  const prev = new Set(sents(texts[i - 1]));
  const cur = sents(texts[i]);
  cur.forEach((s) => { tot++; if (prev.has(s)) same++; });
  if (firsts[i] === firsts[i - 1]) sameFirst++;
}
const all = texts.flatMap(sents);
const freq = {}; all.forEach((s) => (freq[s] = (freq[s] || 0) + 1));
const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log(`Tage: ${N}`);
console.log(`Sätze, die schon am Vortag vorkamen: ${(100 * same / tot).toFixed(0)} %`);
console.log(`Erster Absatz identisch zum Vortag: ${sameFirst} von ${N - 1} Tagen`);
console.log(`Verschiedene erste Absätze: ${new Set(firsts).size} von ${N}; verschiedene Überschriften: ${new Set(heads).size}; verschiedene Gesamttexte: ${new Set(texts).size}`);
console.log(`Verschiedene Sätze insgesamt: ${Object.keys(freq).length} bei ${all.length} Sätzen (Anteil einmaliger Sätze: ${(100 * Object.values(freq).filter((v) => v === 1).length / Object.keys(freq).length).toFixed(0)} %)`);
console.log('Häufigste Sätze:'); top.forEach(([s, n]) => console.log(`  ${n}×  ${s.slice(0, 90)}`));
