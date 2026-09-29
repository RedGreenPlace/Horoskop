// Vergleicht js/astro.js mit data/ephem_referenz.json (1000 Zeitpunkte 1900–2100) und zählt,
// wie oft ein Rechenfehler einen Aspekt über die Orbisgrenze kippt.
const A = require('../js/astro.js');
const ref = require('../data/ephem_referenz.json');
const P = A.PLANETS;
const stat = {};
P.forEach((p) => (stat[p] = []));
ref.forEach((r) => {
  const pos = A.planetPositions(new Date(r.t));
  P.forEach((p) => stat[p].push(Math.abs(A.diff180(pos[p].lon, r[p]))));
});
console.log('Planet     Mittel   95%     Max   (Grad)');
P.forEach((p) => {
  const s = stat[p].slice().sort((a, b) => a - b);
  const m = s.reduce((a, b) => a + b, 0) / s.length;
  console.log(`${p.padEnd(9)} ${m.toFixed(3).padStart(6)} ${s[Math.floor(s.length * 0.95)].toFixed(3).padStart(6)} ${s[s.length - 1].toFixed(3).padStart(6)}`);
});
// Kippen von Aspekten: zufällige Geburtspunkte, Orbisgrenzen aus ASPECTS
const asp = A.ASPECTS;
let rnd = 12345; const rand = () => (rnd = (rnd * 1664525 + 1013904223) % 4294967296) / 4294967296;
let pairs = 0, flips = 0; const byP = {};
P.forEach((p) => (byP[p] = { n: 0, f: 0 }));
ref.forEach((r) => {
  const pos = A.planetPositions(new Date(r.t));
  for (let k = 0; k < 20; k++) {
    const nat = rand() * 360;
    P.forEach((p) => {
      const orb = { moon: 3, sun: 3, mercury: 3, venus: 3, mars: 3 }[p] || 2.5;
      const inAsp = (lon) => asp.some((a) => Math.abs(Math.abs(A.diff180(lon, nat)) - a.angle) <= orb * a.orbFactor);
      byP[p].n++; pairs++;
      if (inAsp(pos[p].lon) !== inAsp(r[p])) { byP[p].f++; flips++; }
    });
  }
});
console.log(`\nAspekt kippt durch Rechenfehler (zufällige Geburtspunkte): ${(100 * flips / pairs).toFixed(2)} % aller Fälle`);
P.forEach((p) => console.log(`${p.padEnd(9)} ${(100 * byP[p].f / byP[p].n).toFixed(2)} %`));
