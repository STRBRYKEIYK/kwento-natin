import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../library/styles.css';
import './HilingPage.css';

export const HILING_KEY = 'chica.hiling.v1';
export const WISHES = [
  { id: 'umaga', label: 'Mabagal na umaga', wish: 'Sana, isang araw, hindi na tayo nagmamadaling magpaalam.', reply: 'Gusto ko rin ng umagang walang nagbibilang ng oras bago umuwi. Yung magkatabi lang tayo, inaantok pa, pinag-uusapan kung anong almusal. Hindi kailangang espesyal ang araw. Basta kasama kita, gusto ko na agad.' },
  { id: 'daan', label: 'Malayo, kasama ka', wish: 'Sana marami pa tayong mapuntahan, basta magkahawak-kamay.', reply: 'Marami pa akong gustong puntahan kasama ka, asawa. Pero kahit maligaw tayo, kahit umulan, kahit sa malapit lang muna, gusto kong ikaw yung katabi ko. Pati yung pag-uwi, parte ng lakad natin.' },
  { id: 'pahinga', label: 'Isang pahinga', wish: 'Sana sa mga araw na mabigat, may pahinga tayong dalawa.', reply: 'Kapag pagod ka na, hindi mo kailangang magpanggap na okay ka sa akin. Pwede tayong tumahimik muna. Makikinig ako kapag gusto mo nang magsalita. Gusto kong may lugar ka sa tabi ko, kahit sa mga araw na wala ka munang maibigay.' },
  { id: 'tahanan', label: 'Isang tahanan', wish: 'Sana, sa dulo ng bawat araw, sa isa’t isa tayo umuuwi.', reply: 'Naiisip ko yung maliliit na bagay: dalawang baso sa mesa, gamit mong naiwan sa tabi ng akin, at ikaw na kukulitin ko kung kumain ka na. Hindi ko pa alam ang bawat detalye ng bukas. Pero gusto kong alagaan kung anong meron tayo, araw-araw, papunta roon.' },
];

const CUSTOM_REPLY = 'Hindi ko man alam lahat ng laman ng hiling mo, gusto kong may puwang doon ang sarili mong saya, ang pahinga mo, at yung mga pangarap na matagal mo nang dala. Kakampi mo ako, asawa. Gusto kitang makitang masaya, sa mga pangarap natin at sa mga pangarap na para sa ’yo.';

function readWish() {
  try {
    const saved = JSON.parse(localStorage.getItem(HILING_KEY));
    if (!saved || typeof saved.wish !== 'string' || !saved.wish.trim() || saved.wish.length > 240) return null;
    return { wish: saved.wish, replyId: WISHES.some(item => item.id === saved.replyId) ? saved.replyId : null };
  } catch { return null; }
}

function Plane({ className = '' }) {
  return <svg className={className} viewBox="0 0 100 75" fill="none" aria-hidden="true"><path d="M4 25 94 5 63 68 44 43 4 25Z" fill="#fff4df" stroke="#9d8277" strokeWidth="1.2" /><path d="m44 43 50-38-35 48 4 15-12-18" fill="#dfc8b3" /><path d="m4 25 55 28L94 5 44 43" stroke="#9d8277" strokeWidth="1.2" /></svg>;
}

function WindowScene({ stage }) {
  const open = stage !== 'closed';
  return <div className={`hl-scene${open ? ' is-open' : ''} is-${stage}`} aria-hidden="true">
    <div className="hl-orbit hl-orbit-one" /><div className="hl-orbit hl-orbit-two" />
    <span className="hl-scene-note">may bukas pa tayong dalawa.</span>
    <div className="hl-window-shadow" />
    <div className="hl-window">
      <div className="hl-outside">
        <div className="hl-moon" />
        <svg className="hl-sky" viewBox="0 0 360 500" preserveAspectRatio="xMidYMid slice">
          <g fill="#f4d9b5"><circle cx="60" cy="160" r="1.3" /><circle cx="140" cy="68" r="1" /><circle cx="285" cy="185" r="1.5" /><circle cx="305" cy="100" r="1" /><circle cx="110" cy="230" r="1" /><path d="m180 125 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" /></g>
          <path d="M0 365Q70 305 150 355T360 325V500H0Z" fill="#6e718c" /><path d="M0 405Q85 350 180 405T360 380V500H0Z" fill="#42465f" />
          <path d="M0 455h32v-62l29-22 29 22v62h34v-30h30v30h25v-70l42-27 42 27v70h30v-43h45v43h22v45H0Z" fill="#252b43" />
          <g fill="#f9d6a1"><rect x="48" y="405" width="11" height="19" rx="5" /><rect x="66" y="405" width="11" height="19" rx="5" /><rect x="207" y="395" width="11" height="18" /><rect x="232" y="395" width="11" height="18" /><rect x="306" y="430" width="10" height="12" /></g>
        </svg>
        <svg className="hl-flight-path" viewBox="0 0 360 500"><path d="M90 430C20 310 310 355 240 235S120 190 265 105" /></svg>
        <Plane className="hl-flying-plane" />
      </div>
      <div className="hl-window-glass" /><div className="hl-mullion hl-mullion-v" /><div className="hl-mullion hl-mullion-h" />
      <div className="hl-curtain hl-curtain-left" /><div className="hl-curtain hl-curtain-right" />
    </div>
    <div className="hl-sill"><span /></div>
    <div className="hl-vase"><i /><i /><i /><b /></div>
    <div className="hl-clock"><span>11:11</span><small>MAKE A LITTLE WISH</small></div>
    <div className="hl-scene-caption"><span />KUNG SAAN NAKAKARATING ANG MGA HILING<span /></div>
  </div>;
}

export default function HilingPage() {
  const [stage, setStage] = useState('closed');
  const [wish, setWish] = useState('');
  const [replyId, setReplyId] = useState(null);
  const [saved, setSaved] = useState(readWish);
  const [saveFailed, setSaveFailed] = useState(false);
  const panelHeading = useRef(null);
  const textarea = useRef(null);
  const reply = WISHES.find(item => item.id === replyId)?.reply || CUSTOM_REPLY;
  const step = stage === 'closed' ? 0 : stage === 'writing' ? 1 : stage === 'folded' ? 2 : 3;

  useEffect(() => {
    const previous = document.title;
    const background = document.body.style.background;
    document.body.style.background = '#171e32';
    document.title = '11:11 · Hiling — Sa lahat ng hiling, ikaw.';
    return () => { document.title = previous; document.body.style.background = background; };
  }, []);

  useEffect(() => {
    if (stage === 'writing') textarea.current?.focus({ preventScroll: true });
    else if (stage !== 'closed') panelHeading.current?.focus({ preventScroll: true });
  }, [stage]);

  useEffect(() => {
    if (stage !== 'flying') return undefined;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => setStage('arrived'), reduced ? 0 : 2200);
    return () => clearTimeout(timer);
  }, [stage]);

  function choose(item) { setWish(item.wish); setReplyId(item.id); }

  function send() {
    const record = { wish: wish.trim(), replyId };
    try { localStorage.setItem(HILING_KEY, JSON.stringify(record)); setSaved(record); setSaveFailed(false); }
    catch { setSaveFailed(true); }
    setStage('flying');
  }

  function revisit() {
    setWish(saved.wish); setReplyId(saved.replyId); setStage('arrived');
  }

  return <div className="hiling" lang="tl">
    <div className="hl-grain" aria-hidden="true" />
    <div className="hl-shell">
      <header className="hl-topbar">
        <Link to="/" className="hl-home">LIBRARY NI CHICO<span>PARA KAY CHICA</span></Link>
        <span className="hl-dedication">a little corner of our someday</span>
        <span className="hl-edition">11:11 <span aria-hidden="true">✧</span></span>
      </header>

      <main className={`hl-main hl-stage-${stage}`}>
        <section className="hl-content" aria-labelledby="hl-title">
          <p className="hl-eyebrow"><span />11:11 · HILING</p>
          <h1 id="hl-title">Sa lahat<br />{' '}ng hiling,<br />{' '}<em>ikaw.</em><svg viewBox="0 0 210 14" aria-hidden="true"><path d="M3 10Q88-2 205 6M28 13Q106 4 181 10" /></svg></h1>

          {stage === 'closed' && <div className="hl-intro hl-enter">
            <p>Sabi nila, humiling ka raw kapag 11:11.<br />Ako, pareho pa rin ang hinihiling.</p>
            <p className="hl-intro-whisper">Mas marami pang bukas na kasama ka.</p>
            <button type="button" className="hl-primary" onClick={() => setStage('writing')}>Buksan ang bintana <span aria-hidden="true">✧</span></button>
            <span className="hl-tiny">KAHIT ANONG ORAS, MAY PUWANG ANG HILING MO.</span>
            {saved && <button type="button" className="hl-text-button" onClick={revisit}>Balikan ang huli mong hiling</button>}
          </div>}

          {stage === 'writing' && <form className="hl-compose hl-enter" onSubmit={event => { event.preventDefault(); if (wish.trim()) setStage('folded'); }}>
            <fieldset><legend>Anong hiling mo para sa atin?</legend>
              <div className="hl-choices">{WISHES.map(item => <button type="button" key={item.id} aria-pressed={replyId === item.id} onClick={() => choose(item)}>{item.label}</button>)}</div>
            </fieldset>
            <div className="hl-paper">
              <label htmlFor="hl-wish">O isulat mo ang sarili mong hiling…</label>
              <textarea id="hl-wish" ref={textarea} rows={3} maxLength={240} value={wish} placeholder="Sana, isang araw…" required onChange={event => { setWish(event.target.value); setReplyId(null); }} />
              <div className="hl-paper-bottom"><span>para sa mga bukas natin</span><span>{wish.length}/240</span></div>
            </div>
            <button className="hl-primary" type="submit" disabled={!wish.trim()}>Itupi ang hiling <Plane /></button>
            <p className="hl-privacy">Dito lang sa browser mo itatabi ang hiling. Hindi ito ipinapadala kay Chico.</p>
          </form>}

          {stage === 'folded' && <div className="hl-folded hl-enter">
            <h2 ref={panelHeading} tabIndex={-1}>Handa na ang munting hiling mo.</h2>
            <blockquote>“{wish.trim()}”</blockquote>
            <div className="hl-folded-note"><Plane /><span>isang papel, isang posibleng bukas.</span></div>
            <button type="button" className="hl-primary" onClick={send}>Paliparin ang hiling <span aria-hidden="true">✧</span></button>
            <button type="button" className="hl-text-button" onClick={() => setStage('writing')}>May babaguhin pa ako</button>
          </div>}

          {stage === 'flying' && <div className="hl-sending hl-enter">
            <h2 ref={panelHeading} tabIndex={-1}>Papunta sa mga bukas natin.</h2>
            <p role="status">Lumilipad na ang hiling mo…</p>
            <button type="button" className="hl-text-button" onClick={() => setStage('arrived')}>Buksan na ang sagot ni Chico</button>
          </div>}

          {stage === 'arrived' && <article className="hl-reply hl-enter">
            <span className="hl-letter-label">MAY SAGOT ANG HILING MO</span>
            <h2 ref={panelHeading} tabIndex={-1}>Chicaaa ko,</h2>
            <blockquote>“{wish.trim()}”</blockquote>
            <p>{reply}</p>
            <p>Sa bawat 11:11, ikaw pa rin. At sa pagitan ng mga oras na ’yon, pipiliin pa rin kita.</p>
            <p className="hl-signature">Nagmamahal at humihiling kasama mo,<br /><strong>Chicooo mo ♡</strong></p>
            {saveFailed && <p className="hl-save-error" role="status">Hindi naitabi sa browser ang hiling mo. Pwede mo pa rin itong basahin ngayon.</p>}
            <button type="button" className="hl-text-button" onClick={() => { setWish(''); setReplyId(null); setSaveFailed(false); setStage('writing'); }}>Isa pang hiling?</button>
          </article>}
        </section>

        <div className="hl-visual"><WindowScene stage={stage} /></div>
      </main>

      <footer className="hl-footer">
        <ol aria-label="Mga hakbang">{['Buksan', 'Humiling', 'Paliparin'].map((label, index) => <li key={label} className={step > index ? 'is-active' : ''} aria-current={step === index + 1 ? 'step' : undefined}><span aria-hidden="true">{step > index + 1 ? '✓' : `0${index + 1}`}</span>{label}</li>)}</ol>
        <p>hindi lang sa 11:11. <em>sa araw-araw, ikaw.</em></p>
      </footer>
    </div>
  </div>;
}
