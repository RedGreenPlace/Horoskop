#!/usr/bin/env node
/*
 * Liest eine LOKAL gespeicherte Ergebnisseite (HTML) oder eingefügten Text und schreibt die Links zu
 * Personenseiten der Astro-Databank untereinander. Das Skript ruft KEINE Webseite ab.
 *
 * So bekommst du die Datei: Suchergebnisse im Browser anzeigen lassen, dann
 *   - Rechtsklick > "Untersuchen" > oberstes <html>-Element > Rechtsklick > "Als HTML kopieren"
 *     (Chrome: "Copy > Copy outerHTML") und in eine Textdatei einfügen, oder
 *   - Strg+S > "Webseite, vollständig".
 * Aufruf: node tools/adb_links.js ergebnisse.html [ausgabe.txt]
 */
const fs = require('fs');
const [inFile, outFile = 'adb_links.txt'] = process.argv.slice(2);
if (!inFile) { console.error('Aufruf: node tools/adb_links.js <gespeicherte-datei> [ausgabe.txt]'); process.exit(1); }
const text = fs.readFileSync(inFile, 'utf8');

// Links auf Personen- bzw. Artikelseiten: .../astro-databank/Name,_Vorname (relative und absolute Links)
const found = new Set();
const re = /(?:https?:\/\/(?:www\.)?astro\.com)?\/astro-databank\/([^"'\s<>#?]+)/gi;
const SKIP = /^(Main_Page|Category:|Special:|Help:|Astro-Databank:|File:|Template:|Talk:|User|AstroWiki|Rodden_Rating|Wiki_Help)/i;
let m;
while ((m = re.exec(text))) {
  const name = decodeURIComponent(m[1]);
  if (SKIP.test(name) || !name.includes(',')) continue; // Personenseiten heißen "Nachname,_Vorname"
  found.add(`https://www.astro.com/astro-databank/${m[1]}`);
}
const links = [...found].sort();
fs.writeFileSync(outFile, links.join('\n') + (links.length ? '\n' : ''));
console.log(`${links.length} Links nach ${outFile} geschrieben.`);
if (!links.length) console.log('Keine Links gefunden. Wurde die Ergebnisliste vor dem Speichern angezeigt, und ist die Datei die ganze Seite?');
