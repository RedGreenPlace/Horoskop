(function () {
  'use strict';
  const A = window.Astro;
  const I = window.Interpret;
  const $ = (id) => document.getElementById(id);
  const STORE = 'horoskop.profile.v1';

  // ---------- kleine DOM-Helfer (kein innerHTML, damit Ortsnamen nie als HTML gelten) ----------
  function el(tag, props, ...children) {
    const n = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => { if (k === 'class') n.className = v; else n.setAttribute(k, v); });
    children.flat().forEach((c) => n.append(c));
    return n;
  }
  const svgNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, text) {
    const n = document.createElementNS(svgNS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (text != null) n.textContent = text;
    return n;
  }

  // ---------- Zeitzonen ----------
  function tzOffsetMs(utcMs, tz) {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
    });
    const p = {};
    dtf.formatToParts(new Date(utcMs)).forEach((x) => { p[x.type] = +x.value; });
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(utcMs / 1000) * 1000;
  }
  // Ortszeit (Wanduhr) in der Zeitzone -> UTC-Date (berücksichtigt historische Sommerzeit)
  function localToUtc(y, mo, d, h, mi, tz) {
    const guess = Date.UTC(y, mo - 1, d, h, mi);
    const off1 = tzOffsetMs(guess, tz);
    let utc = guess - off1;
    const off2 = tzOffsetMs(utc, tz);
    if (off2 !== off1) utc = guess - off2;
    return new Date(utc);
  }

  // ---------- Ortssuche (Open-Meteo Geocoding, ohne API-Key) ----------
  let selected = null; // {name, lat, lon, tz}
  let searchTimer = null;
  let searchSeq = 0;

  function showSuggestions(list) {
    const ul = $('suggestions');
    ul.replaceChildren();
    if (!list.length) { ul.hidden = true; return; }
    list.forEach((r) => {
      const sub = [r.admin1, r.country].filter(Boolean).join(', ');
      const li = el('li', { role: 'option' }, r.name, ' ', el('small', {}, sub));
      li.addEventListener('mousedown', (e) => { e.preventDefault(); choosePlace(r); });
      ul.append(li);
    });
    ul.hidden = false;
  }

  function choosePlace(r) {
    const sub = [r.admin1, r.country].filter(Boolean).join(', ');
    selected = { name: r.name + (sub ? ', ' + sub : ''), lat: r.latitude, lon: r.longitude, tz: r.timezone };
    $('place').value = selected.name;
    $('lat').value = r.latitude.toFixed(4);
    $('lon').value = r.longitude.toFixed(4);
    $('tz').value = r.timezone || '';
    $('placeInfo').textContent = `${r.latitude.toFixed(2)}° N, ${r.longitude.toFixed(2)}° O · ${r.timezone || 'Zeitzone unbekannt'}`;
    $('suggestions').hidden = true;
  }

  async function searchPlaces(q) {
    const seq = ++searchSeq;
    try {
      const url = 'https://geocoding-api.open-meteo.com/v1/search?count=6&language=de&format=json&name=' + encodeURIComponent(q);
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (seq === searchSeq) showSuggestions(data.results || []);
      return data.results || [];
    } catch (e) {
      if (seq === searchSeq) {
        showSuggestions([]);
        $('placeInfo').textContent = 'Ortssuche nicht erreichbar – gib Koordinaten und Zeitzone unter „manuell“ ein.';
      }
      return [];
    }
  }

  $('place').addEventListener('input', () => {
    selected = null;
    clearTimeout(searchTimer);
    const q = $('place').value.trim();
    $('placeInfo').textContent = '';
    if (q.length < 2) { showSuggestions([]); return; }
    searchTimer = setTimeout(() => searchPlaces(q), 300);
  });
  $('place').addEventListener('blur', () => setTimeout(() => { $('suggestions').hidden = true; }, 150));
  $('unknownTime').addEventListener('change', () => { $('time').disabled = $('unknownTime').checked; });

  // ---------- Profil speichern ----------
  function saveProfile() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        name: $('name').value, date: $('date').value, time: $('time').value,
        unknownTime: $('unknownTime').checked, place: $('place').value,
        lat: $('lat').value, lon: $('lon').value, tz: $('tz').value,
      }));
    } catch (e) { /* Speicher evtl. gesperrt – App funktioniert trotzdem */ }
  }
  function loadProfile() {
    try {
      const p = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!p) return false;
      $('name').value = p.name || ''; $('date').value = p.date || ''; $('time').value = p.time || '12:00';
      $('unknownTime').checked = !!p.unknownTime; $('time').disabled = !!p.unknownTime;
      $('place').value = p.place || ''; $('lat').value = p.lat || ''; $('lon').value = p.lon || ''; $('tz').value = p.tz || '';
      if (p.lat && p.lon && p.tz) {
        selected = { name: p.place, lat: +p.lat, lon: +p.lon, tz: p.tz };
        $('placeInfo').textContent = `${(+p.lat).toFixed(2)}° N, ${(+p.lon).toFixed(2)}° O · ${p.tz}`;
      }
      return !!(p.date && p.lat && p.lon && p.tz);
    } catch (e) { return false; }
  }

  // ---------- Hilfsfunktionen ----------
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = () => { const t = new Date(); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; };
  function stars(n) {
    return el('span', { class: 'stars', 'aria-label': `${n} von 5 Sternen` },
      '★'.repeat(n), el('span', { class: 'off' }, '★'.repeat(5 - n)));
  }
  const glyph = (s) => s + '︎'; // Text- statt Emoji-Darstellung

  // Zeitpunkt, an dem der Mond am gewählten Tag das Zeichen wechselt (falls überhaupt)
  function moonIngress(dayStart, dayEnd) {
    const sign = (t) => A.signIndex(A.planetPositions(new Date(t)).moon.lon);
    const s0 = sign(dayStart.getTime());
    const s1 = sign(dayEnd.getTime());
    if (s0 === s1) return null;
    let lo = dayStart.getTime();
    let hi = dayEnd.getTime();
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (sign(mid) === s0) lo = mid; else hi = mid;
    }
    return { time: new Date(hi), sign: s1 };
  }

  // ---------- Horoskop-Rad ----------
  function spread(items, minGap) {
    const s = items.map((x) => ({ ...x, disp: x.lon })).sort((a, b) => a.disp - b.disp);
    for (let pass = 0; pass < 40; pass++) {
      let moved = false;
      for (let i = 0; i < s.length; i++) {
        const j = (i + 1) % s.length;
        let gap = A.norm(s[j].disp - s[i].disp);
        if (s.length > 1 && gap < minGap) {
          const push = (minGap - gap) / 2;
          s[i].disp = A.norm(s[i].disp - push);
          s[j].disp = A.norm(s[j].disp + push);
          moved = true;
        }
      }
      if (!moved) break;
    }
    return s;
  }

  function drawWheel(natal, transit) {
    const C = 230;
    const asc = natal.timeKnown ? natal.asc : 0;
    const ang = (lon) => ((180 + (lon - asc)) * Math.PI) / 180;
    const pt = (lon, r) => [C + r * Math.cos(ang(lon)), C - r * Math.sin(ang(lon))];
    const root = svg('svg', { viewBox: '0 0 460 460', role: 'img', 'aria-label': 'Horoskop-Rad mit Geburts- und Transitplaneten' });
    const stroke = 'rgba(255,255,255,.25)';
    [222, 186, 118].forEach((r) => root.append(svg('circle', { cx: C, cy: C, r, fill: 'none', stroke })));
    for (let i = 0; i < 12; i++) {
      const [x1, y1] = pt(i * 30, 186);
      const [x2, y2] = pt(i * 30, 222);
      root.append(svg('line', { x1, y1, x2, y2, stroke }));
      const [gx, gy] = pt(i * 30 + 15, 204);
      root.append(svg('text', { x: gx, y: gy, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#f5c56b', 'font-size': 16 }, glyph(A.SIGN_GLYPHS[i])));
    }
    if (natal.timeKnown) {
      for (const [lon, label] of [[natal.asc, 'AC'], [natal.mc, 'MC']]) {
        const [x1, y1] = pt(lon, 118);
        const [x2, y2] = pt(lon, 186);
        root.append(svg('line', { x1, y1, x2, y2, stroke: '#8f7cff', 'stroke-width': 2 }));
        const [tx, ty] = pt(lon, 100);
        root.append(svg('text', { x: tx, y: ty, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#8f7cff', 'font-size': 11 }, label));
      }
    }
    // r: Radius der Symbole, tick: [innen, außen] der kleinen Markierung am Ring
    const draw = (data, r, tick, color) => {
      spread(A.PLANETS.map((p) => ({ key: p, lon: data[p].lon })), 9).forEach((p) => {
        const [tx, ty] = pt(p.lon, tick[0]);
        const [ux, uy] = pt(p.lon, tick[1]);
        root.append(svg('line', { x1: tx, y1: ty, x2: ux, y2: uy, stroke: color, 'stroke-width': 1 }));
        const [x, y] = pt(p.disp, r);
        root.append(svg('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: color, 'font-size': 17 }, glyph(A.PLANET_GLYPHS[p.key])));
      });
    };
    draw(natal.planets, 96, [110, 118], '#ece9ff');
    draw(transit, 168, [180, 186], '#6fdca0');
    $('wheel').replaceChildren(root);
  }

  // ---------- Ausgabe ----------
  function render(ctx) {
    const { natal, transit, forDate, name } = ctx;
    const seed = `${ctx.birthKey}|${forDate}`;
    const h = I.dailyHoroscope(natal, transit, seed);

    const [y, m, d] = forDate.split('-').map(Number);
    const dayStart = new Date(y, m - 1, d, 0, 0);
    const dayEnd = new Date(y, m - 1, d + 1, 0, 0);
    $('dayLabel').textContent = (name ? name + ' · ' : '') + dayStart.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    $('headline').textContent = h.headline;

    let moonLine = `${h.moon.phase.icon} ${h.moon.phase.name} ${A.SIGNS_IN[h.moon.sign]} – ${h.moon.phase.text}`;
    const ing = moonIngress(dayStart, dayEnd);
    if (ing) moonLine += ` Um ${ing.time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr wechselt der Mond ${A.SIGNS_INTO[ing.sign]}.`;
    $('moonLine').textContent = moonLine;
    $('intro').textContent = h.intro;
    $('notes').textContent = h.notes.join(' ');
    $('notes').hidden = !h.notes.length;
    $('advice').textContent = h.advice;

    $('areas').replaceChildren(...h.areas.map((a) => el('div', { class: 'card' },
      el('h3', {}, el('span', {}, `${glyph(a.icon)} ${a.title}`), stars(a.stars)),
      el('p', {}, a.text),
      a.driver ? el('p', { class: 'driver' }, 'Auslöser: ' + a.driver) : '')));

    $('aspects').replaceChildren(...(h.aspects.length ? h.aspects.map((a) => el('li', {},
      el('span', { class: 't' }, a.title),
      el('span', { class: 'tag ' + a.tone }, a.aspect.name),
      el('span', { class: 'meta' }, `${a.orb.toFixed(1)}° · ${a.applying ? 'baut sich auf' : 'lässt nach'}`),
      el('p', {}, a.text),
      el('p', { class: 'detail' }, a.details.join(' ')))) : [el('li', {}, 'Heute gibt es keine engen Aspekte zu deinem Geburtshoroskop – ein ruhiger Tag.')]));

    $('profile').replaceChildren(...I.natalProfile(natal).map((l) => el('li', {},
      el('b', {}, `${l.label} ${A.SIGNS_IN[l.sign]}: `), l.text)));
    if (!natal.timeKnown) $('profile').append(el('li', { class: 'hint' }, 'Ohne Geburtszeit sind Aszendent, Häuser und Medium Coeli nicht berechenbar – die Deutung nutzt nur die Planeten.'));

    const rows = [el('tr', {}, el('th', {}, 'Planet'), el('th', {}, 'Position'), el('th', {}, natal.timeKnown ? 'Haus' : ''))];
    A.PLANETS.forEach((p) => {
      const pl = natal.planets[p];
      rows.push(el('tr', {}, el('td', {}, `${glyph(A.PLANET_GLYPHS[p])} ${A.PLANET_NAMES[p]}${pl.retro ? ' ℞' : ''}`), el('td', {}, A.formatLon(pl.lon)), el('td', {}, pl.house ? String(pl.house) : '')));
    });
    if (natal.timeKnown) {
      rows.push(el('tr', {}, el('td', {}, 'Aszendent'), el('td', {}, A.formatLon(natal.asc)), el('td', {}, '1')));
      rows.push(el('tr', {}, el('td', {}, 'Medium Coeli'), el('td', {}, A.formatLon(natal.mc)), el('td', {}, '')));
    }
    $('planetTable').replaceChildren(...rows);

    drawWheel(natal, transit);
    $('result').hidden = false;
  }

  // ---------- Ablauf ----------
  function showError(msg) { $('error').textContent = msg; $('error').hidden = !msg; }

  async function submit(e) {
    if (e) e.preventDefault();
    showError('');
    const btn = e && e.submitter;
    if (btn) btn.disabled = true;
    try {
      // Ort ggf. automatisch auflösen, falls nichts ausgewählt wurde
      let lat = parseFloat($('lat').value);
      let lon = parseFloat($('lon').value);
      let tz = $('tz').value.trim();
      if (!selected && $('place').value.trim() && (isNaN(lat) || isNaN(lon) || !tz)) {
        const res = await searchPlaces($('place').value.trim());
        if (res.length) { choosePlace(res[0]); }
      }
      if (selected) { lat = selected.lat; lon = selected.lon; tz = selected.tz || tz; }
      lat = parseFloat($('lat').value); lon = parseFloat($('lon').value); tz = $('tz').value.trim();
      if (isNaN(lat) || isNaN(lon) || !tz) throw new Error('Ort nicht gefunden. Wähle einen Vorschlag oder gib Koordinaten und Zeitzone manuell ein.');
      try { new Intl.DateTimeFormat('en', { timeZone: tz }); } catch (x) { throw new Error(`Unbekannte Zeitzone „${tz}“ (Beispiel: Europe/Berlin).`); }

      const dateVal = $('date').value;
      if (!dateVal) throw new Error('Bitte gib dein Geburtsdatum an.');
      const [by, bm, bd] = dateVal.split('-').map(Number);
      const timeKnown = !$('unknownTime').checked && !!$('time').value;
      const [bh, bmin] = timeKnown ? $('time').value.split(':').map(Number) : [12, 0];
      const birthUtc = localToUtc(by, bm, bd, bh, bmin, tz);

      const forDate = $('forDate').value || todayStr();
      const [fy, fm, fd] = forDate.split('-').map(Number);
      const noon = new Date(fy, fm - 1, fd, 12, 0);

      const natal = A.natalChart(birthUtc, lat, lon, timeKnown);
      const transit = A.planetPositions(noon);
      saveProfile();
      render({ natal, transit, forDate, name: $('name').value.trim(), birthKey: `${dateVal}${timeKnown ? $('time').value : ''}${lat.toFixed(2)}${lon.toFixed(2)}` });
      $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showError(err.message || String(err));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  $('form').addEventListener('submit', submit);
  $('forDate').value = todayStr();
  if (loadProfile()) submit(null);
})();
