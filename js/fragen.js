/*
 * Leitfragen (360): für jeden laufenden Planeten (erste Ebene) und jeden Geburtspunkt (zweite Ebene)
 * drei Fragen: [leicht (Trigon/Sextil), angespannt (Quadrat/Opposition), verschmelzend (Konjunktion)].
 * Die Fragen sind von Hand geschrieben, im Klartext und ohne Fachbegriffe; die angespannten Fragen sind
 * meist zweiteilig (Schatten und Einladung).
 * Reihenfolge der Geburtspunkte: sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, asc, mc.
 */
(function (root) {
  'use strict';

  const Q = {
    moon: {
      sun: ['Was von dir darfst du heute zeigen, weil die Stimmung es trägt?', 'Wo spielst du eine Rolle, die dich Gefühl kostet? Was würde geschehen, wenn du sie ließest?', 'Was an dir wird sichtbar, wenn du es fühlen lässt, statt es zu erklären?'],
      moon: ['Was brauchst du gerade, und wem kannst du es sagen?', 'Welches Bedürfnis hast du zurückgehalten, damit sich niemand ärgert?', 'Was fühlst du, wenn du nichts erklären musst?'],
      mercury: ['Was würdest du sagen, wenn du sicher wärst, dass man dir zuhört?', 'Welches Gefühl hast du in Worte gepackt, die es kleiner machen? Wie klänge der ungeschminkte Satz?', 'Was sagt dir dein Gefühl, wenn du nicht darüber nachdenkst?'],
      venus: ['Von wem möchtest du gerade Nähe annehmen, ohne etwas dafür zu tun?', 'Wonach sehnst du dich, und wovor schützt du dich, wenn es näher kommt?', 'Was bedeutet Nähe für dich, wenn niemand etwas von dir will?'],
      mars: ['Wofür lohnt es sich gerade, deinem Gefühl zu folgen und loszugehen?', 'Was verteidigst du gerade so heftig? Was wolltest du eigentlich schützen?', 'Was will aus dir heraus, das du bisher heruntergeschluckt hast?'],
      jupiter: ['Was traust du dir zu, wenn du dich gerade sicher fühlst?', 'Wo erwartest du von einem Gefühl mehr, als es halten kann? Was wäre genug?', 'Was tut dir wirklich gut, und wo ist es genug?'],
      saturn: ['Was gibt dir Halt, wenn du dich auf dich selbst verlässt?', 'Welches Gefühl hältst du aus Pflicht klein? Wem nützt das?', 'Was brauchst du, um dich auch dann sicher zu fühlen, wenn dich niemand lobt?'],
      uranus: ['Was würdest du spontan tun, wenn du dich nicht erklären müsstest?', 'Wovor läufst du gerade weg? Wie fühlte es sich an, stehen zu bleiben?', 'Was in dir will sich ändern, obwohl du es noch nicht benennen kannst?'],
      neptune: ['Was hilft dir, dich so anzunehmen, wie du gerade bist – Ruhe, Musik, ein Mensch?', 'Wessen Gefühle trägst du, die nicht deine sind? Was davon darfst du zurückgeben?', 'Wonach sehnst du dich, wenn es ganz still wird?'],
      pluto: ['Welches alte Gefühl darfst du heute ansehen, ohne dass es dich überrollt?', 'Was in dir hat Angst, verletzt zu werden? Was hält es deshalb unter Verschluss?', 'Was liegt unter der Oberfläche und wartet darauf, gesehen zu werden?'],
      asc: ['Wie darfst du heute wirken, wenn du dich nicht verstellst?', 'Was zeigst du nach außen, während innen etwas ganz anderes los ist?', 'Wie sehen andere, wie es dir geht, und wie ist das für dich?'],
      mc: ['Was gelingt dir im Beruf leichter, wenn du auf dein Gefühl hörst?', 'Wo funktionierst du im Beruf, obwohl es dich innerlich woanders hinzieht?', 'Was bedeutet dir deine Arbeit gefühlsmäßig, jenseits von Anerkennung?'],
    },
    sun: {
      sun: ['Wofür hast du heute Kraft, wenn du dir nichts beweisen musst?', 'An wessen Maßstab misst du dich gerade? Was wäre dein eigener?', 'Was ist dir an dir selbst wirklich wichtig?'],
      moon: ['Was weißt du heute klar über das, was du brauchst?', 'Was willst du, und was fühlst du? Wo hältst du eines davon zurück?', 'Wie fühlt es sich an, wenn Kopf und Herz einmal dasselbe sagen?'],
      mercury: ['Was möchtest du klar aussprechen, weil du es heute kannst?', 'Wo redest du dich in eine Sicht hinein, die du kaum noch prüfst?', 'Woran denkst du immer wieder, und was hat es mit dir zu tun?'],
      venus: ['Was in dir darf heute gemocht werden, so wie es ist?', 'Wo gefällst du, statt zu zeigen, was du willst? Was kostet dich das?', 'Was schätzt du an dir, das du selten zeigst?'],
      mars: ['Wofür setzt du dich heute ein, weil es dir wichtig ist?', 'Wo kämpfst du um Recht, statt um das, was dir wichtig ist?', 'Was willst du wirklich, und wofür würdest du einstehen?'],
      jupiter: ['Was würdest du wagen, wenn du dir heute vertraust?', 'Wo hältst du dich für größer oder kleiner, als du gerade bist?', 'Was gibt dir Zuversicht, ohne dass du dir etwas vormachen musst?'],
      saturn: ['Welche Verantwortung trägst du gern, weil sie zu dir passt?', 'Welche Pflicht hältst du für deine, obwohl sie es vielleicht nicht ist?', 'Was trägt dich, wenn du ehrlich zu dir bist?'],
      uranus: ['Was möchtest du an dir anders zeigen als bisher?', 'Wovon möchtest du dich befreien, und was hält dich davon ab?', 'Was in dir will sich neu erfinden, und was davon ist schon lange da?'],
      neptune: ['Wovon träumst du, und was wäre ein erster kleiner Schritt?', 'Wo weißt du gerade nicht mehr, wer du bist? Was wäre ein fester Punkt?', 'Wonach sehnst du dich, wenn niemand zuschaut?'],
      pluto: ['Was darfst du an dir loslassen, weil es dir nicht mehr dient?', 'Was verbirgst du, weil du fürchtest, Macht zu verlieren, wenn du dich zeigst?', 'Was will sich in dir grundlegend wandeln?'],
      asc: ['Wie möchtest du heute wirken, und wie fühlt sich das an?', 'Wer möchtest du sein, und wer erlaubt dir andere zu sehen?', 'Wie kommst du bei anderen an, wenn du einfach du bist?'],
      mc: ['Wohin soll dein Weg gehen, wenn du dir nichts beweisen musst?', 'Was erwartest du von dir beruflich? Woher kommt diese Erwartung?', 'Was möchtest du in der Welt sichtbar machen?'],
    },
    mercury: {
      sun: ['Was möchtest du über dich sagen, das du bisher für dich behalten hast?', 'Was denkst du über dich, das dich klein hält? Stimmt es?', 'Wie beschreibst du dich, wenn du dich selbst fragst?'],
      moon: ['Was hilft dir, deine Gefühle in Worte zu fassen?', 'Was denkst du über dein Gefühl, statt es zu spüren? Was würde es dir sagen?', 'Welches Gefühl fragt gerade nach einem Wort?'],
      mercury: ['Was möchtest du klären, und mit wem?', 'Welcher Gedanke kreist, ohne dich weiterzubringen? Was wäre die Frage darunter?', 'Welcher Gedanke kreist, und was will er dir sagen?'],
      venus: ['Welches freundliche Wort hast du lange aufgeschoben?', 'Was sagst du nicht, weil es die Nähe stören könnte? Was kostet dich das Schweigen?', 'Was ist dir in Beziehungen wichtig genug, es auszusprechen?'],
      mars: ['Was möchtest du klar und direkt sagen, ohne zu verletzen?', 'Worüber ärgerst du dich im Stillen? Wie klänge es ohne Vorwurf?', 'Was willst du, und wie sagst du es so, dass man es hört?'],
      jupiter: ['Welche Idee verdient heute einen konkreten ersten Schritt?', 'Wo planst du größer, als du es prüfen kannst? Was wäre ein kleiner Test?', 'Woran glaubst du, und wofür fehlen dir noch die Belege?'],
      saturn: ['Wo hilft dir heute Genauigkeit, dich sicher zu fühlen?', 'Welche innere Stimme kritisiert zuerst, was nicht klappt? Wessen Stimme ist das?', 'Was denkst du ernsthaft, wenn du dich nicht rechtfertigen musst?'],
      uranus: ['Welche unerwartete Idee würdest du aufschreiben, bevor du sie verwirfst?', 'Welchen Gedanken schiebst du weg, weil er unbequem wäre? Was würde er verändern?', 'Welche neue Sicht auf etwas Altes zeigt sich gerade?'],
      neptune: ['Was ahnst du, das du noch nicht beweisen kannst?', 'Wo vermeidest du eine klare Antwort? Was möchtest du nicht genau wissen?', 'Wonach fragt dein Gefühl, ohne dass du es benennen kannst?'],
      pluto: ['Welche Frage traust du dich heute zu stellen, die tiefer geht?', 'Was denkst du und sprichst es aus Angst vor den Folgen nicht aus?', 'Was willst du wirklich wissen, auch wenn die Antwort weh tun könnte?'],
      asc: ['Wie klingst du, wenn du sagst, was du wirklich meinst?', 'Was sagst du nach außen, und was denkst du wirklich?', 'Wie sprichst du, wenn du dich sicher fühlst?'],
      mc: ['Welche Idee für deinen Weg möchtest du heute festhalten?', 'Was sagst du im Beruf nicht, obwohl es dir wichtig ist?', 'Was möchtest du beruflich klarstellen?'],
    },
    venus: {
      sun: ['Was von dir möchte heute gemocht werden, so wie es ist?', 'Wo passt du dich an, um geliebt zu werden? Was bleibt dabei unsichtbar?', 'Wie fühlt es sich an, wenn du dir selbst Zuneigung gibst?'],
      moon: ['Von wem möchtest du gerade Zuwendung annehmen?', 'Wo suchst du Zuwendung, und wo erwartest du, dass andere deine Bedürfnisse erraten?', 'Was gibt dir Geborgenheit, ohne dass du etwas leisten musst?'],
      mercury: ['Welches freundliche Wort möchtest du sagen, und zu wem?', 'Was sagst du nicht, weil du den Frieden nicht stören willst? Wem nützt das Schweigen?', 'Was ist dir in Gesprächen mit Nahestehenden wichtig?'],
      venus: ['Wo darfst du dir Gutes gönnen, ohne Gegenleistung?', 'Was erwartest du von anderen, ohne es auszusprechen?', 'Was ist dir in Beziehungen wirklich wichtig?'],
      mars: ['Was möchtest du für dich und für andere tun, das Freude macht?', 'Wo wünschst du Nähe und gehst dennoch auf Abstand? Wie fühlt sich jede Seite an?', 'Was begehrst du, und traust du dich, es zu sagen?'],
      jupiter: ['Was würdest du genießen, wenn du kein schlechtes Gewissen hättest?', 'Wo gibst du zu viel oder erwartest zu viel? Was wäre ein fairer Ausgleich?', 'Was ist dir genug, und woran merkst du es?'],
      saturn: ['Was macht eine Beziehung für dich verlässlich?', 'Wo hältst du aus Pflicht an etwas fest, das keine Nähe mehr schenkt?', 'Was trägt eine Bindung, wenn keine Gefühle da sind?'],
      uranus: ['Was macht Nähe leichter, wenn du Freiraum hast?', 'Wo brauchst du mehr Freiheit, und wo hast du Angst, jemanden zu verlieren?', 'Welche Art von Nähe passt zu dir, auch wenn sie ungewöhnlich ist?'],
      neptune: ['Was würdest du in einer Beziehung idealisieren, und was ist wirklich da?', 'Wo siehst du bei jemandem, was du dir wünschst, statt was ist?', 'Wonach sehnst du dich in der Liebe, das kein Mensch erfüllen kann?'],
      pluto: ['Wo darfst du Nähe zulassen, ohne die Kontrolle abzugeben?', 'Was hindert dich, jemanden ganz nah zu lassen? Wovor hast du Angst?', 'Was ist dir an Bindung so wichtig, dass es Angst macht?'],
      asc: ['Wie zeigst du Zuneigung, wenn du dich nicht verstellst?', 'Wie möchtest du gefallen? Was kostet dich das?', 'Was an deinem Auftreten wirkt anziehend, ohne dass du dich anstrengst?'],
      mc: ['Welche Arbeit macht dir Freude und Sinn zugleich?', 'Wo nimmst du beruflich Rücksicht, ohne dass es gesehen wird?', 'Was ist dir an deiner Arbeit wichtiger als Erfolg?'],
    },
    mars: {
      sun: ['Wofür setzt du dich heute mit Überzeugung ein?', 'Wo kämpfst du, um zu gewinnen, statt um dir treu zu bleiben?', 'Was willst du wirklich, und wofür stehst du ein?'],
      moon: ['Welches Bedürfnis darfst du heute mit Kraft vertreten?', 'Worüber bist du wütend, ohne es zuzugeben? Was steckt darunter?', 'Was will aus dir heraus, das du zurückgehalten hast?'],
      mercury: ['Was sagst du heute klar und mutig, ohne zu verletzen?', 'Wo reagierst du scharf, weil dich etwas getroffen hat? Was war es?', 'Was willst du sagen und brauchst dafür nur einen ersten Satz?'],
      venus: ['Was tust du heute, das dir und einem anderen Freude macht?', 'Wonach verlangst du, und wo hältst du dich zurück, weil du nicht abgelehnt werden willst?', 'Was begehrst du, und wie zeigst du es?'],
      mars: ['Wofür lohnt sich deine Kraft?', 'Worüber bist du wütend, ohne es zuzugeben?', 'Was willst du wirklich – und traust du dich, dafür einzustehen?'],
      jupiter: ['Welches große Ziel bekommt heute einen konkreten ersten Schritt?', 'Wo nimmst du dir zu viel vor? Was wäre ein realistischer Anfang?', 'Woran glaubst du so sehr, dass du dafür handeln würdest?'],
      saturn: ['Wofür hast du Ausdauer, wenn du es wirklich willst?', 'Wo bremst du dich aus Angst, Fehler zu machen? Wer würde dich bremsen?', 'Was willst du durchhalten, auch wenn es zäh wird?'],
      uranus: ['Welchen Schritt würdest du gehen, wenn du dich nicht erklären müsstest?', 'Wovon möchtest du dich losreißen, und wer merkt es zuerst?', 'Wo hast du genug von Gewohntem und willst etwas anderes?'],
      neptune: ['Wofür lohnt es sich, Kraft zu geben, auch ohne zu wissen, wohin es führt?', 'Wo verlierst du Energie an Dinge, die keinen klaren Zweck haben?', 'Wofür brennst du, auch wenn du es kaum benennen kannst?'],
      pluto: ['Welche Kraft in dir darf heute wirken, ohne zu zerstören?', 'Wo hältst du fest, um nicht die Kontrolle zu verlieren? Was würde geschehen, wenn du losließest?', 'Was in dir will mit ganzer Macht heraus?'],
      asc: ['Wie zeigst du deine Stärke, ohne andere zu verletzen?', 'Wo trittst du härter auf, als du dich fühlst?', 'Wie wirkt es, wenn du direkt sagst, was du willst?'],
      mc: ['Was willst du beruflich durchsetzen, weil es dir wichtig ist?', 'Wo kämpfst du im Beruf gegen Widerstand, der dich Kraft kostet?', 'Wofür möchtest du in deiner Arbeit einstehen?'],
    },
    jupiter: {
      sun: ['Wofür darfst du dir heute mehr zutrauen?', 'Wo hältst du dich für größer, als du gerade bist – oder für kleiner?', 'Wofür bist du dankbar an dir selbst?'],
      moon: ['Was gibt dir Geborgenheit und Zuversicht zugleich?', 'Wo erwartest du von einem Gefühl mehr, als es tragen kann?', 'Was nährt dein Gefühl wirklich, und woran merkst du, dass es genug ist?'],
      mercury: ['Welche Idee möchte wachsen, und was ist ihr erster Schritt?', 'Wo planst du größer, als du prüfen kannst?', 'Woran glaubst du gerade, und wofür fehlen dir noch die Belege?'],
      venus: ['Was darfst du heute genießen, ohne dass du es verdienen musst?', 'Wo gibst du zu viel, weil du Nähe erkaufen willst?', 'Was macht dich in Beziehungen großzügig, ohne dass es dich auslaugt?'],
      mars: ['Welchem Ziel gibst du heute deine Kraft?', 'Wo nimmst du dir mehr vor, als in einen Tag passt?', 'Wofür wagst du den ersten Schritt, auch wenn du nicht sicher bist?'],
      jupiter: ['Was würdest du wagen, wenn es gelingen dürfte?', 'Wo versprichst du dir mehr, als du selbst gibst?', 'Worauf hoffst du wirklich?'],
      saturn: ['Was wächst, wenn du dir Zeit lässt?', 'Wo stehen Hoffnung und Realität gegeneinander? Was wäre ein Schritt dazwischen?', 'Welche Hoffnung ist stark genug, um Geduld zu tragen?'],
      uranus: ['Welche Chance ergreifst du, wenn du sie heute siehst?', 'Wo lockt dich das Neue, obwohl das Alte noch trägt?', 'Was wäre ein Aufbruch, der zu dir passt?'],
      neptune: ['Was inspiriert dich, ohne dass du es begründen musst?', 'Wo hoffst du auf ein Wunder, statt einen Schritt zu tun?', 'Was gibt deiner Sehnsucht ein Ziel?'],
      pluto: ['Was darfst du wachsen lassen, indem du etwas Altes gehen lässt?', 'Wo wächst du über Grenzen hinaus, die gar nicht deine sind?', 'Welche Erweiterung kostet dich etwas Altes, und ist es das wert?'],
      asc: ['Wie möchtest du heute wirken, wenn du dir vertraust?', 'Wo wirkst du zuversichtlicher, als du dich fühlst?', 'Was macht dich in deiner Ausstrahlung freigiebig?'],
      mc: ['Welche berufliche Chance verdient heute deine Aufmerksamkeit?', 'Wo versprichst du dir von deiner Arbeit mehr, als sie geben kann?', 'Wohin willst du beruflich wachsen?'],
    },
    saturn: {
      sun: ['Was gibt dir Halt, wenn du dir treu bleibst?', 'Wo bremst du dich aus, weil du fürchtest, nicht zu genügen?', 'Was macht dich verlässlich, ohne dass du hart zu dir sein musst?'],
      moon: ['Was gibt dir emotional Halt, ohne dich einzuengen?', 'Welches Gefühl hältst du klein, weil du stark sein willst? Was fehlt dir dadurch?', 'Was brauchst du, um dich sicher zu fühlen?'],
      mercury: ['Wo hilft dir Genauigkeit, dich sicher zu fühlen?', 'Welche innere Stimme sieht zuerst, was nicht klappt? Wem gehört sie?', 'Was denkst du, wenn du ehrlich mit dir bist?'],
      venus: ['Wo darfst du dich in einer Beziehung darauf verlassen, dass es hält?', 'Wo hältst du an etwas fest, das keine Nähe mehr schenkt?', 'Was trägt eine Bindung, wenn es schwierig wird?'],
      mars: ['Wofür bist du bereit dranzubleiben, auch wenn es Zeit braucht?', 'Wo gibst du auf, bevor du es versucht hast? Wer hat dir das beigebracht?', 'Wie viel Kraft steckt in deiner Geduld?'],
      jupiter: ['Was darf wachsen, wenn du ihm Struktur gibst?', 'Wo stoßen deine Hoffnungen an Grenzen? Was wäre ein Schritt dazwischen?', 'Welche Hoffnung trägt Geduld?'],
      saturn: ['Welche Verantwortung trägst du gern?', 'Welche Pflicht trägst du, die nicht deine ist?', 'Wofür bist du bereit, Verantwortung zu übernehmen, auch wenn niemand hinsieht?'],
      uranus: ['Was bleibt verlässlich, wenn du dich veränderst?', 'Wo hält dich Sicherheit fest, obwohl du gehen möchtest?', 'Was braucht ein Gerüst, damit Freiheit möglich wird?'],
      neptune: ['Wie gibst du einem Traum eine erste Form?', 'Wo verfliegen deine Ideale, weil sie keine Form haben? Was wäre ein erster fester Schritt?', 'Wie viel Wirklichkeit verträgt dein Traum?'],
      pluto: ['Was ist stabil genug, um dich durch Veränderung zu tragen?', 'Wo hältst du an Kontrolle fest, weil du Angst hast, alles zu verlieren?', 'Was muss enden, damit etwas Neues Halt hat?'],
      asc: ['Wie wirkst du, wenn du dich sicher fühlst?', 'Wo zeigst du Härte, um nicht verletzt zu werden?', 'Wie wirkst du auf andere, wenn du ernst bist?'],
      mc: ['Was hast du beruflich aufgebaut, worauf du stolz sein darfst?', 'Wo hältst du beruflich Erwartungen aus, die nicht deine sind?', 'Was ist dir an deinem Weg wirklich wichtig?'],
    },
    uranus: {
      sun: ['Welche Seite von dir will endlich frische Luft?', 'Wo passt du dich an, obwohl du eigentlich ausbrechen willst?', 'Wer bist du, wenn du keine Erwartungen erfüllst?'],
      moon: ['Welche kleine Veränderung würde deinem Gefühlsleben gerade guttun?', 'Was in deinem Gefühlsleben ist ins Wanken geraten? Was sagt es dir, wenn du zuhörst?', 'Welches Gefühl braucht gerade mehr Raum?'],
      mercury: ['Welche neue Idee möchte heute aufgeschrieben werden?', 'Welchen Gedanken schiebst du weg, weil er unbequem wäre?', 'Wie sähe eine ganz andere Sicht auf dein Thema aus?'],
      venus: ['Was macht Nähe leichter, wenn sie Raum hat?', 'Wo fühlst du dich in einer Beziehung eingeengt? Wo fürchtest du, allein zu bleiben, wenn du gehst?', 'Was an deiner Art zu lieben ist anders, als man es erwartet?'],
      mars: ['Welchen ungewohnten Schritt würdest du heute gehen?', 'Was hält dich fest, obwohl du längst losstürmen willst?', 'Welchen Impuls hast du bisher unterdrückt? Was passiert, wenn du ihm folgst?'],
      jupiter: ['Welche Möglichkeit hast du bisher übersehen?', 'Welche Möglichkeit reizt dich, obwohl du das Bestehende nicht verlieren willst?', 'Welchen Sprung wagst du, wenn du dem Neuen vertraust?'],
      saturn: ['Welche Regel darfst du erneuern, ohne dich zu verlieren?', 'Welche Ordnung bricht gerade auf? Was gibt dir dabei Halt?', 'Was an deinen Pflichten ist überholt, und was gilt noch?'],
      uranus: ['Was möchtest du anders machen als bisher?', 'Wovon möchtest du dich befreien, und was hält dich?', 'Was fühlt sich gerade eng an?'],
      neptune: ['Welche Sehnsucht darf heute in Bewegung kommen?', 'Wonach sehnst du dich, während du dich gleichzeitig nicht traust, es zu verändern?', 'Wovon träumst du, das sich verändern will?'],
      pluto: ['Was darf sich verändern, weil es dich nicht mehr trägt?', 'Was in dir will sich verändern, und was in dir hat Angst davor?', 'Welcher Umbruch ist in dir schon geschehen, ohne dass es jemand gemerkt hat?'],
      asc: ['Wie zeigst du dich heute anders als sonst?', 'Wo erwartest du von dir, dass du bleibst, wie du bist? Wer erwartet das noch?', 'Welche Seite von dir überrascht andere?'],
      mc: ['Welchen neuen Weg würdest du beruflich ausprobieren?', 'Wo fühlst du dich beruflich eingesperrt? Was würdest du ändern, wenn du dürftest?', 'Was möchtest du in deiner Arbeit anders machen als alle anderen?'],
    },
    neptune: {
      sun: ['Was würdest du träumen, wenn du dir erlaubtest, es ernst zu nehmen?', 'Wo weißt du gerade nicht, wer du bist? Was wäre ein fester Punkt?', 'Wer bist du jenseits aller Rollen?'],
      moon: ['Was beruhigt dich, ohne dass du es erklären musst?', 'Wessen Gefühle trägst du, die nicht deine sind?', 'Wonach sehnst du dich, wenn es still wird?'],
      mercury: ['Welcher Ahnung darfst du heute einmal folgen?', 'Wo bleibst du im Gespräch vage, um niemandem zu widersprechen?', 'Was liegt dir auf der Zunge, das du noch nicht formulieren kannst?'],
      venus: ['Was ist schön an dem, was ist – ohne es zu verklären?', 'Wo liebst du eine Vorstellung von jemandem statt den Menschen?', 'Was suchst du in der Liebe, das größer ist als ein einzelner Mensch?'],
      mars: ['Wofür würdest du Kraft geben, auch ohne genau zu wissen, wohin es führt?', 'Wo verlierst du Energie an Dinge ohne klaren Zweck?', 'Wofür würdest du kämpfen, ohne genau zu wissen, warum?'],
      jupiter: ['Welcher Glaube trägt dich, ohne dass du ihn beweisen musst?', 'Woran glaubst du, ohne zu prüfen, ob es hält?', 'Welches große Bild von deinem Leben trägt dich?'],
      saturn: ['Was in deiner Verantwortung darfst du mit Hingabe tun?', 'Wo verfliegen deine Ideale, weil sie keine Form haben?', 'Wo bleibst du realistisch, und wo darf ein Ideal bleiben?'],
      uranus: ['Wohin darf deine Sehnsucht dich in Bewegung bringen?', 'Wonach sehnst du dich, während du dich nicht traust, es zu verändern?', 'Welcher Traum verlangt nach einer Veränderung?'],
      neptune: ['Welchen Traum würdest du gern in die Wirklichkeit holen?', 'Was möchtest du nicht genau ansehen?', 'Wonach sehnst du dich, ohne es zu benennen?'],
      pluto: ['Was darfst du loslassen, ohne dass du dich verlierst?', 'Wo verlierst du dich in etwas, um nicht fühlen zu müssen, was darunter liegt?', 'Was löst sich in dir auf, und was bleibt?'],
      asc: ['Wie wirkst du, wenn du dich ganz durchlässig zeigst?', 'Wo weißt du nicht mehr, was von dir und was von anderen ist?', 'Wie erlebst du dich, wenn die Grenzen weicher werden?'],
      mc: ['Welcher Traum von deiner Arbeit ist noch nicht ausgesprochen?', 'Wo ist dir beruflich unklar, was du eigentlich willst?', 'Wofür würdest du arbeiten, auch wenn es niemand sieht?'],
    },
    pluto: {
      sun: ['Welche alte Rolle darfst du heute ablegen?', 'Was zeigst du nicht, weil du fürchtest, dass man es gegen dich verwenden könnte?', 'Welche Seite von dir wandelt sich gerade, auch wenn du es noch nicht willst?'],
      moon: ['Welches alte Gefühl darfst du ansehen, ohne dass es dich überrollt?', 'Welches Bedürfnis hast du lange zurückgehalten, weil du fürchtest, verletzt zu werden?', 'Welche alte Verletzung meldet sich gerade, und was möchte sie dir zeigen?'],
      mercury: ['Welche tiefe Frage darfst du heute stellen?', 'Welche Wahrheit denkst du schon lange, ohne sie auszusprechen? Was würde sich ändern?', 'Was willst du wirklich wissen, auch wenn die Antwort weh tut?'],
      venus: ['Wie viel Nähe darfst du heute zulassen, ohne dich aufzugeben?', 'Wovor schützt du dich, wenn dir jemand zu nah kommt? Wer hat dich das gelehrt?', 'Welche Bindung berührt dich so tief, dass sie dich verändert?'],
      mars: ['Welche Kraft in dir darf wirken, ohne zu zerstören?', 'Wo hältst du fest, um nicht die Kontrolle zu verlieren? Was geschähe, wenn du losließest?', 'Was will mit ganzer Macht aus dir heraus?'],
      jupiter: ['Was darf wachsen, indem du etwas Altes gehen lässt?', 'Wo wächst du über Grenzen, die gar nicht deine sind?', 'Was musst du hinter dir lassen, um wirklich zu wachsen?'],
      saturn: ['Welche Struktur in deinem Leben hält auch bei Umbruch?', 'Welche Kontrolle über deine Pflichten hältst du fest, weil du das Chaos fürchtest?', 'Welche Grenze hat sich überlebt?'],
      uranus: ['Welche überholte Gewohnheit darfst du jetzt hinter dir lassen?', 'Wo drängt dein Freiheitsdrang, und was in dir bremst aus Angst?', 'Was in dir ist schon ein anderes geworden, ohne dass jemand es weiß?'],
      neptune: ['Was darfst du loslassen, ohne dich zu verlieren?', 'Wo verlierst du dich, um nicht zu fühlen, was darunter liegt?', 'Was verschwimmt in dir, und was wird dadurch klarer?'],
      pluto: ['Was darfst du loslassen, weil du es nicht mehr brauchst?', 'Was kontrollierst du, weil du Angst hast, es zu verlieren?', 'Was will sich in dir wandeln?'],
      asc: ['Welche Rolle darfst du ablegen, ohne dich zu verlieren?', 'Wo zeigst du Stärke, um nicht angreifbar zu sein? Was schützt du dahinter?', 'Wie verändert sich, wie andere dich erleben?'],
      mc: ['Welche berufliche Rolle hat sich überlebt?', 'Wo hältst du an Einfluss fest, weil du fürchtest, ohne ihn nichts zu sein?', 'Was will sich in deinem Weg grundlegend erneuern?'],
    },
  };

  const INDEX = { F: 0, H: 1, V: 2 };
  // tone: 'F' (Trigon/Sextil), 'H' (Quadrat/Opposition), 'V' (Konjunktion)
  function questionFor(transit, natal, tone) {
    return Q[transit][natal][INDEX[tone]];
  }

  const api = { QUESTIONS: Q, questionFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Fragen = api;
})(typeof window !== 'undefined' ? window : globalThis);
