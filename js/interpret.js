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

  // Eigene Deutung für jede Kombination: laufender Planet (Zeile) -> Geburtspunkt (Schlüssel)
  const THEME = {
    moon: {
      sun: 'Deine Stimmung färbt heute, wie du dich zeigst und wie lebendig du dich fühlst.',
      moon: 'Deine Gefühle sind heute besonders deutlich – Bedürfnisse lassen sich nicht überhören.',
      mercury: 'Gefühl und Verstand sind eng verwoben; du denkst heute so, wie du dich fühlst.',
      venus: 'Nähe, Zuneigung und das Bedürfnis nach Schönem sind heute besonders präsent.',
      mars: 'Reizbarkeit und Tatkraft liegen heute dicht unter der Oberfläche.',
      jupiter: 'Zuversicht, Großzügigkeit und der Wunsch nach mehr Weite melden sich.',
      saturn: 'Pflichtgefühl, Ernst und das Bedürfnis nach Halt bestimmen die Stimmung.',
      uranus: 'Spontane Impulse und Unruhe stören gern die Routine.',
      neptune: 'Du bist heute besonders empfänglich und nimmst die Stimmung anderer wie ein Schwamm auf.',
      pluto: 'Unter der Oberfläche brodelt etwas – intensive Gefühle wollen wahrgenommen werden.',
      asc: 'Deine Stimmung prägt stark, wie du heute auf andere wirkst.',
      mc: 'Deine Gefühlslage färbt heute deine Haltung zu Beruf und Zielen.',
    },
    sun: {
      sun: 'Die Sonne trifft ihren Ausgangspunkt in deinem Horoskop – ein Tag, der dich an deine eigenen Ziele erinnert.',
      moon: 'Bewusstsein und Gefühl begegnen sich – ein guter Moment, um herauszufinden, was du wirklich brauchst.',
      mercury: 'Dein Denken wird klar: Du kannst heute gut ordnen, was dich beschäftigt.',
      venus: 'Deine Ausstrahlung und dein Sinn für das, was dir wichtig ist, werden beleuchtet.',
      mars: 'Deine Tatkraft rückt ins Licht – du spürst, wofür du heute kämpfen willst.',
      jupiter: 'Dein Selbstvertrauen bekommt Nahrung, und du erkennst, wo Wachstum möglich ist.',
      saturn: 'Du misst dich an deinen eigenen Maßstäben – realistisch und nüchtern.',
      uranus: 'Ein Impuls, dich anders zu zeigen als gewohnt, taucht auf.',
      neptune: 'Dein Selbstbild wird weicher; Inspiration und Zweifel liegen nah beieinander.',
      pluto: 'Fragen nach Macht, Kontrolle und echter Veränderung berühren dein Selbstverständnis.',
      asc: 'Das Licht fällt auf dein Auftreten – andere nehmen dich heute deutlicher wahr.',
      mc: 'Die Sonne beleuchtet deine Ziele und deine Rolle im Beruf.',
    },
    mercury: {
      sun: 'Du willst heute sagen und verstehen, wer du bist.',
      moon: 'Was du fühlst, will formuliert werden – Gespräche gehen heute in die Tiefe.',
      mercury: 'Dein Denken dreht sich um sich selbst: Pläne, Notizen, Rückschau.',
      venus: 'Worte werden charmanter; ein Moment für Diplomatie und Gespräche über Geld oder Werte.',
      mars: 'Gedanken werden schnell und Worte scharf – Debatten und Entschlüsse gewinnen an Tempo.',
      jupiter: 'Du siehst das große Bild und schmiedest Pläne; die Details kommen später.',
      saturn: 'Du denkst gründlich und konzentriert; Zahlen, Verträge und Fakten stehen im Vordergrund.',
      uranus: 'Blitzideen und unkonventionelle Lösungen – das Denken springt.',
      neptune: 'Ahnungen, Bilder und Zwischentöne bestimmen das Denken; harte Fakten sind schwerer zu greifen.',
      pluto: 'Du willst hinter die Fassade blicken; Gespräche können bohrend werden.',
      asc: 'Wie du dich ausdrückst, prägt heute deinen Eindruck auf andere.',
      mc: 'Kommunikation im Beruf steht an: Absprachen, Präsentationen, Bewerbungen.',
    },
    venus: {
      sun: 'Du kommst heute leichter an und gönnst dir selbst mehr Anerkennung.',
      moon: 'Weichheit, Zärtlichkeit und der Wunsch nach Geborgenheit – zu Hause fühlt es sich schön an.',
      mercury: 'Gespräche werden charmanter; ein guter Moment für Diplomatie und Verhandlungen.',
      venus: 'Deine Themen Liebe und Werte leuchten auf – frag dich, was dir gerade guttut.',
      mars: 'Anziehung und Begehren; Flirt und Leidenschaft, aber auch Reibung zwischen Nähe und Eigenständigkeit.',
      jupiter: 'Lebensfreude und Großzügigkeit; Genuss ist möglich, ebenso leicht das Zuviel.',
      saturn: 'Beziehungen und Finanzen werden nüchtern auf Verlässlichkeit geprüft.',
      uranus: 'Überraschende Begegnungen, plötzliche Anziehung oder der Wunsch nach mehr Freiheit in Beziehungen.',
      neptune: 'Romantische Sehnsucht und Idealisierung – schön, aber prüfe, was Wunsch und was Wirklichkeit ist.',
      pluto: 'Beziehungen werden intensiver: tiefe Verbundenheit, aber auch Besitzdenken oder Eifersucht.',
      asc: 'Du wirkst heute einnehmender und attraktiver als sonst.',
      mc: 'Charme und Diplomatie helfen dir beruflich; ein guter Tag für Repräsentation.',
    },
    mars: {
      sun: 'Tatendrang und Energie steigen, ebenso das Bedürfnis, dich durchzusetzen.',
      moon: 'Emotionen entladen sich schneller – Gereiztheit oder Leidenschaft.',
      mercury: 'Debattierlust und schnelle Entscheidungen; Worte treffen schärfer als gedacht.',
      venus: 'Begehren und Durchsetzung in Beziehungen – gefragt ist die Balance zwischen Nähe und Eigenständigkeit.',
      mars: 'Dein Antrieb verdichtet sich: Du weißt genau, was du willst.',
      jupiter: 'Mut zu großen Schritten, aber auch Risikofreude und Übermut.',
      saturn: 'Gas und Bremse zugleich: Ausdauer wird verlangt, Frust ist möglich.',
      uranus: 'Unberechenbare Energie – plötzliche Aktionen, Ungeduld und Hektik.',
      neptune: 'Der Antrieb verpufft leicht; Kraft fließt ins Unklare, wenn Ziele fehlen.',
      pluto: 'Enorme Kraft, aber auch Machtkämpfe – lenke sie in ein großes Vorhaben.',
      asc: 'Du trittst energisch und direkt auf.',
      mc: 'Ehrgeiz meldet sich – beruflich willst du vorankommen.',
    },
    jupiter: {
      sun: 'Dein Vertrauen in dich selbst wächst – ein Tag für Zuversicht und Erweiterung.',
      moon: 'Emotionale Fülle und Geborgenheit; Großzügigkeit dir selbst und anderen gegenüber.',
      mercury: 'Der Blick weitet sich; Lernen, Planen und Veröffentlichen gelingen.',
      venus: 'Liebe, Freundschaft und Genuss werden reicher – Einladungen und Geschenke sind möglich.',
      mars: 'Tatkraft mit Rückenwind; große Vorhaben wollen gestartet werden.',
      jupiter: 'Ein Jupiter-Zyklus schließt sich – Zeit, Bilanz zu ziehen und neu zu wachsen.',
      saturn: 'Wachstum und Vorsicht müssen sich verständigen: solide Erweiterung statt Risiko.',
      uranus: 'Überraschende Chancen; plötzlich öffnen sich Türen.',
      neptune: 'Ideale und Vertrauen sind stark – Glaube ohne Prüfung kann täuschen.',
      pluto: 'Große Wandlungschancen; Einfluss und Einsatz wachsen.',
      asc: 'Du wirkst offen, zuversichtlich und gewinnend.',
      mc: 'Berufliche Chancen und Anerkennung sind möglich – gut für den nächsten Karriereschritt.',
    },
    saturn: {
      sun: 'Du spürst, was du wirklich leisten kannst und willst – Ernsthaftigkeit statt Zerstreuung.',
      moon: 'Gefühle wollen Struktur; du übernimmst Verantwortung für deine eigenen Bedürfnisse.',
      mercury: 'Gründliches, sorgfältiges Denken; Entscheidungen brauchen Fakten.',
      venus: 'Liebe und Geld werden nüchtern auf Verbindlichkeit geprüft.',
      mars: 'Gas und Bremse zugleich: Ausdauer wird verlangt, Frust ist möglich.',
      jupiter: 'Erwartungen und Realität werden abgeglichen; Wachstum gibt es nur mit Substanz.',
      saturn: 'Ein Saturn-Zyklus erreicht einen Meilenstein – Lebensbilanz und neue Verantwortung.',
      uranus: 'Struktur und Freiheit ringen miteinander: Altes bricht, Neues muss tragfähig werden.',
      neptune: 'Träume werden auf Machbarkeit geprüft; Ideale brauchen Form.',
      pluto: 'Tiefer Druck und harte Realität, aber auch enorme Standfestigkeit.',
      asc: 'Du wirkst ernster und reservierter; Auftreten und Körper verlangen Beachtung.',
      mc: 'Berufliche Verantwortung und Reifeprüfung – Leistung wird gemessen.',
    },
    uranus: {
      sun: 'Ein Impuls zur Selbstbefreiung: Der Wunsch, aus alten Rollen auszubrechen, wird stärker.',
      moon: 'Das Gefühlsleben ist unruhig; du brauchst mehr Freiheit zu Hause und in Beziehungen.',
      mercury: 'Ungewöhnliche Ideen – das Denken bricht aus gewohnten Bahnen aus.',
      venus: 'Beziehungen und Werte werden neu definiert; plötzliche Anziehung oder Distanz.',
      mars: 'Unberechenbare Energie – Impulsivität und plötzliche Aktionen.',
      jupiter: 'Überraschende Chancen und mutige Neuorientierung.',
      saturn: 'Alte Strukturen geraten ins Wanken.',
      uranus: 'Ein tiefer Wunsch nach Erneuerung deines Lebensentwurfs meldet sich.',
      neptune: 'Persönliche Visionen und kollektive Sehnsüchte verschmelzen; neue Ideale entstehen.',
      pluto: 'Tiefe Umbrüche in Lebensweise und Werten – Erneuerung von innen.',
      asc: 'Du wirkst unberechenbarer und individueller; ein neues Auftreten liegt in der Luft.',
      mc: 'Berufliche Umbrüche und plötzliche Wendungen; der Wunsch nach mehr Autonomie wächst.',
    },
    neptune: {
      sun: 'Dein Selbstbild wird durchlässig – Inspiration, aber auch Orientierungslosigkeit.',
      moon: 'Empfindsamkeit, Träume und Hellhörigkeit – schütze dich vor Überflutung.',
      mercury: 'Fantasie und Intuition; Details und klare Absprachen geraten leicht ins Schwimmen.',
      venus: 'Romantische Sehnsucht, Hingabe und Idealisierung.',
      mars: 'Der Antrieb wird diffus; Kraft fließt in Fantasie oder Rückzug.',
      jupiter: 'Große Ideale und Glaubensfragen – Vorsicht vor Selbsttäuschung und Übermaß.',
      saturn: 'Träume treffen auf Realität: Ernüchterung oder ein tragfähiger Neubau.',
      uranus: 'Visionen und Umbruch verschmelzen.',
      neptune: 'Eine spirituelle Neuorientierung und die Suche nach Sinn.',
      pluto: 'Tiefe Strömungen lösen Altes auf und wandeln es.',
      asc: 'Du wirkst weicher und schwer greifbar; andere projizieren auf dich.',
      mc: 'Berufliche Ziele werden diffus oder inspiriert – Berufung oder Orientierungslosigkeit.',
    },
    pluto: {
      sun: 'Identität und Macht werden von Grund auf hinterfragt – Wandlung ist möglich.',
      moon: 'Tiefe emotionale Prozesse; alte Verletzungen und Bindungen treten hervor.',
      mercury: 'Das Denken wird durchdringend – Besessenheit oder wichtige Erkenntnisse.',
      venus: 'Beziehungen werden intensiv, Werte werden radikal geklärt.',
      mars: 'Enorme Energie mit Konflikten und Machtfragen – dein Wille ist stark.',
      jupiter: 'Überzeugungen und Ziele werden tief verwandelt.',
      saturn: 'Strukturen werden abgebaut und neu gegossen.',
      uranus: 'Ein radikaler Umbruch.',
      neptune: 'Tiefe Auflösung und spirituelle Wandlung.',
      asc: 'Auftreten und Selbstbild wandeln sich; du wirkst intensiver.',
      mc: 'Berufliche Neuausrichtung – Macht, Verantwortung, Ende und Anfang.',
    },
  };
  // Pluto -> Pluto ergänzt
  THEME.pluto.pluto = 'Eine grundlegende Transformation deines Lebensweges.';

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
  const DEIN = { sun: 'deiner Sonne', venus: 'deiner Venus', asc: 'deinem Aszendenten', mc: 'deinem Medium Coeli' };
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

  function exactness(orb, applying) {
    const phase = applying ? 'noch im Aufbau' : 'schon im Abklingen';
    if (orb < 0.3) return 'Der Aspekt ist heute auf den Punkt genau – sein Höhepunkt liegt jetzt.';
    if (orb < 1) return `Der Aspekt ist sehr eng (${orb.toFixed(1)}°) und ${phase}.`;
    return `Der Aspekt ist noch ${orb.toFixed(1)}° vom exakten Punkt entfernt und ${phase} – spürbar, aber nicht dominant.`;
  }

  // Zusatzsätze aus den konkreten Werten: Zeichen, Häuser, Rückläufigkeit, Genauigkeit
  function details(a, natal, transit, ruler, nAsp) {
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
    out.push(exactness(a.orb, a.applying));
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
  function dailyHoroscope(natal, transit, seed) {
    const ruler = A.chartRuler(natal);
    const nAsp = A.natalAspects(natal);
    const aspects = A.transitAspects(transit, natal).map((a) => ({
      ...a, tone: TONE_OF[a.aspect.key], strength: strength(a) * (ruler && a.natal === ruler.planet ? 1.3 : 1), value: aspectValue(a),
    }));
    aspects.sort((x, y) => y.strength - x.strength);
    const top = aspects.slice(0, 6).map((a) => ({
      ...a,
      title: `${A.PLANET_NAMES[a.transit]} ${a.aspect.symbol} ${A.PLANET_NAMES[a.natal]}`,
      text: `${THEME[a.transit][a.natal]} ${TRANSIT[a.transit][a.tone]}`,
      details: details(a, natal, transit, ruler, nAsp),
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

    const headline = lead
      ? `${lead.title}: ${{ F: 'Rückenwind', H: 'Herausforderung mit Entwicklungspotenzial', V: 'Verdichtete Energie' }[lead.tone]}`
      : 'Ein ruhiger Tag';

    return {
      headline,
      intro: `${MOON_SIGN[moonSign]}${moonHouse ? ' ' + MOON_HOUSE[moonHouse - 1] : ''}`,
      moon: { sign: moonSign, house: moonHouse, phase },
      overview: overview(aspects, natal),
      areas, aspects: top, advice, notes,
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

  const api = { dailyHoroscope, natalProfile, natalAspectLines, rhythm, THEME, hash };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Interpret = api;
})(typeof window !== 'undefined' ? window : globalThis);
