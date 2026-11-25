import { useEffect, useRef, useCallback, useMemo } from 'react';
import { LibraryLayout } from '../library/LibraryLayout.jsx';
import { Ticker } from '../library/Ticker.jsx';
import {
  LIB, LIB_BY_ID, SHELVES, PHOTOS, MONTHS, DAYS, PETSA_MAP,
  HEART_SVG, ARROW_SVG, HEART_D,
  SERVER, MEMORY, PHOTO_API, CALAPI, DKEY, SKEY,
} from './libraryData.js';
import './LibraryPage.css';

const DAY_MS = 864e5;
const SVGNS = 'http://www.w3.org/2000/svg';

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function mk(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function txt(tag, cls, t) { const e = mk(tag, cls); e.textContent = t; return e; }
function isoOf(y, mo, d) { return y + '-' + pad(mo + 1) + '-' + pad(d); }
function todayIso() { const t = new Date(); return isoOf(t.getFullYear(), t.getMonth(), t.getDate()); }
function dateOf(iso) { return new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)); }
function daysTo(iso) { const t = new Date(), a = dateOf(iso), b = new Date(t.getFullYear(), t.getMonth(), t.getDate()); return Math.round((a - b) / DAY_MS); }
function cdWord(n) { return n === 0 ? 'NGAYON NA!' : n === 1 ? 'BUKAS NA!' : n + ' ARAW NA LANG'; }
function when(iso) { const d = dateOf(iso); return DAYS[d.getDay()] + ' · ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate(); }
function monthCells(y, mo) {
  const lead = new Date(y, mo, 1).getDay(), dim = new Date(y, mo + 1, 0).getDate(), cells = [];
  for (let i = 0; i < lead; i++) cells.push(0);
  for (let i = 1; i <= dim; i++) cells.push(i);
  while (cells.length % 7) cells.push(0);
  return cells;
}
function statusOf(x) { return x && (x.status === 'proposed' || x.status === 'cancelled') ? x.status : 'confirmed'; }
function isCancelled(x) { return statusOf(x) === 'cancelled'; }
function validEntry(x) { return x && typeof x === 'object' && typeof x.date === 'string'; }
function slotOf(x) { return x.date + '|' + String(x.place || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
function mergePair(a, b) {
  const win = (b.savedAt || 0) >= (a.savedAt || 0) ? b : a, lose = win === b ? a : b, gone = isCancelled(win);
  const out = Object.assign({}, win, { sent: gone ? !!win.sent : [a, b].some(e => e.sent && !isCancelled(e)) });
  if (!gone && !out.mem && lose.mem && !isCancelled(lose)) out.mem = lose.mem;
  return out;
}
function dedupeList(list) {
  const by = {}, order = [];
  list.forEach(x => { if (!validEntry(x)) return; const k = slotOf(x); if (by[k]) by[k] = mergePair(by[k], x); else { by[k] = x; order.push(k); } });
  return order.map(k => by[k]);
}
function mergeAll(lists) {
  const byIdm = {}, ids = [];
  lists.forEach(l => (Array.isArray(l) ? l : []).forEach(x => {
    if (!validEntry(x)) return;
    const k = x.id || slotOf(x);
    if (byIdm[k]) byIdm[k] = mergePair(byIdm[k], x); else { byIdm[k] = x; ids.push(k); }
  }));
  return dedupeList(ids.map(k => byIdm[k]));
}
function mapQ(x) {
  const place = String(x.place || '').trim();
  if (!place) return '';
  const area = String(x.area || '').split(/\s+or\s+/i)[0].trim();
  return [place, area, 'Philippines'].filter(Boolean).join(', ');
}
function mapUrl(x) { const q = mapQ(x); return q ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q) : ''; }
function dirUrl(x) { const q = mapQ(x); return q ? 'https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=' + encodeURIComponent(q) : ''; }
function statusText(x) {
  if (statusOf(x) === 'proposed') return 'PLANO NI CHICO · SAGUTIN SA DATE TAYO';
  if (x.by === 'chico') return 'NAKATAKDA NA';
  return x.sent ? 'NAIPADALA NA KAY CHICO' : 'NAKATAKDA';
}
function specialsFor(iso) {
  const y = +iso.slice(0, 4), m = +iso.slice(5, 7) - 1, d = +iso.slice(8, 10), out = [];
  if (y < 2026) return out;
  if (d === 6) {
    const n = (y - 2026) * 12 + (m - 7);
    if (n === 0) out.push({ kind: 'anniv', title: 'ANNIVERSARY NATIN', sub: 'ANG UNANG ARAW NATIN' });
    else if (n > 0 && n % 12 === 0) out.push({ kind: 'anniv', title: 'ANNIVERSARY NATIN', sub: (n / 12) + ' TAON NA TAYO' });
    else if (n > 0) out.push({ kind: 'ms', title: 'MONTHSARY NATIN', sub: n + ' BUWAN NA TAYO' });
  }
  if (m === 8 && d === 2) out.push({ kind: 'bday', title: 'BIRTHDAY MO, CHICA!', sub: 'IKA-' + (y - 2002) + ' NA TAON MO' });
  return out;
}
function upcomingSpecials(count) {
  const out = [], t = new Date();
  for (let i = 0; i < 400 && out.length < count; i++) {
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
    const iso = isoOf(d.getFullYear(), d.getMonth(), d.getDate());
    specialsFor(iso).forEach(sp => { if (out.length < count) out.push({ iso, ...sp }); });
  }
  return out;
}

function shrinkPhoto(file) {
  function draw(src, w, h) {
    const steps = [[1, 0.84], [1, 0.72], [0.8, 0.72], [0.64, 0.66], [0.5, 0.6]];
    let out = '';
    for (const [scale, quality] of steps) {
      const s = Math.min(1, 1280 / Math.max(w, h)) * scale;
      const cw = Math.max(1, Math.round(w * s)), ch = Math.max(1, Math.round(h * s));
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cw, ch); g.drawImage(src, 0, 0, cw, ch);
      out = cv.toDataURL('image/jpeg', quality);
      if (out.length <= 1100000) return out;
    }
    throw new Error('too big');
  }
  function viaImage() {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => { try { resolve(draw(im, im.naturalWidth, im.naturalHeight)); } catch (e) { reject(e); } URL.revokeObjectURL(url); };
      im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
      im.src = url;
    });
  }
  if (window.createImageBitmap) {
    return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(file)).then(bm => {
      const out = draw(bm, bm.width, bm.height);
      if (bm.close) bm.close();
      return out;
    }).catch(viaImage);
  }
  return viaImage();
}

export default function LibraryPage() {
  const reduce = useRef(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

  const caseRef = useRef(null);
  const noteRef = useRef(null);
  const readerRef = useRef(null);
  const bookRef = useRef(null);
  const mainRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);
  const countRef = useRef(null);
  const hintRef = useRef(null);
  const closeBtnRef = useRef(null);
  const rdTitleRef = useRef(null);
  const calWrapRef = useRef(null);
  const csBodyRef = useRef(null);
  const ddBodyRef = useRef(null);
  const pvImgRef = useRef(null);
  const pvTitleRef = useRef(null);
  const pvLineRef = useRef(null);
  const pvMetaRef = useRef(null);
  const calSheetRef = useRef(null);
  const dateSheetRef = useRef(null);
  const photoViewRef = useRef(null);
  const miniRef = useRef(null);

  const stateRef = useRef({
    cur: null, busy: 0, closing: false, panel: null,
    spines: {}, calAll: [], calSet: [], calMap: {}, calRaw: null, calHome: null, calViews: [], calRemote: [], calRemoteRaw: '',
    ac: null, pulling: false, lastPull: 0, healed: {}, PL: null, plP: null, ddToken: 0,
  });

  const tickerItems = useMemo(() => {
    const items = [];
    for (let r = 0; r < 3; r++) {
      items.push('LIBRARY NI CHICO', '<b>●</b>', 'PARA KAY CHICA', '<b>●</b>', "LAHAT NG GINAWA KO PARA SA'YO", '<b>●</b>');
    }
    return items;
  }, []);

  const totalPages = useMemo(() => LIB.reduce((n, b) => n + b.pages.length, 0), []);

  const initRef = useCallback(() => {
    const S = stateRef.current;
    S.calViews = [];
    try { const cached = JSON.parse(localStorage.getItem(SKEY) || '[]'); if (Array.isArray(cached)) { S.calRemote = cached; S.calRemoteRaw = JSON.stringify(cached); } } catch {}

    function rustle() {
      try { navigator.vibrate?.(8); } catch {}
      try {
        S.ac = S.ac || new (window.AudioContext || window.webkitAudioContext)();
        if (S.ac.state === 'suspended') S.ac.resume();
        const len = Math.floor(S.ac.sampleRate * 0.22), buf = S.ac.createBuffer(1, len, S.ac.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) { const e = Math.sin(Math.PI * i / len); d[i] = (Math.random() * 2 - 1) * e * e; }
        const s = S.ac.createBufferSource(); s.buffer = buf;
        const f = S.ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2300; f.Q.value = 0.7;
        const g = S.ac.createGain(); g.gain.value = 0.06;
        s.connect(f); f.connect(g); g.connect(S.ac.destination); s.start();
      } catch {}
    }

    const caseEl = caseRef.current, bookEl = bookRef.current;
    if (!caseEl || !bookEl) return () => {};
    caseEl.textContent = '';
    let idx = 0;
    SHELVES.forEach(list => {
      const shelf = mk('div', 'shelf'), row = mk('div', 'row');
      list.forEach(key => {
        const i = idx++;
        if (LIB_BY_ID[key]) {
          const b = LIB_BY_ID[key];
          const s = mk('button', 'spine s-' + b.theme); s.type = 'button';
          s.style.setProperty('--w', b.w + 'px'); s.style.setProperty('--h', b.h + 'px');
          if (b.fs) s.style.setProperty('--fs', b.fs + 'px');
          s.style.setProperty('--i', i);
          s.setAttribute('data-book', b.id);
          s.setAttribute('aria-label', 'Buksan ang libro: ' + b.title + ', ' + b.pages.length + ' pahina');
          s.appendChild(txt('span', 'sp-no', b.no));
          s.appendChild(txt('span', 'sp-title', b.title));
          s.appendChild(mk('span', 'sp-heart', HEART_SVG));
          s.addEventListener('click', () => pullAndOpen(b.id));
          S.spines[b.id] = s;
          row.appendChild(s);
        } else if (key === 'thin' || key === 'thin-b') {
          const t = mk('div', 'deco desk-only thin' + (key === 'thin-b' ? ' b' : '')); t.style.setProperty('--i', i); t.setAttribute('aria-hidden', 'true'); row.appendChild(t);
        } else if (key === 'lean') {
          const l = mk('div', 'deco desk-only lean'); l.style.setProperty('--i', i); l.setAttribute('aria-hidden', 'true'); row.appendChild(l);
        } else if (key === 'slot' || key === 'slot-m') {
          const sl = mk('div', 'deco slot ' + (key === 'slot' ? 'desk-only' : 'mob-only'), '<b>+</b><span>SUSUNOD</span>');
          sl.style.setProperty('--i', i); sl.setAttribute('aria-hidden', 'true'); row.appendChild(sl);
        } else if (key === 'minical') {
          const mc = mk('button', 'minical mob-only'); mc.type = 'button'; mc.style.setProperty('--i', i);
          mc.addEventListener('click', () => openCalSheet());
          miniRef.current = mc;
          row.appendChild(mc);
        } else if (key === 'frame') {
          const fr = mk('button', 'deco sframe', '<span class="mat"><span class="ph"><img src="/menu/img/binondo.jpg" alt="" width="480" height="640" loading="lazy"></span></span>');
          fr.type = 'button'; fr.style.setProperty('--i', i);
          fr.setAttribute('aria-label', 'Tingnan ang litrato: Binondo');
          fr.addEventListener('click', () => openPhoto('binondo', fr));
          row.appendChild(fr);
        }
      });
      shelf.appendChild(row); shelf.appendChild(mk('div', 'board'));
      caseEl.appendChild(shelf);
    });
    if (noteRef.current) noteRef.current.textContent = LIB.length + ' LIBRO · ' + totalPages + ' PAHINA';

    const reader = readerRef.current;
    function leafFace(cls, node) { const f = mk('div', 'face ' + cls); if (node) f.appendChild(node); return f; }

    function buildCover(b) {
      const c = mk('div', 'cover t-' + b.theme);
      c.style.setProperty('--ts', b.ts);
      c.appendChild(mk('div', 'cv-in'));
      const top = mk('div', 'cv-top'); top.appendChild(txt('span', '', 'LIBRARY NI CHICO')); top.appendChild(txt('span', '', 'PARA KAY CHICA')); c.appendChild(top);
      const mid = mk('div', 'cv-mid');
      mid.appendChild(txt('div', 'cv-no', b.no));
      const t = mk('div', 'cv-title');
      b.lines.forEach((ln, i) => { if (i) t.appendChild(document.createElement('br')); t.appendChild(document.createTextNode(ln)); });
      mid.appendChild(t); mid.appendChild(txt('p', 'cv-sub', b.sub)); c.appendChild(mid);
      const bot = mk('div', 'cv-bot'); bot.appendChild(txt('span', '', b.pages.length + ' PAHINA')); bot.appendChild(mk('span', '', HEART_SVG)); c.appendChild(bot);
      return c;
    }

    function buildPage(b, p, n) {
      const pg = mk('div', 'page');
      const top = mk('div', 'pg-top');
      const left = mk('span', '');
      left.appendChild(txt('span', 'call', b.title + ' ' + pad(n)));
      if (p.made && Date.now() - Date.parse(p.made) < 4 * DAY_MS) left.appendChild(txt('span', 'new', 'BAGO'));
      top.appendChild(left); top.appendChild(txt('span', 'pg-stamp', p.stamp)); pg.appendChild(top);
      const im = document.createElement('img'); im.src = p.img; im.alt = ''; im.width = p.iw; im.height = p.ih; im.draggable = false;
      if (p.frame) {
        const fr = mk('button', 'pframe'); fr.type = 'button';
        fr.setAttribute('aria-label', 'Tingnan nang malaki: ' + p.title);
        const mat = mk('span', 'mat'), ph = mk('span', 'ph');
        ph.appendChild(im); mat.appendChild(ph); fr.appendChild(mat);
        if (p.photo) fr.addEventListener('click', () => openPhoto(p.photo, fr));
        pg.appendChild(fr);
      } else {
        const pr = mk('div', 'print'); pr.appendChild(im);
        ['tl', 'tr', 'bl', 'br'].forEach(c => pr.appendChild(mk('i', c)));
        pg.appendChild(pr);
      }
      pg.appendChild(txt('h3', '', p.title));
      pg.appendChild(txt('p', 'blurb', p.blurb));
      const go = mk('a', 'go', 'BUKSAN ' + ARROW_SVG); go.href = p.href;
      go.setAttribute('aria-label', 'Buksan: ' + p.title);
      pg.appendChild(go);
      const foot = mk('div', 'pg-foot'); foot.appendChild(txt('span', '', 'PAHINA ' + n + ' / ' + b.pages.length)); foot.appendChild(mk('span', '', HEART_SVG));
      pg.appendChild(foot);
      return pg;
    }

    function buildBase(b) {
      const base = mk('div', 'base'), f = mk('div', 'face');
      f.appendChild(mk('span', '', HEART_SVG.replace('<svg ', '<svg class="h" ')));
      f.appendChild(txt('h3', '', 'Tapos na ang libro'));
      f.appendChild(txt('p', '', 'Nasa shelf pa ang iba, asawa ko.'));
      const btns = mk('div', 'btns');
      const a = txt('button', 'btn', 'ISARA ANG LIBRO'); a.type = 'button'; a.addEventListener('click', closeBook);
      const c = txt('button', 'btn ghost', 'BALIK SA UNA'); c.type = 'button'; c.addEventListener('click', () => setK(1, 700));
      btns.appendChild(a); btns.appendChild(c); f.appendChild(btns); base.appendChild(f);
      return base;
    }

    function buildBook(b) {
      bookEl.innerHTML = '';
      const base = buildBase(b); bookEl.appendChild(base);
      const leaves = [];
      const cover = mk('div', 'leaf');
      cover.appendChild(leafFace('front', buildCover(b)));
      const ep = mk('div', 'endpaper'); ep.appendChild(mk('p', '', 'Para kay Chica<small>— CHICO</small>'));
      cover.appendChild(leafFace('back', ep));
      leaves.push(cover);
      b.pages.forEach((p, i) => {
        const lf = mk('div', 'leaf');
        lf.appendChild(leafFace('front', buildPage(b, p, i + 1)));
        lf.appendChild(leafFace('back', mk('div', 'pageback')));
        leaves.push(lf);
      });
      leaves.forEach(lf => bookEl.appendChild(lf));
      return { base, leaves };
    }

    function setA(i, a) {
      const c = S.cur; if (!c) return;
      const L = c.leaves.length, lf = c.leaves[i];
      c.angles[i] = a;
      lf.style.transform = a === 0 ? 'none' : 'perspective(1800px) rotateY(' + (-a * 180) + 'deg)';
      lf.style.zIndex = a < 0.5 ? (100 + L - i) : (100 + i);
      lf.style.setProperty('--shf', a < 0.5 ? (a * 0.7).toFixed(3) : 0);
      lf.style.setProperty('--shb', a >= 0.5 ? ((1 - a) * 0.7).toFixed(3) : 0);
      lf.children[0].style.boxShadow = a > 0 && a < 1 ? '0 0 ' + (Math.sin(a * Math.PI) * 46).toFixed(1) + 'px rgba(0,0,0,.55)' : '';
      lf.setAttribute('data-flipped', a >= 0.999 ? '1' : '0');
    }

    function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
    function tween(i, to, ms, done) {
      const from = S.cur.angles[i], c = S.cur;
      if (from === to || ms <= 0 || reduce.current) { setA(i, to); if (done) done(); return; }
      S.busy++;
      const t0 = performance.now();
      (function step(now) {
        if (S.cur !== c) { S.busy = Math.max(0, S.busy - 1); return; }
        const p = Math.min(1, (now - t0) / ms);
        setA(i, from + (to - from) * ease(p));
        if (p < 1) requestAnimationFrame(step); else { S.busy = Math.max(0, S.busy - 1); if (done) done(); }
      })(t0);
    }

    function syncUI() {
      const c = S.cur; if (!c) return;
      const N = c.book.pages.length, k = c.k;
      c.leaves.forEach((lf, i) => { if (i === k) lf.removeAttribute('inert'); else lf.setAttribute('inert', ''); });
      if (k === N + 1) c.base.removeAttribute('inert'); else c.base.setAttribute('inert', '');
      if (prevBtnRef.current) prevBtnRef.current.disabled = k === 0;
      if (nextBtnRef.current) nextBtnRef.current.disabled = k === N + 1;
      if (countRef.current) {
        if (k === 0) countRef.current.innerHTML = 'KULUBAN';
        else if (k <= N) countRef.current.innerHTML = 'PAHINA <b>' + k + '</b> / ' + N;
        else countRef.current.innerHTML = 'TAPOS NA';
      }
      if (k > 0 && hintRef.current) hintRef.current.classList.add('off');
      try { history.replaceState(null, '', location.pathname + location.search + (k > 0 ? '#' + c.book.id + '-' + k : '#' + c.book.id)); } catch {}
    }

    function setK(n, ms, silent) {
      const c = S.cur; if (!c) return;
      const N = c.book.pages.length;
      n = Math.max(0, Math.min(N + 1, n));
      const old = c.k; c.k = n;
      for (let i = 0; i < c.leaves.length; i++) {
        const to = i < n ? 1 : 0;
        if (c.angles[i] !== to) tween(i, to, ms == null ? 850 : ms);
      }
      if (n !== old && !silent && ms !== 0) rustle();
      syncUI();
    }

    function clearAnims() {
      [reader, bookEl].forEach(el => { try { el.getAnimations().forEach(a => a.cancel()); } catch {} });
    }
    function clearAnimsOn(el) { try { el.getAnimations().forEach(a => a.cancel()); } catch {} }

    function rectOffset(spine) {
      const r = spine.getBoundingClientRect(), b = bookEl.getBoundingClientRect();
      return { dx: (r.left + r.width / 2) - (b.left + b.width / 2), dy: (r.top + r.height / 2) - (b.top + b.height / 2) };
    }

    function pullAndOpen(id) {
      const sp = S.spines[id]; rustle();
      if (reduce.current) { openBook(id); return; }
      sp.classList.add('pull');
      setTimeout(() => openBook(id), 280);
    }

    function openBook(id, opt) {
      opt = opt || {};
      const b = LIB_BY_ID[id]; if (!b || S.cur) return;
      clearAnims();
      const built = buildBook(b);
      S.cur = { book: b, id, leaves: built.leaves, base: built.base, angles: built.leaves.map(() => 0), k: 0, spine: S.spines[id] };
      if (rdTitleRef.current) rdTitleRef.current.textContent = b.title + ' · ' + b.pages.length + ' PAHINA';
      reader.hidden = false;
      mainRef.current?.setAttribute('inert', '');
      document.documentElement.style.overflow = 'hidden';
      S.cur.leaves.forEach((_, i) => setA(i, 0));
      S.spines[id].classList.remove('pull', 'back');
      S.spines[id].classList.add('gone');
      hintRef.current?.classList.remove('off');
      const startK = opt.k || 0;
      if (opt.immediate || reduce.current) {
        setK(startK, 0, true);
      } else {
        syncUI();
        const o = rectOffset(S.spines[id]);
        reader.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'ease-out' });
        bookEl.animate([
          { transform: `translate(${o.dx}px,${o.dy}px) scale(.16) perspective(1200px) rotateY(-80deg)`, opacity: 0 },
          { opacity: 1, offset: 0.25 },
          { transform: 'none', opacity: 1 },
        ], { duration: 820, easing: 'cubic-bezier(.2,.8,.2,1)' });
        setTimeout(() => { if (S.cur && S.cur.id === id && S.cur.k === 0) setK(1, 950); }, 1000);
      }
      closeBtnRef.current?.focus({ preventScroll: true });
    }

    function closeBook() {
      if (!S.cur || S.closing) return;
      S.closing = true;
      const c = S.cur; let finished = false;
      function finish() {
        if (finished) return; finished = true;
        clearAnims();
        reader.hidden = true; bookEl.innerHTML = '';
        mainRef.current?.removeAttribute('inert');
        document.documentElement.style.overflow = '';
        c.spine.classList.remove('gone', 'pull');
        if (!reduce.current) c.spine.classList.add('back');
        try { c.spine.focus({ preventScroll: true }); } catch {}
        S.cur = null; S.closing = false;
        try { history.replaceState(null, '', location.pathname + location.search); } catch {}
      }
      function shrink() {
        if (reduce.current) { finish(); return; }
        const o = rectOffset(c.spine);
        const a = bookEl.animate([
          { transform: 'none', opacity: 1 },
          { transform: `translate(${o.dx}px,${o.dy}px) scale(.16) perspective(1200px) rotateY(-80deg)`, opacity: 0 },
        ], { duration: 560, easing: 'cubic-bezier(.5,0,.8,.3)', fill: 'forwards' });
        reader.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 480, delay: 120, fill: 'forwards' });
        a.onfinish = finish;
        setTimeout(finish, 900);
      }
      if (c.k > 0 && !reduce.current) { setK(0, 380, true); setTimeout(shrink, 400); rustle(); } else shrink();
    }

    closeBtnRef.current?.addEventListener('click', closeBook);
    prevBtnRef.current?.addEventListener('click', () => { if (S.cur && !S.busy) setK(S.cur.k - 1); });
    nextBtnRef.current?.addEventListener('click', () => { if (S.cur && !S.busy) setK(S.cur.k + 1); });

    function onKey(e) {
      if (S.panel) {
        if (e.key === 'Escape') { e.preventDefault(); closePanel(); }
        return;
      }
      if (!S.cur) return;
      if (e.key === 'Escape') { e.preventDefault(); closeBook(); }
      else if (e.key === 'ArrowRight' && !S.busy) { e.preventDefault(); setK(S.cur.k + 1); }
      else if (e.key === 'ArrowLeft' && !S.busy) { e.preventDefault(); setK(S.cur.k - 1); }
    }
    document.addEventListener('keydown', onKey);

    let drag = null, suppress = false;
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    bookEl.addEventListener('pointerdown', e => {
      if (!S.cur || S.busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
      drag = { x0: e.clientX, id: e.pointerId, dir: 0, leaf: -1, w: bookEl.getBoundingClientRect().width, prog: 0, moved: false, lastX: e.clientX, lastT: performance.now(), v: 0, target: e.target };
    });
    function onMove(e) {
      if (!drag) return;
      const dx = e.clientX - drag.x0;
      if (!drag.dir) {
        if (Math.abs(dx) < 8) return;
        const N = S.cur.book.pages.length;
        drag.dir = dx < 0 ? 1 : -1;
        drag.leaf = drag.dir === 1 ? S.cur.k : S.cur.k - 1;
        if (drag.leaf < 0 || drag.leaf >= S.cur.leaves.length || (drag.dir === 1 && S.cur.k > N)) { drag = null; return; }
        drag.moved = true;
        try { bookEl.setPointerCapture(drag.id); } catch {}
      }
      const span = drag.w * 0.95;
      drag.prog = drag.dir === 1 ? clamp(-dx / span, 0, 1) : 1 - clamp(dx / span, 0, 1);
      const now = performance.now();
      drag.v = (e.clientX - drag.lastX) / Math.max(1, now - drag.lastT);
      drag.lastX = e.clientX; drag.lastT = now;
      S.cur.leaves[drag.leaf].style.zIndex = 400;
      setA(drag.leaf, drag.prog);
    }
    function endDrag(e) {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved) {
        if (d.target?.closest?.('a,button')) return;
        const r = bookEl.getBoundingClientRect(), x = e.clientX - r.left;
        if (!S.cur || S.busy) return;
        if (S.cur.k === 0) setK(1);
        else if (x > r.width * 0.55) setK(S.cur.k + 1);
        else if (x < r.width * 0.25) setK(S.cur.k - 1);
        return;
      }
      suppress = true; setTimeout(() => { suppress = false; }, 60);
      const forward = d.dir === 1;
      const fast = Math.abs(d.v) > 0.5 && ((forward && d.v < 0) || (!forward && d.v > 0));
      const commit = forward ? (d.prog > 0.32 || fast) : (d.prog < 0.68 || fast);
      const to = forward ? (commit ? 1 : 0) : (commit ? 0 : 1);
      const remain = Math.abs(to - d.prog);
      S.cur.k = forward ? (commit ? S.cur.k + 1 : S.cur.k) : (commit ? S.cur.k - 1 : S.cur.k);
      tween(d.leaf, to, 120 + 520 * remain);
      if (commit) rustle();
      syncUI();
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', () => {
      if (!drag) return; const d = drag; drag = null;
      if (d.moved && S.cur) tween(d.leaf, d.dir === 1 ? 0 : 1, 200);
    });
    bookEl.addEventListener('click', e => { if (suppress) { e.preventDefault(); e.stopPropagation(); } }, true);
    bookEl.addEventListener('dragstart', e => e.preventDefault());

    // panels
    function openPanel(el, origin) {
      if (S.panel) return;
      clearAnimsOn(el);
      S.panel = { el, origin: origin || null, fromReader: !!S.cur, closing: false };
      el.hidden = false;
      mainRef.current?.setAttribute('inert', '');
      if (S.cur) reader.setAttribute('inert', '');
      document.documentElement.style.overflow = 'hidden';
      if (!reduce.current && origin) {
        const r = origin.getBoundingClientRect();
        const dx = (r.left + r.width / 2) - window.innerWidth / 2, dy = (r.top + r.height / 2) - window.innerHeight / 2;
        el.animate([
          { transform: `translate(${dx}px,${dy}px) scale(.12)`, opacity: 0 },
          { opacity: 1, offset: 0.3 },
          { transform: 'none', opacity: 1 },
        ], { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)' });
      } else if (!reduce.current) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
      }
      const cb = el.querySelector('[data-close]');
      if (cb) cb.focus({ preventScroll: true });
    }

    function closePanel() {
      if (!S.panel || S.panel.closing) return;
      const pn = S.panel; let finished = false; pn.closing = true;
      function finish() {
        if (finished) return; finished = true;
        clearAnimsOn(pn.el); pn.el.hidden = true;
        if (pn.back) {
          const bk = pn.back; bk.closing = false; S.panel = bk;
          clearAnimsOn(bk.el); bk.el.hidden = false;
          if (!reduce.current) bk.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
          const tg = pn.opener?.isConnected ? pn.opener : bk.el.querySelector('[data-close]');
          try { tg?.focus({ preventScroll: true }); } catch {}
          return;
        }
        if (pn.fromReader) reader.removeAttribute('inert');
        else { mainRef.current?.removeAttribute('inert'); document.documentElement.style.overflow = ''; }
        try { pn.origin?.focus({ preventScroll: true }); } catch {}
        S.panel = null;
      }
      if (reduce.current) { finish(); return; }
      const r = pn.origin ? pn.origin.getBoundingClientRect() : null;
      const to = r
        ? { transform: `translate(${(r.left + r.width / 2) - window.innerWidth / 2}px,${(r.top + r.height / 2) - window.innerHeight / 2}px) scale(.12)`, opacity: 0 }
        : { opacity: 0 };
      const a = pn.el.animate([{ transform: 'none', opacity: 1 }, to], { duration: 360, easing: 'cubic-bezier(.5,0,.8,.3)', fill: 'forwards' });
      a.onfinish = finish;
      setTimeout(finish, 800);
    }

    [calSheetRef, dateSheetRef, photoViewRef].forEach(ref => {
      const el = ref.current; if (!el) return;
      el.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closePanel));
      el.querySelector('.pn-body')?.addEventListener('click', e => { if (e.target === e.currentTarget) closePanel(); });
    });

    // photo viewer
    function openPhoto(key, origin) {
      const ph = PHOTOS[key]; if (!ph || S.panel) return;
      const img = pvImgRef.current; if (!img) return;
      img.alt = ph.alt; img.srcset = ph.srcset; img.sizes = '(max-width: 520px) 80vw, 450px'; img.src = ph.src;
      if (pvTitleRef.current) pvTitleRef.current.textContent = ph.title;
      if (pvLineRef.current) pvLineRef.current.textContent = ph.line;
      if (pvMetaRef.current) pvMetaRef.current.textContent = ph.meta;
      openPanel(photoViewRef.current, origin);
    }

    // calendar data
    function localList(track) {
      let raw = null, arr = [];
      try { raw = localStorage.getItem(DKEY); } catch {}
      if (track) S.calRaw = raw;
      if (raw) { try { arr = JSON.parse(raw); } catch { arr = []; } }
      return Array.isArray(arr) ? arr : [];
    }
    function serverEntryFor(x) {
      const s = slotOf(x);
      for (let i = 0; i < S.calRemote.length; i++) if (validEntry(S.calRemote[i]) && !isCancelled(S.calRemote[i]) && slotOf(S.calRemote[i]) === s) return S.calRemote[i];
      return null;
    }
    function readSet() {
      S.calAll = mergeAll([localList(true), S.calRemote]);
      S.calSet = S.calAll.filter(x => {
        if (isCancelled(x) || !/^\d{4}-\d{2}-\d{2}$/.test(x.date)) return false;
        const d = dateOf(x.date);
        return d.getMonth() === +x.date.slice(5, 7) - 1 && d.getDate() === +x.date.slice(8, 10);
      }).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : (a.savedAt || 0) - (b.savedAt || 0));
      S.calMap = {};
      S.calSet.forEach(x => {
        const c = S.calMap[x.date] || { filled: false, proposed: true };
        if (statusOf(x) === 'confirmed') { c.proposed = false; if (x.sent || x.by === 'chico') c.filled = true; }
        S.calMap[x.date] = c;
      });
    }
    function homeMonth() {
      const t = new Date(), ty = t.getFullYear(), tm = t.getMonth(), ti = todayIso(), head = ti.slice(0, 7);
      for (const x of S.calSet) if (x.date.slice(0, 7) === head) return { y: ty, m: tm };
      for (const x of S.calSet) if (x.date >= ti) return { y: +x.date.slice(0, 4), m: +x.date.slice(5, 7) - 1 };
      return { y: ty, m: tm };
    }
    function nextUp() {
      const ti = todayIso(); let best = null;
      for (const x of S.calSet) if (x.date >= ti) { best = { iso: x.date, x }; break; }
      const sp = upcomingSpecials(1)[0];
      if (sp && (!best || sp.iso < best.iso)) best = { iso: sp.iso, sp };
      return best;
    }
    function heartMark(c, k) {
      const sv = document.createElementNS(SVGNS, 'svg');
      sv.setAttribute('viewBox', '0 0 40 36'); sv.setAttribute('class', c.proposed ? 'hm prop' : 'hm'); sv.setAttribute('aria-hidden', 'true');
      sv.style.setProperty('--k', k);
      function path(cls) {
        const pth = document.createElementNS(SVGNS, 'path');
        pth.setAttribute('d', HEART_D); pth.setAttribute('pathLength', '100'); if (cls) pth.setAttribute('class', cls);
        sv.appendChild(pth);
      }
      if (c.filled) path('fillp');
      path('ghost'); path('');
      return sv;
    }
    function spDot(list) { return mk('i', 'sp-dot' + (list[0].kind === 'ms' ? ' ring' : '')); }

    function fullDay(iso) { const d = dateOf(iso); return { big: MONTHS[d.getMonth()] + ' ' + d.getDate(), sub: DAYS[d.getDay()] + ' · ' + d.getFullYear() }; }
    function btnLink(label, href, cls, blank) {
      const a = txt('a', 'dd-btn' + (cls ? ' ' + cls : ''), label);
      a.href = href; if (blank) { a.target = '_blank'; a.rel = 'noopener'; }
      return a;
    }
    function section(head) { const s = mk('div', 'dd-sec'); if (head) s.appendChild(txt('p', 'dd-h', head)); return s; }
    function listOf(items) { const ul = mk('ul', 'dd-list'); items.forEach(t => ul.appendChild(txt('li', '', t))); return ul; }
    function cardTop(kind, bigText, sub, n) {
      const top = mk('div', 'dd-top'), l = mk('div', 'dd-tl');
      l.appendChild(txt('span', 'k', kind)); l.appendChild(txt('span', 'big', bigText)); l.appendChild(txt('span', 'dd-wd', sub));
      top.appendChild(l); if (n >= 0) top.appendChild(txt('span', 'dd-chip', cdWord(n)));
      return top;
    }

    function loadPlaces() {
      if (S.PL) return Promise.resolve(S.PL);
      if (!S.plP) {
        S.plP = fetch('/date/places.json').then(r => r.ok ? r.json() : null).then(j => { S.PL = j?.places ? j : null; return S.PL; }).catch(() => { S.plP = null; return null; });
      }
      return S.plP;
    }
    function placeFor(x) {
      if (!S.PL) return null;
      if (x.pid && S.PL.places[x.pid]) return S.PL.places[x.pid];
      const nm = String(x.place || '').trim().toLowerCase();
      for (const k in S.PL.places) if (String(S.PL.places[k].name).toLowerCase() === nm) return S.PL.places[k];
      return null;
    }

    function refreshRemote() {
      return fetch(SERVER, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => {
        if (!j || j.ok !== true || !Array.isArray(j.dates)) return;
        S.calRemote = j.dates; S.calRemoteRaw = JSON.stringify(j.dates);
        try { localStorage.setItem(SKEY, S.calRemoteRaw); } catch {}
        renderCalendars();
      }).catch(() => {});
    }

    function applyMemory(entry) {
      S.calRemote = S.calRemote.map(e => e && e.id === entry.id ? entry : e);
      S.calRemoteRaw = JSON.stringify(S.calRemote);
      try { localStorage.setItem(SKEY, S.calRemoteRaw); } catch {}
      renderCalendars();
    }

    function memorySection(x, flash) {
      const sec = section(), srv = serverEntryFor(x), mem = (srv?.mem) || x.mem || null;
      const h = txt('p', 'dd-h mem-h', 'ALAALA NG DATE NATIN'); h.tabIndex = -1; sec.appendChild(h);
      const status = txt('p', 'dd-msg', flash || ''); status.setAttribute('role', 'status');
      const form = mk('div', 'dd-form'), hasMem = !!(mem && (mem.photo || mem.note));
      if (hasMem) {
        if (mem.photo) {
          const fig = mk('figure', 'dd-photo'), im = mk('img');
          im.alt = 'Litrato ng date natin sa ' + (x.place || 'date natin'); im.loading = 'lazy'; im.decoding = 'async';
          im.src = PHOTO_API + '?k=' + encodeURIComponent(mem.photo);
          fig.appendChild(im); sec.appendChild(fig);
        }
        if (mem.note) sec.appendChild(txt('p', 'dd-note mem-note', mem.note));
      } else {
        sec.appendChild(txt('p', 'dd-note', 'WALA PA TAYONG ALAALA DITO. MAGLAGAY KA NG LITRATO, O KAHIT ISANG LINYA LANG.'));
      }
      let toggle = null;
      if (hasMem) {
        toggle = txt('button', 'dd-btn', 'PALITAN ANG ALAALA'); toggle.type = 'button'; toggle.setAttribute('aria-expanded', 'false');
        const tr = mk('div', 'dd-links'); tr.appendChild(toggle); sec.appendChild(tr);
        form.hidden = true;
        toggle.addEventListener('click', () => { form.hidden = !form.hidden; toggle.setAttribute('aria-expanded', form.hidden ? 'false' : 'true'); if (!form.hidden) ta.focus(); });
      }
      const pick = mk('label', 'dd-btn dd-file'), fi = mk('input'); fi.type = 'file'; fi.accept = 'image/*';
      pick.appendChild(fi); pick.appendChild(document.createTextNode(hasMem && mem.photo ? 'IBANG LITRATO' : 'PUMILI NG LITRATO'));
      const prev = mk('img', 'dd-prev'); prev.alt = ''; prev.hidden = true;
      const ta = mk('textarea', 'dd-ta'); ta.maxLength = 300; ta.rows = 3; ta.value = mem?.note || '';
      ta.placeholder = 'ISULAT MO KUNG ANO ANG NAGUSTUHAN MO'; ta.setAttribute('aria-label', 'Isulat ang alaala ng date natin');
      const count = txt('p', 'dd-count', ta.value.length + ' / 300');
      ta.addEventListener('input', () => { count.textContent = ta.value.length + ' / 300'; });
      const save = txt('button', 'dd-btn red', 'I-SAVE ANG ALAALA'); save.type = 'button';
      let photoData = '';
      if (!srv) { save.disabled = true; status.textContent = 'SANDALI LANG, NAG-SA-SYNC PA ANG DATE NATIN. SUBUKAN ULIT MAMAYA.'; }
      fi.addEventListener('change', () => {
        const f = fi.files?.[0]; if (!f) return;
        status.textContent = 'SANDALI LANG...';
        shrinkPhoto(f).then(data => { photoData = data; prev.src = data; prev.hidden = false; status.textContent = ''; })
          .catch(() => { photoData = ''; prev.hidden = true; status.textContent = 'HINDI MABASA ANG LITRATO. SUBUKAN ANG IBA.'; });
      });
      const row = mk('div', 'dd-links'); row.appendChild(pick); form.appendChild(row); form.appendChild(prev); form.appendChild(ta); form.appendChild(count);
      const sr = mk('div', 'dd-links'); sr.appendChild(save); form.appendChild(sr);
      save.addEventListener('click', () => {
        const note = ta.value.trim();
        if (!srv || (!photoData && !note)) { status.textContent = 'MAGLAGAY KA NG LITRATO O KAHIT ISANG LINYA.'; return; }
        save.disabled = true; status.textContent = 'SINESAVE...';
        function post(id) {
          const body = { id }; if (photoData) body.photo = photoData; if (note) body.note = note;
          return fetch(MEMORY, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
            .then(r => r.json().catch(() => ({})).then(j => ({ status: r.status, j })));
        }
        post(srv.id)
          .then(res => { if (res.status !== 404) return res; return refreshRemote().then(() => { const s2 = serverEntryFor(x); return s2 && s2.id !== srv.id ? post(s2.id) : res; }); })
          .then(res => {
            if (res.j?.ok === true && res.j.entry) { applyMemory(res.j.entry); buildDay(x.date, 'NAI-SAVE NA ANG ALAALA NATIN.'); ddBodyRef.current?.querySelector('.mem-h')?.focus({ preventScroll: true }); return; }
            save.disabled = false;
            status.textContent = res.status === 409 ? 'MAGAGAWA LANG ITO PAGKATAPOS NG DATE.' : res.status === 400 && res.j?.why === 'photo' ? 'HINDI GUMANA ANG LITRATO. SUBUKAN ANG IBA.' : 'HINDI NAI-SAVE. SUBUKAN ULIT MAMAYA.';
          }).catch(() => { save.disabled = false; status.textContent = 'HINDI NAI-SAVE. SUBUKAN ULIT MAMAYA.'; });
      });
      sec.appendChild(form); sec.appendChild(status);
      return sec;
    }

    function specialCard(iso, sp, n, planned) {
      const card = mk('section', 'dd sp'), fd = fullDay(iso);
      card.appendChild(cardTop('ESPESYAL NA ARAW', sp.title, fd.big + ' · ' + fd.sub, n));
      const s = section(); s.appendChild(txt('p', 'dd-place', sp.sub));
      if (n >= 0 && !planned) {
        s.appendChild(txt('p', 'dd-note', 'WALA PA TAYONG DATE SA ARAW NA ITO. GUSTO MO BANG PLANUHIN?'));
        const row = mk('div', 'dd-links'); row.appendChild(btnLink('DATE TAYO', '/date', 'red')); s.appendChild(row);
      }
      card.appendChild(s); return card;
    }

    function dateCard(x, n, flash) {
      const card = mk('section', 'dd'), proposed = statusOf(x) === 'proposed', past = n < 0, fd = fullDay(x.date);
      card.appendChild(cardTop(proposed ? 'PLANO NI CHICO' : 'DATE NATIN', fd.big, fd.sub, n));
      const s1 = section();
      s1.appendChild(txt('p', 'dd-place', x.place || 'DATE NATIN'));
      if (x.area) s1.appendChild(txt('p', 'dd-sub', x.area));
      if (x.time) s1.appendChild(txt('p', 'dd-meta', x.time));
      s1.appendChild(txt('p', 'dd-stat', past ? 'NAKARAAN NA' : statusText(x)));
      if (x.note) s1.appendChild(txt('p', 'dd-note', x.note));
      const links = mk('div', 'dd-links');
      if (mapUrl(x)) { links.appendChild(btnLink('TINGNAN SA MAPA', mapUrl(x), '', true)); links.appendChild(btnLink('PAANO PUMUNTA', dirUrl(x), '', true)); }
      s1.appendChild(links); card.appendChild(s1);
      const extra = mk('div', 'dd-extra'); card.appendChild(extra);
      const token = S.ddToken;
      if (!past) loadPlaces().then(() => {
        if (token !== S.ddToken) return;
        const p = placeFor(x), pl = S.PL; if (!pl) return;
        if (p?.highlights?.length) { const a = section("ANO'NG GAGAWIN"); a.appendChild(listOf(p.highlights)); extra.appendChild(a); }
        if (p && pl.tiers?.[p.budget]) {
          const t = pl.tiers[p.budget], b = section('BUDGET PARA SA DALAWA');
          const bl = mk('p', 'dd-budget'); bl.appendChild(txt('b', '', t.sign)); bl.appendChild(document.createTextNode(' · ' + t.range.toUpperCase()));
          b.appendChild(bl); b.appendChild(txt('p', 'dd-fine', pl.budgetNote)); extra.appendChild(b);
        }
        const c = section('DALHIN'); c.appendChild(listOf(p ? p.checklist : pl.generic)); c.appendChild(txt('p', 'dd-fine', pl.checkNote)); extra.appendChild(c);
      });
      if (!past) {
        const srv = serverEntryFor(x), rem = section('PAALALA');
        rem.appendChild(txt('p', 'dd-note', srv ? 'I-SAVE SA CALENDAR PARA MAY ALARM: 1 ARAW AT 2 ORAS BAGO ANG DATE.' : 'I-SAVE SA CALENDAR SA DATE TAYO PARA MAY ALARM: 1 ARAW AT 2 ORAS BAGO ANG DATE.'));
        const cr = mk('div', 'dd-links');
        if (srv) { cr.appendChild(btnLink('GOOGLE CALENDAR', CALAPI + '?id=' + encodeURIComponent(srv.id) + '&f=google', '', true)); cr.appendChild(btnLink('APPLE / OUTLOOK', CALAPI + '?id=' + encodeURIComponent(srv.id) + '&f=ics', '')); }
        else cr.appendChild(btnLink('BUKSAN ANG DATE TAYO', '/date/?open=dates', ''));
        rem.appendChild(cr); card.appendChild(rem);
        const ch = section(), chr = mk('div', 'dd-links');
        chr.appendChild(btnLink(proposed ? 'SAGUTIN SA DATE TAYO' : 'PALITAN O I-CANCEL', '/date/?open=dates', proposed ? 'red' : ''));
        ch.appendChild(chr); card.appendChild(ch);
      } else if (statusOf(x) === 'confirmed') {
        card.appendChild(memorySection(x, flash));
      }
      return card;
    }

    function petsaCard(pd) {
      const card = mk('section', 'dd'), fd = fullDay(pd.iso);
      card.appendChild(cardTop('NAGKITA TAYO', fd.big, fd.sub, -1));
      const s = section(); s.appendChild(txt('p', 'dd-place', pd.blurb || 'DATE NATIN'));
      s.appendChild(txt('p', 'dd-stat', 'NANGYARI NA — MAY LITRATO AT ALAALA'));
      const row = mk('div', 'dd-links'); row.appendChild(btnLink('TINGNAN ANG MGA LITRATO', '/menu/petsa?d=' + pd.d, 'red'));
      s.appendChild(row); card.appendChild(s); return card;
    }

    function buildDay(iso, flash) {
      const body = ddBodyRef.current; if (!body) return;
      const n = daysTo(iso), sps = specialsFor(iso), items = S.calSet.filter(x => x.date === iso), pd = PETSA_MAP[iso];
      S.ddToken++;
      body.textContent = '';
      if (pd) body.appendChild(petsaCard(pd));
      sps.forEach(sp => body.appendChild(specialCard(iso, sp, n, items.length > 0)));
      items.forEach(x => body.appendChild(dateCard(x, n, flash)));
      if (!sps.length && !items.length && !pd) body.appendChild(txt('p', 'cal-empty', 'WALA PANG LAMAN ANG ARAW NA ITO.'));
    }

    function openDay(iso, origin) {
      const prev = S.panel;
      if (prev && (prev.el.id !== 'lib-calSheet' || prev.closing)) return;
      buildDay(iso);
      const el = dateSheetRef.current; if (!el) return;
      ddBodyRef.current.scrollTop = 0;
      if (!prev) { openPanel(el, origin); return; }
      clearAnimsOn(prev.el); prev.el.hidden = true;
      clearAnimsOn(el);
      S.panel = { el, origin: null, opener: origin || null, fromReader: prev.fromReader, closing: false, back: prev };
      el.hidden = false;
      if (!reduce.current) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
      el.querySelector('[data-close]')?.focus({ preventScroll: true });
    }

    // calendar builder
    function makeCal(host, o) {
      if (!host) return;
      const view = { y: 0, m: 0 }, card = mk('div', 'cal'), listEl = o.list ? mk('div', 'cal-list') : null;
      card.innerHTML =
        '<div class="cal-top"><i class="ring r1"></i><i class="ring r2"></i><span class="cal-m"></span>' +
        '<span class="cal-r"><span class="cal-y"></span><span class="cal-nav" hidden>' +
        '<button type="button" data-d="-1" aria-label="Nakaraang buwan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
        '<button type="button" data-d="1" aria-label="Susunod na buwan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>' +
        '</span></span></div>' +
        '<div class="cal-body"><div class="cal-wd" aria-hidden="true"><span>LIN</span><span>LUN</span><span>MAR</span><span>MIY</span><span>HUW</span><span>BIY</span><span>SAB</span></div><div class="cal-grid"></div>' +
        '<p class="cal-key" aria-hidden="true"><span>' + HEART_SVG + 'DATE NATIN</span><span><i></i>ESPESYAL NA ARAW</span><span><b class="dm-key"></b>NAGKITA TAYO</span></p></div>' +
        '<a class="cal-cta" href="/date" aria-label="Date Tayo: pumili ka ng araw"><span class="cta-t">DATE TAYO · PUMILI KA NG ARAW</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>';
      host.appendChild(card);
      if (listEl) host.appendChild(listEl);
      const mEl = card.querySelector('.cal-m'), yEl = card.querySelector('.cal-y'), nav = card.querySelector('.cal-nav'), grid = card.querySelector('.cal-grid');
      function go(delta) { const d = new Date(view.y, view.m + delta, 1); view.y = d.getFullYear(); view.m = d.getMonth(); drawGrid(); }
      nav.querySelectorAll('button').forEach(b => b.addEventListener('click', () => go(+b.getAttribute('data-d'))));
      grid.addEventListener('click', e => { const c = e.target.closest?.('button.d'); if (c) openDay(c.getAttribute('data-iso'), c); });

      function drawGrid() {
        const ti = todayIso(), cells = monthCells(view.y, view.m); let k = 0;
        mEl.textContent = MONTHS[view.m]; yEl.textContent = String(view.y); nav.hidden = false;
        grid.textContent = '';
        for (let i = 0; i < cells.length; i += 7) {
          const wk = mk('div', 'wk');
          for (let j = 0; j < 7; j++) {
            const n = cells[i + j], iso = n ? isoOf(view.y, view.m, n) : '', c = iso ? S.calMap[iso] : null, sp = iso ? specialsFor(iso) : [], pd = iso ? PETSA_MAP[iso] : null;
            const d = mk(c || sp.length || pd ? 'button' : 'span', 'd');
            if (c || sp.length || pd) {
              d.type = 'button'; d.setAttribute('data-iso', iso); d.classList.add('tap');
              d.setAttribute('aria-label', when(iso) + ', ' + [pd ? 'nagkita tayo' : '', c ? 'may date tayo' : '', sp.length ? sp[0].title : ''].filter(Boolean).join(', ') + '. Buksan ang detalye');
            } else d.setAttribute('aria-hidden', 'true');
            if (n) {
              d.textContent = n;
              if (j === 0) d.classList.add('sun');
              if (iso < ti && !pd) d.classList.add('past');
              if (iso === ti) d.classList.add('today');
              if (c) { d.classList.add('set'); d.appendChild(heartMark(c, k++)); }
              if (sp.length) { d.classList.add('sp'); d.appendChild(spDot(sp)); }
              if (pd) { d.classList.add('done'); d.appendChild(mk('span', 'dm', '<svg viewBox="0 0 24 24"><path d="M9.5 4h5l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3L9.5 4z"/><circle cx="12" cy="12.5" r="3.5"/></svg>')); }
            }
            wk.appendChild(d);
          }
          grid.appendChild(wk);
        }
      }

      function item(opts) {
        const it = mk('div', 'cal-item'), main = mk('button', 'ci-main'); main.type = 'button';
        main.appendChild(mk('span', 'ci-h' + (opts.ring ? ' ring' : ''), opts.ring ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6"/></svg>' : HEART_SVG));
        const tx = mk('span', 'ci-t');
        tx.appendChild(txt('b', '', opts.title));
        if (opts.line) tx.appendChild(txt('span', '', opts.line));
        (opts.tags || []).forEach(t => tx.appendChild(txt('em', '', t)));
        main.appendChild(tx);
        main.addEventListener('click', () => {
          if (view.y !== +opts.iso.slice(0, 4) || view.m !== +opts.iso.slice(5, 7) - 1) { view.y = +opts.iso.slice(0, 4); view.m = +opts.iso.slice(5, 7) - 1; drawGrid(); }
          openDay(opts.iso, main);
        });
        it.appendChild(main);
        return it;
      }

      function drawList() {
        if (!listEl) return;
        const ti = todayIso(), nx = nextUp();
        listEl.textContent = '';
        if (nx) {
          const n = daysTo(nx.iso), nb = mk('button', 'cal-next' + (n <= 1 ? ' soon' : '')); nb.type = 'button';
          const big = n === 0 ? 'NGAYON' : n === 1 ? 'BUKAS' : String(n);
          const cn = mk('span', 'cn-n'); cn.appendChild(txt('b', '', big)); if (n > 1) cn.appendChild(txt('small', '', 'ARAW'));
          nb.appendChild(cn);
          const ct = mk('span', 'cn-t');
          ct.appendChild(txt('em', '', nx.sp ? 'SUSUNOD NA ESPESYAL NA ARAW' : 'SUSUNOD NA DATE NATIN'));
          ct.appendChild(txt('b', '', nx.sp ? nx.sp.title : (nx.x.place || 'DATE NATIN').toUpperCase()));
          ct.appendChild(txt('span', '', nx.sp ? when(nx.iso) + ' · ' + nx.sp.sub : when(nx.iso) + (nx.x.time ? ' · ' + nx.x.time : '')));
          nb.appendChild(ct);
          nb.addEventListener('click', () => openDay(nx.iso, nb));
          listEl.appendChild(nb);
        }
        if (!S.calSet.length) {
          if (o.empty) listEl.appendChild(txt('p', 'cal-empty', 'WALA PA TAYONG NAKATAKDANG DATE.\nPUMILI KA NA SA DATE TAYO!'));
        } else {
          const up = S.calSet.filter(x => x.date >= ti), past = S.calSet.filter(x => x.date < ti).reverse();
          up.concat(past).slice(0, o.list).forEach(x => {
            const isPast = x.date < ti, tags = [statusText(x)];
            if (isPast && statusOf(x) === 'confirmed') tags.length = 0, tags.push(x.mem ? 'MAY ALAALA NA' : 'DAGDAGAN NG ALAALA');
            const it = item({ iso: x.date, title: when(x.date), line: [x.place, x.time].filter(Boolean).join(' · '), tags });
            const mu = mapUrl(x);
            if (mu) {
              const ma = txt('a', 'ci-map', 'TINGNAN SA MAPA'); ma.href = mu; ma.target = '_blank'; ma.rel = 'noopener';
              it.appendChild(ma);
            }
            listEl.appendChild(it);
          });
        }
        const sps = upcomingSpecials(3).filter(s => !(nx?.sp && nx.iso === s.iso && nx.sp.kind === s.kind)).slice(0, 2);
        if (sps.length) {
          listEl.appendChild(txt('p', 'cal-sub', 'MGA ESPESYAL NA ARAW'));
          sps.forEach(s => listEl.appendChild(item({ iso: s.iso, ring: s.kind === 'ms', title: when(s.iso), line: s.title, tags: [cdWord(daysTo(s.iso))] })));
        }
      }

      function draw() { drawGrid(); drawList(); }
      const api = { reset() { view.y = S.calHome.y; view.m = S.calHome.m; draw(); } };
      S.calViews.push(api);
      return api;
    }

    // mini calendar
    const miniWd = ['L', 'L', 'M', 'M', 'H', 'B', 'S'];
    function drawMini() {
      const mc = miniRef.current; if (!mc) return;
      const ti = todayIso(), cells = monthCells(S.calHome.y, S.calHome.m); let k = 0, n = 0;
      mc.textContent = '';
      const str = document.createElementNS(SVGNS, 'svg');
      str.setAttribute('class', 'mc-string'); str.setAttribute('viewBox', '0 0 46 13'); str.setAttribute('aria-hidden', 'true');
      str.innerHTML = '<path d="M23 2.5L8 13M23 2.5L38 13"/><circle cx="23" cy="2.4" r="2.2"/>';
      mc.appendChild(str);
      const top = mk('span', 'mc-top'); top.setAttribute('aria-hidden', 'true');
      top.appendChild(txt('b', '', MONTHS[S.calHome.m].slice(0, 3)));
      top.appendChild(txt('small', '', String(S.calHome.y)));
      mc.appendChild(top);
      const g = mk('span', 'mc-grid'); g.setAttribute('aria-hidden', 'true');
      miniWd.forEach(w => g.appendChild(txt('span', 'mc-w', w)));
      cells.forEach((c, idx) => {
        const d = mk('span', 'mc-d');
        if (c) {
          const iso = isoOf(S.calHome.y, S.calHome.m, c), sp = specialsFor(iso), pd = PETSA_MAP[iso];
          d.textContent = c;
          if (idx % 7 === 0) d.classList.add('sun');
          if (iso < ti && !pd) d.classList.add('past');
          if (iso === ti) d.classList.add('today');
          if (S.calMap[iso]) { d.classList.add('set'); n++; d.appendChild(heartMark(S.calMap[iso], k++)); }
          if (sp.length) { d.classList.add('sp'); d.appendChild(spDot(sp)); }
          if (pd) d.classList.add('done');
        }
        g.appendChild(d);
      });
      mc.appendChild(g);
      const foot = txt('span', 'mc-foot', 'BUKSAN'); foot.setAttribute('aria-hidden', 'true');
      mc.appendChild(foot);
      mc.setAttribute('aria-label', 'Kalendaryo, ' + MONTHS[S.calHome.m].toLowerCase() + ' ' + S.calHome.y + (n ? ', ' + n + ' petsang nakatakda' : '') + '. Buksan');
    }

    function renderCalendars() {
      readSet();
      S.calHome = homeMonth();
      S.calViews.forEach(v => v.reset());
      drawMini();
    }

    makeCal(calWrapRef.current, { list: 4, empty: false });
    makeCal(csBodyRef.current, { list: 12, empty: true });
    renderCalendars();

    function openCalSheet() {
      if (S.panel) return;
      renderCalendars();
      pullRemote(true);
      openPanel(calSheetRef.current, miniRef.current);
    }

    function pullRemote(force) {
      const now = Date.now();
      if (S.pulling || (!force && now - S.lastPull < 12000)) return;
      S.pulling = true; S.lastPull = now;
      fetch(SERVER, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => {
        S.pulling = false;
        if (!j || j.ok !== true || !Array.isArray(j.dates)) return;
        const raw = JSON.stringify(j.dates);
        if (raw !== S.calRemoteRaw) { S.calRemoteRaw = raw; S.calRemote = j.dates; try { localStorage.setItem(SKEY, raw); } catch {} renderCalendars(); }
        if (!j.enabled) return;
        const srv = {};
        j.dates.forEach(x => { if (validEntry(x)) srv[slotOf(x)] = x; });
        const send = localList().filter(x => {
          if (!validEntry(x) || typeof x.id !== 'string') return false;
          const s = slotOf(x), k = srv[s];
          if (S.healed[s]) return false;
          if (isCancelled(x)) return !!k && !isCancelled(k) && (x.savedAt || 0) > (k.savedAt || 0);
          if (!k) return true;
          return !isCancelled(k) && !!x.sent && !k.sent;
        });
        send.slice(0, 10).forEach(x => {
          const s = slotOf(x); if (S.healed[s]) return; S.healed[s] = 1;
          try { fetch(SERVER, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(x) }).then(() => { S.lastPull = 0; }); } catch {}
        });
      }).catch(() => { S.pulling = false; });
    }

    function refreshCalendars() {
      let raw = null; try { raw = localStorage.getItem(DKEY); } catch {}
      if (raw !== S.calRaw) renderCalendars();
      pullRemote();
    }
    window.addEventListener('pageshow', refreshCalendars);
    window.addEventListener('focus', refreshCalendars);
    window.addEventListener('storage', e => { if (e.key === DKEY || e.key === null) refreshCalendars(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshCalendars(); });
    const interval = setInterval(() => { if (!document.hidden) pullRemote(); }, 45000);
    pullRemote(true);

    const m = /^#([a-z]+)-(\d+)$/.exec(location.hash || '');
    if (m && LIB_BY_ID[m[1]]) {
      const kk = parseInt(m[2], 10);
      openBook(m[1], { k: Math.min(kk, LIB_BY_ID[m[1]].pages.length + 1), immediate: true });
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pageshow', refreshCalendars);
      window.removeEventListener('focus', refreshCalendars);
      clearInterval(interval);
    };
  }, [totalPages]);

  useEffect(() => {
    document.title = 'LIBRARY NI CHICO PARA KAY CHICA';
    const cleanup = initRef();
    return cleanup;
  }, [initRef]);

  return (
    <LibraryLayout>
      <div className="lib-page">
        <Ticker items={tickerItems} />
        <main className="wrap" ref={mainRef}>
          <header className="hero">
            <p className="eyebrow">PARA KAY CHICA · MGA GINAWA KO</p>
            <h1 className="lib-h1">Library <em>ni Chico</em></h1>
            <p className="lede">Pumili ka ng libro sa shelf, tapos buksan mo. Bawat pahina sa loob, isang ginawa ko para sa&apos;yo, asawa ko.</p>
          </header>

          <div className="room">
            <aside className="calwrap" ref={calWrapRef} aria-label="Kalendaryo ng Date Tayo" />
            <div className="roomcol">
              <section className="case" ref={caseRef} aria-label="Bookshelf" />
              <p className="shelf-note" ref={noteRef} />
            </div>
          </div>

          <footer>
            <p className="final">Hindi pa tapos ang library na &apos;to. May idadagdag pa ako, asawa ko.</p>
            <p className="sign">— Chico</p>
            <p className="fine">LIBRARY NI CHICO · PARA KAY CHICA</p>
          </footer>
        </main>

        <div className="reader" ref={readerRef} role="dialog" aria-modal="true" aria-labelledby="lib-rdTitle" hidden>
          <div className="rd-top">
            <button className="rd-close" ref={closeBtnRef} type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>SHELF
            </button>
            <p className="rd-title" id="lib-rdTitle" ref={rdTitleRef} />
          </div>
          <div className="stage"><div className="book" ref={bookRef} /></div>
          <div className="rd-nav">
            <button ref={prevBtnRef} type="button" aria-label="Nakaraang pahina">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <p className="rd-count" ref={countRef} aria-live="polite" />
            <button ref={nextBtnRef} type="button" aria-label="Susunod na pahina">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
          <p className="rd-hint" ref={hintRef}>I-SWIPE O I-TAP ANG GILID PARA MAG-FLIP</p>
        </div>

        <div className="panel" id="lib-calSheet" ref={calSheetRef} role="dialog" aria-modal="true" aria-label="Kalendaryo" hidden>
          <div className="rd-top">
            <button className="rd-close" data-close type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>BALIK
            </button>
            <p className="rd-title">KALENDARYO</p>
          </div>
          <div className="pn-body" ref={csBodyRef} />
        </div>

        <div className="panel" ref={dateSheetRef} role="dialog" aria-modal="true" aria-label="Detalye ng araw" hidden>
          <div className="rd-top">
            <button className="rd-close" data-close type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>BALIK
            </button>
            <p className="rd-title">DETALYE</p>
          </div>
          <div className="pn-body dd-body" ref={ddBodyRef} />
        </div>

        <div className="panel" ref={photoViewRef} role="dialog" aria-modal="true" aria-label="Litrato" hidden>
          <div className="rd-top">
            <button className="rd-close" data-close type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>BALIK
            </button>
            <p className="rd-title" ref={pvTitleRef} />
          </div>
          <div className="pn-body">
            <figure className="pv">
              <span className="mat"><span className="ph">
                <img ref={pvImgRef} alt="" width="900" height="1200" decoding="async" />
              </span></span>
            </figure>
            <p className="pv-cap"><b ref={pvLineRef} /><span ref={pvMetaRef} /></p>
          </div>
        </div>
      </div>
    </LibraryLayout>
  );
}
