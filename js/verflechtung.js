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
    sun: { N: 'dein Selbstwert', A: 'deinen Selbstwert' },
    moon: { N: 'dein Gefühlsleben', A: 'dein Gefühlsleben' },
    mercury: { N: 'dein Denken', A: 'dein Denken' },
    venus: { N: 'dein Bedürfnis nach Nähe', A: 'dein Bedürfnis nach Nähe' },
    mars: { N: 'dein Antrieb', A: 'deinen Antrieb' },
    jupiter: { N: 'deine Zuversicht', A: 'deine Zuversicht' },
    saturn: { N: 'dein Verantwortungsgefühl', A: 'dein Verantwortungsgefühl' },
    uranus: { N: 'dein Freiheitsdrang', A: 'deinen Freiheitsdrang' },
    neptune: { N: 'deine Sehnsucht', A: 'deine Sehnsucht' },
    pluto: { N: 'deine Tiefe', A: 'deine Tiefe' },
    asc: { N: 'dein Auftreten', A: 'dein Auftreten' },
    mc: { N: 'dein Weg im Beruf', A: 'deinen Weg im Beruf' },
  };
  // Vier Formulierungen je Verhältnis (H = drückt, F = trägt); {N} und {A} werden durch den Bereich ersetzt
  const BRIDGE = {
    soften: ['Ein Stück weit fängt das {A} auf:', 'Zum Glück gibt es Halt für {A}:', 'Entlastung kommt für {A}:', 'Zugleich wird es für {A} erträglicher:'],
    sharpen: ['Verschärft wird es dadurch, dass {N} zugleich von anderer Seite berührt wird:', 'Dazu kommt weiterer Druck auf {A}:', 'Und {N} bekommt noch einen Stoß:', 'Zugleich wird {N} zusätzlich gefordert:'],
    boost: ['Verstärkt wird das Gute dadurch, dass {N} zusätzlichen Rückenwind bekommt:', 'Zusätzlich trägt es {A}:', 'Und {N} bekommt noch Unterstützung:', 'Dazu passt, dass {N} weiteren Halt findet:'],
    disturb: ['Gestört wird der gute Lauf dadurch, dass {N} zugleich gefordert wird:', 'Ein Störfeuer trifft {A}:', 'Aber {N} wird zugleich von anderer Seite herausgefordert:', 'Doch für {A} gibt es auch Gegenwind:'],
  };

  // Auflösung: zwei Teile in dir, die in verschiedene Richtungen ziehen (Schlüssel in der Reihenfolge von PLANETS)
  const AUFLOESUNG = {
    'sun|moon': 'Was du sein willst und was du fühlst, muss sich nicht ausschließen: Wer beides zu Wort kommen lässt, wirkt echter.',
    'sun|mercury': 'Wer du sein willst und was du dazu sagst, passt zusammen, sobald du es aussprichst, statt es nur zu denken.',
    'sun|venus': 'Dass du du selbst sein willst und zugleich gemocht werden möchtest, ist kein Widerspruch: Nähe trägt am längsten, wenn sie echt ist.',
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
    'sun|moon': 'Bewusstsein und Gefühl begegnen sich.',
    'sun|mercury': 'Selbstbild und Denken treffen aufeinander.',
    'sun|venus': 'Selbstwert und Nähe rücken zusammen.',
    'sun|mars': 'Wille und Antrieb ziehen an einem Strang oder gegeneinander.',
    'sun|jupiter': 'Selbstvertrauen trifft auf Zuversicht.',
    'sun|saturn': 'Ausstrahlung trifft auf Ernst.',
    'sun|uranus': 'Das Bewusste trifft auf den Wunsch nach Freiheit.',
    'sun|neptune': 'Klarheit trifft auf Sehnsucht.',
    'sun|pluto': 'Das Bewusste trifft auf das Tiefe.',
    'moon|mercury': 'Stimmung und Denken sprechen miteinander.',
    'moon|venus': 'Stimmung und Nähe verweben sich.',
    'moon|mars': 'Stimmung und Tatkraft schaukeln sich auf.',
    'moon|jupiter': 'Stimmung trifft auf Zuversicht.',
    'moon|saturn': 'Stimmung trifft auf Ernst.',
    'moon|uranus': 'Stimmung trifft auf Unruhe.',
    'moon|neptune': 'Stimmung trifft auf Sehnsucht.',
    'moon|pluto': 'Stimmung trifft auf Tiefe.',
    'mercury|venus': 'Worte und Zuwendung treffen sich.',
    'mercury|mars': 'Denken und Tempo treffen sich.',
    'mercury|jupiter': 'Denken trifft auf große Pläne.',
    'mercury|saturn': 'Denken trifft auf Prüfung.',
    'mercury|uranus': 'Denken trifft auf Blitzideen.',
    'mercury|neptune': 'Denken trifft auf Ahnung.',
    'mercury|pluto': 'Denken trifft auf Tiefe.',
    'venus|mars': 'Nähe trifft auf Tatendrang.',
    'venus|jupiter': 'Nähe trifft auf Fülle.',
    'venus|saturn': 'Nähe trifft auf Verlässlichkeit.',
    'venus|uranus': 'Nähe trifft auf Freiheit.',
    'venus|neptune': 'Nähe trifft auf Sehnsucht.',
    'venus|pluto': 'Nähe trifft auf Intensität.',
    'mars|jupiter': 'Tatkraft trifft auf Zuversicht.',
    'mars|saturn': 'Tatkraft trifft auf Ausdauer und Bremse.',
    'mars|uranus': 'Tatkraft trifft auf Unruhe.',
    'mars|neptune': 'Tatkraft trifft auf Nebel.',
    'mars|pluto': 'Tatkraft trifft auf Willensstärke.',
    'jupiter|saturn': 'Wachstum trifft auf Realität.',
    'jupiter|uranus': 'Wachstum trifft auf Wandel.',
    'jupiter|neptune': 'Wachstum trifft auf Ideale.',
    'jupiter|pluto': 'Wachstum trifft auf Wandlung.',
    'saturn|uranus': 'Halt trifft auf Freiheit.',
    'saturn|neptune': 'Halt trifft auf Träume.',
    'saturn|pluto': 'Halt trifft auf Umbruch.',
    'uranus|neptune': 'Neuerung trifft auf Sehnsucht.',
    'uranus|pluto': 'Umbruch trifft auf Wandlung.',
    'neptune|pluto': 'Sehnsucht trifft auf Tiefe.',
  };
  // FF = beide tragen, FH = eine trägt und eine fordert, HH = beide fordern; je drei Formulierungen
  const PAIR_CONT = {
    FF: ['Beides trägt dich – nutze es für etwas, das dir wichtig ist.', 'Beides unterstützt dich, und es lohnt sich, es zu nutzen.', 'Das arbeitet heute für dich.'],
    FH: ['Das Eine trägt, das Andere fordert – lass dich vom Tragenden halten.', 'Was drückt, wird von dem abgefedert, was hilft.', 'Dazwischen liegt dein Spielraum: Nutze ihn.'],
    HH: ['Beides fordert dich zugleich – wähle eines und lass den Rest ruhen.', 'Das ist doppelter Druck: Nimm Tempo raus.', 'Anstrengend, aber es zeigt dir, was wirklich zählt.'],
  };

  // ---------- Stufe 5: Muster ----------
  // {N} = Bereich des betroffenen Punkts (Nominativ)
  const PATTERNS = {
    brennpunkt_1h2f: ['{N} steht im Brennpunkt: Eine Seite drückt, zwei Seiten öffnen.', 'Bei {N} kommt heute alles zusammen: Ein Widerstand, aber zweimal Unterstützung.', 'Für {N} gilt: Ein Druck, dem gleich zwei Hilfen gegenüberstehen.'],
    brennpunkt_2h1f: ['{N} steht im Brennpunkt: Zwei Seiten drücken, eine öffnet.', 'Bei {N} kommt heute vieles zusammen: Zweimal Widerstand, aber eine Hilfe.', 'Für {N} gilt: Zwei Belastungen und eine Stütze.'],
    brennpunkt_3h: ['{N} steht im Brennpunkt: Von mehreren Seiten kommt Druck.', 'Bei {N} zieht sich heute alles zusammen, und nichts fängt es ab.', 'Für {N} gilt: Mehrere Belastungen ohne Ausgleich.'],
    brennpunkt_3f: ['{N} steht im Brennpunkt: Von mehreren Seiten kommt Unterstützung.', 'Bei {N} kommt heute vieles zusammen, und alles hilft.', 'Für {N} gilt: Mehrfacher Rückenwind.'],
    gegensatz_bruecke: ['Zwei Seiten in dir ziehen heute in verschiedene Richtungen, daneben gibt es auch Rückenwind.', 'Es gibt heute zwei Baustellen, aber auch etwas, das dich trägt.'],
    nur_rueckenwind: ['Heute gibt es kaum Widerstand: Vieles läuft dir zu.', 'Der Tag hat wenig Reibung und viel Unterstützung.'],
    nur_druck: ['Heute gibt es wenig Ausgleich: Du musst ihn dir selbst schaffen.', 'Der Tag hat viel Reibung und wenig Entlastung – sei nachsichtig mit dir.'],
  };

  // ---------- Hilfsfunktionen ----------
  const key = (a, b) => (PLANETS.indexOf(a) <= PLANETS.indexOf(b) ? `${a}|${b}` : `${b}|${a}`);
  const domainPlanet = (n) => DOMAIN_PLANET[n] || n;
  const fill = (tpl, n) => tpl.replace(/\{N\}/g, DOMAIN[n].N).replace(/\{A\}/g, DOMAIN[n].A);
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
