/*
 * Deutung: verwandelt Transite (laufende Planeten -> Geburtshoroskop) in einen
 * persönlichen Tagestext. Tonarten: F = fließend (Trigon/Sextil),
 * H = fordernd (Quadrat/Opposition), V = verschmelzend (Konjunktion).
 */
(function (root) {
  'use strict';
  const A = root.Astro || (typeof require !== 'undefined' ? require('./astro.js') : null);
  const Themes = root.Themes || (typeof require !== 'undefined' ? require('./themes.js') : null);
  // Kombinationstext je laufendem Planet, Geburtspunkt und Tonart (F leicht, H angespannt, V verschmelzend)
  const themeFor = (t, n, tone) => Themes.themeFor(t, n, tone);
  const Verf = root.Verflechtung || (typeof require !== 'undefined' ? require('./verflechtung.js') : null);
  const Fein = root.Feinheit || (typeof require !== 'undefined' ? require('./feinheit.js') : null);

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

  // Wie der laufende Planet im betroffenen Haus wirkt
  const INTO = {
    sun: 'Vitalität und Aufmerksamkeit fließen hierher',
    moon: 'Stimmung färbt diesen Bereich',
    mercury: 'Gedanken und Gespräche kreisen hier',
    venus: 'Harmonie und Genuss finden hier Raum',
    mars: 'Tempo, Mut und mögliche Konflikte prägen diesen Bereich',
    jupiter: 'Wachstum und Zuversicht öffnen hier Türen',
    saturn: 'Ernst, Struktur und Prüfung liegen hier',
    uranus: 'Überraschung und Freiheitsdrang mischen hier auf',
    neptune: 'Inspiration und Nebel liegen hier dicht beisammen',
    pluto: 'Tiefe und Wandlung wirken hier',
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
      houses: { 5: 1, 7: 1, 8: 0.5 },
      text: {
        low: ['Beziehungen brauchen heute Geduld. Sprich Bedürfnisse ruhig aus, statt sie zu erwarten.', 'Zwischenmenschlich kann es haken – nimm Kritik nicht persönlich und verschiebe Grundsatzdiskussionen.'],
        mid: ['Ein ausgeglichener Beziehungstag ohne große Wellen – Raum für kleine Gesten.', 'Nähe entsteht heute im Alltäglichen: zuhören, da sein, gemeinsam etwas essen.'],
        high: ['Herzlichkeit liegt in der Luft; Nähe, Flirt und Versöhnung gelingen leicht.', 'Du wirkst anziehend und offen – ein guter Tag für ein ehrliches Gespräch oder ein Date.'],
      },
    },
    career: {
      title: 'Beruf & Finanzen', icon: '◆',
      targets: { mc: 1, saturn: 0.8, sun: 0.7, jupiter: 0.7, mercury: 0.6, venus: 0.4 },
      houses: { 10: 1, 6: 0.6, 2: 0.6 },
      text: {
        low: ['Im Job ist Durchhaltevermögen gefragt. Wichtige Entscheidungen lieber vertagen und Details prüfen.', 'Widerstände oder Verzögerungen sind möglich – setze Prioritäten, statt alles auf einmal zu wollen.'],
        mid: ['Solider Arbeitstag: Routineaufgaben laufen, für Großes braucht es einen zweiten Anlauf.', 'Weder Rückenwind noch Gegenwind – nutze die Ruhe für Planung und Ordnung.'],
        high: ['Beruflich gibt es Rückenwind. Präsentiere Ideen, verhandle oder starte etwas Neues.', 'Deine Arbeit wird bemerkt und geschätzt – ein guter Tag, um sichtbar zu werden.'],
      },
    },
    energy: {
      title: 'Energie & Wohlbefinden', icon: '✦',
      targets: { sun: 1, mars: 0.9, moon: 0.7, asc: 0.7, saturn: 0.4 },
      houses: { 1: 1, 6: 0.6 },
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

  // Wie sich Energie im jeweiligen Zeichen ausdrückt
  const SIGN_STYLE = [
    'impulsiv, direkt und ungeduldig', 'beharrlich, sinnlich und bodenständig', 'beweglich, neugierig und sprunghaft',
    'gefühlvoll, schützend und wechselhaft', 'stolz, großzügig und dramatisch', 'sorgfältig, kritisch und praktisch',
    'ausgleichend, höflich und unentschlossen', 'intensiv, kontrolliert und leidenschaftlich', 'optimistisch, offen und unbekümmert',
    'diszipliniert, ehrgeizig und nüchtern', 'eigenwillig, distanziert und erfinderisch', 'einfühlsam, verträumt und grenzenlos',
  ];
  const HOUSE_TOPIC = [
    'Selbstbild, Körper und Neuanfänge', 'Geld, Besitz und Selbstwert', 'Kommunikation, Umfeld und Lernen',
    'Zuhause, Familie und Wurzeln', 'Kreativität, Romantik und Vergnügen', 'Alltag, Arbeit und Gesundheit',
    'Partnerschaft und Verträge', 'Intimität, geteilte Ressourcen und Wandlung', 'Reisen, Weltbild und Weiterbildung',
    'Beruf, Ruf und Lebensziel', 'Freundschaften, Netzwerke und Zukunftspläne', 'Rückzug, Unterbewusstes und Erholung',
  ];
  // Wie günstig ein laufender Planet ist, wenn er durch ein Bereichshaus zieht
  const PLANET_VALENCE = { sun: 0.5, moon: 0.2, mercury: 0.2, venus: 0.8, mars: -0.2, jupiter: 0.9, saturn: -0.6, uranus: -0.1, neptune: -0.2, pluto: -0.3 };
  const PERSONAL_FOCUS = { mercury: 'Du denkst und sprichst', venus: 'In Liebe, Freundschaft und Genuss bist du', mars: 'Du gehst Dinge an und setzt dich durch:' };

  const NAT_TONE = {
    F: 'Das ist eine eingespielte Stärke – der heutige Transit kann sie nutzen.',
    H: 'Diese Grundspannung kennst du gut – der heutige Transit rührt daran.',
    V: 'Beide Anteile wirken bei dir als Einheit – der Transit trifft sie gemeinsam.',
  };
  const KEYWORD = { sun: 'Identität', moon: 'Gefühle', mercury: 'Denken', venus: 'Liebe und Werte', mars: 'Antrieb', jupiter: 'Wachstum', saturn: 'Struktur', uranus: 'Freiheitsdrang', neptune: 'Intuition', pluto: 'Tiefe', asc: 'Auftreten', mc: 'Berufung' };
  const DEIN = {
    sun: 'deiner Sonne', moon: 'deinem Mond', mercury: 'deinem Merkur', venus: 'deiner Venus', mars: 'deinem Mars',
    jupiter: 'deinem Jupiter', saturn: 'deinem Saturn', uranus: 'deinem Uranus', neptune: 'deinem Neptun', pluto: 'deinem Pluto',
    asc: 'deinem Aszendenten', mc: 'deinem Medium Coeli',
  };
  const ACC = {
    sun: 'deine Sonne', moon: 'deinen Mond', mercury: 'deinen Merkur', venus: 'deine Venus', mars: 'deinen Mars',
    jupiter: 'deinen Jupiter', saturn: 'deinen Saturn', uranus: 'deinen Uranus', neptune: 'deinen Neptun', pluto: 'deinen Pluto',
    asc: 'deinen Aszendenten', mc: 'dein Medium Coeli',
  };
  const PRONOUN = { sun: 'sie', venus: 'sie', mc: 'es' };

  // Wie ein schneller Planet ein Dauerthema auslöst, je nach Verhältnis zum Hintergrund
  // soften = harmonischer Auslöser auf Spannung, sharpen = Spannung auf Spannung,
  // disturb = Spannung auf Rückenwind, boost = Rückenwind auf Rückenwind, fuse = Konjunktion
  const TRIGGER = {
    sun: {
      soften: 'Sie federt die Spannung ab und macht es leichter, darüber zu sprechen, statt es wegzudrücken.',
      sharpen: 'Sie stellt dich vor die Wahl: Position beziehen oder ausweichen.',
      disturb: 'Sie bringt Unruhe in etwas, das eigentlich gut läuft.',
      boost: 'Sie gibt zusätzlich Rückenwind.',
      fuse: 'Sie rückt das Thema ins Licht.',
    },
    moon: {
      soften: 'Deine Stimmung macht es weicher und erträglicher.',
      sharpen: 'Deine Stimmung verstärkt es – Gefühle liegen dünnhäutig nah an der Oberfläche.',
      disturb: 'Stimmungsschwankungen stören einen sonst guten Lauf.',
      boost: 'Deine Stimmung trägt dich zusätzlich.',
      fuse: 'Die Gefühle verdichten sich.',
    },
    mercury: {
      soften: 'Gespräche und klare Worte entschärfen es.',
      sharpen: 'Worte fallen schärfer aus und lösen Streit oder Grübelei aus.',
      disturb: 'Missverständnisse stören einen sonst guten Fluss.',
      boost: 'Ideen und Gespräche geben zusätzlichen Schwung.',
      fuse: 'Das Thema kreist im Kopf.',
    },
    venus: {
      soften: 'Zuwendung, Charme und ein freundliches Wort machen es milder.',
      sharpen: 'Ansprüche an Nähe oder Anerkennung reiben sich am Thema.',
      disturb: 'Bequemlichkeit oder Harmoniebedürfnis bremsen einen sonst guten Lauf.',
      boost: 'Freundlichkeit und Genuss verstärken das Gute.',
      fuse: 'Es geht heute um Nähe und um das, was dir wichtig ist.',
    },
    mars: {
      soften: 'Tatkraft hilft, es anzupacken, statt zu grübeln.',
      sharpen: 'Ungeduld heizt es an – Reizbarkeit und Konflikte sind wahrscheinlicher.',
      disturb: 'Ungeduld stört einen sonst guten Lauf.',
      boost: 'Antrieb und Mut geben zusätzlichen Schub.',
      fuse: 'Es wird konkret und drängt zum Handeln.',
    },
  };
  const REL_ADVICE = {
    soften: 'Nutze die Entlastung und sprich Schwieriges heute an – aber nicht überstürzt.',
    sharpen: 'Nimm Tempo raus und entscheide nichts im Affekt.',
    disturb: 'Halte am Bewährten fest und lass dich nicht aus dem Konzept bringen.',
    boost: 'Nutze den Rückenwind für etwas, das dir wirklich wichtig ist.',
    fuse: 'Konzentriere dich heute auf dieses eine Thema.',
  };
  const ELEMENT_DOM = [
    'Feuer dominiert: Du brauchst Begeisterung, Bewegung und Taten.',
    'Erde dominiert: Du brauchst Greifbares, Verlässlichkeit und Ergebnisse.',
    'Luft dominiert: Du brauchst Austausch, Ideen und geistige Freiheit.',
    'Wasser dominiert: Du brauchst emotionale Tiefe, Intuition und Nähe.',
  ];
  const ELEMENT_MISSING = [
    'Feuer fehlt: Antrieb entsteht bei dir selten spontan – Motivation kommt über Struktur oder andere Menschen.',
    'Erde fehlt: Praktisches und Körperliches vergisst du leicht – feste Routinen helfen.',
    'Luft fehlt: Abstand und Sachlichkeit fallen dir schwer – Gedanken aufzuschreiben hilft.',
    'Wasser fehlt: Gefühle laufen bei dir eher nebenher – nimm dir bewusst Zeit dafür.',
  ];
  const QUALITY_DOM = [
    'Du setzt Impulse und beginnst gern Neues (viel kardinale Energie).',
    'Du bleibst dran und lässt dich schwer umstimmen (viel fixe Energie).',
    'Du passt dich an und wechselst gern die Perspektive (viel veränderliche Energie).',
  ];

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

  const tzOpt = (opts) => (opts && opts.timeZone ? { timeZone: opts.timeZone } : {});
  const fmtTime = (d, opts) => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', ...tzOpt(opts) });
  const fmtDate = (d, opts) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric', ...tzOpt(opts) });
  const sameDay = (a, b, opts) => a.toLocaleDateString('de-DE', tzOpt(opts)) === b.toLocaleDateString('de-DE', tzOpt(opts));
  const exactAt = (a, opts) => (opts && opts.when ? A.exactTime(a.transit, a.natalLon, a.aspect.angle, opts.when) : null);

  // Satz zur Exaktheit: mit echtem Zeitpunkt, sonst nur nach Abstand
  function exactSentence(a, opts) {
    const t = exactAt(a, opts);
    if (!t) return exactness(a.orb, a.applying);
    const dh = (t - opts.when) / 3.6e6;
    const day = sameDay(t, opts.when, opts) ? 'heute' : `am ${fmtDate(t, opts)}`;
    if (Math.abs(dh) < 3) return `Der Aspekt ist jetzt auf den Punkt genau (exakt um ${fmtTime(t, opts)} Uhr).`;
    if (dh > 0) return `Der Aspekt wird ${day} um ${fmtTime(t, opts)} Uhr exakt.`;
    return `Der Aspekt war ${day} um ${fmtTime(t, opts)} Uhr exakt und klingt ab.`;
  }

  // Verflochtene Tagesdeutung: Dauerthema (langsamer Planet) + Auslöser (schneller Planet) + Begleiter
  const SLOW = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const FAST = ['sun', 'moon', 'mercury', 'venus', 'mars'];
  function pickStory(all) {
    const top = all.slice(0, 8);
    if (!top.length) return null;
    // Roter Faden: der Geburtspunkt mit den meisten (und stärksten) Aspekten
    const agg = {};
    top.forEach((a) => {
      agg[a.natal] = agg[a.natal] || { n: 0, sum: 0 };
      agg[a.natal].n += 1;
      agg[a.natal].sum += a.strength;
    });
    const focus = Object.keys(agg).sort((x, y) => agg[y].n - agg[x].n || agg[y].sum - agg[x].sum)[0];
    const best = (list) => list.slice().sort((x, y) => y.strength - x.strength)[0] || null;
    const slow = top.filter((a) => SLOW.includes(a.transit));
    const fast = top.filter((a) => FAST.includes(a.transit));
    const bg = best(slow.filter((a) => a.natal === focus)) || best(slow);
    const trig = bg ? best(fast.filter((a) => a.natal === focus)) || best(fast) : null;
    const used = new Set([bg, trig].filter(Boolean));
    const rest = [];
    top.filter((a) => !used.has(a)).forEach((a) => {
      if (rest.length < 2 && !rest.some((r) => r.natal === a.natal && r.transit === a.transit)) rest.push(a);
    });

    return { top, agg, focus, bg, trig, rest };
  }

  function story(natal, all, opts) {
    const sel = pickStory(all);
    if (!sel) return null;
    const { top, agg, focus, bg, trig, rest } = sel;
    const name = (k) => A.PLANET_NAMES[k];
    const parts = [];
    const n = agg[focus].n;
    parts.push(n >= 2
      ? `Der Tag dreht sich um ${ACC[focus]}: ${n} Planeten sprechen ${PRONOUN[focus] || 'ihn'} an.`
      : `Im Mittelpunkt steht ${ACC[focus]}.`);
    let rel = null;
    if (bg) {
      parts.push(`Im Hintergrund läuft ${name(bg.transit)} ${bg.aspect.phrase} ${DEIN[bg.natal]}: ${themeFor(bg.transit, bg.natal, bg.tone)}`);
      if (trig) {
        const bgTone = bg.tone === 'V' ? (bg.value < 0 ? 'H' : 'F') : bg.tone;
        rel = trig.tone === 'V' ? 'fuse' : trig.tone === 'F' ? (bgTone === 'H' ? 'soften' : 'boost') : (bgTone === 'H' ? 'sharpen' : 'disturb');
        const t = exactAt(trig, opts);
        const when = t && sameDay(t, opts.when, opts) ? ` (exakt um ${fmtTime(t, opts)} Uhr)` : '';
        const lead = trig.natal === bg.natal ? 'Ausgelöst wird das durch' : 'Dazu kommt heute';
        parts.push(`${lead} ${name(trig.transit)} ${trig.aspect.phrase} ${DEIN[trig.natal]}${when}: ${TRIGGER[trig.transit][rel]}`);
      }
    } else {
      const lead = top[0];
      parts.push(`${themeFor(lead.transit, lead.natal, lead.tone)} ${TRANSIT[lead.transit][lead.tone]}`);
      rest.splice(0, 1);
    }
    const conns = ['Zugleich wirkt', 'Dazu kommt'];
    rest.forEach((a, i) => parts.push(`${conns[i]} ${name(a.transit)} ${a.aspect.phrase} ${DEIN[a.natal]}: ${themeFor(a.transit, a.natal, a.tone)}`));
    return { text: parts.join(' '), advice: rel ? REL_ADVICE[rel] : null, relation: rel };
  }

  function exactness(orb, applying) {
    const phase = applying ? 'noch im Aufbau' : 'schon im Abklingen';
    if (orb < 0.3) return 'Der Aspekt ist heute auf den Punkt genau – sein Höhepunkt liegt jetzt.';
    if (orb < 1) return `Der Aspekt ist sehr eng (${orb.toFixed(1)}°) und ${phase}.`;
    return `Der Aspekt ist noch ${orb.toFixed(1)}° vom exakten Punkt entfernt und ${phase} – spürbar, aber nicht dominant.`;
  }

  // Zusatzsätze aus den konkreten Werten: Zeichen, Häuser, Rückläufigkeit, Genauigkeit
  function details(a, natal, transit, ruler, nAsp, opts) {
    const t = transit[a.transit];
    const name = A.PLANET_NAMES[a.transit];
    const tSign = A.signIndex(t.lon);
    const out = [`${name} steht ${A.SIGNS_IN[tSign]} und wirkt dort ${SIGN_STYLE[tSign]}.`];
    if (t.retro && a.transit !== 'sun' && a.transit !== 'moon') {
      out.push(`${name} ist rückläufig: Das Thema kehrt zurück – prüfe und überarbeite, statt Neues zu erzwingen.`);
    }
    if (natal.timeKnown) {
      const h = A.wholeSignHouse(t.lon, natal.asc);
      out.push(`Der Transit landet in deinem ${h}. Haus (${HOUSE_TOPIC[h - 1]}): ${INTO[a.transit]}.`);
    }
    const nName = A.PLANET_NAMES[a.natal];
    if (natal.planets[a.natal]) {
      const n = natal.planets[a.natal];
      const house = n.house ? ` im ${n.house}. Haus (${HOUSE_TOPIC[n.house - 1]})` : '';
      out.push(`Dein ${nName} steht ${A.SIGNS_IN[n.sign]}${house} – du erlebst dieses Thema ${SIGN_STYLE[n.sign]}.`);
    } else {
      const lon = a.natal === 'asc' ? natal.asc : natal.mc;
      const s = A.signIndex(lon);
      out.push(`Dein ${nName} liegt ${A.SIGNS_IN[s]}: ${SIGN_STYLE[s]}.`);
    }
    if (ruler && a.natal === ruler.planet) {
      out.push(`Dein ${nName} ist zugleich dein Aszendentherrscher – ein Schlüsselplanet deines Horoskops, Transite darauf wiegen schwerer.`);
    }
    const na = nAsp.find((e) => e.a === a.natal || e.b === a.natal);
    if (na) {
      const other = na.a === a.natal ? na.b : na.a;
      const target = DEIN[other] || `deinem ${A.PLANET_NAMES[other]}`;
      out.push(`Dein ${nName} steht im Geburtshoroskop ${na.aspect.phrase} ${target}. ${NAT_TONE[TONE_OF[na.aspect.key]]}`);
    }
    out.push(exactSentence(a, opts));
    return out;
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
  function dailyHoroscope(natal, transit, seed, opts) {
    const ruler = A.chartRuler(natal);
    const nAsp = A.natalAspects(natal);
    const aspects = A.transitAspects(transit, natal).map((a) => ({
      ...a, tone: TONE_OF[a.aspect.key], strength: strength(a) * (ruler && a.natal === ruler.planet ? 1.3 : 1), value: aspectValue(a),
    }));
    aspects.sort((x, y) => y.strength - x.strength);
    const top = aspects.slice(0, 6).map((a) => ({
      ...a,
      title: `${A.PLANET_NAMES[a.transit]} ${a.aspect.symbol} ${A.PLANET_NAMES[a.natal]}`,
      text: `${themeFor(a.transit, a.natal, a.tone)} ${TRANSIT[a.transit][a.tone]}`,
      details: details(a, natal, transit, ruler, nAsp, opts),
    }));

    // Bereiche mit Sternen
    const areas = Object.keys(AREAS).map((key) => {
      const cfg = AREAS[key];
      let sum = 0;
      let driver = null;
      const consider = (label, c) => { if (!driver || Math.abs(c) > Math.abs(driver.c)) driver = { label, c }; };
      aspects.forEach((a) => {
        const w = cfg.targets[a.natal];
        if (!w) return;
        const contribution = (a.value * a.strength * w) / 8;
        sum += contribution;
        consider(`${A.PLANET_NAMES[a.transit]} ${a.aspect.symbol} ${A.PLANET_NAMES[a.natal]}`, contribution);
      });
      // Laufende Planeten in den Häusern, die zu diesem Bereich gehören
      if (natal.timeKnown) {
        A.PLANETS.forEach((p) => {
          const h = A.wholeSignHouse(transit[p].lon, natal.asc);
          const hw = cfg.houses[h];
          if (!hw) return;
          const c = (PLANET_VALENCE[p] * T_WEIGHT[p] * hw) / 10;
          sum += c;
          consider(`${A.PLANET_NAMES[p]} im ${h}. Haus`, c);
        });
      }
      const stars = clamp(Math.round(3 + sum), 1, 5);
      const level = stars <= 2 ? 'low' : stars === 3 ? 'mid' : 'high';
      return {
        key, title: cfg.title, icon: cfg.icon, stars,
        text: pick(cfg.text[level], seed, key),
        driver: driver ? driver.label : null,
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

    const st = story(natal, aspects, opts);
    const pl = plainStory(natal, aspects, opts, seed, transit);
    const headline = lead
      ? `${lead.title}: ${{ F: 'Rückenwind', H: 'Herausforderung mit Entwicklungspotenzial', V: 'Verdichtete Energie' }[lead.tone]}`
      : 'Ein ruhiger Tag';

    return {
      headline,
      intro: `${MOON_SIGN[moonSign]}${moonHouse ? ' ' + MOON_HOUSE[moonHouse - 1] : ''}`,
      moon: { sign: moonSign, house: moonHouse, phase },
      overview: overview(aspects, natal),
      story: st ? st.text : null,
      plain: pl,
      moonPlain: moonPlain(transit, natal),
      areas, aspects: top, advice: pl && pl.advice ? pl.advice : st && st.advice ? st.advice : advice, notes,
    };
  }

  // Regelbasierte Tagessynthese: Grundton, roter Faden, Zusammenspiel mehrerer Transite
  function overview(all, natal) {
    const top = all.slice(0, 8);
    if (!top.length) return 'Am Himmel ist es für dich ruhig: keine engen Kontakte zu deinem Geburtshoroskop. Dein eigener Rhythmus gibt heute den Ton an.';
    const parts = [];
    const strong = top.slice(0, 5);
    const f = strong.filter((a) => a.tone === 'F').length;
    const hd = strong.filter((a) => a.tone === 'H').length;
    if (f >= hd + 2) parts.push('Insgesamt ein Tag mit Rückenwind: Vieles fügt sich, wenn du es zulässt.');
    else if (hd >= f + 2) parts.push('Insgesamt ein fordernder Tag: Es geht weniger um Leichtigkeit als um Reifung – wer Ruhe bewahrt, kommt weiter.');
    else parts.push('Ein gemischter Tag: Rückenwind und Widerstand wechseln sich ab, du musst Prioritäten setzen.');

    // Roter Faden: Geburtspunkt, der mehrfach angesprochen wird, sonst Haus des stärksten Aspekts
    const count = {};
    top.forEach((a) => { count[a.natal] = (count[a.natal] || 0) + 1; });
    const [key, n] = Object.entries(count).sort((x, y) => y[1] - x[1])[0];
    if (n >= 2) {
      parts.push(`Roter Faden: Dein ${A.PLANET_NAMES[key]} wird von ${n} Planeten zugleich angesprochen – das Thema ${KEYWORD[key]} steht heute im Mittelpunkt.`);
    } else {
      const pl = natal.planets[top[0].natal];
      if (pl && pl.house) parts.push(`Der Schwerpunkt liegt im Bereich „${HOUSE_TOPIC[pl.house - 1]}“ (${pl.house}. Haus).`);
    }

    // Zusammenspiel: mehrere Transite ergeben zusammen mehr als die Einzelteile
    const has = (t, pred) => top.some((a) => a.transit === t && (!pred || pred(a)));
    const isHard = (a) => a.tone === 'H';
    const hardOnSoft = top.filter((a) => isHard(a) && (a.natal === 'moon' || a.natal === 'venus')).length;
    const combos = [
      [has('mars') && has('saturn'), 'Mars und Saturn sind zugleich aktiv: Du willst vorankommen und wirst gebremst. Wähle Ausdauer statt Sprint.'],
      [has('venus') && has('jupiter') && !has('venus', isHard) && !has('jupiter', isHard), 'Venus und Jupiter zusammen machen den Tag zur Einladung für Genuss, Großzügigkeit und gute Begegnungen – gönn dir etwas, aber halte Maß.'],
      [has('saturn', isHard) && has('jupiter', (a) => a.tone === 'F'), 'Vorsicht und Zuversicht halten sich die Waage: Solide Schritte schlagen große Sprünge.'],
      [has('neptune') && has('mercury'), 'Klarheit ist heute Mangelware – bestätige Wichtiges schriftlich und frage lieber einmal mehr nach.'],
      [has('pluto') && has('mars'), 'Mars und Pluto verstärken einander: viel Kraft, aber auch Machtspiele. Wähle ein Ziel und lass Nebenkriegsschauplätze.'],
      [hardOnSoft >= 2, 'Gefühle und Beziehungen werden von mehreren Spannungen zugleich berührt – sei heute besonders behutsam mit dir und anderen.'],
      [has('uranus') && has('moon'), 'Unruhe von innen und Überraschungen von außen fallen zusammen: Plane Puffer ein.'],
    ];
    combos.filter((c) => c[0]).slice(0, 2).forEach((c) => parts.push(c[1]));
    return parts.join(' ');
  }

  // Wechselt der Mond im Lauf des Tages das Zeichen, ändert sich die Tagesstimmung
  function rhythm(from, to, hm) {
    return `Bis ${hm} Uhr wirkt der Mond ${A.SIGNS_IN[from]} – ${SIGN_STYLE[from]}. Danach steht er ${A.SIGNS_IN[to]} – ${SIGN_STYLE[to]}: Die Tagesstimmung wechselt.`;
  }

  // ---------- Klartext: durchgehender Text ohne Fachbegriffe ----------
  const PLAIN_FOCUS = {
    sun: 'deinen Selbstwert und deine Ausstrahlung', moon: 'deine Gefühle und Bedürfnisse', mercury: 'dein Denken und Sprechen',
    venus: 'Nähe und das, was dir wichtig ist', mars: 'deinen Antrieb und deine Durchsetzung', jupiter: 'deine Zuversicht und deine Ziele',
    saturn: 'Verantwortung und Verlässlichkeit', uranus: 'deinen Freiheitsdrang', neptune: 'deine Träume und deine Intuition',
    pluto: 'Kontrolle und Wandel', asc: 'dein Auftreten', mc: 'deine berufliche Richtung',
  };
  // Was hochwill (Bedürfnis hinter dem betroffenen Punkt)
  const NEED = {
    sun: 'der Wunsch, dich so zu zeigen, wie du wirklich bist',
    moon: 'das Bedürfnis nach Wärme, Anerkennung und Geborgenheit',
    mercury: 'etwas, das du sagen oder klären willst',
    venus: 'der Wunsch nach Nähe und danach, dass dich jemand wirklich wertschätzt',
    mars: 'aufgestaute Tatkraft und Ärger, der raus will',
    jupiter: 'die Hoffnung auf mehr und der Wunsch, etwas Großes zu wagen',
    saturn: 'das Gefühl, zu viel Verantwortung zu tragen',
    uranus: 'der Drang nach Freiheit und Veränderung',
    neptune: 'eine Sehnsucht, die du nicht recht benennen kannst',
    pluto: 'ein tiefes Thema, das du lange festhältst',
    asc: 'der Wunsch, anders aufzutreten, als du es gewohnt bist',
    mc: 'der Wunsch, beruflich mehr zu bewirken und anerkannt zu werden',
  };
  // Was es zurückhält (Art des Drucks)
  const HOLD = {
    saturn: 'Vorsicht, Pflichtgefühl und dem Zweifel, ob du es dir erlauben darfst',
    jupiter: 'zu großen Erwartungen, die dich zögern lassen',
    uranus: 'Unruhe und dem Widerstand gegen jede Einengung',
    neptune: 'Unsicherheit und dem Gefühl, dass alles verschwimmt',
    pluto: 'der Angst, die Kontrolle zu verlieren oder dich auszuliefern',
    mars: 'Ungeduld und Reizbarkeit',
    venus: 'der Sorge, Nähe oder Harmonie zu gefährden',
    mercury: 'Grübeln und der Angst, das Falsche zu sagen',
    sun: 'der Frage, wie du dabei wirkst',
    moon: 'schwankender Stimmung',
  };
  // Was es trägt (bei leichtem Aspekt)
  const SUPPORT = {
    saturn: 'Ausdauer und Verlässlichkeit', jupiter: 'Zuversicht und Großzügigkeit', uranus: 'frischen Ideen und Mut zum Ungewohnten',
    neptune: 'Intuition und Einfühlung', pluto: 'innerer Stärke und Entschlossenheit', mars: 'Tatkraft und Mut',
    venus: 'Wärme und Charme', mercury: 'klaren Worten', sun: 'Selbstvertrauen', moon: 'einer guten Grundstimmung',
  };
  const REL_HEAD = {
    soften: 'Spannung, die sich löst', sharpen: 'Spannung, die sich zuspitzt', disturb: 'Störfeuer in einem guten Lauf',
    boost: 'Rückenwind', fuse: 'ein Thema, das nicht loslässt',
  };
  // Auslöser im Klartext; davor steht die Uhrzeit („Um 21:22 Uhr …“)
  const PLAIN_TRIG = {
    sun: {
      soften: 'wird es leichter: Was du jetzt aussprichst oder zeigst, kommt an, statt Druck zu erzeugen.',
      sharpen: 'wirst du vor die Wahl gestellt: Position beziehen oder ausweichen.',
      disturb: 'kommt Unruhe in etwas, das eigentlich gut läuft.',
      boost: 'kommt zusätzlicher Rückenwind dazu.',
      fuse: 'rückt das Thema ins Licht – es lässt sich nicht mehr übergehen.',
    },
    moon: {
      soften: 'wird die Stimmung weicher, und das Thema fühlt sich erträglicher an.',
      sharpen: 'liegen die Gefühle dünnhäutig an der Oberfläche, und das Thema tut mehr weh als sonst.',
      disturb: 'stören Stimmungsschwankungen einen sonst guten Lauf.',
      boost: 'trägt dich deine Stimmung zusätzlich.',
      fuse: 'verdichten sich die Gefühle.',
    },
    mercury: {
      soften: 'helfen klare Worte und ein ruhiges Gespräch, die Spannung zu lösen.',
      sharpen: 'fallen Worte schärfer aus und lösen Streit oder Grübeln aus.',
      disturb: 'sorgen Missverständnisse für Störungen in einem sonst guten Fluss.',
      boost: 'geben Ideen und Gespräche zusätzlichen Schwung.',
      fuse: 'kreist das Thema im Kopf.',
    },
    venus: {
      soften: 'machen Zuwendung und ein freundliches Wort alles milder.',
      sharpen: 'reiben sich Ansprüche an Nähe und Anerkennung am Thema.',
      disturb: 'bremst Bequemlichkeit oder der Wunsch nach Harmonie einen sonst guten Lauf.',
      boost: 'verstärken Freundlichkeit und Genuss das Gute.',
      fuse: 'geht es um Nähe und darum, was dir wichtig ist.',
    },
    mars: {
      soften: 'hilft Tatkraft, es anzupacken, statt zu grübeln.',
      sharpen: 'heizt Ungeduld es an – Reizbarkeit und Konflikte werden wahrscheinlicher.',
      disturb: 'stört Ungeduld einen sonst guten Lauf.',
      boost: 'gibt Antrieb zusätzlichen Schub.',
      fuse: 'wird es konkret und drängt zum Handeln.',
    },
  };
  // Psychologische Leitfrage je betroffenem Bereich und Charakter (F leicht, H angespannt, V verschmelzend)
  const PSYCH_NATAL = {
    sun: { F: 'Was möchtest du zeigen, wenn du sicher wärst, dass es willkommen ist?', H: 'Wessen Bild von dir versuchst du gerade zu erfüllen?', V: 'Was ist dir an dir selbst wirklich wichtig?' },
    moon: { F: 'Was brauchst du gerade, und wem kannst du es sagen?', H: 'Welches Bedürfnis hast du zurückgehalten, damit sich niemand ärgert?', V: 'Was fühlst du, wenn du nichts erklären musst?' },
    mercury: { F: 'Was möchtest du sagen, und wem?', H: 'Was denkst du, sprichst es aber nicht aus?', V: 'Welcher Gedanke kreist, und was will er dir sagen?' },
    venus: { F: 'Wo darfst du dir Gutes gönnen, ohne Gegenleistung?', H: 'Was erwartest du von anderen, ohne es auszusprechen?', V: 'Was ist dir in Beziehungen wirklich wichtig?' },
    mars: { F: 'Wofür lohnt sich deine Kraft?', H: 'Worüber bist du wütend, ohne es zuzugeben?', V: 'Was willst du wirklich – und traust du dich, dafür einzustehen?' },
    jupiter: { F: 'Was würdest du wagen, wenn es gelingen dürfte?', H: 'Wo versprichst du dir mehr, als du selbst gibst?', V: 'Worauf hoffst du wirklich?' },
    saturn: { F: 'Welche Verantwortung trägst du gern?', H: 'Welche Pflicht trägst du, die nicht deine ist?', V: 'Was trägt dich, wenn du ehrlich zu dir bist?' },
    uranus: { F: 'Was möchtest du anders machen als bisher?', H: 'Wovon möchtest du dich befreien, und was hält dich?', V: 'Was fühlt sich gerade eng an?' },
    neptune: { F: 'Wovon träumst du, und was wäre ein erster kleiner Schritt?', H: 'Was möchtest du nicht genau ansehen?', V: 'Wonach sehnst du dich, ohne es zu benennen?' },
    pluto: { F: 'Was darfst du loslassen, weil du es nicht mehr brauchst?', H: 'Was kontrollierst du, weil du Angst hast, es zu verlieren?', V: 'Was will sich in dir wandeln?' },
    asc: { F: 'Wie möchtest du wirken?', H: 'Was zeigst du nach außen, und was fühlst du wirklich?', V: 'Wie erlebt dich dein Umfeld gerade?' },
    mc: { F: 'Wohin soll es beruflich gehen?', H: 'Was erwartest du beruflich von dir, und woher kommt das?', V: 'Was möchtest du in der Welt bewirken?' },
  };
  const PLAIN_TONE = { F: 'Das geht leicht von der Hand.', H: 'Das kostet Kraft.', V: 'Das lässt sich nicht übergehen.' };
  const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);

  // Beginn und Ende des lokalen Tages von `when`
  function dayBounds(when, opts) {
    if (!opts.timeZone) {
      const a = new Date(when.getFullYear(), when.getMonth(), when.getDate());
      return [a, new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1)];
    }
    const offset = (ms) => {
      const p = {};
      new Intl.DateTimeFormat('en-US', { timeZone: opts.timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
        .formatToParts(new Date(ms)).forEach((x) => { p[x.type] = +x.value; });
      return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
    };
    const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: opts.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(when).split('-').map(Number);
    const mid = (dd) => { const g = Date.UTC(y, m - 1, dd, 0, 0); let u = g - offset(g); u = g - offset(u); return new Date(u); };
    return [mid(d), mid(d + 1)];
  }

  // Alle exakten Aspekte (laufender Planet -> Geburtspunkt) im Zeitfenster [from, to]
  function eventsBetween(natal, planets, from, to, minWeight) {
    const H = 3600000;
    const around = new Date((from.getTime() + to.getTime()) / 2);
    const span = (to.getTime() - from.getTime()) / 2 / H;
    const pos = A.planetPositions(around);
    const targets = A.PLANETS.map((k) => [k, natal.planets[k].lon]);
    if (natal.timeKnown) targets.push(['asc', natal.asc], ['mc', natal.mc]);
    const out = [];
    planets.forEach((tp) => {
      const reach = Math.abs(pos[tp].speed) * (span / 12) + 0.5; // Grad, die der Planet im Fenster zurücklegen kann
      targets.forEach(([k, lon]) => A.ASPECTS.forEach((asp) => {
        const cands = asp.angle === 0 || asp.angle === 180 ? [A.norm(lon + asp.angle)] : [A.norm(lon + asp.angle), A.norm(lon - asp.angle)];
        if (!cands.some((c) => Math.abs(A.diff180(pos[tp].lon, c)) <= reach)) return;
        const t = A.exactTime(tp, lon, asp.angle, around, span, tp === 'moon' ? 0.5 : 2);
        if (t && t >= from && t <= to) {
          const w = T_WEIGHT[tp] * N_WEIGHT[k];
          if (!minWeight || w >= minWeight) out.push({ t, transit: tp, natal: k, aspect: asp, tone: TONE_OF[asp.key], weight: w });
        }
      }));
    });
    return out.sort((a, b) => a.t - b.t);
  }

  function whenPhrase(t, opts) {
    const hm = fmtTime(t, opts);
    if (sameDay(t, opts.when, opts)) return `um ${hm} Uhr`;
    const next = sameDay(t, new Date(opts.when.getTime() + 24 * 3600000), opts);
    if (next && +hm.slice(0, 2) < 5) return `in der Nacht um ${hm} Uhr`;
    return `am ${t.toLocaleDateString('de-DE', { weekday: 'long', ...tzOpt(opts) })} um ${hm} Uhr`;
  }

  // Zeitpunkt, an dem der Mond im Zeitfenster das Zeichen wechselt (sonst null)
  function moonIngress(from, to) {
    const sign = (ms) => A.signIndex(A.planetPositions(new Date(ms)).moon.lon);
    const s0 = sign(from.getTime());
    const s1 = sign(to.getTime());
    if (s0 === s1) return null;
    let lo = from.getTime();
    let hi = to.getTime();
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      if (sign(mid) === s0) lo = mid; else hi = mid;
    }
    return { time: new Date(hi), sign: s1 };
  }

  // Zwei Zusatzsätze zum Dauerthema aus vier möglichen (Haus/Zeichen des Planeten, Haus/Zeichen deines Geburtspunkts);
  // welche erscheinen, dreht sich mit dem Datum weiter.
  function modifiers(bg, natal, transit, seed) {
    const v = hash(`${seed}|v`) % 2;
    const t = transit[bg.transit];
    const np = natal.planets[bg.natal];
    const cands = [];
    if (natal.timeKnown) cands.push(Fein.transitHouse(bg.transit, A.wholeSignHouse(t.lon, natal.asc), v));
    if (np && np.house) cands.push(Fein.natalHouse(bg.natal, np.house, v));
    cands.push(Fein.transitSign(bg.transit, A.signIndex(t.lon), v));
    if (np) cands.push(Fein.natalSign(bg.natal, np.sign, v));
    const list = cands.filter(Boolean);
    if (!list.length) return [];
    const start = hash(`${seed}|m`) % list.length;
    return list.length > 1 ? [list[start], list[(start + 1) % list.length]] : [list[0]];
  }

  // Durchgehender Text: Worum es geht, was hochwill, was es hält, wann es sich löst, Tagesverlauf, Ausblick
  function plainStory(natal, all, opts, seed, transit) {
    const sel = pickStory(all);
    if (!sel) return null;
    const { focus, agg, bg, trig } = sel;
    const paras = [];
    let rel = null;

    // Absatz 1: Worum es geht, was hochwill und was es zurückhält
    const n = agg[focus].n;
    const tn = (a) => (a.tone === 'V' ? (a.value < 0 ? 'H' : 'F') : a.tone);
    const atFocus = sel.top.filter((a) => a.natal === focus);
    const nh = atFocus.filter((a) => tn(a) === 'H').length;
    const nf = atFocus.length - nh;
    const hAll = sel.top.filter((a) => tn(a) === 'H');
    const fAll = sel.top.filter((a) => tn(a) === 'F');
    const pat = !bg || bg.natal === focus ? Verf.patternFor(nh, nf) : null;
    let opener = n >= 2 ? `Der Tag dreht sich um ${PLAIN_FOCUS[focus]} – mehrere Einflüsse treffen genau hier zusammen.` : `Im Mittelpunkt stehen ${PLAIN_FOCUS[focus]}.`;
    if (pat) opener = cap(Verf.pattern(pat, focus, hash(`${seed}|pat`)));
    else if (sel.top.length >= 3 && !hAll.length) opener = `Im Mittelpunkt stehen ${PLAIN_FOCUS[focus]}. ${Verf.pattern('nur_rueckenwind', focus, hash(`${seed}|pat`))}`;
    else if (sel.top.length >= 3 && !fAll.length) opener = `Im Mittelpunkt stehen ${PLAIN_FOCUS[focus]}. ${Verf.pattern('nur_druck', focus, hash(`${seed}|pat`))}`;
    else if (new Set(hAll.map((a) => a.natal)).size >= 2 && fAll.length) opener = `Im Mittelpunkt stehen ${PLAIN_FOCUS[focus]}. ${Verf.pattern('gegensatz_bruecke', focus, hash(`${seed}|pat`))}`;
    const p1 = [opener];
    if (bg) {
      const bgTone = bg.tone === 'V' ? (bg.value < 0 ? 'H' : 'F') : bg.tone;
      if (bgTone === 'H') p1.push(`Was raus will, ist ${NEED[bg.natal]}. Zurückgehalten wird es von ${HOLD[bg.transit]}.`);
      else p1.push(`${cap(NEED[bg.natal])} findet heute Unterstützung, getragen von ${SUPPORT[bg.transit]}.`);
      p1.push(themeFor(bg.transit, bg.natal, bg.tone));
      const nuance = Fein.aspectNuance(bg.transit, bg.natal, bg.aspect.key);
      if (nuance) p1.push(nuance);
      modifiers(bg, natal, transit, seed).forEach((m) => p1.push(m));
      if (trig) rel = trig.tone === 'V' ? 'fuse' : trig.tone === 'F' ? (bgTone === 'H' ? 'soften' : 'boost') : (bgTone === 'H' ? 'sharpen' : 'disturb');
    } else {
      const lead = sel.top[0];
      p1.push(themeFor(lead.transit, lead.natal, lead.tone));
    }
    paras.push(p1.join(' '));

    // Absatz 2: Auslöser und übrige Ereignisse des Tages in zeitlicher Reihenfolge
    const canTime = opts && opts.when;
    const bounds = canTime ? dayBounds(opts.when, opts) : null;
    const inDay = (t) => t && t >= bounds[0] && t <= bounds[1];
    const items = [];
    let wovenSet = [];
    const isSame = (e, a) => a && e.transit === a.transit && e.natal === a.natal && e.aspect.angle === a.aspect.angle;
    // Paarspezifischer, tonabhängiger Satz zu einem Ereignis
    const eventLine = (e) => themeFor(e.transit, e.natal, e.tone);
    if (bg && trig) {
      const t = canTime ? A.exactTime(trig.transit, trig.natalLon, trig.aspect.angle, opts.when) : null;
      const when = inDay(t) ? whenPhrase(t, opts) : 'im Lauf des Tages';
      const combo = [tn(bg), tn(trig)].sort().join('');
      const pairLine = Verf.pair(bg.transit, trig.transit, combo === 'HF' ? 'FH' : combo, hash(`${seed}|pair`));
      items.push({ t: inDay(t) ? t : new Date(0), text: `${cap(when)} ${PLAIN_TRIG[trig.transit][rel]}${pairLine ? ` ${pairLine}` : ''}` });
      // Weitere Konstellationen verflechten: am selben Punkt per Brücke, an anderen per Auflösung
      let prev = trig;
      const woven = [];
      const seen = new Set();
      (sel.rest || []).forEach((e) => {
        if (isSame(e, trig) || isSame(e, bg)) return;
        woven.push(e);
        const r = e.tone === 'V' ? 'fuse' : tn(e) === 'F' ? (tn(prev) === 'H' ? 'soften' : 'boost') : (tn(prev) === 'H' ? 'sharpen' : 'disturb');
        let line = themeFor(e.transit, e.natal, e.tone);
        if (e.natal === prev.natal && r !== 'fuse') line = `${Verf.bridge(r, e.natal, hash(`${seed}|b${woven.length}`))} ${line}`;
        else {
          let auf = [tn(e), tn(prev)].includes('H') ? Verf.aufloesung(e.natal, prev.natal) : null;
          if (auf && seen.has(auf)) auf = null;
          if (auf) seen.add(auf);
          line = `Dazu kommt: ${line}${auf ? ` ${auf}` : ''}`;
        }
        items[items.length - 1].text += ` ${line}`;
        prev = e;
      });
      wovenSet = woven;
    }
    let outlook = null;
    if (canTime) {
      const [ds, de] = bounds;
      const upcoming = (e) => (e.t >= new Date(opts.when.getTime() - 3600000) ? 1.5 : 1);
      eventsBetween(natal, A.PLANETS, ds, de, 2.2)
        .filter((e) => !isSame(e, trig) && !isSame(e, bg) && !wovenSet.some((w) => isSame(e, w)))
        .sort((a, b) => b.weight * upcoming(b) - a.weight * upcoming(a)).slice(0, 5)
        .forEach((e) => items.push({ t: e.t, text: `${cap(whenPhrase(e.t, opts))}: ${eventLine(e)}` }));
      const ing = moonIngress(ds, de);
      if (ing) items.push({ t: ing.time, text: `${cap(whenPhrase(ing.time, opts))} wechselt die Grundstimmung: ${SIGN_STYLE[ing.sign]}.` });
      const next = eventsBetween(natal, ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'], de, new Date(de.getTime() + 72 * 3600000), 4);
      const o = next.sort((a, b) => b.weight - a.weight)[0];
      if (o) {
        const head = { F: 'kommt Rückenwind', H: 'wird es zäh', V: 'rückt ein Thema in den Mittelpunkt' }[o.tone];
        outlook = `Ausblick: ${cap(whenPhrase(o.t, { ...opts, when: de }))} ${head}. ${eventLine(o)}`;
      }
    }
    items.sort((a, b) => a.t - b.t);
    if (items.length) paras.push(items.map((x) => x.text).join(' '));
    const qTone = bg ? (bg.tone === 'V' ? 'V' : bg.tone) : sel.top[0].tone;
    paras.push(`Frage an dich: ${PSYCH_NATAL[focus][qTone]}`);
    if (outlook) paras.push(outlook);

    const focusHead = cap(`es geht um ${PLAIN_FOCUS[focus]}`);
    return {
      headline: `${focusHead}: ${rel ? REL_HEAD[rel] : 'ein Thema, das dich begleitet'}`,
      text: paras.join('\n\n'),
      advice: rel ? REL_ADVICE[rel] : null,
    };
  }

  function moonPlain(transit, natal) {
    const phase = moonPhase(transit);
    const sign = A.signIndex(transit.moon.lon);
    const house = natal.timeKnown ? ` ${MOON_HOUSE[A.wholeSignHouse(transit.moon.lon, natal.asc) - 1]}` : '';
    const d = phase.elong; // 0 = Neumond, 180 = Vollmond
    const near = (target, label) => (Math.abs(d - target) > 4 && phase.name === label ? (d > target ? `Kurz nach ${label}` : `Kurz vor ${label}`) : phase.name);
    const name = near(180, 'Vollmond') !== phase.name ? near(180, 'Vollmond') : near(d > 180 ? 360 : 0, 'Neumond');
    const NEAR = {
      'Kurz nach Vollmond': 'Der Höhepunkt liegt gerade hinter dir; Gefühle und Ergebnisse klingen nach.',
      'Kurz vor Vollmond': 'Der Höhepunkt steht kurz bevor; Gefühle verdichten sich.',
      'Kurz nach Neumond': 'Ein Neuanfang hat gerade begonnen; erste Ideen zeigen sich.',
      'Kurz vor Neumond': 'Ein Zyklus schließt sich; Ruhe und Loslassen tun gut.',
    };
    return `${phase.icon} ${name}: ${NEAR[name] || phase.text} Der Grundton des Tages ist ${SIGN_STYLE[sign]}.${house}`;
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
    ['mercury', 'venus', 'mars'].forEach((p) => {
      const pl = natal.planets[p];
      const house = pl.house ? ` Schwerpunkt: ${HOUSE_TOPIC[pl.house - 1]} (${pl.house}. Haus).` : '';
      const retro = pl.retro ? ' Rückläufig geboren: Du verarbeitest dieses Thema nach innen und brauchst dafür Zeit.' : '';
      lines.push({ label: A.PLANET_NAMES[p], sign: pl.sign, text: `${PERSONAL_FOCUS[p]} ${SIGN_STYLE[pl.sign]}.${house}${retro}` });
    });
    const ruler = A.chartRuler(natal);
    if (ruler) {
      const r = natal.planets[ruler.planet];
      lines.push({
        heading: `Aszendentherrscher: ${A.PLANET_NAMES[ruler.planet]} ${A.SIGNS_IN[ruler.sign]}`,
        text: `Der Schlüsselplanet deines Horoskops. Sein Thema zieht sich durch dein Leben: ${KEYWORD[ruler.planet]}, ${SIGN_STYLE[ruler.sign]} gelebt.${r.house ? ` Schwerpunkt: ${HOUSE_TOPIC[r.house - 1]} (${r.house}. Haus).` : ''}`,
      });
    }
    const d = A.distribution(natal);
    const top = d.elements.indexOf(Math.max(...d.elements));
    const elText = [];
    if (d.elements[top] / d.total >= 0.4) elText.push(ELEMENT_DOM[top]);
    d.elements.forEach((v, i) => { if (v === 0) elText.push(ELEMENT_MISSING[i]); });
    const qTop = d.qualities.indexOf(Math.max(...d.qualities));
    if (d.qualities[qTop] / d.total >= 0.45) elText.push(QUALITY_DOM[qTop]);
    if (elText.length) lines.push({ heading: 'Elemente & Qualitäten: ', text: elText.join(' ') });
    return lines;
  }

  // Die engsten Aspekte im Geburtshoroskop als Grundspannungen
  function natalAspectLines(natal, limit) {
    return A.natalAspects(natal).slice(0, limit || 5).map((e) => {
      const tone = TONE_OF[e.aspect.key];
      const k = (x) => KEYWORD[x];
      const text = {
        F: `${k(e.a)} und ${k(e.b)} unterstützen sich bei dir – hier liegt eine natürliche Begabung.`,
        H: `${k(e.a)} und ${k(e.b)} ziehen bei dir in verschiedene Richtungen – daraus entsteht Reibung, aber auch Entwicklung.`,
        V: `${k(e.a)} und ${k(e.b)} wirken bei dir als Einheit – intensiv und schwer zu trennen.`,
      }[tone];
      return { title: `${A.PLANET_NAMES[e.a]} ${e.aspect.symbol} ${A.PLANET_NAMES[e.b]}`, name: e.aspect.name, orb: e.orb, tone, text };
    });
  }

  const api = { dailyHoroscope, natalProfile, natalAspectLines, rhythm, themeFor, hash };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Interpret = api;
})(typeof window !== 'undefined' ? window : globalThis);
