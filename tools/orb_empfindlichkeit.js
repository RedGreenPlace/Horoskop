// Wie oft ändert sich die Deutung, wenn alle laufenden Planeten um ein paar Hundertstel/Zehntel Grad verschoben werden?
const A = require('../js/astro.js');
const I = require('../js/interpret.js');
const natal = A.natalChart(new Date(Date.UTC(1996, 2, 2, 2, 15)), 51.5364, 7.2228);
const N = 120;
let rnd = 99; const rand = () => (rnd = (rnd * 1664525 + 1013904223) % 4294967296) / 4294967296;
const run = (i, eps) => {
  const w = new Date(Date.UTC(2026, 8, 1 + i, 17, 0));
  const pos = A.planetPositions(w);
  if (eps) A.PLANETS.forEach((p) => { pos[p] = { ...pos[p], lon: A.norm(pos[p].lon + (rand() * 2 - 1) * eps) }; });
  const h = I.dailyHoroscope(natal, pos, `s${i}`, { when: w, timeZone: 'Europe/Berlin' });
  return { p1: h.plain.text.split('\n\n')[0], head: h.plain.headline };
};
const base = []; for (let i = 0; i < N; i++) base.push(run(i, 0));
console.log(`Tage: ${N}. Anteil mit geändertem erstem Absatz / geänderter Überschrift bei zufälliger Verschiebung aller Planeten um bis zu ±eps Grad`);
[0.02, 0.05, 0.1, 0.3].forEach((eps) => {
  let a = 0, b = 0; for (let i = 0; i < N; i++) { const r = run(i, eps); if (r.p1 !== base[i].p1) a++; if (r.head !== base[i].head) b++; }
  console.log(`eps ${String(eps).padEnd(4)}°: erster Absatz ${Math.round(100 * a / N)} %, Überschrift ${Math.round(100 * b / N)} %`);
});
