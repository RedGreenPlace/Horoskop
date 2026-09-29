/*
 * Lebensereignis-Scanner (Test): rechnet über einen Zeitraum für zwölf Themen aus, wann langsame Planeten
 * die dazugehörigen Geburtspunkte und Häuser berühren, und bündelt die stärksten Phasen zu Kapiteln.
 * Er zeigt Phasen erhöhter Intensität und ihr Thema – nicht die konkreten Ereignisse.
 */
(function (root) {
  'use strict';
  const A = root.Astro || (typeof require !== 'undefined' ? require('./astro.js') : null);
  const Themes = root.Themes || (typeof require !== 'undefined' ? require('./themes.js') : null);

  // Nur langsame Planeten: Sonne, Merkur, Venus und Mond sind für Lebensereignisse zu kurzlebig
  const TRANSIT_W = { pluto: 1, saturn: 1, uranus: 0.9, neptune: 0.8, jupiter: 0.8, mars: 0.35 };
  const ORB = { pluto: 3, saturn: 3, uranus: 3, neptune: 3, jupiter: 3, mars: 2 };
  const ASP_W = { conjunction: 1, opposition: 1, square: 0.9, trine: 0.7, sextile: 0.5 };
  const ASP_ORB = { conjunction: 1, opposition: 1, square: 0.9, trine: 0.8, sextile: 0.6 };
  const TONE = { conjunction: 'V', sextile: 'F', trine: 'F', square: 'H', opposition: 'H' };
  const VALENCE_V = { jupiter: 0.7, saturn: -0.6, pluto: -0.5, mars: -0.4, uranus: 0, neptune: 0 };
  const HOUSE_W = 0.35; // Grundwirkung, solange ein langsamer Planet durch ein Themenhaus zieht
  // Für Deszendent und IC gibt es keine eigenen Texte: sinngemäß Venus (Beziehung) und Mond (Geborgenheit)
  const TEXT_KEY = { desc: 'venus', ic: 'moon' };

  const TOPICS = {
    partnership: { label: 'Partnerschaft', examples: 'Kennenlernen, Zusammenziehen, Heirat, Trennung', targets: { venus: 1, desc: 0.9, moon: 0.6, mars: 0.4, sun: 0.4 }, houses: { 7: 1, 5: 0.4, 8: 0.4 } },
    family: { label: 'Familie', examples: 'Kind, Tod oder Krankheit von Angehörigen, Bruch mit Eltern', targets: { moon: 1, ic: 1, sun: 0.4, saturn: 0.4, venus: 0.3 }, houses: { 4: 1, 10: 0.3 } },
    career: { label: 'Beruf', examples: 'Jobwechsel, Kündigung, Beförderung, Selbstständigkeit', targets: { mc: 1, saturn: 0.7, sun: 0.6, jupiter: 0.5, mars: 0.3 }, houses: { 10: 1, 6: 0.5, 2: 0.3 } },
    education: { label: 'Ausbildung', examples: 'Studium, Abschluss, Prüfung, Umschulung', targets: { mercury: 1, jupiter: 0.6, mc: 0.3, sun: 0.3 }, houses: { 3: 1, 9: 1 } },
    money: { label: 'Geld', examples: 'Erbe, große Anschaffung, Schulden, Gehaltssprung', targets: { venus: 0.8, jupiter: 0.6, saturn: 0.5, pluto: 0.4 }, houses: { 2: 1, 8: 0.8 } },
    housing: { label: 'Wohnen', examples: 'Umzug, Hauskauf, Auswandern', targets: { moon: 0.9, ic: 1, uranus: 0.3, jupiter: 0.3 }, houses: { 4: 1 } },
    health: { label: 'Gesundheit', examples: 'Krankheit, OP, Erschöpfung, Unfall', targets: { sun: 0.8, mars: 0.8, asc: 0.8, saturn: 0.5, moon: 0.3 }, houses: { 6: 1, 1: 0.5, 12: 0.4 } },
    meaning: { label: 'Sinn und Innenleben', examples: 'Sinnkrise, spirituelle Wende, Therapie, Neuorientierung', targets: { neptune: 0.7, pluto: 0.7, sun: 0.6, moon: 0.6, saturn: 0.3 }, houses: { 12: 1, 8: 0.5, 9: 0.4 } },
    friends: { label: 'Freundschaften', examples: 'Neue Freunde, Bruch, Gemeinschaft', targets: { venus: 0.5, mercury: 0.5, uranus: 0.6, moon: 0.3 }, houses: { 11: 1 } },
    identity: { label: 'Identität', examples: 'Neuer Look, neue Rolle, Namenswechsel', targets: { asc: 1, sun: 0.8, moon: 0.3, mars: 0.3 }, houses: { 1: 1 } },
    creative: { label: 'Kreatives', examples: 'Projektstart, Veröffentlichung, Erfolg', targets: { sun: 0.7, venus: 0.7, jupiter: 0.5, mars: 0.3 }, houses: { 5: 1 } },
    conflict: { label: 'Konflikte und Recht', examples: 'Streit, Vertrag, Behörden, Prozess', targets: { mercury: 0.6, mars: 0.8, saturn: 0.5, jupiter: 0.4 }, houses: { 7: 0.5, 9: 0.5, 3: 0.3, 6: 0.3 } },
  };

  const DAY = 86400000;

  // Ein Geburtspunkt dient mehreren Themen. Sein Einfluss wird auf die Themen verteilt (nach Gewicht),
  // damit nicht ein einzelner Transit gleichzeitig alle Themen auf den Höhepunkt hebt.
  const SHARE = {};
  Object.keys(TOPICS).forEach((tk) => Object.keys(TOPICS[tk].targets).forEach((pk) => { SHARE[pk] = (SHARE[pk] || 0) + TOPICS[tk].targets[pk]; }));
  const shareOf = (tk, pk) => (TOPICS[tk].targets[pk] ? TOPICS[tk].targets[pk] / Math.pow(SHARE[pk], 0.75) : 0);

  function natalPoints(natal) {
    const pts = A.PLANETS.map((k) => ({ key: k, lon: natal.planets[k].lon }));
    if (natal.timeKnown) {
      pts.push({ key: 'asc', lon: natal.asc }, { key: 'desc', lon: A.norm(natal.asc + 180) }, { key: 'mc', lon: natal.mc }, { key: 'ic', lon: A.norm(natal.mc + 180) });
    }
    return pts;
  }

  // Alle Beiträge (Aspekte und Haus-Grundwirkung) zu allen Themen an einem Zeitpunkt
  function contributions(natal, pos, pts) {
    const out = {};
    Object.keys(TOPICS).forEach((k) => { out[k] = { total: 0, net: 0, items: [] }; });
    Object.keys(TRANSIT_W).forEach((tp) => {
      const lon = pos[tp].lon;
      pts.forEach((pt) => {
        const sep = Math.abs(A.diff180(lon, pt.lon));
        A.ASPECTS.forEach((asp) => {
          const maxOrb = ORB[tp] * ASP_ORB[asp.key];
          const orb = Math.abs(sep - asp.angle);
          if (orb > maxOrb) return;
          const tone = TONE[asp.key];
          const valence = tone === 'F' ? 1 : tone === 'H' ? -1 : VALENCE_V[tp];
          const base = TRANSIT_W[tp] * ASP_W[asp.key] * (1 - orb / maxOrb);
          Object.keys(TOPICS).forEach((tk) => {
            const w = shareOf(tk, pt.key);
            if (!w) return;
            const v = base * w;
            out[tk].total += v;
            out[tk].net += v * valence;
            out[tk].items.push({ kind: 'aspect', transit: tp, natal: pt.key, aspect: asp, orb, tone, value: v });
          });
        });
      });
      if (natal.timeKnown) {
        const h = A.wholeSignHouse(lon, natal.asc);
        Object.keys(TOPICS).forEach((tk) => {
          const w = TOPICS[tk].houses[h];
          if (!w) return;
          const v = HOUSE_W * TRANSIT_W[tp] * w;
          out[tk].total += v;
          out[tk].items.push({ kind: 'house', transit: tp, house: h, value: v });
        });
      }
    });
    return out;
  }

  function scan(natal, from, to, stepDays) {
    stepDays = stepDays || 2;
    const pts = natalPoints(natal);
    const dates = [];
    const series = {};
    Object.keys(TOPICS).forEach((k) => { series[k] = []; });
    for (let t = from.getTime(); t <= to.getTime(); t += stepDays * DAY) {
      const d = new Date(t);
      const c = contributions(natal, A.planetPositions(d), pts);
      dates.push(d);
      Object.keys(TOPICS).forEach((k) => series[k].push(c[k].total));
    }
    return { dates, series };
  }

  function smooth(a, w) {
    const h = Math.floor(w / 2);
    return a.map((_, i) => {
      let s = 0;
      let n = 0;
      for (let j = Math.max(0, i - h); j <= Math.min(a.length - 1, i + h); j++) { s += a[j]; n++; }
      return s / n;
    });
  }
  const percentile = (arr, p) => {
    const s = arr.slice().sort((x, y) => x - y);
    return s[Math.min(s.length - 1, Math.floor(p * s.length))];
  };

  function describePeak(natal, pts, topicKey, date) {
    const c = contributions(natal, A.planetPositions(date), pts)[topicKey];
    const net = c.total ? c.net / c.total : 0;
    const tone = net > 0.25 ? 'Rückenwind' : net < -0.25 ? 'Belastung oder Umbruch' : 'Wendepunkt';
    const seen = new Set();
    const drivers = c.items.filter((x) => x.kind === 'aspect').sort((a, b) => b.value - a.value).filter((x) => {
      const key = x.transit + x.natal;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 2).map((x) => ({
      transit: x.transit, natal: x.natal, aspect: x.aspect.key, tone: x.tone,
      text: Themes.themeFor(x.transit, TEXT_KEY[x.natal] || x.natal, x.tone),
    }));
    return { tone, drivers };
  }

  /**
   * Kapitel: die stärksten Phasen pro Thema, vergleichbar gemacht über das 90. Perzentil des jeweiligen Themas.
   * opts: { topics: [Schlüssel], perTopic: 3, limit: 10, minStrength: 1 }
   */
  function chapters(natal, from, to, opts) {
    opts = opts || {};
    const topics = opts.topics || Object.keys(TOPICS);
    const { dates, series } = scan(natal, from, to, 2);
    const pts = natalPoints(natal);
    const all = [];
    topics.forEach((tk) => {
      const sm = smooth(series[tk], 5);
      const p90 = percentile(sm, 0.9) || 1;
      const cand = [];
      for (let i = 1; i < sm.length - 1; i++) if (sm[i] >= sm[i - 1] && sm[i] > sm[i + 1]) cand.push(i);
      cand.sort((a, b) => sm[b] - sm[a]);
      const chosen = [];
      cand.forEach((i) => {
        if (chosen.length >= (opts.perTopic || 3)) return;
        if (chosen.some((j) => Math.abs(dates[i] - dates[j]) < 60 * DAY)) return;
        chosen.push(i);
      });
      chosen.forEach((i) => {
        let l = i;
        let r = i;
        while (l > 0 && sm[l - 1] >= 0.5 * sm[i]) l--;
        while (r < sm.length - 1 && sm[r + 1] >= 0.5 * sm[i]) r++;
        const strength = sm[i] / p90;
        if (strength < (opts.minStrength === undefined ? 1 : opts.minStrength)) return;
        const d = describePeak(natal, pts, tk, dates[i]);
        all.push({ topic: tk, label: TOPICS[tk].label, peak: dates[i], start: dates[l], end: dates[r], strength, tone: d.tone, drivers: d.drivers });
      });
    });
    all.sort((a, b) => b.strength - a.strength);
    return all.slice(0, opts.limit || 10);
  }

  // Wie stark ist ein Thema an einem Tag im Vergleich zum ganzen Zeitraum? (0 = niedrigster, 1 = höchster Tag)
  function rankAt(natal, topicKey, date, from, to) {
    const { series } = scan(natal, from, to, 2);
    const v = contributions(natal, A.planetPositions(date), natalPoints(natal))[topicKey].total;
    const s = series[topicKey];
    return s.filter((x) => x < v).length / s.length;
  }

  const api = { TOPICS, scan, chapters, rankAt, contributions, natalPoints };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LifeEvents = api;
})(typeof window !== 'undefined' ? window : globalThis);
