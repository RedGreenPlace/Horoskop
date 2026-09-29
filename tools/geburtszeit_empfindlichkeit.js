// Wie stark hängt die Tagesdeutung an der Geburtszeit? Vergleicht 90 Tage mit verschobener Geburtszeit.
// Aufruf: node tools/geburtszeit_empfindlichkeit.js [lat lon zone JJJJ-MM-TT HH:MM]
const A = require('../js/astro.js');
const I = require('../js/interpret.js');
const [lat = 51.5364, lon = 7.2228, zone = 'Europe/Berlin', date = '1996-03-02', time = '03:15'] = process.argv.slice(2);
const base = (() => { // Ortszeit -> UTC über Intl
  const [y, m, d] = date.split('-').map(Number); const [h, mi] = time.split(':').map(Number);
  let t = Date.UTC(y, m - 1, d, h, mi);
  const off = (ms) => { const p = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date(ms)).reduce((o, x) => (o[x.type] = +x.value, o), {}); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - ms; };
  return new Date(t - off(t - off(t)));
})();
const chart = (shift) => A.natalChart(new Date(base.getTime() + shift * 60000), +lat, +lon, true);
const day = (natal, i) => {
  const w = new Date(Date.UTC(2026, 8, 1 + i, 17, 0));
  const h = I.dailyHoroscope(natal, A.planetPositions(w), `s${i}`, { when: w, timeZone: zone });
  const a = h.aspects.slice(0, 8).map((x) => `${x.transit}>${x.natal}>${x.aspect.key}`);
  return { text: h.plain.text.split('\n\n')[0], top: a, lead: a[0], set: new Set(a), head: h.plain.headline };
};
const N = 90;
const ref = []; const nat0 = chart(0);
for (let i = 0; i < N; i++) ref.push(day(nat0, i));
console.log(`Geburtszeit ${time} (${zone}); ${N} Tage; Anteil der Tage, an denen sich etwas ändert:`);
console.log('Verschiebung | erster Absatz | Überschrift | wichtigster Aspekt | Aspektliste (Jaccard-Mittel)');
[-60, -30, -15, -5, 5, 15, 30, 60].forEach((sh) => {
  const nat = chart(sh); let tx = 0, hd = 0, ld = 0, jac = 0;
  for (let i = 0; i < N; i++) {
    const d = day(nat, i), r = ref[i];
    if (d.text !== r.text) tx++; if (d.head !== r.head) hd++; if (d.lead !== r.lead) ld++;
    const inter = [...d.set].filter((x) => r.set.has(x)).length; jac += inter / (d.set.size + r.set.size - inter);
  }
  const pc = (x) => `${Math.round(100 * x / N)} %`.padStart(5);
  console.log(`${String(sh).padStart(4)} min     | ${pc(tx)}         | ${pc(hd)}       | ${pc(ld)}              | ${(jac / N).toFixed(2)}`);
});
