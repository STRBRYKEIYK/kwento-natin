import { useState, useCallback, useEffect, useRef } from 'react';
import './StarsPage.css';

const NOTES = [
  ['Yung tawa mo', 'MAY MGA ARAW PONG ISANG TAWA MO LANG, PARANG MAY NADAGDAG NANG KONTING LIWANAG SA ARAW KOOOO.'],
  ['Yung mga kwento mo', 'KAHIT YUNG MGA RANDOM NA BAGAY NA KINUKWENTO MOOOO, GUSTO KONG PAKINGGAN. GUSTO KONG MAS MAKILALA YUNG MUNDO MO.'],
  ['Yung pagiging ikaw', 'WALA PO KANG KAILANGANG PATUNAYAN SA MUNTING SURPRISE NA ITO. MASAYA LANG PO AKONG IKAW YUNG CHICAAAA KOOOO.'],
  ['Yung maliliit na sandali', 'MGA SIMPLENG KUMUSTAHAN, MAIKLING TAWANAN, AT KAHIT ORDINARYONG ARAW—MGA BAGAY NA PINAPAHALAGAHAN KOOOO.'],
  ['Yung ngiti mo', 'SANA PO MAY KAHIT ISANG MUNTING BAGAY NA MAKAPAGPANGITI SA’YO NGAYON, ASAWAAAA.'],
  ['Yung pangarap natin', 'GUSTO KO PONG MATUTUNAN ANG MAG-ALAGA SA MGA PANGARAP NANG MAY PAGPAPASENSYA AT PAG-UNAWA.'],
  ['Yung oras mo', 'SALAMAT SA BAWAT SANDALING IBINABAHAGI MO SA AKIN. ALAM KO PONG MAHALAGA ANG ORAS MOOOO.'],
  ['Yung puso mo', 'GUSTO KO PONG MAGING MAS MAINGAT SA MGA SALITA AT GAWA KO, DAHIL MAHALAGA PO SA AKIN YUNG PUSO MOOOO.'],
  ['Yung tahimik na lambing', 'HINDI PO LAHAT NG PAGMAMAHAL KAILANGANG MALAKAS. MINSAN NASA MAHINAHONG PAKIKINIG AT SIMPLENG PAG-ALALA LANG.'],
  ['Yung susunod na araw', 'SANA PO MAY DALANG KAPAYAPAAN AT MGA MUNTING MAGAGANDANG SANDALI ANG MGA SUSUNOD NA ARAW MOOOO.'],
  ['Yung pagpapasalamat ko', 'SALAMAT PO SA PAGIGING BAHAGI NG BUHAY KO, ASAWAAAA. HINDI KO BINABALEWALA YUN.'],
  ['Yung huling bituin', 'KUNG MAY ISANG BAGAY PO AKONG GUSTONG MANATILING TOTOO, YUN AY ANG PAGMAMAHAL NA IPINAPAKITA SA PAGGALANG, PASENSYA, AT MABUBUTING GAWA.'],
];

export default function StarsPage() {
  const [opened, setOpened] = useState(new Set());
  const [active, setActive] = useState(null);
  const finalRef = useRef(null);

  useEffect(() => {
    document.title = '12:12 · A Sky Full of Little Things';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = '#201928';
    return () => { if (meta) meta.content = '#121111'; };
  }, []);

  const openStar = useCallback((i) => {
    setOpened(prev => { const next = new Set(prev); next.add(i); return next; });
    setActive(i);
  }, []);

  useEffect(() => {
    if (opened.size === 12 && finalRef.current) {
      setTimeout(() => finalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 400);
    }
  }, [opened.size]);

  const surprise = () => {
    const unopened = NOTES.map((_, i) => i).filter(i => !opened.has(i));
    openStar(unopened.length ? unopened[Math.floor(Math.random() * unopened.length)] : Math.floor(Math.random() * 12));
  };

  const reset = () => {
    setOpened(new Set());
    setActive(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="stars-page">
      <div className="sky" aria-hidden="true" />
      <main className="wrap">
        <header>
          <div className="eyebrow">A little something for you</div>
          <div className="clock">12<span>:</span>12</div>
          <h1>Isang munting langit para sa&apos;yo.</h1>
          <p className="subtitle">
            ASAWAAAA KOOOO, MI CHICAAAA 🥹❤️<br />
            Hindi po ito mahabang sulat. May 12 munting bituin lang na gusto kong ipakita sa&apos;yo. Bawat isa, may nakatagong lambing mula sa Chico mo.
          </p>
          <p className="instruction">PINDUTIN MO LANG PO ANG MGA BITUIN, KAPAG GUSTO MOOOO ✦</p>
        </header>

        <section className="scene" aria-label="Twelve little star notes">
          <div className="counter" aria-live="polite">{opened.size} of 12 little stars opened</div>
          <div className="stars">
            {NOTES.map((_, i) => (
              <button key={i} type="button" className={`star${opened.has(i) ? ' open' : ''}`}
                aria-label={`${opened.has(i) ? 'Reopen' : 'Open'} star ${i + 1}`}
                onClick={() => openStar(i)}>
                <span className="glyph" aria-hidden="true">✦</span>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>

          <div className={`reader${active !== null ? ' new' : ''}`} key={active} aria-live="polite">
            {active !== null ? (
              <>
                <div className="number">Star {String(active + 1).padStart(2, '0')} / 12</div>
                <h2>{NOTES[active][0]}</h2>
                <p>{NOTES[active][1]}</p>
              </>
            ) : (
              <>
                <div className="number">A little note from Chico</div>
                <h2>Pick a star, Chicaaa ko.</h2>
                <p>Wala pong tamang pagkakasunod-sunod. Kahit alin po, para sa&apos;yo lahat.</p>
              </>
            )}
          </div>

          <div className="controls">
            <button className="btn" type="button" onClick={surprise}>Surprise me ✦</button>
            <button className="btn" type="button" onClick={reset}>Start again ↺</button>
          </div>
        </section>

        {opened.size === 12 && (
          <section className="final" ref={finalRef}>
            <div className="label">After all twelve stars</div>
            <h2>At ang ikalabintatlo?</h2>
            <p>Hindi po siya bituin. Siya yung tahimik na hiling ko para sa&apos;yo: na sa mga darating na araw, may mga munting sandaling magpapagaan ng puso mo at magbibigay ng dahilan para ngumiti ka.</p>
            <p className="big">AT KUNG MAY MAIDADAGDAG MAN AKONG LIWANAG SA ARAW MOOOO, MASAYA NA PO AKO ROON. ♡</p>
            <p>HINDI MO PO KAILANGANG MAG-REPLY O MAGMADALI. GUSTO KO LANG PONG IPAALALA NA NAPAKAHALAGA MO, ASAWAAAA KOOOO.</p>
            <p><strong>MAHAL NA MAHAL KITAAAA, CHICAAAA KOOOO. ❤️</strong></p>
          </section>
        )}

        <p className="bottom">Made with care, from your Chico.<br />Isang munting sorpresa lang po, walang kailangang kapalit.</p>
      </main>
    </div>
  );
}
