import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import picnic from '../../public/menu/img/hapon.svg';
import '../library/styles.css';
import './HaponPage.css';

const LITTLE_NOTES = {
  flower: { title: 'Isang bulaklak para sa’yo.', text: 'Para sa ngiti mong gusto kong makita ngayong hapon. Kung katabi lang kita, iaabot ko ’to tapos kukulitin kitang magpa-picture. Ang ganda mo, Chicaaa ko. Sasabihin ko ulit ’yan sa’yo sa susunod nating pagkikita.' },
  rest: { title: 'Yung isang baso, sa’yo.', text: 'Tabi muna tayo, asawa. Kahit ilang minuto lang. Inom ka muna ng tubig, luwagan ang balikat, at ikwento mo sa’kin kung kumusta ang araw mo. Gusto kitang pakinggan, kahit pa ang kwento mo ay “wala lang.”' },
};

function Heart() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20S3 14.8 3 8.6C3 3.5 9 2.4 12 6.6c3-4.2 9-3.1 9 2C21 14.8 12 20 12 20Z" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

function PicnicIcon({ type }) {
  if (type === 'flower') return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 28V15m0 8c-6 0-8-4-8-6 5 0 8 3 8 6Zm0-5c6 0 8-4 8-6-5 0-8 3-8 6ZM16 15C9 15 7 9 8 5l5 3 3-5 3 5 5-3c1 7-2 10-8 10Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>;
  if (type === 'rest') return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m7 10 2 18h14l2-18H7Zm3 5h12M19 18l4-15M5 28h22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="m12 18 3 3m3-1 2 3" stroke="currentColor" strokeWidth="2" /></svg>;
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="4" y="7" width="24" height="18" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="m4 8 12 10L28 8M4 25l9-9m15 9-9-9" stroke="currentColor" strokeWidth="1.3" /><path d="M16 23s-3-1.8-3-4c0-1.7 2-2 3-.6 1-1.4 3-1.1 3 .6 0 2.2-3 4-3 4Z" fill="currentColor" /></svg>;
}

const SURPRISES = [['rest', 'Isang pahinga', 'Yung isang baso, sa’yo.'], ['flower', 'Isang bulaklak', 'Para sa ngiti mo.'], ['letter', 'Isang sulat', 'May gusto akong sabihin.']];

export default function HaponPage() {
  const [note, setNote] = useState(null);
  const [visited, setVisited] = useState([]);
  const titleRef = useRef(null);
  const readingRef = useRef(null);
  const picnicRef = useRef(null);
  const picnicTitleRef = useRef(null);
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '12:12 · Hapon Natin — Para sa Chicaaa ko';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    if (!note) return;
    titleRef.current?.focus({ preventScroll: true });
    readingRef.current?.scrollIntoView?.({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [note, reveal]);

  function openNote(next) {
    setNote(next);
    setReveal(previous => previous + 1);
    setVisited(previous => previous.includes(next) ? previous : [...previous, next]);
  }

  function returnToPicnic() {
    setNote(null);
    picnicTitleRef.current?.focus({ preventScroll: true });
    picnicRef.current?.scrollIntoView?.({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  return (
    <div className="hapon" lang="tl">
      <div className="hp-shell">
        <header className="hp-nav">
          <Link to="/" className="hp-brand">LIBRARY NI CHICO<span>PARA KAY CHICA</span></Link>
          <span className="hp-nav-center">ORAS-ORAS · ISANG MUNTING HAPON</span>
          <span className="hp-nav-time">12:12 <Heart /></span>
        </header>

        <main>
          <section className="hp-hero" ref={picnicRef} aria-labelledby="hp-heading">
            <div className="hp-copy">
              <p className="hp-eyebrow"><span className="hp-sun" aria-hidden="true">☼</span> 12:12 PM · PARA SA CHICAAA KO</p>
              <h1 id="hp-heading" ref={picnicTitleRef} tabIndex={-1}>Sa gitna ng araw,<em>ikaw ang<br />pahinga ko.</em></h1>
              <p className="hp-hand">Dito ka muna, asawa. Tayo muna. ♡</p>
            </div>

            <div className="hp-picnic">
              <div className="hp-art">
                <img src={picnic} width="1200" height="900" alt="Isang picnic para sa dalawa: dalawang baso ng iced tea, isang pulang tulip, at sobre na may pusong selyo sa ilalim ng araw." />
                <div className="hp-clock" aria-hidden="true">12:12<span>HAPON NATIN</span></div>
                <span className="hp-scribble" aria-hidden="true">yung katabi ko, sa’yo.</span>
                <button type="button" className={`hp-pin hp-pin-drink${visited.includes('rest') ? ' hp-visited' : ''}`} onClick={() => openNote('rest')} aria-controls="hp-note" aria-label="Buksan ang munting pahinga"><span>♡</span></button>
                <button type="button" className={`hp-pin hp-pin-flower${visited.includes('flower') ? ' hp-visited' : ''}`} onClick={() => openNote('flower')} aria-controls="hp-note" aria-label="Buksan ang bulaklak mo"><span>♡</span></button>
                <button type="button" className={`hp-pin hp-pin-letter${visited.includes('letter') ? ' hp-visited' : ''}`} onClick={() => openNote('letter')} aria-controls="hp-note" aria-label="Buksan ang sulat ni Chico"><Heart /></button>
              </div>
              <div className="hp-caption"><span>ISANG HAPON. DALAWANG BASO.</span><span className="hp-caption-hand">ikaw ang kasama. ♡</span></div>
            </div>

            <div className="hp-invitation">
              <nav className="hp-explore" aria-label="Buksan ang mga lambing">
                {SURPRISES.map(([id, label, detail]) => <button key={id} type="button" onClick={() => openNote(id)} aria-controls="hp-note" aria-pressed={note === id}>
                  <PicnicIcon type={id} /><span className="hp-explore-copy"><span>{label}</span><small>{detail}</small></span><span className="hp-explore-mark" aria-hidden="true">{visited.includes(id) ? '♥' : '+'}</span>
                </button>)}
              </nav>
              <p className="hp-intro">Chicaaa ko, nagtira po ako ng isang lugar sa tabi ko. May malamig na inumin, isang bulaklak, at mga salitang gusto kong ibulong sa’yo.</p>
              <button className="hp-primary" type="button" aria-controls="hp-note" onClick={() => openNote('letter')}>Tabi muna tayo <Heart /></button>
            </div>
          </section>

          <section className="hp-reading" ref={readingRef} id="hp-note" aria-label="Mga lambing ni Chico" hidden={!note}>
            <div className="hp-reading-top"><span>MUNTING LAMBING · PARA SA’YO LANG</span><button type="button" onClick={returnToPicnic}>Balik sa picnic <span aria-hidden="true">×</span></button></div>
            <nav className="hp-note-nav" aria-label="Pumili ng lambing">
              {[['rest', 'Isang pahinga'], ['flower', 'Isang bulaklak'], ['letter', 'Isang sulat']].map(([id, label]) => (
                <button key={id} type="button" aria-pressed={note === id} onClick={() => openNote(id)}>{label} <span aria-hidden="true">{visited.includes(id) ? '♥' : '♡'}</span></button>
              ))}
            </nav>
            {note === 'letter' ? (
              <article className="hp-letter">
                <div className="hp-letter-top"><span>12:12 PM · ISANG LIHAM SA GITNA NG ARAW</span><span className="hp-letter-seal"><Heart /></span></div>
                <h2 ref={titleRef} tabIndex={-1}>Chicaaaa koooo,</h2>
                <p>12:12 POOOO, ASAWAAAA KOOOO. Tabi po muna tayo. Kahit dito lang muna sa munting picnic na ’to, gusto kitang makasama ngayong hapon. Yung isang baso, sa’yo. Yung bulaklak, sa’yo rin. At yung Chico na gustong-gusto kang makausap? Sa’yo po ’yon. ♡</p>
                <p>Gusto lang kitang singitan ng konting lambing sa gitna ng araw mo. Kumain ka na po ba, mahal? Sana may masarap kang nakain at may kahit saglit kang pahinga. Kung marami ka pang gagawin mamaya, nandito muna itong munting sulat na puwede mong balikan kapag gusto mong huminga.</p>
                <p>Iniisip ko kung anong ikukwento mo kung magkatabi tayo ngayon. Baka may nakakatawa kang nakita, baka may nakakainis na nangyari, o baka gusto mo lang munang manahimik habang umiinom tayo. Gusto ko po lahat ’yon. Gusto kong makilala pati yung ordinaryong hapon mo.</p>
                <p>Ang sarap sigurong umupo sa tabi mo nang walang hinahabol. Makikinig ako sa kwento mo, aabutin yung kamay mo, tapos sasabihin kong ang ganda mo. Malamang makukulitan ka na naman sa’kin kasi uulitin ko pa. Pero totoo po, Chicaaa ko. Gusto kitang tingnan at pakinggan nang ganon katagal.</p>
                <p>Habang hinihintay yung susunod nating pagkikita, gusto ko pong may mga ganitong munting bagay kang mabubuksan. May sulat kang matatagpuan sa isang ordinaryong hapon. May bulaklak na ginawa para sa’yo. May paalala na naisip kita at gusto kitang mapangiti.</p>
                <p>Sa 12:12 na ’to, sana gumaan kahit kaunti yung natitira mong araw. Sana masarap ang pagkain mo mamaya. Sana may dahilan kang tumawa. At kapag may gusto kang ikwento, gusto ko pong marinig. Kahit mahaba. Kahit paulit-ulit. Ikaw ’yan eh, asawa ko.</p>
                <p className="hp-letter-ending">Sa dami ng puwedeng gawin ngayong hapon,<br /><em>gusto ko lang munang mahalin ka.</em></p>
                <p className="hp-sign">Mahal na mahal kitAAAA.<br /><span>Your Chicooo ♡</span></p>
              </article>
            ) : note && (
              <article className="hp-little-note" key={note}>
                <p className="hp-eyebrow">ISANG MUNTING LAMBING · 12:12</p>
                <Heart />
                <h2 ref={titleRef} tabIndex={-1}>{LITTLE_NOTES[note].title}</h2>
                <p>{LITTLE_NOTES[note].text}</p>
                <p className="hp-sign">Your Chicooo ♡</p>
                <button className="hp-primary" type="button" onClick={() => openNote(note === 'rest' ? 'flower' : 'letter')}>{note === 'rest' ? 'May bulaklak ka rin' : 'May sulat pa ’ko'}</button>
              </article>
            )}
            <p className="hp-reading-footer">{visited.length === 3 ? 'SA’YO LAHAT NG LAMBING NA ’TO, ASAWA.' : 'DAHAN-DAHAN LANG. SA’YO ANG ORAS NA ’TO.'}</p>
            <button type="button" className="hp-return" onClick={returnToPicnic}>Balik muna sa picnic <Heart /></button>
          </section>
        </main>

        <footer className="hp-footer"><Link to="/">BALIK SA LIBRARY</Link><span>12:12 · HAPON NATIN</span><span>WITH LOVE, YOUR CHICOOO <Heart /></span></footer>
      </div>
    </div>
  );
}
