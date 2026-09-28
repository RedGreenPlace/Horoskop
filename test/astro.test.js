const assert = require('assert');
const A = require('../js/astro.js');

const near = (name, got, want, tol) => {
  const d = Math.abs(A.diff180(got, want));
  console.log(`${d <= tol ? 'OK  ' : 'FAIL'} ${name}: ${got.toFixed(3)} (soll ${want}, Δ${d.toFixed(3)}°)`);
  assert(d <= tol, name);
};

// Meeus-Beispiele (0h TD ≈ UT, Toleranz deckt ΔT ab)
let p = A.planetPositions(new Date(Date.UTC(1992, 9, 13, 0, 0)));
near('Sonne 1992-10-13', p.sun.lon, 199.909, 0.05);
p = A.planetPositions(new Date(Date.UTC(1992, 3, 12, 0, 0)));
near('Mond 1992-04-12', p.moon.lon, 133.163, 0.4);
p = A.planetPositions(new Date(Date.UTC(1992, 11, 20, 0, 0)));
near('Venus 1992-12-20', p.venus.lon, 313.081, 0.1);
// Große Konjunktion 21.12.2020 ~18:20 UT: Jupiter/Saturn ≈ 0°29' Wassermann
p = A.planetPositions(new Date(Date.UTC(2020, 11, 21, 18, 20)));
near('Jupiter 2020-12-21', p.jupiter.lon, 300.48, 0.15);
near('Saturn 2020-12-21', p.saturn.lon, 300.48, 0.15);
// Pluto 2000-01-01 12h ≈ 251.4° (Schütze)
p = A.planetPositions(new Date(Date.UTC(2000, 0, 1, 12, 0)));
near('Pluto J2000', p.pluto.lon, 251.4, 1.2);
near('Sonne J2000', p.sun.lon, 280.37, 0.05);
// Rückläufigkeit: Merkur 2024-04-10 rückläufig, 2024-06-01 direkt
assert(A.planetPositions(new Date(Date.UTC(2024, 3, 10))).mercury.retro === true);
assert(A.planetPositions(new Date(Date.UTC(2024, 5, 1))).mercury.retro === false);
// Aszendent London, 2000-01-01 12:00 UT: ~24° Widder, MC ~9-10° Steinbock
const a = A.angles(new Date(Date.UTC(2000, 0, 1, 12, 0)), 51.5, 0);
near('ASC London J2000', a.asc, 24.5, 1);
near('MC London J2000', a.mc, 279.7, 1);
console.log('Alle Tests bestanden');
