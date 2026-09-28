/*
 * Deutung: verwandelt Transite (laufende Planeten -> Geburtshoroskop) in einen
 * persönlichen Tagestext. Tonarten: F = fließend (Trigon/Sextil),
 * H = fordernd (Quadrat/Opposition), V = verschmelzend (Konjunktion).
 */
(function (root) {
  'use strict';
  const A = root.Astro || (typeof require !== 'undefined' ? require('./astro.js') : null);

  const TONE_OF = { conjunction: 'V', sextile: 'F', trine: 'F', square: 'H', opposition: 'H' };

  // Was der laufende Planet bewirkt
  const TRANSIT = {
    sun: { F: 'Die Tagesenergie unterstützt dich mühelos.', H: 'Die Tagesenergie fordert dich heraus, klar Position zu beziehen.', V: 'Die Sonne rückt heute ins Rampenlicht deines Horoskops.' },
    moon: { F: 'Deine Stimmung trägt dich heute in genau die richtige Richtung.', H: 'Gefühle schwanken heute stärker als sonst – nimm sie ernst, aber nicht wörtlich.', V: 'Der Mond intensiviert heute deine Gefühlslage.' },
    mercury: { F: 'Gespräche, Ideen und Ausdruck gelingen heute leicht.', H: 'Missverständnisse und Hektik liegen in der Luft – wäge Worte lieber zweimal ab.', V: 'Dein Denken und Sprechen ist heute ganz auf diesen Bereich gerichtet.' },
    venus: { F: 'Charme und Harmonie öffnen dir Türen.', H: 'Bequemlichkeit oder hohe Ansprüche an andere sorgen heute für Reibung.', V: 'Venus bringt Wärme, Genuss und Sinn für Schönheit ins Spiel.' },
    mars: { F: 'Du hast Antrieb und Mut, Dinge anzupacken.', H: 'Ungeduld und Reizbarkeit sind nah – dosiere deine Kraft.', V: 'Mars gibt heute Tempo und Durchsetzungskraft.' },
    jupiter: { F: 'Großzügigkeit und Zuversicht eröffnen Möglichkeiten.', H: 'Übertreibung und zu große Erwartungen sind die Fallstricke.', V: 'Jupiter weitet den Horizont und schenkt Optimismus.' },
    saturn: { F: 'Disziplin und Geduld zahlen sich jetzt spürbar aus.', H: 'Verantwortung und Druck fordern Ausdauer – kein Tag für Abkürzungen.', V: 'Saturn verlangt Ernsthaftigkeit und Struktur.' },
    uranus: { F: 'Überraschende Einfälle bringen frischen Wind.', H: 'Unruhe und plötzliche Wendungen können Pläne durchkreuzen – bleib flexibel.', V: 'Uranus wirbelt Gewohntes auf und weckt Freiheitsdrang.' },
    neptune: { F: 'Intuition und Inspiration sind ungewöhnlich stark.', H: 'Vorsicht vor Nebel: Illusionen, Erschöpfung oder Unklarheit trüben die Sicht.', V: 'Neptun macht empfänglich und träumerisch.' },
    pluto: { F: 'Tiefe Veränderungen laufen im Stillen in deinem Sinne ab.', H: 'Machtthemen und alte Muster drängen an die Oberfläche.', V: 'Pluto legt tiefe Schichten frei und treibt Wandlung an.' },
  };

  // Welcher Teil von dir betroffen ist
  const NATAL = {
    sun: { F: 'Dein Selbstvertrauen und deine Ausstrahlung profitieren spürbar.', H: 'Dein Selbstwert und dein Durchsetzungswille werden auf die Probe gestellt.', V: 'Dein Kern, deine Identität und deine Lebenskraft stehen im Fokus.' },
    moon: { F: 'Du fühlst dich emotional sicher und kannst Nähe gut zulassen.', H: 'Deine Gefühlswelt ist verletzlicher – sorge bewusst für Ruhe und Geborgenheit.', V: 'Gefühle, Bedürfnisse und das Thema Zuhause rücken in den Vordergrund.' },
    mercury: { F: 'Lernen, Verhandeln und Austausch laufen rund.', H: 'Beim Denken und Kommunizieren droht Reibung – prüfe Details.', V: 'Dein Denken, Reden und Entscheiden ist stark beschäftigt.' },
    venus: { F: 'In Liebe, Freundschaft und Geldangelegenheiten läuft es angenehm.', H: 'In Beziehungen und beim Geld ist Fingerspitzengefühl gefragt.', V: 'Beziehungen, Genuss und das, was dir wichtig ist, stehen im Mittelpunkt.' },
    mars: { F: 'Deine Tatkraft findet den passenden Kanal.', H: 'Dein Antrieb kann in Ärger oder Übereifer umschlagen – lenke ihn in Bewegung.', V: 'Antrieb, Wille und Kampfgeist sind stark aktiviert.' },
    jupiter: { F: 'Wachstum und Glück kommen dir entgegen.', H: 'Du neigst dazu, zu viel zu wollen oder zu versprechen.', V: 'Chancen, Wachstum und Sinnfragen melden sich.' },
    saturn: { F: 'Verlässlichkeit und Struktur tragen dich.', H: 'Selbstzweifel oder Pflichtgefühl wiegen schwer – kleine Schritte helfen.', V: 'Verantwortung, Grenzen und langfristige Ziele werden spürbar.' },
    uranus: { F: 'Freiheit und Neues lassen sich gut in dein Leben integrieren.', H: 'Dein Bedürfnis nach Freiheit prallt auf Routine und Verpflichtungen.', V: 'Dein Wunsch nach Veränderung und Unabhängigkeit ist geweckt.' },
    neptune: { F: 'Intuition und Mitgefühl tragen dich.', H: 'Ideale und Wirklichkeit passen nicht recht zusammen – bleib auf dem Boden.', V: 'Sehnsüchte und Vorstellungskraft sind sehr präsent.' },
    pluto: { F: 'Du kannst tiefgreifende Veränderungen souverän steuern.', H: 'Kontrollbedürfnis und Ängste melden sich – Loslassen fällt schwer.', V: 'Wandlung, Intensität und Loslassen sind Thema.' },
    asc: { F: 'Dein Auftreten wirkt einladend und stimmig.', H: 'Du wirkst nach außen angespannter, als du dich fühlst.', V: 'Dein Auftreten und dein Umgang mit der Umwelt werden betont.' },
    mc: { F: 'Beruflich und bei deinen Zielen kommst du gut voran.', H: 'Im Beruf und bei deinen Zielen sind Hürden oder Erwartungen spürbar.', V: 'Beruf, Status und Lebensziel rücken in den Fokus.' },
  };

  const MOON_SIGN = [
    'Der Mond im Widder macht dich impulsiv, mutig und ungeduldig. Ein guter Tag, um anzufangen – weniger, um abzuwarten.',
    'Der Mond im Stier sehnt sich nach Ruhe, gutem Essen und Verlässlichkeit. Tempo zu drosseln zahlt sich aus.',
    'Der Mond in den Zwillingen macht neugierig und gesprächig. Viel Austausch, viele Ideen – Konzentration braucht Disziplin.',
    'Der Mond im Krebs weckt Fürsorge, Nostalgie und das Bedürfnis nach Geborgenheit. Rückzug ins Vertraute tut gut.',
    'Der Mond im Löwen verlangt nach Ausdruck, Anerkennung und Herzlichkeit. Zeig dich – großzügig, nicht dominant.',
    'Der Mond in der Jungfrau schärft den Blick für Details und Ordnung. Ideal zum Aufräumen, Planen und für die Gesundheit.',
    'Der Mond in der Waage sucht Harmonie, Schönheit und Ausgleich. Entscheidungen fallen schwerer, Gespräche leichter.',
    'Der Mond im Skorpion vertieft alles: Leidenschaft, Misstrauen, Intuition. Emotionale Ehrlichkeit statt Machtspiele.',
    'Der Mond im Schützen macht optimistisch, freiheitsliebend und offen für Neues. Perfekt für Pläne mit Weitblick.',
    'Der Mond im Steinbock macht sachlich, ehrgeizig und zurückhaltend. Arbeite effizient, verdränge aber keine Gefühle.',
    'Der Mond im Wassermann macht unabhängig und kreativ. Freunde, Gruppen und ungewöhnliche Ideen tun gut.',
    'Der Mond in den Fischen macht sensibel, träumerisch und mitfühlend. Schütze deine Grenzen, nähre Kreativität und Ruhe.',
  ];

  const MOON_HOUSE = [
    'Im Fokus steht heute deine Person: Auftreten, Körper, Neuanfänge.',
    'Im Fokus stehen heute Geld, Besitz und dein Selbstwert.',
    'Im Fokus stehen heute Gespräche, Kontakte, kurze Wege und Lernen.',
    'Im Fokus stehen heute Zuhause, Familie und innere Sicherheit.',
    'Im Fokus stehen heute Kreativität, Spiel, Romantik und Vergnügen.',
    'Im Fokus stehen heute Alltag, Arbeit, Routinen und Gesundheit.',
    'Im Fokus stehen heute Partnerschaft und wichtige Gegenüber.',
    'Im Fokus stehen heute Intimität, gemeinsame Ressourcen und tiefe Gefühle.',
    'Im Fokus stehen heute Weitblick, Reisen, Lernen und Sinnfragen.',
    'Im Fokus stehen heute Beruf, Verantwortung und dein öffentliches Bild.',
    'Im Fokus stehen heute Freundschaften, Netzwerke und Zukunftswünsche.',
    'Im Fokus stehen heute Rückzug, Loslassen und Erholung.',
  ];

  const PHASES = [
    { name: 'Neumond', icon: '🌑', text: 'Zeit für Neuanfänge und stille Vorsätze.' },
    { name: 'Zunehmende Sichel', icon: '🌒', text: 'Erste Schritte und Absichten dürfen sichtbar werden.' },
    { name: 'Erstes Viertel', icon: '🌓', text: 'Entscheidungen und Handeln sind gefragt.' },
    { name: 'Zunehmender Mond', icon: '🌔', text: 'Feinschliff – bleib dran, es baut sich auf.' },
    { name: 'Vollmond', icon: '🌕', text: 'Emotionen und Ergebnisse erreichen einen Höhepunkt.' },
    { name: 'Abnehmender Mond', icon: '🌖', text: 'Teilen, danken und Bilanz ziehen.' },
    { name: 'Letztes Viertel', icon: '🌗', text: 'Loslassen, was nicht mehr passt.' },
    { name: 'Abnehmende Sichel', icon: '🌘', text: 'Rückzug, Erholung und Vorbereitung auf den Neustart.' },
  ];

  // Bereiche: welche Geburtspunkte zählen (Gewicht), Textbank je Sternestufe
  const AREAS = {
    love: {
      title: 'Liebe & Beziehungen', icon: '♥',
      targets: { venus: 1, moon: 0.8, mars: 0.5, sun: 0.4, asc: 0.4 },
      text: {
        low: ['Beziehungen brauchen heute Geduld. Sprich Bedürfnisse ruhig aus, statt sie zu erwarten.', 'Zwischenmenschlich kann es haken – nimm Kritik nicht persönlich und verschiebe Grundsatzdiskussionen.'],
        mid: ['Ein ausgeglichener Beziehungstag ohne große Wellen – Raum für kleine Gesten.', 'Nähe entsteht heute im Alltäglichen: zuhören, da sein, gemeinsam etwas essen.'],
        high: ['Herzlichkeit liegt in der Luft; Nähe, Flirt und Versöhnung gelingen leicht.', 'Du wirkst anziehend und offen – ein guter Tag für ein ehrliches Gespräch oder ein Date.'],
      },
    },
    career: {
      title: 'Beruf & Finanzen', icon: '◆',
      targets: { mc: 1, saturn: 0.8, sun: 0.7, jupiter: 0.7, mercury: 0.6, venus: 0.4 },
      text: {
        low: ['Im Job ist Durchhaltevermögen gefragt. Wichtige Entscheidungen lieber vertagen und Details prüfen.', 'Widerstände oder Verzögerungen sind möglich – setze Prioritäten, statt alles auf einmal zu wollen.'],
        mid: ['Solider Arbeitstag: Routineaufgaben laufen, für Großes braucht es einen zweiten Anlauf.', 'Weder Rückenwind noch Gegenwind – nutze die Ruhe für Planung und Ordnung.'],
        high: ['Beruflich gibt es Rückenwind. Präsentiere Ideen, verhandle oder starte etwas Neues.', 'Deine Arbeit wird bemerkt und geschätzt – ein guter Tag, um sichtbar zu werden.'],
      },
    },
    energy: {
      title: 'Energie & Wohlbefinden', icon: '✦',
      targets: { sun: 1, mars: 0.9, moon: 0.7, asc: 0.7, saturn: 0.4 },
      text: {
        low: ['Deine Energie ist eher niedrig oder unruhig. Pausen, Wasser, frische Luft und früh ins Bett.', 'Du bist schneller erschöpft oder gereizt – schone deine Kräfte und vermeide Überforderung.'],
        mid: ['Stabile Energie mit kleinen Schwankungen; Bewegung an der frischen Luft gleicht sie aus.', 'Du kommst gut durch den Tag, wenn du dir Zeit für Mahlzeiten und Pausen nimmst.'],
        high: ['Du bist vital und belastbar – nutze den Schwung für Sport oder liegengebliebene Aufgaben.', 'Körper und Geist ziehen an einem Strang; ein guter Tag für etwas Herausforderndes.'],
      },
    },
  };

  const ADVICE = {
    F: ['Nimm Angebote heute an – vieles fügt sich, wenn du einfach anfängst.', 'Der Rückenwind ist real: Sprich die Bitte aus, die du schon lange vor dir herschiebst.', 'Genieße, was gut läuft, statt schon nach dem nächsten Problem zu suchen.'],
    H: ['Atme durch, bevor du reagierst. Widerstand ist heute Information, kein Urteil.', 'Wähle eine Sache, die du gut machst, und lass den Rest ruhig liegen.', 'Reibung zeigt, wo etwas wachsen will – bleib freundlich und bestimmt.'],
    V: ['Konzentriere dich auf ein Thema; Intensität wirkt, wenn sie gebündelt wird.', 'Was heute auftaucht, will beachtet werden. Nimm dir Zeit für die Frage dahinter.', 'Ein bewusster Moment der Stille am Abend hilft, den Tag zu verdauen.'],
    N: ['Ein ruhiger Tag ohne große Sterne-Ereignisse: Nutze ihn für Dinge, die du selbst bestimmst.', 'Wenn die Himmelsbühne leise ist, zählt deine eigene Entscheidung besonders.'],
  };

  const SUN_SIGN = ['Tatkraft, Mut und Pioniergeist', 'Beständigkeit, Genuss- und Sicherheitsstreben', 'Neugier, Wandelbarkeit und Kommunikationslust', 'Gefühlstiefe, Fürsorge und Schutzbedürfnis', 'Selbstausdruck, Herzenswärme und Stolz', 'Genauigkeit, Dienstbereitschaft und Analyse', 'Harmoniebedürfnis, Ästhetik und Fairness', 'Intensität, Leidenschaft und Tiefgang', 'Freiheitsdrang, Optimismus und Sinnsuche', 'Ehrgeiz, Verlässlichkeit und Ausdauer', 'Eigenständigkeit, Ideenreichtum und Gemeinschaftssinn', 'Empathie, Fantasie und Hingabe'];
  const MOON_NATAL = ['schnelle, direkte Gefühlsreaktionen und den Wunsch nach Aktion', 'Ruhe, Körperlichkeit und verlässliche Rituale', 'Abwechslung, Gespräche und geistige Anregung', 'Geborgenheit, Nähe und emotionale Sicherheit', 'Wärme, Anerkennung und Großzügigkeit', 'Ordnung, Nützlichsein und klare Abläufe', 'Harmonie, Zweisamkeit und Ausgeglichenheit', 'tiefe Bindungen, Vertrauen und emotionale Intensität', 'Weite, Freiheit und Zuversicht', 'Struktur, Selbstkontrolle und Zurückhaltung', 'Unabhängigkeit, Raum und Freundschaft', 'Mitgefühl, Rückzug und Träumerei'];
  const ASC_SIGN = ['direkt, energisch, initiativ', 'ruhig, sinnlich, verlässlich', 'aufgeweckt, wendig, kommunikativ', 'sensibel, fürsorglich, zurückhaltend', 'strahlend, warmherzig, präsent', 'bescheiden, aufmerksam, sachlich', 'charmant, diplomatisch, gewinnend', 'magnetisch, intensiv, geheimnisvoll', 'offen, unternehmungslustig, herzlich', 'seriös, kontrolliert, zielstrebig', 'originell, distanziert, freundlich', 'sanft, einfühlsam, verträumt'];

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const pick = (arr, seed, salt) => arr[hash(seed + '|' + salt) % arr.length];
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  // Gewicht des laufenden Planeten und des Geburtspunkts für die Rangfolge
  const T_WEIGHT = { pluto: 4.5, neptune: 4, uranus: 4, saturn: 4.5, jupiter: 4, mars: 3, sun: 2.5, venus: 2.5, mercury: 2, moon: 1.6 };
  const N_WEIGHT = { sun: 3, moon: 3, asc: 3, mc: 3, mercury: 2.5, venus: 2.5, mars: 2.5, jupiter: 2, saturn: 2, uranus: 1.5, neptune: 1.5, pluto: 1.5 };
  const BENEFIC = { venus: 0.7, jupiter: 0.8, sun: 0.5 };
  const MALEFIC = { saturn: -0.6, mars: -0.5, pluto: -0.5 };

  function aspectValue(a) {
    switch (a.aspect.key) {
      case 'trine': return 1;
      case 'sextile': return 0.7;
      case 'square': return -1;
      case 'opposition': return -0.8;
      default: return BENEFIC[a.transit] || MALEFIC[a.transit] || 0.15;
    }
  }

  function strength(a) {
    return T_WEIGHT[a.transit] * N_WEIGHT[a.natal] * (1 - (a.orb / a.maxOrb) * 0.6);
  }

  function moonPhase(transit) {
    const elong = A.norm(transit.moon.lon - transit.sun.lon);
    return { elong, ...PHASES[Math.floor(A.norm(elong + 22.5) / 45) % 8] };
  }

  /**
   * @param {object} natal  Ergebnis von Astro.natalChart
   * @param {object} transit Ergebnis von Astro.planetPositions (für den Tag)
   * @param {string} seed   beliebiger String für stabile Textvarianten (z. B. Geburtsdaten + Datum)
   */
  function dailyHoroscope(natal, transit, seed) {
    const aspects = A.transitAspects(transit, natal).map((a) => ({
      ...a, tone: TONE_OF[a.aspect.key], strength: strength(a), value: aspectValue(a),
    }));
    aspects.sort((x, y) => y.strength - x.strength);
    const top = aspects.slice(0, 6).map((a) => ({
      ...a,
      title: `${A.PLANET_NAMES[a.transit]} ${a.aspect.symbol} ${A.PLANET_NAMES[a.natal]}`,
      text: `${TRANSIT[a.transit][a.tone]} ${NATAL[a.natal][a.tone]}`,
    }));

    // Bereiche mit Sternen
    const areas = Object.keys(AREAS).map((key) => {
      const cfg = AREAS[key];
      let sum = 0;
      let driver = null;
      aspects.forEach((a) => {
        const w = cfg.targets[a.natal];
        if (!w) return;
        const contribution = (a.value * a.strength * w) / 8;
        sum += contribution;
        if (!driver || Math.abs(contribution) > Math.abs(driver.c)) driver = { a, c: contribution };
      });
      const stars = clamp(Math.round(3 + sum), 1, 5);
      const level = stars <= 2 ? 'low' : stars === 3 ? 'mid' : 'high';
      return {
        key, title: cfg.title, icon: cfg.icon, stars,
        text: pick(cfg.text[level], seed, key),
        driver: driver ? `${A.PLANET_NAMES[driver.a.transit]} ${driver.a.aspect.symbol} ${A.PLANET_NAMES[driver.a.natal]}` : null,
      };
    });

    const moon = transit.moon;
    const moonSign = A.signIndex(moon.lon);
    const moonHouse = natal.timeKnown ? A.wholeSignHouse(moon.lon, natal.asc) : null;
    const phase = moonPhase(transit);
    const notes = [];
    if (transit.mercury.retro) notes.push('Merkur läuft rückläufig: Verträge, Technik und Absprachen doppelt prüfen, alte Themen melden sich.');
    ['venus', 'mars'].forEach((p) => {
      if (transit[p].retro) notes.push(`${A.PLANET_NAMES[p]} läuft rückläufig – ${p === 'venus' ? 'Beziehungs- und Wertefragen werden neu bewertet.' : 'Tatendrang staut sich, Geduld zahlt sich aus.'}`);
    });

    const lead = top[0];
    const adviceKey = lead ? lead.tone : 'N';
    const advice = pick(ADVICE[adviceKey], seed, 'advice');

    const headline = lead
      ? `${lead.title}: ${{ F: 'Rückenwind', H: 'Herausforderung mit Entwicklungspotenzial', V: 'Verdichtete Energie' }[lead.tone]}`
      : 'Ein ruhiger Tag';

    return {
      headline,
      intro: `${MOON_SIGN[moonSign]}${moonHouse ? ' ' + MOON_HOUSE[moonHouse - 1] : ''}`,
      moon: { sign: moonSign, house: moonHouse, phase },
      areas, aspects: top, advice, notes,
    };
  }

  function natalProfile(natal) {
    const sun = natal.planets.sun.sign;
    const moon = natal.planets.moon.sign;
    const lines = [
      { label: 'Sonne', sign: sun, text: `Dein Wesenskern ist geprägt von ${SUN_SIGN[sun]}.` },
      { label: 'Mond', sign: moon, text: `Emotional brauchst du ${MOON_NATAL[moon]}.` },
    ];
    if (natal.timeKnown) {
      const asc = A.signIndex(natal.asc);
      lines.push({ label: 'Aszendent', sign: asc, text: `Andere erleben dich als ${ASC_SIGN[asc]}.` });
    }
    return lines;
  }

  const api = { dailyHoroscope, natalProfile, hash };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Interpret = api;
})(typeof window !== 'undefined' ? window : globalThis);
