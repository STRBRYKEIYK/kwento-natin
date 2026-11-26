import { useEffect, useRef, useState } from 'react';
import { LibraryLayout } from '../library/LibraryLayout.jsx';
import { BackLink } from '../library/BackLink.jsx';
import './MatamisPage.css';

export const BAKE_SECONDS = 10;

export const INGREDIENTS = [
  { id: 'ngiti', amount: '1 TASANG', name: 'NGITI MO', why: 'PINAKAMATAMIS NA ASUKAL SA BUONG MUNDO.' },
  { id: 'asawa', amount: '10 PATAK NG', name: '“ASAWA KO”', why: 'TUMATAMIS ANG LAHAT PAG SINASABI KO ’YAN.' },
  { id: 'tawa', amount: '2 KUTSARANG', name: 'TAWA MO', why: 'MALAMBOT SA TENGA, MATAMIS SA PUSO. HSHSHS!' },
  { id: 'kilig', amount: '1 PISNGI NG', name: 'KILIG', why: 'YUNG NAMUMULA KA PAG NAGLALAMBINGAN TAYO.' },
  { id: 'boses', amount: '3 KUTSARITANG', name: 'BOSES MO', why: 'KAHIT ISANG “HELLO” LANG, TUNAW NA AGAD AKO.' },
  { id: 'puso', amount: '1 PIRASONG', name: 'MALAMBOT NA PUSO MO', why: 'PARA SA MGA ASO’T PUSANG NAGHAHANAP NG TAHANAN.' },
  { id: 'iloveyou', amount: '1 BUNGKOS NG', name: '“I LOVE YOU”', why: 'WALANG EXPIRATION, WALANG LIMIT, WALANG TIGIL.' },
  { id: 'yakap', amount: '1 MALAKING', name: 'YAKAP', why: 'HINDI PINAGMAMADALI, PARA MAS TUMAGAL ANG TAMIS.' },
  { id: 'pangako', amount: '1 CRUST NA GAWA SA', name: 'PANGAKO KO', why: 'MATIBAY, HINDI BUMIBITAW, AT PARA SA ’YO LANG.' },
  { id: 'ikaw', amount: '1 CHERRY SA TAAS:', name: 'IKAW', why: 'ANG PINAKAHULING SANGKAP, ANG PINAKAMAHALAGA.' },
];

const OVEN_LINES = [
  { from: 10, text: 'PINAPAINIT PA ANG HURNO…' },
  { from: 7, text: 'MAY AMOY NA, ASAWA KO.' },
  { from: 4, text: 'KONTING TIIS PA. MATAMIS ’TO, PANGAKO.' },
  { from: 1, text: 'HALOS NA!' },
];

const LETTER = [
  '10:10 POOO, CHICAAAA KOOOO! KUNG TITINGNAN MO YUNG DALAWANG KAMAY NG ORASAN SA ORAS NA ’TO, PARANG NAKABUKAS ANG DALAWANG BRASO NIYA, HANDANG YUMAKAP. AT NGUMINGITI PA. KAYA NAISIP KO, ANG ORAS NA ’TO AY PARA SA MATAMIS NA BAGAY. AT ANG PINAKAMATAMIS SA BUHAY KO AY IKAW. HSHSHSHS!',
  'KAYA TUMIMPLA AKO NG KEK PARA SA ’YO. WALANG MALAKING OKASYON, WALANG HINIHINGING KAPALIT. GUSTO LANG KITANG PATAMISIN ANG ARAW MO, KASI SA ARAW KO, IKAW LANG ANG NAGPAPATAMIS DOON.',
  'ALAM MO BA KUNG ANONG PINAKAMATAMIS NA SANGKAP SA RESIPING ’TO? HINDI YUNG ASUKAL. YUNG NGITI MO. KAPAG NGUMINGITI KA, PARANG HUMIHINTO YUNG ORAS PARA LANG PAGMASDAN KA. KAYA SIGURO NAKAKATUWA NA ANG 10:10 AY NGITI RIN SA ORASAN.',
  'SAMPUNG SANGKAP LANG ANG NAISULAT KO, PERO ANG TOTOO, ASAWAAA KO, SAMPUNG LIBO PA YUN. HINDI KO KAYANG BILANGIN YUNG MGA DAHILAN KUNG BAKIT ANG SARAP MONG MAHALIN. ISANG PAHINA PA LANG ’TO NG RESIPI, MAY MARAMI PA AKONG ISUSULAT.',
  'KAYA PAG NAKITA MO ANG 10:10, NGUMITI KA, HA? ISIPIN MO NA NASA TABI MO AKO, HAWAK ANG PLATO NG KEK, AT HINIHINTAY KANG MAUNANG TUMIKIM. KAPAG HINDI MO MAUBOS, OKAY LANG, SA ’KIN NA YUNG NATIRA. HSHSHSHS!',
];

const pad = n => String(n).padStart(2, '0');

function Clock({ className = '' }) {
  // 10:10: the hour hand sits a little past ten (305°), the minute hand on the two (60°)
  const hand = (deg, len) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x2: 100 + len * Math.cos(rad), y2: 100 + len * Math.sin(rad) };
  };
  const hour = hand(305, 46);
  const minute = hand(60, 70);
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="92" className="mt-clock-face" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        const long = i % 3 === 0;
        return <line key={i} x1={100 + (long ? 74 : 79) * Math.cos(a)} y1={100 + (long ? 74 : 79) * Math.sin(a)} x2={100 + 86 * Math.cos(a)} y2={100 + 86 * Math.sin(a)} className="mt-clock-tick" />;
      })}
      <line x1="100" y1="100" {...hour} className="mt-clock-hand mt-clock-hour" />
      <line x1="100" y1="100" {...minute} className="mt-clock-hand mt-clock-minute" />
      <circle cx="100" cy="100" r="6" className="mt-clock-pin" />
    </svg>
  );
}

function Cake({ count }) {
  const layer = (min, name, children) => <g className={`mt-layer mt-layer-${name}${count >= min ? ' is-on' : ''}`}>{children}</g>;
  return (
    <svg className="mt-cake" viewBox="0 0 260 230" role="img" aria-label={`ANG KEK MO: ${count} SA 10 SANGKAP NA`}>
      <ellipse cx="130" cy="204" rx="108" ry="13" className="mt-plate" />
      <ellipse cx="130" cy="201" rx="84" ry="8" className="mt-plate-in" />
      {layer(1, 'crust', <rect x="62" y="160" width="136" height="34" rx="5" className="mt-crust" />)}
      {layer(3, 'cream-a', <rect x="62" y="126" width="136" height="34" className="mt-cream" />)}
      {layer(5, 'cream-b', <rect x="62" y="92" width="136" height="34" className="mt-cream" />)}
      {layer(7, 'top', <rect x="62" y="74" width="136" height="18" rx="4" className="mt-top" />)}
      {layer(9, 'drizzle', <path d="M72 92 q4 20 8 0 M100 92 q5 24 10 0 M138 92 q4 16 8 0 M168 92 q5 22 10 0" className="mt-drizzle" />)}
      {layer(10, 'cherry', <><path d="M130 58 q8 -20 24 -26" className="mt-stem" /><circle cx="130" cy="64" r="11" className="mt-cherry" /></>)}
    </svg>
  );
}

export default function MatamisPage() {
  const [added, setAdded] = useState([]);
  const [stage, setStage] = useState('mix'); // mix → bake → done
  const [seconds, setSeconds] = useState(BAKE_SECONDS);
  const [tasted, setTasted] = useState(false);
  const heading = useRef(null);
  const count = added.length;
  const ready = count === INGREDIENTS.length;
  const oven = OVEN_LINES.find(line => seconds >= line.from) || OVEN_LINES[OVEN_LINES.length - 1];

  useEffect(() => {
    const previous = document.title;
    document.title = '10:10 · MATAMIS';
    return () => { document.title = previous; };
  }, []);

  useEffect(() => {
    if (stage !== 'bake') return undefined;
    if (seconds <= 0) { setStage('done'); return undefined; }
    const timer = setTimeout(() => setSeconds(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [stage, seconds]);

  useEffect(() => {
    if (stage === 'done') heading.current?.focus();
  }, [stage, tasted]);

  function toggle(id) {
    if (stage !== 'mix') return;
    setAdded(list => list.includes(id) ? list.filter(item => item !== id) : [...list, id]);
  }

  function bake() {
    if (!ready || stage !== 'mix') return;
    setSeconds(BAKE_SECONDS);
    setStage('bake');
  }

  function again() {
    setAdded([]);
    setStage('mix');
    setSeconds(BAKE_SECONDS);
    setTasted(false);
    window.scrollTo?.({ top: 0 });
  }

  const meterLabel = `${count} / ${INGREDIENTS.length}`;
  const action = stage === 'mix'
    ? <button className="mt-primary" type="button" disabled={!ready} onClick={bake}>{ready ? 'IHURNO NA' : `KULANG PA ANG ${INGREDIENTS.length - count}`}</button>
    : stage === 'bake'
      ? <button className="mt-primary" type="button" disabled>NASA HURNO PA…</button>
      : tasted
        ? <button className="mt-secondary" type="button" onClick={again}>TIMPLAHIN ULIT</button>
        : <button className="mt-primary" type="button" onClick={() => setTasted(true)}>TIKMAN MO</button>;

  return (
    <LibraryLayout>
      <div className="matamis" lang="tl">
        <main className="mt-shell">
          <header className="mt-topbar">
            <BackLink />
            <span>PARA SA CHICAAA KO</span>
            <span className="mt-small-clock">10:10</span>
          </header>

          <section className="mt-hero" aria-labelledby="mt-title">
            <div className="mt-hero-copy">
              <p className="mt-eyebrow">10:10 · ISANG RESIPI</p>
              <h1 id="mt-title">RESIPI NG<br /><em>MATAMIS.</em></h1>
              <p className="mt-intro">TINGNAN MO ANG ORASAN SA 10:10. NAKABUKAS ANG DALAWANG BRASO NIYA, HANDANG YUMAKAP. KAYA GUMAWA AKO NG RESIPI PARA SA ’YO: SAMPUNG SANGKAP, ISANG HURNO, AT ISANG KEK NA PARA LANG SA ASAWA KO.</p>
            </div>
            <Clock className="mt-clock" />
          </section>

          <div className="mt-room">
            <aside className="mt-side" aria-label="ANG KEK MO">
              <div className="mt-side-head"><span>CHEESECAKE NG 10:10</span><b>{meterLabel}</b></div>
              <Cake count={count} />
              <div className="mt-meter" role="img" aria-label={`TAMIS: ${count} SA 10`}>
                {INGREDIENTS.map((item, index) => <i key={item.id} className={index < count ? 'is-on' : ''} />)}
              </div>
              <dl className="mt-facts">
                <div><dt>SERVINGS</dt><dd>2 · IKAW AT AKO</dd></div>
                <div><dt>HURNO</dt><dd>{BAKE_SECONDS} SEGUNDO</dd></div>
                <div><dt>TAMIS</dt><dd>{count === INGREDIENTS.length ? '10 / 10' : `${count} / 10`}</dd></div>
              </dl>
              <div className="mt-side-action">{action}</div>
            </aside>

            <section className="mt-panel" aria-label="MGA SANGKAP">
              {stage === 'mix' && <>
                <div className="mt-panel-head"><span>MGA SANGKAP</span><b>{meterLabel}</b></div>
                <p className="mt-panel-hint">PINDUTIN MO ANG BAWAT ISA PARA IDAGDAG SA TIMPLA. PWEDE MONG ALISIN ULIT KUNG GUSTO MO.</p>
                <ul className="mt-grid">
                  {INGREDIENTS.map((item, index) => {
                    const on = added.includes(item.id);
                    return (
                      <li key={item.id}>
                        <button type="button" className={`mt-card${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggle(item.id)}>
                          <span className="mt-card-no" aria-hidden="true">{pad(index + 1)}</span>
                          <span className="mt-card-amount">{item.amount}</span>
                          <span className="mt-card-name">{item.name}</span>
                          <span className="mt-card-why">{item.why}</span>
                          <span className="mt-card-state" aria-hidden="true">{on ? 'IDINAGDAG ✓' : 'IDAGDAG +'}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {ready && <div className="mt-panel-foot"><p>SAMPU NA! TAMA NA ANG TIMPLA, ASAWA KO.</p>{action}</div>}
              </>}

              {stage === 'bake' && <div className="mt-oven">
                <div className="mt-panel-head"><span>SA HURNO</span><b>10:10</b></div>
                <div className="mt-oven-box">
                  <p className="mt-timer" aria-hidden="true">00:{pad(seconds)}</p>
                  <div className="mt-oven-bar" aria-hidden="true"><i style={{ width: `${((BAKE_SECONDS - seconds) / BAKE_SECONDS) * 100}%` }} /></div>
                </div>
                <p className="mt-oven-line" role="status" aria-live="polite">{oven.text}</p>
                <p className="mt-panel-hint">SAMPUNG SEGUNDO LANG, HINDI SAMPUNG MINUTO. ISA PA, GUSTO KO NG SARIWANG LAMBING PARA SA ’YO. HSHSHS!</p>
              </div>}

              {stage === 'done' && !tasted && <div className="mt-done">
                <div className="mt-panel-head"><span>LUTO NA</span><b>10 / 10</b></div>
                <h2 ref={heading} tabIndex={-1}>TAPOS NA, ASAWA KO!</h2>
                <p className="mt-done-score" aria-hidden="true">10<span>/</span>10</p>
                <p className="mt-done-copy">10/10 ANG TAMIS. HINDI LANG SA KEK, ASAWAAA KO. SA ’YO RIN. TIKMAN MO NA, MAY SULAT AKONG INIHAIN SA TABI NIYA.</p>
                {action}
              </div>}

              {stage === 'done' && tasted && <article className="mt-letter">
                <div className="mt-panel-head"><span>SULAT SA TABI NG KEK</span><b>10:10</b></div>
                <h2 ref={heading} tabIndex={-1}>ASAWAAAA KOOOO,</h2>
                {LETTER.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                <p className="mt-handwriting">10:10. NAKABUKAS ANG BRASO KO,<br />PARA SA ’YO LANG.</p>
                <p className="mt-signature">MAHAL NA MAHAL KITAAAA, CHICAAAA KOOOO!<br />MWUAAAAAAAAAAAHHHH! 😘❤️<br />YOUR CHICOOO</p>
                {action}
              </article>}
            </section>
          </div>

          <footer className="mt-footer"><span>10:10 · MATAMIS</span><span>WITH LOVE, ALWAYS.</span></footer>
        </main>
      </div>
    </LibraryLayout>
  );
}
