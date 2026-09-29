/*
 * Meine Themen: Ein Thema hat ein Bezugsdatum (bei KI der Start von ChatGPT, bei einem Kind der Geburtstag).
 * Für dieses Datum wird ein eigenes Horoskop gerechnet (ohne Uhrzeit: nur Planeten, ohne Mond). Die langsamen
 * laufenden Planeten (Jupiter bis Pluto) werden dagegen gehalten. Die Formulierungen sind von Hand geschrieben:
 * je Thema-Art neun Bedeutungen (was der Planet im Thema-Horoskop bei diesem Thema bedeutet) und
 * 27 gemeinsame Sätze (laufender Planet × Tonart). Bezugsdatum und Zuordnungen sind Konvention, kein Beleg.
 */
(function (root) {
  'use strict';
  const A = root.Astro || require('./astro.js');

  const TRANSIT = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  // [leicht (Sextil, Trigon), angespannt (Quadrat, Opposition), verschmelzend (Konjunktion)]
  const VOCAB = {
    jupiter: ['Hier gibt es Rückenwind, und Hoffnungen dürfen wachsen.', 'Erwartungen und Versprechen laufen dem Machbaren davon.', 'Hier wird alles größer und rückt ins Licht.'],
    saturn: ['Hier wird es verlässlicher, und Geduld zahlt sich aus.', 'Hier stößt es auf Grenzen, und es wird geprüft, was trägt.', 'Hier kommt Ernst ins Spiel: Was Bestand hat, wird deutlich.'],
    uranus: ['Überraschende Impulse bringen hier etwas in Bewegung.', 'Hier wird durchgerüttelt: Plötzliches und Unruhe.', 'Hier steht eine Wendung an, die sich nicht planen lässt.'],
    neptune: ['Hier gibt es Inspiration und mehr Einfühlung.', 'Hier wird vieles unscharf, und Erwartungen verschwimmen.', 'Hier verschwimmen die Grenzen zwischen Wunsch und Wirklichkeit.'],
    pluto: ['Hier wächst innere Stärke, und ein Wandel gelingt.', 'Hier geht es um Macht und Kontrolle; der Druck steigt.', 'Hier verändert sich etwas Grundlegendes.'],
  };

  // Bedeutung der neun Planeten im Horoskop des Themas (Mond entfällt: ohne Uhrzeit zu ungenau)
  const TYPES = {
    ki: {
      label: 'KI', date: new Date(Date.UTC(2022, 10, 30, 12, 0)),
      note: 'Bezugsdatum: Start von ChatGPT am 30.11.2022 (gewählt, ohne Uhrzeit; andere Daten würden andere Aussagen ergeben).',
      meaning: {
        sun: 'das Selbstverständnis von KI und wie sie wahrgenommen wird', mercury: 'Sprache, Denken und Verständigung mit KI',
        venus: 'Nutzen, Zusammenarbeit und Vertrauen', mars: 'Tempo und Konkurrenz',
        jupiter: 'Wachstum, Hoffnung und Versprechen', saturn: 'Regeln, Grenzen und Verlässlichkeit',
        uranus: 'technische Sprünge und Überraschungen', neptune: 'Visionen, Täuschung und Unschärfe',
        pluto: 'Macht, Kontrolle und tiefgreifender Wandel',
      },
    },
    kind: {
      label: 'Kind', date: null,
      note: 'Bezugsdatum: der Geburtstag; ohne Uhrzeit gerechnet. Die Deutung ist eine Anregung, keine Aussage über das Kind.',
      meaning: {
        sun: 'sein Wesen und sein Selbstvertrauen', mercury: 'Sprechen, Lernen und Neugier',
        venus: 'Zuneigung und das, was ihm Freude macht', mars: 'Energie, Trotz und Bewegungsdrang',
        jupiter: 'Vertrauen und Wachstum', saturn: 'Grenzen, Regeln und Sicherheit',
        uranus: 'Eigenwilligkeit und Überraschungen', neptune: 'Fantasie und Empfindsamkeit',
        pluto: 'Willen und tiefe Entwicklungsschritte',
      },
    },
  };

  const TONE = { conjunction: 2, sextile: 0, trine: 0, square: 1, opposition: 1 };
  const MAX_ORB = 1.5;

  const chartCache = {};
  function chartOf(date) {
    const k = date.getTime();
    if (!chartCache[k]) chartCache[k] = A.natalChart(date, 0, 0, false);
    return chartCache[k];
  }

  // topic: { type: 'ki'|'kind', name?: string, date?: Date }; transit: Ergebnis von planetPositions
  function lines(topic, transit, limit) {
    const type = TYPES[topic.type];
    const date = topic.date || type.date;
    if (!type || !date) return [];
    const name = topic.name || type.label;
    const chart = chartOf(date);
    const out = [];
    TRANSIT.forEach((tp) => {
      A.PLANETS.filter((p) => p !== 'moon').forEach((np) => {
        const sep = Math.abs(A.diff180(transit[tp].lon, chart.planets[np].lon));
        A.ASPECTS.forEach((asp) => {
          const orb = Math.abs(sep - asp.angle);
          if (orb > MAX_ORB * asp.orbFactor) return;
          out.push({ transit: tp, natal: np, aspect: asp, orb, text: `${name} – ${type.meaning[np]}: ${VOCAB[tp][TONE[asp.key]]}` });
        });
      });
    });
    out.sort((a, b) => a.orb - b.orb);
    return out.slice(0, limit || 2);
  }

  const api = { TYPES, VOCAB, TRANSIT, lines };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Themen = api;
})(typeof window !== 'undefined' ? window : globalThis);
