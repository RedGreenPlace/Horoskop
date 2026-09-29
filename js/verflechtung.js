/*
 * Verflechtung (Achse 1, Stufen 2, 3 und 5):
 *  - Stufe 2: Verbindungssätze (bridge) zwischen zwei Konstellationen am selben Geburtspunkt und
 *             Auflösungssätze (aufloesung) für Gegensätze zwischen zwei Geburtspunkten
 *  - Stufe 3: Satz für ein Paar laufender Planeten (pair)
 *  - Stufe 5: Muster aus drei und mehr Konstellationen (pattern)
 * Alle Texte ohne Fachbegriffe.
 */
(function (root) {
  'use strict';

  const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  // ---------- Stufe 2: Verbindungssätze ----------
  // Bereich des betroffenen Geburtspunkts in Nominativ (N) und Akkusativ (A)
  const DOMAIN = {
    sun: { N: 'dein Selbstwert', A: 'deinen Selbstwert', D: 'deinem Selbstwert' },
    moon: { N: 'dein Gefühlsleben', A: 'dein Gefühlsleben', D: 'deinem Gefühlsleben' },
    mercury: { N: 'dein Denken', A: 'dein Denken', D: 'deinem Denken' },
    venus: { N: 'dein Bedürfnis nach Nähe', A: 'dein Bedürfnis nach Nähe', D: 'deinem Bedürfnis nach Nähe' },
    mars: { N: 'dein Antrieb', A: 'deinen Antrieb', D: 'deinem Antrieb' },
    jupiter: { N: 'deine Zuversicht', A: 'deine Zuversicht', D: 'deiner Zuversicht' },
    saturn: { N: 'dein Verantwortungsgefühl', A: 'dein Verantwortungsgefühl', D: 'deinem Verantwortungsgefühl' },
    uranus: { N: 'dein Freiheitsdrang', A: 'deinen Freiheitsdrang', D: 'deinem Freiheitsdrang' },
    neptune: { N: 'deine Sehnsucht', A: 'deine Sehnsucht', D: 'deiner Sehnsucht' },
    pluto: { N: 'dein Umgang mit Kontrolle und Wandel', A: 'deinen Umgang mit Kontrolle und Wandel', D: 'deinem Umgang mit Kontrolle und Wandel' },
    asc: { N: 'dein Auftreten', A: 'dein Auftreten', D: 'deinem Auftreten' },
    mc: { N: 'dein Weg im Beruf', A: 'deinen Weg im Beruf', D: 'deinem Weg im Beruf' },
  };
  // Vier Formulierungen je Verhältnis (H = drückt, F = trägt); {N} und {A} werden durch den Bereich ersetzt
  const BRIDGE = {
    soften: ['Ein zweiter Einfluss entlastet {A}:', 'Zum Glück gibt es Halt für {A}:', 'Entlastung kommt für {A}:', 'Zugleich wird es für {A} erträglicher:'],
    sharpen: ['Verschärft wird es dadurch, dass {N} zugleich von einem zweiten Einfluss betroffen ist:', 'Dazu kommt weiterer Druck auf {A}:', 'Und {N} wird noch zusätzlich belastet:', 'Zugleich wird {N} zusätzlich gefordert:'],
    boost: ['Verstärkt wird das Gute dadurch, dass {N} zusätzlichen Rückenwind bekommt:', 'Zusätzlich unterstützt das {A}:', 'Und {N} bekommt noch Unterstützung:', 'Dazu passt, dass {N} weiteren Halt findet:'],
    disturb: ['Gestört wird der gute Lauf dadurch, dass {N} zugleich gefordert wird:', 'Ein zweiter Einfluss stört {A}:', 'Aber {N} wird zugleich von anderer Seite herausgefordert:', 'Doch für {A} gibt es auch Gegenwind:'],
  };

  // Auflösung: zwei Teile in dir, die in verschiedene Richtungen ziehen (Schlüssel in der Reihenfolge von PLANETS)
  const AUFLOESUNG = {
    'sun|moon': 'Was du sein willst und was du fühlst, muss sich nicht ausschließen: Wer beides zu Wort kommen lässt, wirkt echter.',
    'sun|mercury': 'Wer du sein willst und was du dazu sagst, passt zusammen, sobald du es aussprichst, statt es nur zu denken.',
    'sun|venus': 'Dass du ganz du selbst sein willst und zugleich gemocht werden möchtest, ist kein Widerspruch: Nähe trägt am längsten, wenn sie echt ist.',
    'sun|mars': 'Dein Selbstbild und dein Antrieb ziehen an einem Strang, sobald du weißt, wofür du wirklich kämpfen willst.',
    'sun|jupiter': 'Selbstvertrauen und Zuversicht verstärken sich, solange du sie an der Wirklichkeit misst.',
    'sun|saturn': 'Dass du glänzen willst und zugleich Verantwortung trägst, ist kein Widerspruch: Ausstrahlung hat Bestand, wenn sie Boden hat.',
    'sun|uranus': 'Du willst du selbst sein und frei sein: Beides gelingt, wenn du dir kleine Freiräume nimmst, statt alles hinzuwerfen.',
    'sun|neptune': 'Wer du bist und wonach du dich sehnst, darf nebeneinander bestehen: Träume dürfen ein Kompass sein, aber kein Ersatz für Schritte.',
    'sun|pluto': 'Dein Selbstbild und dein Bedürfnis nach Kontrolle lernen voneinander: Wer sich zeigt, verliert nicht automatisch die Macht über sich.',
    'moon|mercury': 'Kopf und Herz sprechen nicht dieselbe Sprache, aber sie lassen sich übersetzen: Sag in einem Satz, was du fühlst.',
    'moon|venus': 'Dein Bedürfnis nach Geborgenheit und dein Wunsch nach Nähe sind zwei Seiten derselben Sehnsucht: Du darfst beide zeigen.',
    'moon|mars': 'Gefühl und Tatkraft sind kein Gegensatz: Was du fühlst, sagt dir, wofür sich Handeln lohnt.',
    'moon|jupiter': 'Dass du Geborgenheit brauchst und mehr willst, ist kein Widerspruch: Kleine, verlässliche Schritte tragen beides.',
    'moon|saturn': 'Gefühl und Pflicht ziehen an dir: Deine Bedürfnisse ernst zu nehmen ist selbst eine Verantwortung.',
    'moon|uranus': 'Nähe und Freiheit sind kein Entweder-oder: Schaffe dir Raum, ohne dich zu entfernen.',
    'moon|neptune': 'Deine Empfindsamkeit und deine Sehnsucht brauchen Grenzen, damit sie dich nicht überfluten: Ein ruhiger Ort hilft.',
    'moon|pluto': 'Der Wunsch, gesehen zu werden, und die Angst, dich auszuliefern, gehören zusammen: Du darfst dich in kleinen Dosen zeigen.',
    'mercury|venus': 'Was du sagst und was du empfindest, darf sich annähern: Ein freundliches Wort öffnet mehr als ein kluges.',
    'mercury|mars': 'Denken und Handeln gehören zusammen: Erst ein klarer Gedanke, dann der Schritt.',
    'mercury|jupiter': 'Große Ideen und Genauigkeit vertragen sich, wenn du den ersten Schritt konkret machst.',
    'mercury|saturn': 'Ideen brauchen Fakten, und Fakten brauchen Ideen: Wer beides prüft, kommt weiter.',
    'mercury|uranus': 'Neue Einfälle und klare Worte ergänzen sich: Schreib die Idee auf, bevor du sie verwirfst.',
    'mercury|neptune': 'Klarheit und Ahnung müssen nicht kämpfen: Frag nach, was du nur spürst.',
    'mercury|pluto': 'Was du denkst und was du nicht aussprichst, will sich treffen: Sag einen Satz, der wahr ist.',
    'venus|mars': 'Nähe und Durchsetzung schließen sich nicht aus: Wer klar sagt, was er will, wird oft ernster genommen.',
    'venus|jupiter': 'Genuss und Maß können Freunde sein: Gönn dir etwas, ohne zu übertreiben.',
    'venus|saturn': 'Nähe und Verlässlichkeit sind zwei Wege zum selben Ziel: Vertrauen wächst durch Wiederholung.',
    'venus|uranus': 'Nähe und Freiheit sind kein Widerspruch: Die besten Beziehungen lassen Raum.',
    'venus|neptune': 'Deine Sehnsucht nach Nähe und die Wirklichkeit dürfen sich treffen: Sieh, was ist, und liebe es trotzdem.',
    'venus|pluto': 'Nähe und Kontrolle stehen sich im Weg: Wer loslässt, bekommt oft mehr Nähe zurück.',
    'mars|jupiter': 'Tatkraft und Zuversicht verstärken sich, solange du dir ein Ziel setzt, das du wirklich erreichen kannst.',
    'mars|saturn': 'Gas und Bremse zugleich sind kein Fehler, sondern Tempo mit Steuerung: Wähle Ausdauer statt Sprint.',
    'mars|uranus': 'Tatendrang und Unruhe ergänzen sich, wenn du deine Energie in einen Plan lenkst.',
    'mars|neptune': 'Kraft und Träume brauchen ein Ziel, das du benennen kannst, sonst verpufft die Energie.',
    'mars|pluto': 'Willenskraft und Machtfragen: Lenke die Kraft in ein Vorhaben statt in einen Streit.',
    'jupiter|saturn': 'Dass du mehr willst und Substanz brauchst, ist kein Widerspruch: Kleine, verlässliche Schritte tragen weiter als ein großer.',
    'jupiter|uranus': 'Chancen und Wandel ergänzen sich, wenn du flexibel bleibst und trotzdem ein Ziel behältst.',
    'jupiter|neptune': 'Große Hoffnung und nüchterne Prüfung brauchen einander: Träume dürfen wachsen, wenn du sie prüfst.',
    'jupiter|pluto': 'Wachstum und Wandlung gehen Hand in Hand: Erweiterung bedeutet oft, etwas Altes loszulassen.',
    'saturn|uranus': 'Halt und Freiheit schließen sich nicht aus: Freiheit trägt, wenn sie ein Gerüst hat.',
    'saturn|neptune': 'Ideale und Wirklichkeit brauchen Form: Gib deinem Traum ein erstes, kleines Gerüst.',
    'saturn|pluto': 'Druck und Wandel sind zwei Seiten einer Prüfung: Standhaft bleiben und loslassen gehören zusammen.',
    'uranus|neptune': 'Neuerung und Sehnsucht ziehen in verschiedene Richtungen: Ein Schritt ins Ungewohnte darf auch ein Schritt zu einem Traum sein.',
    'uranus|pluto': 'Freiheitsdrang und Tiefe ergänzen sich: Ein Umbruch gelingt, wenn er nicht nur Bruch, sondern auch Neuanfang ist.',
    'neptune|pluto': 'Sehnsucht und Wandel gehören zusammen: Was sich auflöst, macht Platz für etwas, das trägt.',
  };
  // Aszendent und Beruf haben keine eigene Auflösung: sinngemäß Selbstausdruck und Struktur
  const DOMAIN_PLANET = { asc: 'sun', mc: 'saturn' };

  // ---------- Stufe 3: Satz für ein Paar laufender Planeten ----------
  const PAIR_CORE = {
    'sun|moon': 'Verstand und Gefühl begegnen sich.',
    'sun|mercury': 'Dein Selbstbild und dein Denken beeinflussen sich.',
    'sun|venus': 'Dein Selbstwert und dein Bedürfnis nach Nähe rücken zusammen.',
    'sun|mars': 'Willenskraft und Tatendrang verstärken sich oder geraten aneinander.',
    'sun|jupiter': 'Selbstvertrauen und Zuversicht wachsen – manchmal über das Ziel hinaus.',
    'sun|saturn': 'Der Wunsch zu glänzen trifft auf Ernst und Pflicht.',
    'sun|uranus': 'Der Wunsch, du selbst zu sein, trifft auf den Wunsch nach Freiheit.',
    'sun|neptune': 'Klarheit trifft auf Sehnsucht und Unschärfe.',
    'sun|pluto': 'Dein Selbstbild trifft auf ein tiefes Bedürfnis nach Kontrolle und Wandel.',
    'moon|mercury': 'Deine Stimmung und dein Denken beeinflussen sich gegenseitig.',
    'moon|venus': 'Deine Stimmung und dein Wunsch nach Nähe verstärken sich.',
    'moon|mars': 'Gefühle und Tatendrang schaukeln sich gegenseitig auf.',
    'moon|jupiter': 'Deine Stimmung trifft auf Zuversicht – und auf die Neigung, zu viel zu wollen.',
    'moon|saturn': 'Deine Stimmung trifft auf Ernst und Pflichtgefühl.',
    'moon|uranus': 'Deine Stimmung trifft auf Unruhe und den Wunsch nach Abwechslung.',
    'moon|neptune': 'Deine Stimmung trifft auf Sehnsucht und Empfindsamkeit.',
    'moon|pluto': 'Deine Stimmung trifft auf tiefe, alte Gefühle.',
    'mercury|venus': 'Worte und Zuwendung treffen sich.',
    'mercury|mars': 'Denken und Tempo treffen sich.',
    'mercury|jupiter': 'Dein Denken trifft auf große Pläne.',
    'mercury|saturn': 'Dein Denken trifft auf Strenge und Genauigkeit.',
    'mercury|uranus': 'Dein Denken trifft auf plötzliche Einfälle.',
    'mercury|neptune': 'Dein Denken trifft auf Ahnungen, die sich schwer greifen lassen.',
    'mercury|pluto': 'Dein Denken trifft auf Fragen, die tief gehen.',
    'venus|mars': 'Der Wunsch nach Nähe trifft auf Tatendrang.',
    'venus|jupiter': 'Der Wunsch nach Nähe trifft auf Großzügigkeit und Genuss.',
    'venus|saturn': 'Der Wunsch nach Nähe trifft auf das Bedürfnis nach Verlässlichkeit.',
    'venus|uranus': 'Der Wunsch nach Nähe trifft auf den Wunsch nach Freiheit.',
    'venus|neptune': 'Der Wunsch nach Nähe trifft auf Sehnsucht und Idealbilder.',
    'venus|pluto': 'Der Wunsch nach Nähe trifft auf Intensität und Kontrollbedürfnis.',
    'mars|jupiter': 'Tatkraft trifft auf Zuversicht.',
    'mars|saturn': 'Tatkraft trifft auf Bremse und Ausdauer.',
    'mars|uranus': 'Tatkraft trifft auf Unruhe und plötzliche Impulse.',
    'mars|neptune': 'Tatkraft trifft auf Unklarheit darüber, wohin sie soll.',
    'mars|pluto': 'Tatkraft trifft auf große innere Willensstärke.',
    'jupiter|saturn': 'Der Wunsch nach mehr trifft auf die Wirklichkeit.',
    'jupiter|uranus': 'Der Wunsch nach mehr trifft auf plötzliche Veränderung.',
    'jupiter|neptune': 'Der Wunsch nach mehr trifft auf Ideale und Träume.',
    'jupiter|pluto': 'Der Wunsch nach mehr trifft auf einen tiefen Wandel.',
    'saturn|uranus': 'Das Bedürfnis nach Halt trifft auf den Wunsch nach Freiheit.',
    'saturn|neptune': 'Das Bedürfnis nach Halt trifft auf Träume und Ideale.',
    'saturn|pluto': 'Das Bedürfnis nach Halt trifft auf einen tiefen Umbruch.',
    'uranus|neptune': 'Der Wunsch nach Neuem trifft auf Sehnsucht.',
    'uranus|pluto': 'Der Wunsch nach Neuem trifft auf einen tiefen Wandel.',
    'neptune|pluto': 'Sehnsucht trifft auf einen tiefen Wandel.',
  };
  // FF = beide tragen, FH = eine trägt und eine fordert, HH = beide fordern; je drei Formulierungen
  const PAIR_CONT = {
    FF: ['Beides trägt dich – nutze es für etwas, das dir wichtig ist.', 'Beides unterstützt dich, und es lohnt sich, es zu nutzen.', 'Das arbeitet heute für dich.'],
    FH: ['Ein Einfluss trägt dich, der andere fordert dich – lass dich vom Tragenden halten.', 'Was belastet, wird von dem abgefedert, was hilft.', 'Dazwischen liegt dein Spielraum: Nutze ihn.'],
    HH: ['Beides fordert dich zugleich – wähle eines und lass den Rest ruhen.', 'Das ist doppelter Druck: Nimm Tempo raus.', 'Der doppelte Druck ist anstrengend, zeigt dir aber, was wirklich zählt.'],
  };

  // ---------- Stufe 5: Muster ----------
  // {N} = Bereich des betroffenen Punkts (Nominativ)
  const PATTERNS = {
    brennpunkt_1h2f: ['{N} steht heute im Mittelpunkt: Ein Einfluss belastet dich, zwei unterstützen dich.', 'Bei {D} wirken heute drei Einflüsse zusammen: einer belastet, zwei helfen.', 'Für {A} gilt heute: Einer der Einflüsse macht es schwer, zwei machen es leichter.'],
    brennpunkt_2h1f: ['{N} steht heute im Mittelpunkt: Zwei Einflüsse belasten dich, einer unterstützt dich.', 'Bei {D} wirken heute drei Einflüsse zusammen: zwei belasten, einer hilft.', 'Für {A} gilt heute: Zwei Einflüsse machen es schwer, einer macht es leichter.'],
    brennpunkt_3h: ['{N} steht heute im Mittelpunkt: Mehrere Einflüsse belasten dich zugleich.', 'Bei {D} wirken heute mehrere Einflüsse zusammen, und keiner entlastet.', 'Für {A} gilt heute: Mehrere Belastungen, keine Entlastung.'],
    brennpunkt_3f: ['{N} steht heute im Mittelpunkt: Mehrere Einflüsse unterstützen dich zugleich.', 'Bei {D} wirken heute mehrere Einflüsse zusammen, und alle helfen.', 'Für {A} gilt heute: Mehrfacher Rückenwind.'],
    gegensatz_bruecke: ['Zwei Bereiche deines Lebens stehen heute unter Spannung; daneben gibt es auch Unterstützung.', 'Es gibt heute zwei Baustellen, aber auch etwas, das dich trägt.'],
    nur_rueckenwind: ['Heute gibt es kaum Widerstand: Vieles läuft dir zu.', 'Der Tag hat wenig Reibung und viel Unterstützung.'],
    nur_druck: ['Heute gibt es wenig Ausgleich: Du musst ihn dir selbst schaffen.', 'Der Tag hat viel Reibung und wenig Entlastung – sei nachsichtig mit dir.'],
  };

  // ---------- Hilfsfunktionen ----------
  const key = (a, b) => (PLANETS.indexOf(a) <= PLANETS.indexOf(b) ? `${a}|${b}` : `${b}|${a}`);
  const domainPlanet = (n) => DOMAIN_PLANET[n] || n;
  const fill = (tpl, n) => tpl.replace(/\{N\}/g, DOMAIN[n].N).replace(/\{A\}/g, DOMAIN[n].A).replace(/\{D\}/g, DOMAIN[n].D);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const api = {
    DOMAIN, BRIDGE, AUFLOESUNG, PAIR_CORE, PAIR_CONT, PATTERNS, PLANETS,
    // relation: 'soften' | 'sharpen' | 'boost' | 'disturb'; n: Geburtspunkt; v: Variante (Zahl)
    bridge: (relation, n, v) => fill(BRIDGE[relation][Math.abs(v || 0) % BRIDGE[relation].length], n),
    // Auflösungssatz für zwei verschiedene Geburtspunkte, sonst null
    aufloesung(n1, n2) {
      const a = domainPlanet(n1);
      const b = domainPlanet(n2);
      return a === b ? null : AUFLOESUNG[key(a, b)];
    },
    // combo: 'FF' | 'FH' | 'HH' für zwei verschiedene laufende Planeten, sonst null
    pair(t1, t2, combo, v) {
      if (t1 === t2) return null;
      const core = PAIR_CORE[key(t1, t2)];
      const cont = PAIR_CONT[combo];
      return `${core} ${cont[Math.abs(v || 0) % cont.length]}`;
    },
    // Musternamen aus Anzahl der drückenden (h) und tragenden (f) Konstellationen am selben Punkt
    patternFor(h, f) {
      if (h + f >= 3) {
        if (h >= 3 && f === 0) return 'brennpunkt_3h';
        if (f >= 3 && h === 0) return 'brennpunkt_3f';
        return h >= 2 ? 'brennpunkt_2h1f' : 'brennpunkt_1h2f';
      }
      return null;
    },
    pattern: (name, n, v) => fill(PATTERNS[name][Math.abs(v || 0) % PATTERNS[name].length], n),
    cap,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Verflechtung = api;
})(typeof window !== 'undefined' ? window : globalThis);
