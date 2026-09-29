/*
 * Astronomie-Engine: Planetenpositionen (tropisch, geozentrisch), Aszendent, MC,
 * Häuser (Whole Sign) und Aspekte. Basiert auf den Bahnelementen von Paul Schlyter
 * ("How to compute planetary positions"). Genauigkeit: ca. 1-2 Bogenminuten für die
 * inneren Planeten, Mond ~0,3°, ausreichend für ein Tageshoroskop.
 */
(function (root) {
  'use strict';

  const RAD = Math.PI / 180;
  const norm = (x) => ((x % 360) + 360) % 360;
  const sind = (x) => Math.sin(x * RAD);
  const cosd = (x) => Math.cos(x * RAD);
  const atan2d = (y, x) => Math.atan2(y, x) / RAD;
  const diff180 = (a, b) => ((a - b + 540) % 360) - 180;

  const SIGNS = ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau', 'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'];
  // Grammatisch korrekte Formen: „steht im Widder“ / „wechselt in den Widder“
  const SIGNS_IN = ['im Widder', 'im Stier', 'in den Zwillingen', 'im Krebs', 'im Löwen', 'in der Jungfrau', 'in der Waage', 'im Skorpion', 'im Schützen', 'im Steinbock', 'im Wassermann', 'in den Fischen'];
  const SIGNS_INTO = ['in den Widder', 'in den Stier', 'in die Zwillinge', 'in den Krebs', 'in den Löwen', 'in die Jungfrau', 'in die Waage', 'in den Skorpion', 'in den Schützen', 'in den Steinbock', 'in den Wassermann', 'in die Fische'];
  const SIGN_GLYPHS =['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const PLANET_NAMES = {
    sun: 'Sonne', moon: 'Mond', mercury: 'Merkur', venus: 'Venus', mars: 'Mars',
    jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptun', pluto: 'Pluto',
    asc: 'Aszendent', mc: 'Medium Coeli',
  };
  const PLANET_GLYPHS = {
    sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄',
    uranus: '♅', neptune: '♆', pluto: '♇', asc: 'AC', mc: 'MC',
  };

  function julianDay(date) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  function solveKepler(M, e) {
    let E = M + (e / RAD) * sind(M) * (1 + e * cosd(M));
    for (let i = 0; i < 12; i++) {
      const dE = (E - (e / RAD) * sind(E) - M) / (1 - e * cosd(E));
      E -= dE;
      if (Math.abs(dE) < 1e-7) break;
    }
    return E;
  }

  // d = Tage seit 2000 Jan 0.0 TT (JD 2451543.5)
  function elements(name, d) {
    switch (name) {
      case 'sun': return { N: 0, i: 0, w: 282.9404 + 4.70935e-5 * d, a: 1, e: 0.016709 - 1.151e-9 * d, M: 356.047 + 0.9856002585 * d };
      case 'moon': return { N: 125.1228 - 0.0529538083 * d, i: 5.1454, w: 318.0634 + 0.1643573223 * d, a: 60.2666, e: 0.0549, M: 115.3654 + 13.0649929509 * d };
      case 'mercury': return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d };
      case 'venus': return { N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d };
      case 'mars': return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d };
      case 'jupiter': return { N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d };
      case 'saturn': return { N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d };
      case 'uranus': return { N: 74.0005 + 1.3978e-5 * d, i: 0.7733 + 1.9e-8 * d, w: 96.6612 + 3.0565e-5 * d, a: 19.18171 - 1.55e-8 * d, e: 0.047318 + 7.45e-9 * d, M: 142.5905 + 0.011725806 * d };
      case 'neptune': return { N: 131.7806 + 3.0173e-5 * d, i: 1.77 - 2.55e-7 * d, w: 272.8461 - 6.027e-6 * d, a: 30.05826 + 3.313e-8 * d, e: 0.008606 + 2.15e-9 * d, M: 260.2471 + 0.005995147 * d };
      default: throw new Error('Unbekannter Körper: ' + name);
    }
  }

  // Position im Bahnsystem -> ekliptikale Länge, Breite, Distanz
  function orbit(el) {
    const E = solveKepler(el.M, el.e);
    const xv = el.a * (cosd(E) - el.e);
    const yv = el.a * Math.sqrt(1 - el.e * el.e) * sind(E);
    const v = atan2d(yv, xv);
    const r = Math.sqrt(xv * xv + yv * yv);
    const vw = v + el.w;
    const x = r * (cosd(el.N) * cosd(vw) - sind(el.N) * sind(vw) * cosd(el.i));
    const y = r * (sind(el.N) * cosd(vw) + cosd(el.N) * sind(vw) * cosd(el.i));
    const z = r * sind(vw) * sind(el.i);
    return { x, y, z, r, lon: norm(atan2d(y, x)), lat: atan2d(z, Math.sqrt(x * x + y * y)), v, E };
  }

  function plutoLon(d) {
    const S = 50.03 + 0.033459652 * d;
    const P = 238.95 + 0.003968789 * d;
    return norm(
      238.9508 + 0.00400703 * d
      - 19.799 * sind(P) + 19.848 * cosd(P)
      + 0.897 * sind(2 * P) - 4.956 * cosd(2 * P)
      + 0.61 * sind(3 * P) + 1.211 * cosd(3 * P)
      - 0.341 * sind(4 * P) - 0.19 * cosd(4 * P)
      + 0.128 * sind(5 * P) - 0.034 * cosd(5 * P)
      - 0.038 * sind(6 * P) + 0.031 * cosd(6 * P)
      + 0.02 * sind(S - P) - 0.01 * cosd(S - P)
    );
  }

  function longitudes(d) {
    const out = {};

    // Sonne
    const selS = elements('sun', d);
    const sun = orbit(selS);
    const sunLon = norm(sun.lon);
    out.sun = sunLon;
    const xs = sun.r * cosd(sunLon);
    const ys = sun.r * sind(sunLon);
    const Ms = selS.M;
    const Ls = selS.M + selS.w;

    // Mond
    const elM = elements('moon', d);
    const mo = orbit(elM);
    const Mm = elM.M;
    const Lm = elM.M + elM.w + elM.N;
    const D = Lm - Ls;
    const F = Lm - elM.N;
    out.moon = norm(
      mo.lon
      - 1.274 * sind(Mm - 2 * D) + 0.658 * sind(2 * D) - 0.186 * sind(Ms)
      - 0.059 * sind(2 * Mm - 2 * D) - 0.057 * sind(Mm - 2 * D + Ms) + 0.053 * sind(Mm + 2 * D)
      + 0.046 * sind(2 * D - Ms) + 0.041 * sind(Mm - Ms) - 0.035 * sind(D) - 0.031 * sind(Mm + Ms)
      - 0.015 * sind(2 * F - 2 * D) + 0.011 * sind(Mm - 4 * D)
    );

    // Planeten
    const Mj = elements('jupiter', d).M;
    const Msat = elements('saturn', d).M;
    const Mu = elements('uranus', d).M;
    ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].forEach((name) => {
      const p = orbit(elements(name, d));
      let lon = p.lon;
      let lat = p.lat;
      if (name === 'jupiter') {
        lon += -0.332 * sind(2 * Mj - 5 * Msat - 67.6) - 0.056 * sind(2 * Mj - 2 * Msat + 21)
          + 0.042 * sind(3 * Mj - 5 * Msat + 21) - 0.036 * sind(Mj - 2 * Msat)
          + 0.022 * cosd(Mj - Msat) + 0.023 * sind(2 * Mj - 3 * Msat + 52) - 0.016 * sind(Mj - 5 * Msat - 69);
      } else if (name === 'saturn') {
        lon += 0.812 * sind(2 * Mj - 5 * Msat - 67.6) - 0.229 * cosd(2 * Mj - 4 * Msat - 2)
          + 0.119 * sind(Mj - 2 * Msat - 3) + 0.046 * sind(2 * Mj - 6 * Msat - 69) + 0.014 * sind(Mj - 3 * Msat + 32);
        lat += -0.02 * cosd(2 * Mj - 4 * Msat - 2) + 0.018 * sind(2 * Mj - 6 * Msat - 49);
      } else if (name === 'uranus') {
        lon += 0.04 * sind(Msat - 2 * Mu + 6) + 0.035 * sind(Msat - 3 * Mu + 33) - 0.015 * sind(Mj - Mu + 20);
      }
      const xh = p.r * cosd(lon) * cosd(lat);
      const yh = p.r * sind(lon) * cosd(lat);
      out[name] = norm(atan2d(yh + ys, xh + xs));
    });

    // Pluto: heliozentrische Reihen (Schlyter), mit Sonnenposition ins Geozentrische umgerechnet (Parallaxe bis ca. 2°)
    const Pp = 238.95 + 0.003968789 * d;
    const plat = -3.908 - 5.441 * sind(Pp) - 14.963 * cosd(Pp) + 3.544 * sind(2 * Pp) + 1.669 * cosd(2 * Pp) - 1.06 * sind(3 * Pp) + 0.318 * cosd(3 * Pp);
    const pr = 40.724 + 6.684 * sind(Pp) + 6.895 * cosd(Pp) - 1.184 * sind(2 * Pp) - 0.032 * cosd(2 * Pp) + 0.162 * sind(3 * Pp) - 0.143 * cosd(3 * Pp);
    const pl = plutoLon(d);
    out.pluto = norm(atan2d(pr * sind(pl) * cosd(plat) + ys, pr * cosd(pl) * cosd(plat) + xs));
    return out;
  }

  function daysSince2000(date) {
    return julianDay(date) - 2451543.5;
  }

  function planetPositions(date) {
    const d = daysSince2000(date);
    const now = longitudes(d);
    const before = longitudes(d - 0.05);
    const after = longitudes(d + 0.05);
    const res = {};
    PLANETS.forEach((p) => {
      const speed = diff180(after[p], before[p]) / 0.1; // Grad / Tag
      res[p] = { lon: now[p], speed, retro: speed < 0 };
    });
    return res;
  }

  function obliquity(date) {
    return 23.4393 - 3.563e-7 * daysSince2000(date);
  }

  function siderealTime(date, lonEast) {
    const jd = julianDay(date);
    return norm(280.46061837 + 360.98564736629 * (jd - 2451545) + lonEast);
  }

  function angles(date, lat, lonEast) {
    const ramc = siderealTime(date, lonEast);
    const eps = obliquity(date);
    const asc = norm(atan2d(cosd(ramc), -(sind(ramc) * cosd(eps) + Math.tan(lat * RAD) * sind(eps))));
    const mc = norm(atan2d(sind(ramc), cosd(ramc) * cosd(eps)));
    return { asc, mc, ramc };
  }

  function signIndex(lon) {
    return Math.floor(norm(lon) / 30);
  }

  function formatLon(lon) {
    const s = signIndex(lon);
    const within = norm(lon) - s * 30;
    const deg = Math.floor(within);
    const min = Math.floor((within - deg) * 60);
    return deg + '°' + String(min).padStart(2, '0') + '′ ' + SIGNS[s];
  }

  // Whole-Sign-Haus (1-12) eines Punktes bezogen auf den Aszendenten
  function wholeSignHouse(lon, asc) {
    return ((signIndex(lon) - signIndex(asc) + 12) % 12) + 1;
  }

  /**
   * Geburtshoroskop. `date` ist ein UTC-Date, `lat`/`lon` in Grad (Ost positiv).
   * Ohne bekannte Geburtszeit (timeKnown=false) werden Aszendent, MC und Häuser weggelassen.
   */
  function natalChart(date, lat, lon, timeKnown) {
    const planets = planetPositions(date);
    const chart = { planets, timeKnown: !!timeKnown, asc: null, mc: null, birth: date };
    if (timeKnown) {
      const a = angles(date, lat, lon);
      chart.asc = a.asc;
      chart.mc = a.mc;
      PLANETS.forEach((p) => { planets[p].house = wholeSignHouse(planets[p].lon, a.asc); });
    }
    PLANETS.forEach((p) => { planets[p].sign = signIndex(planets[p].lon); });
    return chart;
  }

  const ASPECTS = [
    { key: 'conjunction', phrase: 'in Konjunktion mit', name: 'Konjunktion', symbol: '☌', angle: 0, orbFactor: 1 },
    { key: 'sextile', phrase: 'im Sextil zu', name: 'Sextil', symbol: '⚹', angle: 60, orbFactor: 0.7 },
    { key: 'square', phrase: 'im Quadrat zu', name: 'Quadrat', symbol: '□', angle: 90, orbFactor: 0.9 },
    { key: 'trine', phrase: 'im Trigon zu', name: 'Trigon', symbol: '△', angle: 120, orbFactor: 0.9 },
    { key: 'opposition', phrase: 'in Opposition zu', name: 'Opposition', symbol: '☍', angle: 180, orbFactor: 1 },
  ];

  const TRANSIT_ORB = { moon: 3, sun: 3, mercury: 3, venus: 3, mars: 3, jupiter: 2.5, saturn: 2.5, uranus: 2.5, neptune: 2.5, pluto: 2.5 };

  /**
   * Aspekte zwischen den laufenden Planeten (Transit) und den Geburtspunkten.
   * `transit` = planetPositions(...), `natal` = natalChart(...).
   */
  function transitAspects(transit, natal) {
    const targets = PLANETS.map((p) => ({ key: p, lon: natal.planets[p].lon }));
    if (natal.timeKnown) {
      targets.push({ key: 'asc', lon: natal.asc }, { key: 'mc', lon: natal.mc });
    }
    const out = [];
    PLANETS.forEach((tp) => {
      targets.forEach((tg) => {
        const sep = Math.abs(diff180(transit[tp].lon, tg.lon));
        ASPECTS.forEach((asp) => {
          const maxOrb = TRANSIT_ORB[tp] * asp.orbFactor;
          const orb = Math.abs(sep - asp.angle);
          if (orb <= maxOrb) {
            // Wird der Abstand kleiner? (Transit-Geschwindigkeit, Geburtspunkt fest)
            const future = Math.abs(Math.abs(diff180(transit[tp].lon + transit[tp].speed * 0.25, tg.lon)) - asp.angle);
            out.push({ transit: tp, natal: tg.key, natalLon: tg.lon, aspect: asp, orb, maxOrb, applying: future < orb });
          }
        });
      });
    });
    return out;
  }

  // ---------- Geburtshoroskop-Struktur ----------
  const RULERS = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'pluto', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const ELEMENTS = ['Feuer', 'Erde', 'Luft', 'Wasser'];
  const QUALITIES = ['kardinal', 'fix', 'veränderlich'];

  // Aszendentherrscher (moderne Herrschaft), null ohne Geburtszeit
  function chartRuler(natal) {
    if (!natal.timeKnown) return null;
    const planet = RULERS[signIndex(natal.asc)];
    return { planet, sign: natal.planets[planet].sign, house: natal.planets[planet].house };
  }

  // Verteilung auf Elemente und Qualitäten (Sonne, Mond, Aszendent doppelt; Merkur bis Saturn einfach)
  function distribution(natal) {
    const weights = { sun: 2, moon: 2, mercury: 1, venus: 1, mars: 1, jupiter: 1, saturn: 1 };
    const el = [0, 0, 0, 0];
    const q = [0, 0, 0];
    const add = (sign, w) => { el[sign % 4] += w; q[sign % 3] += w; };
    Object.keys(weights).forEach((p) => add(natal.planets[p].sign, weights[p]));
    if (natal.timeKnown) add(signIndex(natal.asc), 2);
    const total = el.reduce((a, b) => a + b, 0);
    return { elements: el, qualities: q, total };
  }

  // Aspekte innerhalb des Geburtshoroskops (ohne rein generationsbedingte Uranus/Neptun/Pluto-Paare)
  function natalAspects(natal) {
    const pts = PLANETS.map((p) => ({ key: p, lon: natal.planets[p].lon }));
    if (natal.timeKnown) pts.push({ key: 'asc', lon: natal.asc }, { key: 'mc', lon: natal.mc });
    const outer = ['uranus', 'neptune', 'pluto'];
    const orbOf = (k) => (k === 'sun' || k === 'moon' ? 7 : k === 'asc' || k === 'mc' ? 5 : 5);
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i];
        const b = pts[j];
        if (outer.includes(a.key) && outer.includes(b.key)) continue;
        if (['asc', 'mc'].includes(a.key) && ['asc', 'mc'].includes(b.key)) continue;
        const sep = Math.abs(diff180(a.lon, b.lon));
        ASPECTS.forEach((asp) => {
          const maxOrb = Math.max(orbOf(a.key), orbOf(b.key)) * asp.orbFactor;
          const orb = Math.abs(sep - asp.angle);
          if (orb <= maxOrb) out.push({ a: a.key, b: b.key, aspect: asp, orb, maxOrb });
        });
      }
    }
    return out.sort((x, y) => x.orb / x.maxOrb - y.orb / y.maxOrb);
  }

  // Ekliptikale Länge eines Körpers zu einem Zeitpunkt
  function longitudeAt(planet, date) {
    return longitudes(daysSince2000(date))[planet];
  }

  /**
   * Zeitpunkt, an dem `planet` den Winkel `angle` zu `targetLon` exakt erreicht,
   * gesucht im Fenster ±spanHours um `around`. Bei mehreren Treffern (Rückläufigkeit)
   * gewinnt der nächste. Gibt null zurück, wenn im Fenster kein exakter Durchgang liegt.
   */
  function exactTime(planet, targetLon, angle, around, spanHours, stepHours) {
    spanHours = spanHours || 72;
    stepHours = stepHours || 2;
    const cands = angle === 0 || angle === 180 ? [norm(targetLon + angle)] : [norm(targetLon + angle), norm(targetLon - angle)];
    const H = 3600000;
    const t0 = around.getTime() - spanHours * H;
    const n = Math.round((2 * spanHours) / stepHours);
    const lonAt = (ms) => longitudeAt(planet, new Date(ms));
    let best = null;
    cands.forEach((c) => {
      let prevT = t0;
      let prevG = diff180(lonAt(t0), c);
      for (let i = 1; i <= n; i++) {
        const t = t0 + i * stepHours * H;
        const g = diff180(lonAt(t), c);
        if (Math.abs(prevG) < 30 && Math.abs(g) < 30 && prevG * g <= 0) {
          let lo = prevT;
          let hi = t;
          let glo = prevG;
          for (let k = 0; k < 30; k++) {
            const mid = (lo + hi) / 2;
            const gm = diff180(lonAt(mid), c);
            if (glo * gm <= 0) hi = mid; else { lo = mid; glo = gm; }
          }
          const tm = (lo + hi) / 2;
          if (best === null || Math.abs(tm - around.getTime()) < Math.abs(best - around.getTime())) best = tm;
        }
        prevT = t;
        prevG = g;
      }
    });
    return best === null ? null : new Date(best);
  }

  // ---------- Mondbreite, Mondknoten, Finsternisse, Fortschreibung ----------
  // Ekliptikale Breite des Mondes (Grad), Bahnelemente nach Schlyter samt Störungsgliedern
  function moonGeometry(d) {
    const sun = elements('sun', d);
    const el = elements('moon', d);
    const mo = orbit(el);
    const Mm = el.M;
    const Lm = el.M + el.w + el.N;
    const D = Lm - (sun.M + sun.w);
    const F = Lm - el.N;
    const lat = mo.lat - 0.173 * sind(F - 2 * D) - 0.055 * sind(Mm - F - 2 * D) - 0.046 * sind(Mm + F - 2 * D) + 0.033 * sind(F + 2 * D) + 0.017 * sind(2 * Mm + F);
    return { lat, parallax: Math.asin(1 / mo.r) / RAD }; // Grad
  }
  const moonLatitude = (d) => moonGeometry(d).lat;

  // Mittlerer aufsteigender Mondknoten (Nordknoten)
  function meanNode(date) {
    return norm(125.1228 - 0.0529538083 * daysSince2000(date));
  }

  /**
   * Sonnen- und Mondfinsternisse im Zeitraum [from, to]. Gesucht werden Neu- und Vollmonde; bei genügend
   * kleiner Mondbreite entsteht eine Finsternis (Sonne: |β| < 1,55°, Mond mit Kernschatten: |β| < 1,05°).
   * Rein halbschattige Mondfinsternisse werden bewusst nicht gezählt.
   */
  function eclipses(from, to) {
    const H = 3600000;
    const step = 6 * H;
    const out = [];
    const elong = (ms) => {
      const L = longitudes(daysSince2000(new Date(ms)));
      return norm(L.moon - L.sun);
    };
    let t = from.getTime() - 2 * 24 * H;
    let prev = elong(t);
    for (t += step; t <= to.getTime() + 2 * 24 * H; t += step) {
      const cur = elong(t);
      [[0, 'solar'], [180, 'lunar']].forEach(([target, kind]) => {
        const a = diff180(prev, target);
        const b = diff180(cur, target);
        if (a < 0 && b >= 0 && Math.abs(a) < 30 && Math.abs(b) < 30) {
          let lo = t - step;
          let hi = t;
          for (let k = 0; k < 25; k++) {
            const mid = (lo + hi) / 2;
            if (diff180(elong(mid), target) < 0) lo = mid; else hi = mid;
          }
          const tm = (lo + hi) / 2;
          const d = daysSince2000(new Date(tm));
          const { lat, parallax: pi } = moonGeometry(d);
          // Grenzbreite: Sonnenfinsternis = Halbschatten trifft die Erde; Mondfinsternis = Mond berührt den Kernschatten
          const limit = kind === 'solar' ? 0.2642 + 1.2725 * pi : (pi - 0.2642) * 1.02 + 0.2725 * pi;
          if (Math.abs(lat) < limit) {
            const L = longitudes(d);
            const date = new Date(tm);
            if (date >= from && date <= to) out.push({ date, kind, lon: kind === 'solar' ? L.sun : L.moon, lat });
          }
        }
      });
      prev = cur;
    }
    return out.sort((x, y) => x.date - y.date);
  }

  // Sekundärprogression: ein Tag nach der Geburt entspricht einem Lebensjahr
  function progressedDate(birth, when) {
    return new Date(birth.getTime() + (when.getTime() - birth.getTime()) / 365.2422);
  }

  const api = {
    SIGNS, SIGNS_IN, SIGNS_INTO, SIGN_GLYPHS, PLANETS, PLANET_NAMES, PLANET_GLYPHS, ASPECTS,
    julianDay, planetPositions, natalChart, transitAspects, natalAspects, chartRuler, distribution, exactTime, longitudeAt,
    RULERS, ELEMENTS, QUALITIES, moonLatitude, meanNode, eclipses, progressedDate, angles, signIndex, formatLon,
    wholeSignHouse, norm, diff180,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Astro = api;
})(typeof window !== 'undefined' ? window : globalThis);
