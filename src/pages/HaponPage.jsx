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

export default function HaponPage() {
  const [note, setNote] = useState(null);
  const [visited, setVisited] = useState([]);
  const titleRef = useRef(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '12:12 · Hapon Natin — Para sa Chicaaa ko';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    if (note) titleRef.current?.focus({ preventScroll: true });
  }, [note]);

  function openNote(next) {
    setNote(next);
    setVisited(previous => previous.includes(next) ? previous : [...previous, next]);
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
          <section className="hp-hero" aria-labelledby="hp-heading">
            <div className="hp-copy">
              <p className="hp-eyebrow">12:12 PM · PARA SA’YO, NGAYONG HAPON</p>
              <h1 id="hp-heading">Sa gitna ng araw,<br /><em>ikaw ang<br />pahinga ko.</em></h1>
              <p className="hp-intro">Chicaaa ko, nagtira po ako ng isang lugar sa tabi ko. May malamig na inumin, isang bulaklak, at mga salitang gusto kong ibulong sa’yo.</p>
              <p className="hp-hand">Dito ka muna, asawa. Tayo muna. ♡</p>
              <a className="hp-primary" href="#hp-note" onClick={() => openNote('letter')}>Tabi muna tayo <Heart /></a>
              <p className="hp-footnote">ISANG HAPON. DALAWANG BASO. IKAW ANG KASAMA.</p>
            </div>

            <div className="hp-picnic">
              <div className="hp-art">
                <img src={picnic} width="1200" height="900" alt="Isang picnic para sa dalawa: dalawang baso ng iced tea, isang pulang tulip, at sobre na may pusong selyo sa ilalim ng araw." />
                <div className="hp-clock" aria-hidden="true">12:12<span>HAPON NATIN</span></div>
                <span className="hp-scribble" aria-hidden="true">yung katabi ko, sa’yo.</span>
                <a href="#hp-note" className={`hp-pin hp-pin-drink${visited.includes('rest') ? ' hp-visited' : ''}`} onClick={() => openNote('rest')} aria-label="Buksan ang munting pahinga"><span>♡</span> PAHINGA</a>
                <a href="#hp-note" className={`hp-pin hp-pin-flower${visited.includes('flower') ? ' hp-visited' : ''}`} onClick={() => openNote('flower')} aria-label="Buksan ang bulaklak mo"><span>♡</span> BULAKLAK</a>
                <a href="#hp-note" className={`hp-pin hp-pin-letter${visited.includes('letter') ? ' hp-visited' : ''}`} onClick={() => openNote('letter')} aria-label="Buksan ang sulat ni Chico"><span>♡</span> SULAT MO</a>
              </div>
              <div className="hp-caption"><span>PINDUTIN ANG MGA MUNTING LAMBING</span><span>PARA SA CHICAAA KO <Heart /></span></div>
            </div>
          </section>

          <section className="hp-reading" id="hp-note" aria-label="Mga lambing ni Chico" hidden={!note}>
            <nav className="hp-note-nav" aria-label="Pumili ng lambing">
              {[['rest', 'Isang pahinga'], ['flower', 'Isang bulaklak'], ['letter', 'Isang sulat']].map(([id, label]) => (
                <button key={id} type="button" aria-pressed={note === id} onClick={() => openNote(id)}>{label} <span aria-hidden="true">{visited.includes(id) ? '♥' : '♡'}</span></button>
              ))}
            </nav>
            {note === 'letter' ? (
              <article className="hp-letter">
                <div className="hp-letter-top"><span>12:12 PM · ISANG LIHAM SA GITNA NG ARAW</span><Heart /></div>
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
          </section>
        </main>

        <footer className="hp-footer"><Link to="/">BALIK SA LIBRARY</Link><span>12:12 · HAPON NATIN</span><span>WITH LOVE, YOUR CHICOOO <Heart /></span></footer>
      </div>
    </div>
  );
}
