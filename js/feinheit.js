/*
 * Feinheit (Achse 2): Zusatzsätze zu einer einzelnen Konstellation.
 *  - aspectNuance: Opposition („im Gegenüber“) und Sextil („wenn du zugreifst“) statt nur „angespannt/leicht“
 *  - transitHouse / natalHouse: in welchem Lebensbereich es sich abspielt
 *  - transitSign / natalSign: mit welcher Färbung
 *
 * Die Sätze sind als Bausteine geschrieben: je Planet ein Satzrahmen (in zwei Varianten), je Haus und
 * je Zeichen ein Fragment. Daraus entstehen 10 × 12 Sätze je Tabelle. Alle Texte ohne Fachbegriffe.
 */
(function (root) {
  'use strict';

  const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  // Wo (Lebensbereich je Haus), passend zu „vor allem …“
  const LOC = [
    'im Auftreten und im Körpergefühl',
    'bei Geld, Besitz und Selbstwert',
    'in Gesprächen, Kontakten und beim Lernen',
    'zu Hause und in der Familie',
    'bei Herzensdingen, Kreativität und Vergnügen',
    'im Alltag, bei der Arbeit und bei der Gesundheit',
    'in Partnerschaft und Verträgen',
    'bei Intimität, geteilten Ressourcen und dem Loslassen',
    'bei Reisen, Weiterbildung und deinem Weltbild',
    'im Beruf und bei deinen Zielen',
    'in Freundschaften und Netzwerken',
    'im Rückzug und im Verborgenen',
  ];

  // Wie (Färbung je Zeichen), als Adverbien
  const MANNER = [
    'impulsiv, direkt und ungeduldig', 'beharrlich, sinnlich und bodenständig', 'beweglich, neugierig und sprunghaft',
    'gefühlvoll, schützend und wechselhaft', 'stolz, großzügig und dramatisch', 'sorgfältig, kritisch und praktisch',
    'ausgleichend, höflich und unentschlossen', 'intensiv, kontrolliert und leidenschaftlich', 'optimistisch, offen und unbekümmert',
    'diszipliniert, ehrgeizig und nüchtern', 'eigenwillig, distanziert und erfinderisch', 'einfühlsam, verträumt und grenzenlos',
  ];

  // Laufender Planet durch ein Haus: [Variante A, Variante B]
  const TH = {
    sun: [(l) => `Deine Aufmerksamkeit und Kraft sind vor allem ${l} gefragt.`, (l) => `Was ${l} passiert, bekommt besonders viel Licht.`],
    moon: [(l) => `Die Stimmung färbt vor allem, was ${l} geschieht.`, (l) => `Deine Gefühle melden sich vor allem ${l}.`],
    mercury: [(l) => `Gedanken und Gespräche kreisen vor allem ${l}.`, (l) => `Worte und Nachrichten spielen vor allem ${l} eine Rolle.`],
    venus: [(l) => `Harmonie und Genuss suchen sich vor allem ${l} ihren Platz.`, (l) => `Zuwendung und Wertschätzung sind vor allem ${l} ein Thema.`],
    mars: [(l) => `Tempo und mögliche Konflikte wirken vor allem ${l}.`, (l) => `Deine Kraft und Ungeduld zeigen sich vor allem ${l}.`],
    jupiter: [(l) => `Wachstum und Zuversicht öffnen vor allem ${l} neue Türen.`, (l) => `Chancen und Zuversicht zeigen sich vor allem ${l}.`],
    saturn: [(l) => `Vor allem ${l} wird es ernst, und du wirst auf die Probe gestellt.`, (l) => `Verantwortung und Geduld sind vor allem ${l} gefragt.`],
    uranus: [(l) => `Überraschung und Freiheitsdrang mischen vor allem ${l} auf.`, (l) => `Plötzliches und Ungewohntes tritt vor allem ${l} auf.`],
    neptune: [(l) => `Vor allem ${l} liegen Inspiration und Unklarheit dicht beieinander.`, (l) => `Träume und Zweifel betreffen vor allem das, was ${l} geschieht.`],
    pluto: [(l) => `Ein tiefer Wandel spielt sich vor allem ${l} ab.`, (l) => `Was sich grundlegend verändern will, zeigt sich vor allem ${l}.`],
  };

  // Geburtspunkt in einem Haus
  const NH = {
    sun: [(l) => `Du willst dich vor allem ${l} zeigen.`, (l) => `Dein Bedürfnis, gesehen zu werden, liegt vor allem ${l}.`],
    moon: [(l) => `Deine Gefühle suchen Halt vor allem ${l}.`, (l) => `Geborgenheit suchst du vor allem ${l}.`],
    mercury: [(l) => `Dein Denken kreist bei dir vor allem ${l}.`, (l) => `Dein Kopf ist vor allem ${l} beschäftigt.`],
    venus: [(l) => `Was dir wichtig ist, suchst du vor allem ${l}.`, (l) => `Nähe und Wertschätzung sind dir vor allem ${l} wichtig.`],
    mars: [(l) => `Deine Tatkraft sucht sich ihren Weg vor allem ${l}.`, (l) => `Kämpfen und anpacken willst du vor allem ${l}.`],
    jupiter: [(l) => `Dein Vertrauen wächst vor allem ${l}.`, (l) => `Zuversicht und Chancen findest du vor allem ${l}.`],
    saturn: [(l) => `Deine Verantwortung liegt vor allem ${l}.`, (l) => `Ernst und Pflicht spürst du vor allem ${l}.`],
    uranus: [(l) => `Dein Freiheitsdrang meldet sich vor allem ${l}.`, (l) => `Aus der Reihe tanzen willst du vor allem ${l}.`],
    neptune: [(l) => `Deine Sehnsucht und Intuition zeigen sich vor allem ${l}.`, (l) => `Träumen und Mitfühlen liegt dir vor allem ${l}.`],
    pluto: [(l) => `Kontrolle und Loslassen sind dir vor allem ${l} ein großes Thema.`, (l) => `Was dich tief bewegt, liegt vor allem ${l}.`],
  };

  // Laufender Planet in einem Zeichen
  const TS = {
    sun: [(m) => `Die Grundstimmung des Tages wirkt ${m}.`, (m) => `Der Tag fühlt sich ${m} an.`],
    moon: [(m) => `Die Stimmung ist ${m}.`, (m) => `Gefühle zeigen sich heute ${m}.`],
    mercury: [(m) => `Das Denken arbeitet ${m}.`, (m) => `Gedanken und Worte fließen ${m}.`],
    venus: [(m) => `Im Miteinander geht es heute ${m} zu.`, (m) => `Zuwendung und Genuss zeigen sich ${m}.`],
    mars: [(m) => `Dein Antrieb ist heute ${m}.`, (m) => `Der Antrieb geht ${m} zur Sache.`],
    jupiter: [(m) => `Große Ideen und Chancen wirken heute ${m}.`, (m) => `Zuversicht äußert sich ${m}.`],
    saturn: [(m) => `Pflichten und Grenzen wirken heute ${m}.`, (m) => `Die Strenge des Tages zeigt sich ${m}.`],
    uranus: [(m) => `Der Wunsch nach Veränderung ist heute ${m}.`, (m) => `Unruhe und Freiheitsdrang zeigen sich ${m}.`],
    neptune: [(m) => `Sehnsüchte und Träume wirken heute ${m}.`, (m) => `Deine Intuition arbeitet ${m}.`],
    pluto: [(m) => `Ein tiefer Wandel im Hintergrund wirkt ${m}.`, (m) => `Was sich in dir verändern will, tut das ${m}.`],
  };

  // Geburtspunkt in einem Zeichen
  const NS = {
    sun: [(m) => `Dein Wesen ist ${m}.`, (m) => `Du selbst wirkst ${m}.`],
    moon: [(m) => `Deine Gefühle zeigen sich ${m}.`, (m) => `Was du brauchst, verlangst du ${m}.`],
    mercury: [(m) => `Dein Denken und Sprechen wirkt ${m}.`, (m) => `Du denkst und redest ${m}.`],
    venus: [(m) => `In Liebe und Genuss bist du ${m}.`, (m) => `Zuneigung zeigst du ${m}.`],
    mars: [(m) => `Deine Tatkraft äußert sich ${m}.`, (m) => `Wenn du anpackst, dann ${m}.`],
    jupiter: [(m) => `Dein Vertrauen zeigt sich ${m}.`, (m) => `Zuversicht lebst du ${m}.`],
    saturn: [(m) => `Deine Verantwortung trägst du ${m}.`, (m) => `Pflicht nimmst du ${m}.`],
    uranus: [(m) => `Dein Freiheitsdrang äußert sich ${m}.`, (m) => `Freiheit forderst du ${m}.`],
    neptune: [(m) => `Deine Sehnsucht zeigt sich ${m}.`, (m) => `Träumen und Mitfühlen tust du ${m}.`],
    pluto: [(m) => `Mit Kontrolle und Loslassen gehst du ${m} um.`, (m) => `Wenn dich etwas tief berührt, reagierst du ${m}.`],
  };

  // Aspektart: Opposition = im Gegenüber; Sextil = Chance, die man ergreifen muss
  const OPP_FRAME = {
    sun: 'Andere stellen dich direkt vor die Frage,',
    moon: 'Andere reagieren auf deine Stimmung und zeigen dir,',
    mercury: 'Gespräche mit anderen bringen ans Licht,',
    venus: 'Nähe und Abstand zu anderen zeigen dir,',
    mars: 'Andere fordern dich heraus und zeigen dir,',
    jupiter: 'Andere machen dir Mut oder Druck und zeigen dir,',
    saturn: 'Andere setzen dir Grenzen und zeigen dir,',
    uranus: 'Überraschungen durch andere zeigen dir,',
    neptune: 'Andere wirken schwer greifbar und spiegeln dir,',
    pluto: 'Andere spiegeln dir,',
  };
  const OPP_OBJ = {
    sun: 'was du an dir selbst nicht zeigen willst',
    moon: 'was du an Bedürfnissen zurückhältst',
    mercury: 'was du nicht aussprichst',
    venus: 'was du dir an Nähe wünschst oder nicht zulässt',
    mars: 'was du an Ärger und Tatkraft verdrängst',
    jupiter: 'was du dir an Größe zutraust oder nicht',
    saturn: 'wo du dich selbst begrenzt',
    uranus: 'wo du dich nach Freiheit sehnst',
    neptune: 'was du dir erträumst und nicht ansiehst',
    pluto: 'wo du Kontrolle festhältst',
    asc: 'wie du wirklich wirkst',
    mc: 'was du beruflich willst und nicht sagst',
  };
  const SEX_FRAME = {
    sun: 'Nutze die klare Stimmung, um',
    moon: 'Nutze die weiche Stimmung, um',
    mercury: 'Nutze das klare Denken, um',
    venus: 'Nutze die Offenheit, um',
    mars: 'Nutze den Schwung, um',
    jupiter: 'Nutze den Rückenwind, um',
    saturn: 'Nutze die Verlässlichkeit, um',
    uranus: 'Nutze den frischen Wind, um',
    neptune: 'Nutze die Feinfühligkeit, um',
    pluto: 'Nutze die innere Stärke, um',
  };
  const SEX_OBJ = {
    sun: 'dich so zu zeigen, wie du bist',
    moon: 'auszusprechen, was du brauchst',
    mercury: 'etwas zu klären, das dich beschäftigt',
    venus: 'Nähe zuzulassen oder zu zeigen',
    mars: 'etwas anzupacken, das du aufschiebst',
    jupiter: 'etwas Neues zu wagen',
    saturn: 'etwas Verbindliches festzumachen',
    uranus: 'etwas anders zu machen als bisher',
    neptune: 'einer Vision Form zu geben',
    pluto: 'etwas Altes loszulassen',
    asc: 'anders aufzutreten',
    mc: 'beruflich einen Schritt zu gehen',
  };

  const pick = (pair, v) => pair[(v || 0) % pair.length];

  const api = {
    LOC, MANNER, TH, NH, TS, NS, OPP_FRAME, OPP_OBJ, SEX_FRAME, SEX_OBJ,
    // house: 1–12, sign: 0–11, v: Variante 0/1
    transitHouse: (planet, house, v) => pick(TH[planet], v)(LOC[house - 1]),
    natalHouse: (planet, house, v) => (NH[planet] ? pick(NH[planet], v)(LOC[house - 1]) : null),
    transitSign: (planet, sign, v) => pick(TS[planet], v)(MANNER[sign]),
    natalSign: (planet, sign, v) => (NS[planet] ? pick(NS[planet], v)(MANNER[sign]) : null),
    // Nur Opposition und Sextil bekommen einen Zusatz; die anderen Aspektarten tragen den Grundtext
    aspectNuance(transit, natal, aspectKey) {
      if (aspectKey === 'opposition') return `Oft zeigt es sich im Gegenüber: ${OPP_FRAME[transit]} ${OPP_OBJ[natal]}.`;
      if (aspectKey === 'sextile') return `Es wird leicht, sobald du zugreifst: ${SEX_FRAME[transit]} ${SEX_OBJ[natal]}.`;
      return null;
    },
    PLANETS,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Feinheit = api;
})(typeof window !== 'undefined' ? window : globalThis);
