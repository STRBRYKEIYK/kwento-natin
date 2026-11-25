import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LibraryLayout } from '../library/LibraryLayout.jsx';
import { Ticker } from '../library/Ticker.jsx';
import { BackLink } from '../library/BackLink.jsx';
import './OrasPage.css';

const SLOTS = ['10:10', '11:11', '12:12', '1:11', '2:22', '3:33', '4:44', '5:55'];
const CLOCK = { '10:10': [610, 1330], '11:11': [671, 1391], '12:12': [12, 732], '1:11': [71, 791], '2:22': [142, 862], '3:33': [213, 933], '4:44': [284, 1004], '5:55': [355, 1075] };
const DAYS = ['LINGGO', 'LUNES', 'MARTES', 'MIYERKULES', 'HUWEBES', 'BIYERNES', 'SABADO'];
const MONTHS = ['ENE', 'PEB', 'MAR', 'ABR', 'MAY', 'HUN', 'HUL', 'AGO', 'SET', 'OKT', 'NOV', 'DIS'];
const MEDIA = { image: 'LITRATO', video: 'VIDEO', audio: 'VOICE MESSAGE' };
const PAGE = 40;

function manilaMinutes() {
  try {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    let h = 0, m = 0;
    p.forEach(x => { if (x.type === 'hour') h = +x.value % 24; if (x.type === 'minute') m = +x.value; });
    return h * 60 + m;
  } catch { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
}

function nearestSlot() {
  const now = manilaMinutes();
  let best = null, bd = 1e9;
  SLOTS.forEach(s => {
    CLOCK[s].forEach(c => { const d = Math.min(Math.abs(now - c), 1440 - Math.abs(now - c)); if (d < bd) { bd = d; best = s; } });
  });
  return { slot: best, away: bd };
}

function dayLabel(d) {
  const x = new Date(d + 'T00:00:00');
  return [DAYS[x.getDay()], MONTHS[x.getMonth()] + ' ' + x.getDate()];
}

function TextWithLinks({ text }) {
  const re = /(https:\/\/chica\.keicodes\.dev\/[^\s]*)/g;
  const parts = [];
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<a key={m.index} href={m[1]}>{m[1]}</a>);
    last = m.index + m[1].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function Tag({ m }) {
  if (!m.a?.length) return null;
  const names = m.a.map(a => MEDIA[a] || a.toUpperCase());
  return <p className="tag">MAY KASAMANG {names.join(' AT ')} SA CHAT</p>;
}

function MsgCard({ m }) {
  const [expanded, setExpanded] = useState(false);
  const long = m.x.length > 520 || m.x.split('\n').length > 9;
  return (
    <article className={`msg${long && !expanded ? ' clamp' : ''}`}>
      <div className="mh">
        <p className="tm">{m.t}<i>{m.p}</i></p>
        <Tag m={m} />
      </div>
      <p className="tx"><TextWithLinks text={m.x} /></p>
      {long && (
        <button className="rd" type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'ITAGO' : 'BASAHIN LAHAT'}
        </button>
      )}
    </article>
  );
}

function FeatCard({ m, onAgain }) {
  const d = dayLabel(m.d);
  return (
    <div className="feat">
      <div className="fh">
        <p className="lbl red">PINILI NG TADHANA</p>
        <button className="again" type="button" onClick={onAgain}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="1" fill="currentColor" /><circle cx="15" cy="15" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
          ISA PA
        </button>
      </div>
      <p className="tm">{m.t}<i>{m.p}</i></p>
      <p className="dt">{d[0]} · {d[1]}, {m.d.slice(0, 4)}</p>
      <p className="tx"><TextWithLinks text={m.x} /></p>
      <Tag m={m} />
    </div>
  );
}

function Chip({ label, pressed, count, disabled, onClick }) {
  return (
    <button className="chip" type="button" role="switch" aria-pressed={pressed} disabled={disabled} onClick={onClick}>
      {label}{count !== undefined && <small>{count}</small>}
    </button>
  );
}

export default function OrasPage() {
  const [all, setAll] = useState([]);
  const [error, setError] = useState(false);
  const [slot, setSlot] = useState('');
  const [kind, setKind] = useState('');
  const [ap, setAp] = useState('');
  const [sort, setSort] = useState('new');
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [feat, setFeat] = useState(null);
  const nearRef = useRef(nearestSlot());
  const timerRef = useRef(0);
  const wide = useRef(typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches);

  useEffect(() => {
    document.title = 'MGA ORAS NATIN · LIBRARY NI CHICO';
    fetch('/oras/messages.json')
      .then(r => { if (!r.ok) throw 0; return r.json(); })
      .then(d => {
        setAll(d);
        const hash = (location.hash || '').replace('#', '');
        const fromHash = SLOTS.find(s => s.replace(':', '') === hash);
        if (fromHash) setSlot(fromHash);
        else if (nearRef.current.away <= 20) setSlot(nearRef.current.slot);
      })
      .catch(() => setError(true));
  }, []);

  const matchFn = useCallback((m, skipSlot) => {
    if (!skipSlot && slot && m.t !== slot) return false;
    if (kind && (kind === 'long' ? m.k !== 1 : m.k !== 0)) return false;
    if (ap && m.p !== ap) return false;
    if (q && m.x.toLowerCase().indexOf(q) < 0) return false;
    return true;
  }, [slot, kind, ap, q]);

  const list = useMemo(() => {
    const f = all.filter(m => matchFn(m));
    f.sort((a, b) => sort === 'new' ? (a.s < b.s ? 1 : -1) : (a.s < b.s ? -1 : 1));
    return f;
  }, [all, matchFn, sort]);

  const active = slot || kind || ap || q;

  const clearAll = () => { setSlot(''); setKind(''); setAp(''); setQ(''); setShown(PAGE); setFeat(null); };

  const surprise = useCallback(() => {
    if (!list.length) return;
    const pool = list.filter(m => m !== feat);
    setFeat((pool.length ? pool : list)[Math.floor(Math.random() * (pool.length || list.length))]);
  }, [list, feat]);

  const slotCounts = useMemo(() => {
    const counts = { '': 0 };
    SLOTS.forEach(s => { counts[s] = 0; });
    all.forEach(m => { if (matchFn(m, true)) { counts['']++; if (counts[m.t] !== undefined) counts[m.t]++; } });
    return counts;
  }, [all, matchFn]);

  const tickerItems = useMemo(() => {
    const items = [];
    for (let r = 0; r < 4; r++) SLOTS.forEach(s => { items.push(s); items.push('<b>●</b>'); });
    return items;
  }, []);

  const handleSearch = e => {
    clearTimeout(timerRef.current);
    const v = e.target.value;
    timerRef.current = setTimeout(() => { setQ(v.trim().toLowerCase()); setShown(PAGE); setFeat(null); }, 160);
  };

  const shownList = list.slice(0, shown);
  let curDay = '';

  return (
    <LibraryLayout>
      <div className="oras-page">
        <Ticker items={tickerItems} />
        <main className="wrap">
          <BackLink />
          <header className="hero">
            <p className="eyebrow">ORAS-ORAS · PARA KAY CHICA</p>
            <h1 className="lib-h1">Mga oras <em>natin.</em></h1>
            <p className="lede">Isang oras, isang &quot;I love you&quot;. Lahat ng pinadala ko sa&apos;yo, nandito na. Pumili ka ng oras, asawa ko.</p>
          </header>

          <div className="room">
            <aside className="side" aria-label="Mga toggle">
              <div className="top"><p className="lbl red">MGA TOGGLE</p></div>
              <div className="acts">
                <button className="act" type="button" onClick={() => { setSlot(nearRef.current.slot); setShown(PAGE); setFeat(null); }}>
                  ORAS NGAYON · <b>{nearRef.current.slot}</b>
                </button>
                <button className="act" type="button" disabled={!list.length} onClick={surprise}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="1" fill="currentColor" /><circle cx="15" cy="15" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
                  SURPRISE ME
                </button>
              </div>

              <div className="grp">
                <p className="lbl">ORAS</p>
                <div className="chips scroll" role="group" aria-label="Oras">
                  <Chip label="LAHAT" pressed={!slot} count={slotCounts['']} onClick={() => { setSlot(''); setShown(PAGE); setFeat(null); }} />
                  {SLOTS.map(s => (
                    <Chip key={s} label={s} pressed={slot === s} count={slotCounts[s]}
                      disabled={!slotCounts[s] && slot !== s}
                      onClick={() => { setSlot(slot === s ? '' : s); setShown(PAGE); setFeat(null); }} />
                  ))}
                </div>
              </div>

              <details className="more" open={wide.current}>
                <summary>MAS MARAMING TOGGLE <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></summary>
                <div className="grp">
                  <p className="lbl">HABA</p>
                  <div className="chips" role="group" aria-label="Haba">
                    {[['', 'LAHAT'], ['long', 'MAHABA'], ['short', 'MAIKLI']].map(([v, l]) => (
                      <Chip key={v} label={l} pressed={kind === v} onClick={() => { setKind(v); setShown(PAGE); setFeat(null); }} />
                    ))}
                  </div>
                </div>
                <div className="grp">
                  <p className="lbl">UMAGA O GABI</p>
                  <div className="chips" role="group" aria-label="AM o PM">
                    {[['', 'LAHAT'], ['AM', 'UMAGA (AM)'], ['PM', 'GABI (PM)']].map(([v, l]) => (
                      <Chip key={v} label={l} pressed={ap === v} onClick={() => { setAp(v); setShown(PAGE); setFeat(null); }} />
                    ))}
                  </div>
                </div>
                <div className="grp">
                  <p className="lbl">AYOS</p>
                  <div className="chips" role="group" aria-label="Ayos">
                    {[['new', 'PINAKABAGO'], ['old', 'PINAKALUMA']].map(([v, l]) => (
                      <Chip key={v} label={l} pressed={sort === v} onClick={() => { setSort(v); setShown(PAGE); setFeat(null); }} />
                    ))}
                  </div>
                </div>
                <div className="grp">
                  <label className="lbl" htmlFor="oras-q">HANAPIN</label>
                  <input className="find" id="oras-q" type="search" placeholder="ISANG SALITA LANG" autoComplete="off" enterKeyHint="search" onInput={handleSearch} />
                </div>
              </details>

              <p className="status" role="status">
                {active ? `${list.length} SA ${all.length} MESSAGE ANG BAGAY.` : `${all.length} MESSAGE SA KABUUAN.`}
                {active && <button type="button" onClick={clearAll}>ALISIN</button>}
              </p>
            </aside>

            <section className="panel" aria-label="Mga message">
              <div className="ph"><span className="r">MGA MESSAGE</span><span className="n">{list.length}{active ? ` / ${all.length}` : ''}</span></div>
              <div className="pb">
                {error && (
                  <div className="empty"><p>HINDI MA-LOAD ANG MGA MESSAGE. SUBUKAN ULIT MAMAYA.</p></div>
                )}
                {!error && feat && list.includes(feat) && <FeatCard m={feat} onAgain={surprise} />}
                {!error && !list.length && all.length > 0 && (
                  <div className="empty">
                    <p>WALANG BAGAY SA MGA TOGGLE.</p>
                    <button type="button" onClick={clearAll}>ALISIN ANG MGA FILTER</button>
                  </div>
                )}
                {!error && shownList.map((m, i) => {
                  const dayHeader = m.d !== curDay;
                  if (dayHeader) curDay = m.d;
                  const d = dayHeader ? dayLabel(m.d) : null;
                  return (
                    <div key={m.s + '-' + i} className={dayHeader ? 'day' : undefined}>
                      {dayHeader && <h2><span>{d[0]} · {d[1]}</span><span>{m.d.slice(0, 4)}</span></h2>}
                      <MsgCard m={m} />
                    </div>
                  );
                })}
                {list.length > shown && (
                  <button className="more-btn" type="button" onClick={() => setShown(s => s + PAGE)}>
                    MAS MARAMI PA ({list.length - shown})
                  </button>
                )}
              </div>
            </section>
          </div>

          <footer>
            <p className="sign">— Chico</p>
            <p className="fine">LIBRARY NI CHICO · PARA KAY CHICA</p>
          </footer>
        </main>
      </div>
    </LibraryLayout>
  );
}
