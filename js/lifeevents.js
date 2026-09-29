/*
 * Lebensereignis-Scanner (Test): rechnet über einen Zeitraum für zwölf Themen aus, wann langsame Planeten,
 * Finsternisse und die fortgeschriebenen Geburtsplaneten (Sekundärprogression) die dazugehörigen Geburtspunkte
 * und Häuser berühren, und bündelt die stärksten Phasen zu Kapiteln mit Klartext und psychologischer Leitfrage.
 * Er zeigt Phasen erhöhter Intensität und ihr Thema – nicht die konkreten Ereignisse.
 */
(function (root) {
  'use strict';
  const A = root.Astro || (typeof require !== 'undefined' ? require('./astro.js') : null);
  const Themes = root.Themes || (typeof require !== 'undefined' ? require('./themes.js') : null);

  // Nur langsame Planeten: Sonne, Merkur, Venus und Mond sind als Transit für Lebensereignisse zu kurzlebig
  const TRANSIT_W = { pluto: 1, saturn: 1, uranus: 0.9, neptune: 0.8, jupiter: 0.8, mars: 0.35 };
  const ORB = { pluto: 3, saturn: 3, uranus: 3, neptune: 3, jupiter: 3, mars: 2 };
  // Fortgeschriebene Planeten (ein Tag = ein Lebensjahr): enge Orbs, weil sie sich sehr langsam bewegen
  const PROG_W = { sun: 0.7, moon: 0.6, mercury: 0.35, venus: 0.4, mars: 0.4 };
  const PROG_ORB = 1;
  const ECLIPSE_W = 1.2;
  const ECLIPSE_ORB = 3;
  const ECLIPSE_DAYS = 90; // Wirkdauer vor und nach einer Finsternis (linear abnehmend)
  const ASP_W = { conjunction: 1, opposition: 1, square: 0.9, trine: 0.7, sextile: 0.5 };
  const ASP_ORB = { conjunction: 1, opposition: 1, square: 0.9, trine: 0.8, sextile: 0.6 };
  const TONE = { conjunction: 'V', sextile: 'F', trine: 'F', square: 'H', opposition: 'H' };
  const VALENCE_V = { jupiter: 0.7, saturn: -0.6, pluto: -0.5, mars: -0.4, uranus: 0, neptune: 0, sun: 0.3, moon: 0, mercury: 0, venus: 0.5, eclipse: 0 };
  const HOUSE_W = 0.35; // Grundwirkung, solange ein langsamer Planet durch ein Themenhaus zieht
  // Für Deszendent, IC und Mondknoten gibt es keine eigenen Texte: sinngemäß Venus, Mond und Sonne
  const TEXT_KEY = { desc: 'venus', ic: 'moon', node: 'sun' };
  const ASPECT = {};
  A.ASPECTS.forEach((a) => { ASPECT[a.key] = a; });

  const TOPICS = {
    partnership: { label: 'Partnerschaft', examples: 'Kennenlernen, Zusammenziehen, Heirat, Trennung', targets: { venus: 1, desc: 0.9, moon: 0.6, mars: 0.4, sun: 0.4, node: 0.3 }, houses: { 7: 1, 5: 0.4, 8: 0.4 } },
    family: { label: 'Familie', examples: 'Kind, Tod oder Krankheit von Angehörigen, Bruch mit Eltern', targets: { moon: 1, ic: 1, sun: 0.4, saturn: 0.4, venus: 0.3, node: 0.3 }, houses: { 4: 1, 10: 0.3 } },
    career: { label: 'Beruf', examples: 'Jobwechsel, Kündigung, Beförderung, Selbstständigkeit', targets: { mc: 1, saturn: 0.7, sun: 0.6, jupiter: 0.5, mars: 0.3, node: 0.3 }, houses: { 10: 1, 6: 0.5, 2: 0.3 } },
    education: { label: 'Ausbildung', examples: 'Studium, Abschluss, Prüfung, Umschulung', targets: { mercury: 1, jupiter: 0.6, mc: 0.3, sun: 0.3 }, houses: { 3: 1, 9: 1 } },
    money: { label: 'Geld', examples: 'Erbe, große Anschaffung, Schulden, Gehaltssprung', targets: { venus: 0.8, jupiter: 0.6, saturn: 0.5, pluto: 0.4 }, houses: { 2: 1, 8: 0.8 } },
    housing: { label: 'Wohnen', examples: 'Umzug, Hauskauf, Auswandern', targets: { moon: 0.9, ic: 1, uranus: 0.3, jupiter: 0.3 }, houses: { 4: 1 } },
    health: { label: 'Gesundheit', examples: 'Krankheit, OP, Erschöpfung, Unfall', targets: { sun: 0.8, mars: 0.8, asc: 0.8, saturn: 0.5, moon: 0.3 }, houses: { 6: 1, 1: 0.5, 12: 0.4 } },
    meaning: { label: 'Sinn und Innenleben', examples: 'Sinnkrise, spirituelle Wende, Therapie, Neuorientierung', targets: { neptune: 0.7, pluto: 0.7, sun: 0.6, moon: 0.6, saturn: 0.3, node: 0.5 }, houses: { 12: 1, 8: 0.5, 9: 0.4 } },
    friends: { label: 'Freundschaften', examples: 'Neue Freunde, Bruch, Gemeinschaft', targets: { venus: 0.5, mercury: 0.5, uranus: 0.6, moon: 0.3 }, houses: { 11: 1 } },
    identity: { label: 'Identität', examples: 'Neuer Look, neue Rolle, Namenswechsel', targets: { asc: 1, sun: 0.8, moon: 0.3, mars: 0.3, node: 0.4 }, houses: { 1: 1 } },
    creative: { label: 'Kreatives', examples: 'Projektstart, Veröffentlichung, Erfolg', targets: { sun: 0.7, venus: 0.7, jupiter: 0.5, mars: 0.3 }, houses: { 5: 1 } },
    conflict: { label: 'Konflikte und Recht', examples: 'Streit, Vertrag, Behörden, Prozess', targets: { mercury: 0.6, mars: 0.8, saturn: 0.5, jupiter: 0.4 }, houses: { 7: 0.5, 9: 0.5, 3: 0.3, 6: 0.3 } },
  };

  // Psychologische Leitfrage je Thema und Charakter der Phase
  const PSYCH = {
    partnership: {
      R: 'Wo darfst du Nähe zulassen, ohne dich zu verstellen?',
      B: 'Wie viel Nähe hältst du aus, ohne dich zu verlieren – und was passiert, wenn du sie einforderst?',
      W: 'Welches Beziehungsmuster hat dir gedient, und welches darf enden?',
    },
    family: {
      R: 'Was haben dir die Menschen, aus denen du kommst, mitgegeben, das dich trägt?',
      B: 'Welche alte Rolle in deiner Familie trägst du noch, obwohl sie dir nicht mehr passt?',
      W: 'Wo endet Loyalität, und wo beginnt dein eigenes Zuhause?',
    },
    career: {
      R: 'Was würdest du tun, wenn du dir mehr zutrauen würdest?',
      B: 'Arbeitest du für Anerkennung, für Sicherheit oder für etwas, das dir wirklich wichtig ist?',
      W: 'Was bedeutet Erfolg für dich – und wessen Maßstab misst du gerade?',
    },
    education: {
      R: 'Was möchtest du wirklich verstehen, nicht nur bestehen?',
      B: 'Welche Angst vor dem Scheitern hält dich davon ab, dich zu zeigen?',
      W: 'Welches Wissen oder welche Fähigkeit fehlt dir für den nächsten Schritt?',
    },
    money: {
      R: 'Wofür ist Geld für dich da – für Sicherheit, Freiheit oder Genuss?',
      B: 'Welches Gefühl von Mangel oder Kontrolle steckt hinter deinen Geldentscheidungen?',
      W: 'Was bist du dir wert – unabhängig von dem, was du besitzt?',
    },
    housing: {
      R: 'Was braucht ein Ort, damit du dich dort zu Hause fühlst?',
      B: 'Läufst du von etwas weg oder auf etwas zu, wenn du über Veränderung nachdenkst?',
      W: 'Wo gehörst du hin, und wer bestimmt das?',
    },
    health: {
      R: 'Was gibt dir Kraft, und wie viel davon gönnst du dir?',
      B: 'Welche Grenze hast du überschritten, und was will dein Körper dir damit sagen?',
      W: 'Was in deinem Alltag darf sich ändern, damit du gesund bleibst?',
    },
    meaning: {
      R: 'Was trägt dich, wenn Sicherheiten wegfallen?',
      B: 'Wovor schützt dich deine Leere oder Erschöpfung, und was möchte gesehen werden?',
      W: 'Welchen Glaubenssatz über dich hast du übernommen, ohne ihn zu prüfen?',
    },
    friends: {
      R: 'Wo gehörst du dazu, ohne dich anzupassen?',
      B: 'Wessen Erwartungen hast du zu lange erfüllt – und was kostet es dich, es zu lassen?',
      W: 'Welche Beziehungen nähren dich, und welche halten nur aus Gewohnheit?',
    },
    identity: {
      R: 'Welche Seite von dir zeigst du noch zu selten?',
      B: 'Wen spielst du, um akzeptiert zu werden – und was kostet dich das?',
      W: 'Wer möchtest du werden, jetzt wo alte Rollen nicht mehr passen?',
    },
    creative: {
      R: 'Was möchtest du zeigen, wenn niemand urteilen würde?',
      B: 'Welche Angst vor Bewertung blockiert deinen Ausdruck?',
      W: 'Was willst du in die Welt bringen, das nur du bringen kannst?',
    },
    conflict: {
      R: 'Wo darfst du klar Nein sagen, ohne eine Beziehung zu gefährden?',
      B: 'Welcher Ärger sucht sich gerade ein Ventil, und was steckt darunter?',
      W: 'Worum geht es dir eigentlich, wenn du streitest – ums Recht oder ums Gehörtwerden?',
    },
  };
  const TONE_KEY = { 'Rückenwind': 'R', 'Belastung oder Umbruch': 'B', 'Wendepunkt': 'W' };

  // Finsternis-Texte je betroffenem Geburtspunkt
  const ECLIPSE_TEXT = {
    sun: 'dein Selbstbild wird angestoßen – Entscheidungen zu Identität und Richtung werden fällig.',
    moon: 'Gefühle und Bedürfnisse kommen ans Licht – Altes will verabschiedet werden.',
    mercury: 'dein Denken verändert sich – ein Gespräch oder eine Nachricht bringt Klarheit oder Wende.',
    venus: 'Beziehungen und Werte kommen in Bewegung – etwas wird neu bewertet.',
    mars: 'Energie wird freigesetzt – Anlass, etwas anzupacken oder zu beenden.',
    jupiter: 'Horizonte öffnen sich – eine Chance oder Wende bei Zielen und Überzeugungen.',
    saturn: 'es wird geprüft, was trägt – Strukturen werden fester oder fallen weg.',
    uranus: 'Überraschendes bricht herein – ein plötzlicher Wendepunkt.',
    neptune: 'Gewissheiten lösen sich auf – Klarheit über Träume oder Täuschungen.',
    pluto: 'ein Thema wird vertieft – etwas Grundlegendes endet oder beginnt.',
    asc: 'dein Auftreten verändert sich – ein neuer Abschnitt in deiner Selbstdarstellung.',
    desc: 'ein wichtiges Gegenüber ist betroffen – eine Beziehung verändert sich.',
    mc: 'Beruf und Ziele kommen in Bewegung – eine berufliche Wende ist möglich.',
    ic: 'Zuhause und Herkunft sind im Fokus – Familie und Wohnen rücken nach vorn.',
    node: 'deine Lebensrichtung wird berührt – ein Schritt auf deinem Weg wird fällig.',
  };

  // Konkrete Ereignisse je Thema und Signal der Phase. Die Zuordnung ist typisch, aber keine Vorhersage.
  const SIGNAL_LABEL = { begin: 'Beginn', commit: 'Festigung', end: 'Ende', upheaval: 'Umbruch', sudden: 'Plötzliches', dissolve: 'Auflösung' };
  const EVENTS = {
    partnership: {
      begin: 'Kennenlernen, Verliebtheit oder ein gemeinsamer Neuanfang',
      commit: 'Zusammenziehen, Verlobung oder Heirat',
      end: 'Trennung oder das Ende einer Beziehungsphase',
      upheaval: 'Streit, Krise oder eine Zerreißprobe in der Beziehung',
      sudden: 'eine überraschende Begegnung oder ein plötzlicher Bruch',
      dissolve: 'Unklarheit in der Beziehung, Idealisierung oder Sehnsucht nach jemandem',
    },
    family: {
      begin: 'Familienzuwachs – Geburt eines Kindes oder ein neues Familienmitglied',
      commit: 'ein Familienfest, gemeinsame Verantwortung oder klare Absprachen mit Angehörigen',
      end: 'Abschied von Angehörigen, Auszug oder das Ende einer Familienrolle',
      upheaval: 'Streit oder Bruch in der Familie, Krankheit von Angehörigen',
      sudden: 'plötzliche Nachrichten aus der Familie',
      dissolve: 'eine unklare Familiensituation, Rückzug oder Überforderung durch andere',
    },
    career: {
      begin: 'neuer Job, Beförderung, Projektstart oder Selbstständigkeit',
      commit: 'fester Vertrag, mehr Verantwortung oder eine langfristige Position',
      end: 'Kündigung, Jobverlust oder das Ende eines Arbeitsabschnitts',
      upheaval: 'Druck, Konflikte im Job oder eine berufliche Krise',
      sudden: 'ein überraschendes Angebot, Umstrukturierung oder ein plötzlicher Wechsel',
      dissolve: 'berufliche Orientierungslosigkeit oder Zweifel am eigenen Weg',
    },
    education: {
      begin: 'Studien- oder Ausbildungsbeginn, ein neuer Kurs oder ein neues Wissensgebiet',
      commit: 'bestandene Prüfung, Abschluss oder ein verbindlicher Ausbildungsplan',
      end: 'das Ende der Ausbildung oder ein Abbruch',
      upheaval: 'Prüfungsdruck, Zweifel oder Überforderung',
      sudden: 'eine plötzliche Chance oder ein Kurswechsel in der Ausbildung',
      dissolve: 'Unsicherheit, was du lernen oder werden willst',
    },
    money: {
      begin: 'Gehaltssprung, Erbe, neue Einnahmen oder eine größere Anschaffung',
      commit: 'eine langfristige Bindung wie Kredit oder Kauf, oder solide Rücklagen',
      end: 'ein Verlust, das Ende einer Einnahmequelle oder das Ablösen von Schulden',
      upheaval: 'Geldsorgen, Schulden oder ein finanzieller Engpass',
      sudden: 'eine unerwartete Ausgabe oder unerwartete Einnahme',
      dissolve: 'Unübersichtlichkeit bei den Finanzen, Täuschung oder Fehlkalkulation',
    },
    housing: {
      begin: 'Umzug, neue Wohnung oder Hauskauf',
      commit: 'Mietvertrag, Kauf oder langfristiges Einrichten',
      end: 'Auszug oder das Ende eines Wohnorts',
      upheaval: 'Streit ums Wohnen, Renovierung oder Wohnungsnot',
      sudden: 'ein plötzlicher Umzug oder Wohnungswechsel',
      dissolve: 'Unentschlossenheit, wo du leben willst, oder Heimweh',
    },
    health: {
      begin: 'ein neuer Gesundheitsimpuls: Sport, Ernährung oder Genesung',
      commit: 'feste Routinen, Vorsorge oder eine gute Behandlung',
      end: 'das Ende einer Krankheitsphase oder der Abschluss einer Behandlung',
      upheaval: 'Erschöpfung, Überlastung, Krankheit oder eine OP',
      sudden: 'akute Beschwerden, ein Unfall oder ein plötzlicher Befund',
      dissolve: 'diffuse Beschwerden, Müdigkeit oder Empfindlichkeit',
    },
    meaning: {
      begin: 'Neuorientierung, neue Interessen oder ein spiritueller Aufbruch',
      commit: 'ein klarer Lebensentschluss oder eine feste Praxis',
      end: 'der Abschied von einem Lebensabschnitt oder von alten Überzeugungen',
      upheaval: 'eine Sinnkrise oder tiefe innere Erschütterung',
      sudden: 'eine plötzliche Einsicht oder ein Wendepunkt',
      dissolve: 'Leere, Suche oder Rückzug',
    },
    friends: {
      begin: 'neue Freundschaften, Gruppen oder Netzwerke',
      commit: 'eine feste Freundschaft, ein Verein oder gemeinsame Vorhaben',
      end: 'ein Bruch oder das Ende einer Freundschaft',
      upheaval: 'Streit im Freundeskreis oder Enttäuschung',
      sudden: 'eine überraschende Begegnung oder ein Kontaktabbruch',
      dissolve: 'Distanz oder Zweifel, wer zu dir passt',
    },
    identity: {
      begin: 'ein neuer Look, eine neue Rolle oder ein neuer Selbstausdruck',
      commit: 'sich zu etwas bekennen, ein Namenswechsel oder eine klare Selbstentscheidung',
      end: 'das Ende einer alten Rolle oder Lebensphase',
      upheaval: 'eine Identitätskrise oder starker Druck von außen',
      sudden: 'ein plötzlicher Wandel im Auftreten',
      dissolve: 'Orientierungslosigkeit, wer du sein willst',
    },
    creative: {
      begin: 'ein Projektstart, eine Veröffentlichung oder ein neues Hobby',
      commit: 'der Abschluss eines Werks oder ein verbindliches Engagement',
      end: 'das Ende eines Projekts oder der Abschied von einem Hobby',
      upheaval: 'Kritik, Blockade oder Selbstzweifel',
      sudden: 'plötzliche Inspiration oder eine unerwartete Bühne',
      dissolve: 'Ideenfluss ohne Richtung',
    },
    conflict: {
      begin: 'ein Vertrag oder eine Vereinbarung, die neu beginnt',
      commit: 'Einigung, Vertragsabschluss oder klare Regeln',
      end: 'das Ende eines Streits oder Prozesses',
      upheaval: 'Streit, Behördenkram oder ein Rechtsstreit',
      sudden: 'ein plötzlicher Konflikt oder ein unerwartetes Schreiben',
      dissolve: 'Missverständnisse und Unklarheit in Vereinbarungen',
    },
  };

  // Welches Signal (Beginn, Festigung, Ende, Umbruch, Plötzliches, Auflösung) ein einzelner Beitrag trägt
  function itemSignals(x) {
    const out = {};
    const set = (k, w) => { out[k] = (out[k] || 0) + w; };
    const t = x.tone;
    if (x.kind === 'eclipse') {
      if (x.eclipseKind === 'solar') { set('begin', 1); if (t === 'H') set('upheaval', 0.3); } else set('end', 1);
      return out;
    }
    if (x.kind === 'progression') {
      if (x.transit === 'sun') { if (t === 'H') set('upheaval', 0.4); else set('begin', 0.6); }
      else if (x.transit === 'moon') { if (t === 'H') set('upheaval', 0.5); else set('begin', 0.3); }
      else if (x.transit === 'venus') { if (t === 'H') set('upheaval', 0.5); else set('commit', 0.6); }
      else if (x.transit === 'mars') { if (t === 'H') set('upheaval', 0.6); else set('begin', 0.5); }
      else set('sudden', 0.3);
      return out;
    }
    switch (x.transit) {
      case 'jupiter': set('begin', t === 'H' ? 0.4 : 1); if (t === 'H') set('upheaval', 0.3); break;
      case 'saturn':
        if (t === 'F') set('commit', 1);
        else if (t === 'V') { set('commit', 0.6); set('end', 0.4); } else { set('end', 0.6); set('upheaval', 0.6); }
        break;
      case 'pluto':
        if (t === 'F') { set('begin', 0.4); set('end', 0.4); } else { set('end', 0.6); set('upheaval', 0.6); }
        break;
      case 'uranus': set('sudden', 1); if (t === 'H') set('upheaval', 0.3); break;
      case 'neptune': set('dissolve', t === 'F' ? 0.6 : 1); if (t === 'F') set('begin', 0.3); if (t === 'H') set('upheaval', 0.3); break;
      case 'mars':
        if (t === 'F') set('begin', 0.5); else if (t === 'V') { set('begin', 0.3); set('upheaval', 0.5); } else set('upheaval', 1);
        break;
      default: break;
    }
    return out;
  }

  // Signale einer Phase, nach Gewicht sortiert
  function signalsOf(items) {
    const tot = {};
    items.filter((x) => x.kind !== 'house').forEach((x) => {
      const sg = itemSignals(x);
      Object.keys(sg).forEach((k) => { tot[k] = (tot[k] || 0) + sg[k] * x.value; });
    });
    return Object.keys(tot).map((k) => ({ signal: k, weight: tot[k] })).sort((a, b) => b.weight - a.weight);
  }

  const DAY = 86400000;

  // Ein Geburtspunkt dient mehreren Themen. Sein Einfluss wird auf die Themen verteilt (nach Gewicht),
  // damit nicht ein einzelner Transit gleichzeitig alle Themen auf den Höhepunkt hebt.
  const SHARE = {};
  Object.keys(TOPICS).forEach((tk) => Object.keys(TOPICS[tk].targets).forEach((pk) => { SHARE[pk] = (SHARE[pk] || 0) + TOPICS[tk].targets[pk]; }));
  const shareOf = (tk, pk) => (TOPICS[tk].targets[pk] ? TOPICS[tk].targets[pk] / Math.pow(SHARE[pk], 0.75) : 0);

  function natalPoints(natal) {
    const pts = A.PLANETS.map((k) => ({ key: k, lon: natal.planets[k].lon }));
    if (natal.birth) pts.push({ key: 'node', lon: A.meanNode(natal.birth) });
    if (natal.timeKnown) {
      pts.push({ key: 'asc', lon: natal.asc }, { key: 'desc', lon: A.norm(natal.asc + 180) }, { key: 'mc', lon: natal.mc }, { key: 'ic', lon: A.norm(natal.mc + 180) });
    }
    return pts;
  }

  // Alte Tageswörter in Phasen-Sprache umsetzen
  function phaseWording(t) {
    return t
      .replace(/\bheute\b/g, 'derzeit')
      .replace(/Ein emotional intensiver Tag/g, 'Eine emotional intensive Zeit')
      .replace(/Ein nüchterner, ernster Tag/g, 'Eine nüchterne, ernste Zeit')
      .replace(/Ein Tag, der/g, 'Eine Zeit, die')
      .replace(/ein Tag, an dem/g, 'eine Zeit, in der')
      .replace(/ein guter Tag/g, 'eine gute Zeit');
  }

  function add(out, tk, v, valence, item) {
    out[tk].total += v;
    out[tk].net += v * valence;
    if (item) out[tk].items.push({ ...item, value: v });
  }

  // Alle Beiträge (Transite, Finsternisse, Progressionen, Haus-Grundwirkung) zu allen Themen an einem Zeitpunkt
  function contributions(natal, pos, pts, ctx) {
    const out = {};
    Object.keys(TOPICS).forEach((k) => { out[k] = { total: 0, net: 0, items: [] }; });
    const topicKeys = Object.keys(TOPICS);

    // Langsame Transitplaneten
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
          topicKeys.forEach((tk) => {
            const w = shareOf(tk, pt.key);
            if (w) add(out, tk, base * w, valence, { kind: 'aspect', transit: tp, natal: pt.key, aspect: asp, tone });
          });
        });
      });
      if (natal.timeKnown) {
        const h = A.wholeSignHouse(lon, natal.asc);
        topicKeys.forEach((tk) => {
          const w = TOPICS[tk].houses[h];
          if (w) add(out, tk, HOUSE_W * TRANSIT_W[tp] * w, 0, { kind: 'house', transit: tp, house: h });
        });
      }
    });

    // Finsternisse wirken rund 90 Tage vor und nach dem Termin
    (ctx.eclipses || []).forEach((e) => {
      const days = Math.abs(ctx.date - e.date) / DAY;
      if (days > ECLIPSE_DAYS) return;
      const decay = 1 - days / ECLIPSE_DAYS;
      pts.forEach((pt) => {
        ['conjunction', 'opposition', 'square'].forEach((key) => {
          const orb = Math.abs(Math.abs(A.diff180(e.lon, pt.lon)) - ASPECT[key].angle);
          if (orb > ECLIPSE_ORB) return;
          const base = ECLIPSE_W * ASP_W[key] * (1 - orb / ECLIPSE_ORB) * decay;
          const tone = TONE[key];
          topicKeys.forEach((tk) => {
            const w = shareOf(tk, pt.key);
            if (w) add(out, tk, base * w, tone === 'H' ? -1 : 0, { kind: 'eclipse', transit: 'eclipse', eclipseKind: e.kind, natal: pt.key, aspect: ASPECT[key], tone });
          });
        });
      });
      if (natal.timeKnown) {
        const h = A.wholeSignHouse(e.lon, natal.asc);
        topicKeys.forEach((tk) => {
          const w = TOPICS[tk].houses[h];
          if (w) add(out, tk, HOUSE_W * ECLIPSE_W * w * decay, 0, { kind: 'house', transit: 'eclipse', house: h });
        });
      }
    });

    // Fortgeschriebene Planeten (Sekundärprogression)
    if (natal.birth) {
      const prog = A.planetPositions(A.progressedDate(natal.birth, ctx.date));
      Object.keys(PROG_W).forEach((body) => {
        const lon = prog[body].lon;
        pts.forEach((pt) => {
          const sep = Math.abs(A.diff180(lon, pt.lon));
          A.ASPECTS.forEach((asp) => {
            const orb = Math.abs(sep - asp.angle);
            if (orb > PROG_ORB) return;
            const tone = TONE[asp.key];
            const valence = tone === 'F' ? 1 : tone === 'H' ? -1 : VALENCE_V[body];
            const base = PROG_W[body] * ASP_W[asp.key] * (1 - orb / PROG_ORB);
            topicKeys.forEach((tk) => {
              const w = shareOf(tk, pt.key);
              if (w) add(out, tk, base * w, valence, { kind: 'progression', transit: body, natal: pt.key, aspect: asp, tone });
            });
          });
        });
      });
      if (natal.timeKnown) {
        const h = A.wholeSignHouse(prog.moon.lon, natal.asc); // emotionaler Schwerpunkt der letzten Jahre
        topicKeys.forEach((tk) => {
          const w = TOPICS[tk].houses[h];
          if (w) add(out, tk, HOUSE_W * 0.6 * w, 0, { kind: 'house', transit: 'progressed', house: h });
        });
      }
    }
    return out;
  }

  function makeCtx(natal, from, to) {
    const eclipses = A.eclipses(new Date(from.getTime() - (ECLIPSE_DAYS + 5) * DAY), new Date(to.getTime() + (ECLIPSE_DAYS + 5) * DAY));
    return { eclipses };
  }

  function scan(natal, from, to, stepDays) {
    stepDays = stepDays || 2;
    const pts = natalPoints(natal);
    const base = makeCtx(natal, from, to);
    const dates = [];
    const series = {};
    Object.keys(TOPICS).forEach((k) => { series[k] = []; });
    for (let t = from.getTime(); t <= to.getTime(); t += stepDays * DAY) {
      const d = new Date(t);
      const c = contributions(natal, A.planetPositions(d), pts, { ...base, date: d });
      dates.push(d);
      Object.keys(TOPICS).forEach((k) => series[k].push(c[k].total));
    }
    return { dates, series, ctx: base };
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

  function driverText(x) {
    const key = TEXT_KEY[x.natal] || x.natal;
    if (x.kind === 'eclipse') return `${x.eclipseKind === 'solar' ? 'Eine Sonnenfinsternis (Neubeginn)' : 'Eine Mondfinsternis (Abschluss)'}: ${ECLIPSE_TEXT[x.natal]}`;
    const t = phaseWording(Themes.themeFor(x.transit, key, x.tone));
    return x.kind === 'progression' ? `Innere Reifung: ${t}` : t;
  }

  function describePeak(natal, pts, topicKey, date, ctx) {
    const c = contributions(natal, A.planetPositions(date), pts, { ...ctx, date })[topicKey];
    const net = c.total ? c.net / c.total : 0;
    const tone = net > 0.25 ? 'Rückenwind' : net < -0.25 ? 'Belastung oder Umbruch' : 'Wendepunkt';
    const seen = new Set();
    const drivers = c.items.filter((x) => x.kind !== 'house').sort((a, b) => b.value - a.value).filter((x) => {
      const key = `${x.kind}|${x.transit}|${x.natal}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 2).map((x) => ({ kind: x.kind, transit: x.transit, natal: x.natal, aspect: x.aspect.key, tone: x.tone, text: driverText(x) }));
    return { tone, drivers, signals: signalsOf(c.items) };
  }

  /**
   * Kapitel: die stärksten Phasen pro Thema, vergleichbar gemacht über das 90. Perzentil des jeweiligen Themas.
   * opts: { topics: [Schlüssel], perTopic: 3, limit: 10, minStrength: 1 }
   * Erwartet natal.birth (wird von Astro.natalChart gesetzt) für Progressionen und Mondknoten.
   */
  function chapters(natal, from, to, opts) {
    opts = opts || {};
    const topics = opts.topics || Object.keys(TOPICS);
    const { dates, series, ctx } = scan(natal, from, to, 2);
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
        const d = describePeak(natal, pts, tk, dates[i], ctx);
        const psych = PSYCH[tk][TONE_KEY[d.tone]];
        const sig = d.signals.filter((x, idx) => idx === 0 || x.weight >= 0.5 * d.signals[0].weight).slice(0, 2);
        // Bei belastender Phase ist ein Beginn selten unbeschwert
        const events = sig.map((x) => (d.tone === 'Belastung oder Umbruch' && x.signal === 'begin' ? `ein anstrengender Neubeginn – ${EVENTS[tk][x.signal]}` : EVENTS[tk][x.signal]));
        all.push({
          topic: tk, label: TOPICS[tk].label, peak: dates[i], start: dates[l], end: dates[r], strength,
          began: l === 0, ongoing: r === sm.length - 1, // Phase beginnt vor bzw. endet nach dem betrachteten Zeitraum
          tone: d.tone, drivers: d.drivers, psych,
          signals: sig.map((x) => SIGNAL_LABEL[x.signal]), events,
          summary: `${TOPICS[tk].label} – ${d.tone}: ${d.drivers.map((x) => x.text).join(' ')} Typisch für so eine Phase (keine Vorhersage): ${events.join(' oder ')}. Innere Frage: ${psych}`,
        });
      });
    });
    all.sort((a, b) => b.strength - a.strength);
    return all.slice(0, opts.limit || 10);
  }

  // Wie stark ist ein Thema an einem Tag im Vergleich zum ganzen Zeitraum? (0 = niedrigster, 1 = höchster Tag)
  function rankAt(natal, topicKey, date, from, to) {
    const { series, ctx } = scan(natal, from, to, 2);
    const v = contributions(natal, A.planetPositions(date), natalPoints(natal), { ...ctx, date })[topicKey].total;
    const s = series[topicKey];
    return s.filter((x) => x < v).length / s.length;
  }

  const api = { TOPICS, PSYCH, EVENTS, SIGNAL_LABEL, signalsOf, scan, chapters, rankAt, contributions, natalPoints, makeCtx };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LifeEvents = api;
})(typeof window !== 'undefined' ? window : globalThis);
