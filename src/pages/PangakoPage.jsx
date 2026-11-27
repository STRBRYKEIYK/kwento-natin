import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../library/styles.css';
import './PangakoPage.css';
import PangakoRing from './PangakoRing.jsx';

const PROMISES = [
  {
    id: 'bagyo',
    num: '01',
    tabTitle: 'SA BAGYO AT ULAN',
    tabSub: 'SHELTER, PAYONG, AT SAFE SPACE',
    meta: 'CHICO · AUG 15, 2026 · 2:10–2:11 PM',
    heading: 'HINDI AKO SUSUKO SA’YO, CHICAAA.',
    quotes: [
      {
        text: '“I WON’T GIVE UP CHICAAA KAHIT DUMATING ANG BAGYO I’LL MAKE US A SHELTER”',
        by: 'CHICO · AUG 15, 2026 · 2:10 PM',
      },
      {
        text: '“IF MAULAN KUKUHA AKO NG PAYONG”',
        by: 'CHICO · AUG 15, 2026 · 2:11 PM',
      },
      {
        text: '“IF YOU FELT IN DANGER I’LL BE YOUR SAFE SPACE”',
        by: 'CHICO · AUG 15, 2026 · 2:11 PM',
      },
    ],
    whisper:
      'KAHIT ANONG BIGAT NG ARAW O LAKAS NG ULAN, GUSTO KONG MALAMAN MONG MAY TAHANAN KANG UUWIAN SA AKIN. HINDI LANG SA MAGAGANDANG ARAW — LALO NA KAPAG KAILANGAN MO NG MASISILUNGAN AT KAKAMPI.',
  },
  {
    id: 'spark',
    num: '02',
    tabTitle: 'WELDING, KILITI, AT INIT',
    tabSub: 'KUNG MANLAMIG O MAWALAN NG SPARK',
    meta: 'CHICA & CHICO · AUG 15, 2026 · 2:12 PM',
    heading: 'KUNG MANLAMIG KA, PAPAINITIN KITA.',
    quotes: [
      {
        text: '“PAG WALA NA TAYONG SPARK, PA WELDING TAYO”',
        by: 'CHICA · AUG 15, 2026 · 2:12 PM',
      },
      {
        text: '“PAG WALA KANANG NARARAMDAMANG KILIG KIKILITIIN KITA”',
        by: 'CHICA · AUG 15, 2026 · 2:12 PM',
      },
      {
        text: '“KUNG MANLAMIG KA, PAPAINITIN KITA.”',
        by: 'PANGAKONG MAY LAMBING · CHICO PARA KAY CHICA',
      },
    ],
    whisper:
      'ANG SARAP MAHALIN NANG MAY TAWA AT KULIT. KUNG DUMATING MAN ANG MGA ORDINARYONG ARAW NA PARANG TAHIMIK O MALAMIG, PIPILIIN PA RIN KITANG SUYUIN, PATAWANIN, AT PAINITIN NG LAMBING — ARAW-ARAW.',
  },
  {
    id: 'tatlo',
    num: '03',
    tabTitle: 'TATLONG PANGAKO',
    tabSub: 'WALANG IWANAN · PANININDIGAN · ILALABAN',
    meta: 'CHICO · AUG 18, 2026',
    heading: 'PANININDIGAN KITA, CHICAAA KO.',
    quotes: [
      {
        text: '“PANGAKO KO SAYO WALANG IWANAN. PANGAKO KO SAYO PANININDIGAN KITA. PANGAKO KO SAYO NA ILALABAN NATIN TOH.”',
        by: 'CHICO · AUG 18, 2026',
      },
    ],
    whisper:
      'HINDI ITO SALITANG SINABI LANG DAHIL MASAYA ANG SANDALI. ITO ANG PIPILIIN KONG GAWIN SA BAWAT ARAW — ANG MANATILI, TUMUPAD, AT LUMABAN KASAMA KA.',
  },
  {
    id: 'faith',
    num: '04',
    tabTitle: 'HOUSEHOLD OF FAITH',
    tabSub: 'SI KRISTO ANG MATIBAY NA PUNDASYON',
    meta: 'CHICO · AUG 15, 2026 · 2:12 PM',
    heading: 'SA BAWAT HAKBANG, SI KRISTO ANG SENTRO.',
    quotes: [
      {
        text: '“AND WE WILL BUILT A HOUSEHOLD OF FAITH WITH CHRIST AS OUR SOLID FOUNDATION”',
        by: 'CHICO · AUG 15, 2026 · 2:12 PM',
      },
    ],
    whisper:
      'MAS MATATAG TAYO DAHIL HINDI LANG SA SARILI NATING LAKAS TAYO KUMAKAPIT. IPINAGPAPASA-DIYOS NATIN ANG BUKAS NATIN — MAY PASENSYA, MAY PANANAMPALATAYA, AT MAY TIWALA SA TAMANG PANAHON NIYA.',
  },
  {
    id: 'oras222',
    num: '05',
    tabTitle: 'PAALALA NG 2:22',
    tabSub: 'BALANSE, HARMONYA, AT DIVINE TIMING',
    meta: '2:22 · ANG PERSONAL NATING PAALALA',
    heading: 'SABAY TAYO SA TAMANG PANAHON NG DIYOS.',
    quotes: [
      {
        text: '“DALAWA TAYONG MAGKASAMA, ISANG PANGINOON ANG NANGUNGUNA SA BAWAT ORAS NATIN.”',
        by: '2:22 · ORAS-ORAS · CHICO & CHICA',
      },
    ],
    whisper:
      'PARA SA ATING DALAWA, ANG 2:22 AY ISANG MALUMANAY NA PAALALA NG BALANSE, HARMONYA, PAGTUTULUNGAN, AT PASENSYA — NA SABAY TAYONG LALAKAD NANG MAY TIWALA SA PLANO AT TAMANG PANAHON NG DIYOS PARA SA ATIN.',
  },
];

function SparkIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5L14.1 9.9L21.5 12L14.1 14.1L12 21.5L9.9 14.1L2.5 12L9.9 9.9L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DiamondIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 4.5H16.5L21 9.5L12 20L3 9.5L7.5 4.5Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {!filled && <path d="M3 9.5H21M12 20L8.5 9.5L12 4.5L15.5 9.5L12 20Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />}
    </svg>
  );
}

export function RingIllustration({ lit = false, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const gOuter = `pk-gold-outer-${uid}`;
  const gInner = `pk-gold-inner-${uid}`;
  const gEdge = `pk-gold-edge-${uid}`;
  const gDiamond = `pk-diamond-${uid}`;
  const gAura = `pk-aura-${uid}`;
  const gShadow = `pk-shadow-${uid}`;

  return (
    <div className={`pk-ring-figure ${className}`.trim()}>
      <svg
        className="pk-ring-svg"
        viewBox="0 0 420 420"
        role="img"
        aria-label="MANIPIS AT MAKINTAB NA DILAW NA GINTONG OPEN RING NA MAY MALIIT NA BILOG NA SOLITAIRE DIAMOND SA GITNA NG PAGITAN — SIMBOLO NG MGA PANGAKO NINA CHICO AT CHICA."
      >
        <defs>
          <radialGradient id={gAura} cx="50%" cy="46%" r="50%">
            <stop offset="0%" stopColor="#f8e6b0" stopOpacity={lit ? '0.38' : '0.24'} />
            <stop offset="48%" stopColor="#d9ab4d" stopOpacity={lit ? '0.16' : '0.09'} />
            <stop offset="100%" stopColor="#d9ab4d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={gOuter} x1="12%" y1="12%" x2="88%" y2="88%">
            <stop offset="0%" stopColor="#fff6d6" />
            <stop offset="22%" stopColor="#ecc56a" />
            <stop offset="50%" stopColor="#b58025" />
            <stop offset="76%" stopColor="#f7dd91" />
            <stop offset="100%" stopColor="#946418" />
          </linearGradient>
          <linearGradient id={gInner} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#774f13" />
            <stop offset="42%" stopColor="#c79537" />
            <stop offset="72%" stopColor="#faebc0" />
            <stop offset="100%" stopColor="#65410e" />
          </linearGradient>
          <linearGradient id={gEdge} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fff9e6" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#e6bc5f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff6d6" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id={gDiamond} cx="42%" cy="34%" r="66%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="36%" stopColor="#f5f8ff" />
            <stop offset="74%" stopColor="#dae5f5" />
            <stop offset="100%" stopColor="#fff2d2" />
          </radialGradient>
          <radialGradient id={gShadow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#040302" stopOpacity="0.72" />
            <stop offset="65%" stopColor="#040302" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#040302" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft Golden Halo & Fine Orbital Frame */}
        <circle cx="210" cy="216" r="184" fill={`url(#${gAura})`} />
        <circle
          cx="210"
          cy="216"
          r="164"
          fill="none"
          stroke="#e6bf69"
          strokeOpacity={lit ? '0.32' : '0.18'}
          strokeWidth="1"
          strokeDasharray="2 8"
        />

        {/* Delicate Faith Cross-Star Above the Solitaire */}
        <g stroke="#f0cf80" strokeOpacity="0.65" strokeWidth="1.25" strokeLinecap="round">
          <line x1="210" y1="42" x2="210" y2="62" />
          <line x1="203" y1="50" x2="217" y2="50" />
        </g>

        {/* Velvet Surface Ground Shadow */}
        <ellipse cx="210" cy="344" rx="112" ry="15" fill={`url(#${gShadow})`} />

        {/* Floating Open Yellow Gold Ring + Solitaire Diamond */}
        <g className="pk-ring-float">
          {/* Inner 3D gold band thickness */}
          <path
            d="M 176 135 A 106 89 0 1 0 244 135"
            fill="none"
            stroke={`url(#${gInner})`}
            strokeWidth="13.5"
            strokeLinecap="round"
          />

          {/* Main slim polished yellow gold open band */}
          <path
            d="M 179 128 A 112 94 0 1 0 241 128"
            fill="none"
            stroke={`url(#${gOuter})`}
            strokeWidth="11.2"
            strokeLinecap="round"
          />

          {/* Crisp mirror edge along the gold band */}
          <path
            d="M 178 128 A 112 94 0 1 0 242 128"
            fill="none"
            stroke={`url(#${gEdge})`}
            strokeWidth="2.1"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Polished specular highlights on left and right curves */}
          <path
            d="M 105 240 A 112 94 0 0 0 158 302"
            fill="none"
            stroke="#fff8e3"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.72"
          />
          <path
            d="M 278 292 A 112 94 0 0 0 318 214"
            fill="none"
            stroke="#fff8e3"
            strokeWidth="1.7"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Sculpted open-band terminals gently bridging toward the solitaire */}
          <path
            d="M 178 128 C 185 126 189 127 193 128"
            fill="none"
            stroke="#f7e2a6"
            strokeWidth="6.8"
            strokeLinecap="round"
          />
          <path
            d="M 242 128 C 235 126 231 127 227 128"
            fill="none"
            stroke="#f7e2a6"
            strokeWidth="6.8"
            strokeLinecap="round"
          />

          {/* Four delicate 18K gold prongs cradling the diamond in the opening */}
          <circle cx="195" cy="120.5" r="3" fill="#f8e6b4" stroke="#8f6117" strokeWidth="0.85" />
          <circle cx="195" cy="135.5" r="3" fill="#e5bc61" stroke="#7d5212" strokeWidth="0.85" />
          <circle cx="225" cy="120.5" r="3" fill="#f8e6b4" stroke="#8f6117" strokeWidth="0.85" />
          <circle cx="225" cy="135.5" r="3" fill="#e5bc61" stroke="#7d5212" strokeWidth="0.85" />

          {/* Small Round Solitaire Diamond Bridging the Opening */}
          <g transform="translate(210 128)">
            <circle cx="0" cy="0" r="21" fill="#fff7df" fillOpacity={lit ? '0.32' : '0.2'} />
            <circle cx="0" cy="0" r="16.5" fill={`url(#${gDiamond})`} stroke="#ffffff" strokeWidth="1.15" />
            <polygon
              points="0,-9 6.4,-6.4 9,0 6.4,6.4 0,9 -6.4,6.4 -9,0 -6.4,-6.4"
              fill="#ffffff"
              fillOpacity="0.78"
              stroke="#b7c8e4"
              strokeWidth="0.85"
            />
            <g stroke="#a2b7d8" strokeWidth="0.8" opacity="0.9">
              <line x1="0" y1="-9" x2="0" y2="-16.5" />
              <line x1="6.4" y1="-6.4" x2="11.6" y2="-11.6" />
              <line x1="9" y1="0" x2="16.5" y2="0" />
              <line x1="6.4" y1="6.4" x2="11.6" y2="11.6" />
              <line x1="0" y1="9" x2="0" y2="16.5" />
              <line x1="-6.4" y1="6.4" x2="-11.6" y2="11.6" />
              <line x1="-9" y1="0" x2="-16.5" y2="0" />
              <line x1="-6.4" y1="-6.4" x2="-11.6" y2="-11.6" />
            </g>
          </g>

          {/* Diamond Starlight Glint */}
          <g className="pk-diamond-spark">
            <path
              d="M221 104 L222.8 114.2 L233 116 L222.8 117.8 L221 128 L219.2 117.8 L209 116 L219.2 114.2 Z"
              fill="#ffffff"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function PangakoPage({ ringStage = null }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [heldIds, setHeldIds] = useState([]);
  const [letterOpen, setLetterOpen] = useState(false);

  const tabRefs = useRef([]);
  const letterOpenerRef = useRef(null);
  const letterHeadingRef = useRef(null);
  const letterSectionRef = useRef(null);
  const promisesSectionRef = useRef(null);

  const activePromise = PROMISES[activeIndex];
  const isHeld = heldIds.includes(activePromise.id);
  const allHeld = heldIds.length === PROMISES.length;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '2:22 · PANGAKO — PARA SA CHICAAA KO';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    if (!letterOpen) return;
    letterHeadingRef.current?.focus({ preventScroll: true });
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    letterSectionRef.current?.scrollIntoView?.({
      block: 'start',
      behavior: reduced ? 'instant' : 'smooth',
    });
  }, [letterOpen]);

  function toggleHold(id) {
    setHeldIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function handleTabKeyDown(event, index) {
    let nextIndex = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (index + 1) % PROMISES.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + PROMISES.length) % PROMISES.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = PROMISES.length - 1;
    }
    if (nextIndex !== null) {
      event.preventDefault();
      setActiveIndex(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  }

  function openOrFoldLetter() {
    if (letterOpen) {
      setLetterOpen(false);
      letterOpenerRef.current?.focus({ preventScroll: true });
    } else {
      setLetterOpen(true);
    }
  }

  function jumpToPromises() {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    promisesSectionRef.current?.scrollIntoView?.({
      block: 'start',
      behavior: reduced ? 'instant' : 'smooth',
    });
  }

  return (
    <div className="pangako" lang="tl">
      <div className="pk-shell">
        <header className="pk-nav">
          <Link to="/" className="pk-brand">
            LIBRARY NI CHICO
            <span>PARA KAY CHICA</span>
          </Link>
          <span className="pk-nav-center">ORAS-ORAS · ISANG PANGAKO SA TAMANG PANAHON</span>
          <span className="pk-nav-time" aria-label="2:22">
            2:22 <SparkIcon />
          </span>
        </header>

        <main>
          <section className="pk-hero" aria-labelledby="pk-hero-title">
            <div className="pk-stage-col">
              <div className={`pk-stage${heldIds.length > 0 ? ' pk-stage-lit' : ''}`}>
                <div className="pk-stage-arch" aria-hidden="true" />
                <div className="pk-stage-top">
                  <span>SIMBOLO NG PANGAKO</span>
                  <SparkIcon />
                  <span>2:22</span>
                </div>
                <span className="pk-stage-clock" aria-hidden="true">2:22</span>

                <div className="pk-stage-slot">
                  {ringStage || (
                    <PangakoRing fallback={<RingIllustration lit={heldIds.length > 0} />} />
                  )}
                </div>

                <div className="pk-stage-dock" role="status" aria-live="polite">
                  <span>
                    {allHeld
                      ? 'LAHAT NG PANGAKO, HAWAK NA NATIN.'
                      : 'GINTONG PANGAKO · SI KRISTO ANG SENTRO.'}
                  </span>
                  <span className="pk-stage-dock-count">
                    {heldIds.length} / {PROMISES.length}
                  </span>
                </div>
              </div>

              <p className="pk-stage-caption">
                <span>PAALALA NG MGA PANGAKO AT BUKAS NA SABAY NATING BINUBUO.</span>
                <span>PARA SA CHICAAA KO. ♡</span>
              </p>
            </div>

            <div className="pk-copy-col">
              <p className="pk-eyebrow">
                <span className="pk-eyebrow-rule" aria-hidden="true" />
                ORAS-ORAS · 2:22 · MULA SA CHICOOO MO
              </p>

              <h1 id="pk-hero-title" className="pk-title">
                PANGAKO.
                <em>SA BAWAT ORAS AT PANAHON.</em>
              </h1>

              <p className="pk-lede">
                CHICAAA KO, MAY 2:22 AKONG GINAWA PARA SA’YO. ISANG TAHIMIK NA LUGAR KUNG SAAN
                NAKATAGO ANG MGA PANGAKO NATIN — YUNG MGA NAKAKATAWA, YUNG MGA SERYOSO, AT YUNG
                PANALANGIN NATING SI KRISTO LAGI ANG GITNA NATIN.
              </p>

              <p className="pk-ring-note">
                ITONG GINTONG SINGSING NA MAY MUNTING SOLITAIRE AY SIMBOLO NG MGA PANGAKO NATIN AT
                NG KINABUKASANG DAHAN-DAHAN NATING BINUBUO — MAY RESPETO, MAY PASENSYA, AT MAY
                TIWALA SA TAMANG PANAHON NG DIYOS.
              </p>

              <div className="pk-hero-actions">
                <button
                  ref={letterOpenerRef}
                  type="button"
                  className="pk-primary-btn"
                  aria-expanded={letterOpen}
                  aria-controls="pk-letter"
                  onClick={openOrFoldLetter}
                >
                  <SparkIcon />
                  {letterOpen ? 'ITUPI MUNA ANG SULAT' : 'BUKSAN ANG SULAT SA 2:22'}
                </button>
                <button type="button" className="pk-ghost-btn" onClick={jumpToPromises}>
                  TINGNAN ANG MGA PANGAKO
                </button>
              </div>

              <section className="pk-meaning" aria-labelledby="pk-meaning-title">
                <p className="pk-section-kicker">ANG PERSONAL NATING KAHULUGAN NG 2:22</p>
                <h2 id="pk-meaning-title" className="pk-meaning-heading">
                  BALANSE, HARMONYA, AT TIWALA SA ORAS NG DIYOS.
                </h2>
                <p className="pk-meaning-body">
                  ANG 2:22 AY MUNTING PAALALA SA ATING DALAWA: PAREHO TAYONG KAKAMPI,
                  MATUTUTO TAYONG MAGHINTAY
                  NANG MAY PASENSYA, AT NA SA BAWAT HAKBANG NATIN, SI KRISTO ANG ATING MATIBAY NA
                  PUNDASYON.
                </p>
                <ul className="pk-pillars" aria-label="MGA HALIGI NG 2:22">
                  <li>BALANSE</li>
                  <li>HARMONYA</li>
                  <li>PARTNERSHIP</li>
                  <li>PASENSYA</li>
                  <li>DIVINE TIMING</li>
                  <li>CHRIST AT THE CENTER</li>
                </ul>
              </section>
            </div>
          </section>

          <section
            ref={promisesSectionRef}
            className="pk-promises"
            aria-labelledby="pk-promises-title"
          >
            <div className="pk-promises-head">
              <div>
                <p className="pk-section-kicker">MGA SALITANG TINATANDAAN NATIN</p>
                <h2 id="pk-promises-title">
                  LIMANG PANGAKO <em>PARA SA ATIN.</em>
                </h2>
              </div>
              <p className="pk-promises-status" role="status" aria-live="polite">
                {allHeld
                  ? 'LAHAT NG PANGAKO, HAWAK NA NATIN.'
                  : `${heldIds.length} SA ${PROMISES.length} PANGAKONG HAWAK MO NGAYON`}
              </p>
            </div>

            <div className="pk-ledger">
              <div className="pk-tablist" role="tablist" aria-label="MGA PANGAKO NINA CHICO AT CHICA">
                {PROMISES.map((item, index) => {
                  const selected = index === activeIndex;
                  const sealed = heldIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        tabRefs.current[index] = el;
                      }}
                      id={`pk-tab-${item.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`pk-panel-${item.id}`}
                      tabIndex={selected ? 0 : -1}
                      className="pk-tab"
                      onClick={() => setActiveIndex(index)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                    >
                      <span className="pk-tab-num">{item.num}</span>
                      <span>
                        <span className="pk-tab-title">{item.tabTitle}</span>
                        <span className="pk-tab-sub">{item.tabSub}</span>
                      </span>
                      <span className="pk-tab-mark" aria-hidden="true">
                        {sealed ? '◆' : '◇'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <article
                key={activePromise.id}
                id={`pk-panel-${activePromise.id}`}
                role="tabpanel"
                aria-labelledby={`pk-tab-${activePromise.id}`}
                className="pk-panel"
              >
                <div className="pk-panel-meta">
                  <span>PANGAKO {activePromise.num}</span>
                  <span>{activePromise.meta}</span>
                </div>

                <h3 className="pk-panel-title">{activePromise.heading}</h3>

                <div className="pk-quotes">
                  {activePromise.quotes.map((quote) => (
                    <blockquote key={quote.text} className="pk-quote">
                      <p>{quote.text}</p>
                      <footer>— {quote.by}</footer>
                    </blockquote>
                  ))}
                </div>

                <p className="pk-panel-whisper">{activePromise.whisper}</p>

                <div className="pk-panel-actions">
                  <button
                    type="button"
                    className="pk-seal-btn"
                    aria-pressed={isHeld}
                    onClick={() => toggleHold(activePromise.id)}
                  >
                    <DiamondIcon filled={isHeld} />
                    {isHeld ? 'HAWAK NA ANG PANGAKONG ’TO' : 'HAWAKAN ANG PANGAKONG ’TO'}
                  </button>

                  <button
                    type="button"
                    className="pk-next-btn"
                    onClick={() => {
                      const nextIndex = (activeIndex + 1) % PROMISES.length;
                      setActiveIndex(nextIndex);
                      tabRefs.current[nextIndex]?.focus();
                    }}
                  >
                    SUSUNOD NA PANGAKO →
                  </button>
                </div>
              </article>
            </div>

            {allHeld && (
              <p className="pk-all-held-banner" role="status">
                LAHAT NG LIMANG PANGAKO AY HAWAK NA NATIN — KUMIKINANG ANG GINTONG PAALALA PARA SA
                TAMANG PANAHON NG DIYOS. ♡
              </p>
            )}
          </section>

          <section
            ref={letterSectionRef}
            id="pk-letter"
            className="pk-letter-section"
            aria-labelledby="pk-letter-heading"
            hidden={!letterOpen}
          >
            {letterOpen && (
              <article className="pk-letter-card">
                <div className="pk-letter-top">
                  <span>2:22 · SULAT MULA SA CHICOOO MO</span>
                  <span>ORAS-ORAS · PANGAKO</span>
                </div>

                <h2 id="pk-letter-heading" ref={letterHeadingRef} tabIndex={-1}>
                  CHICAAA KO,
                </h2>

                <div className="pk-letter-body">
                  <p>
                    2:22 PO, ASAWA KO. BAWAT BESES NA MAKITA KO ANG ORAS NA ’TO, IKAW ANG UNANG
                    PUMAPASOK SA ISIP KO — AT YUNG TAHIMIK NA PASASALAMAT SA DIYOS DAHIL IKAW ANG
                    KASAMA KO SA LAKAD NA ’TO. PARA SA ATING DALAWA, ANG 2:22 AY PAALALA NG
                    BALANSE, HARMONYA, PASENSYA, AT TIWALA SA TAMANG PANAHON NIYA.
                  </p>

                  <p>
                    NATATAWA PA RIN AKO TUWING NAAALALA KO YUNG USAPAN NATIN NOONG AGOSTO. SABI MO,
                    “PAG WALA NA TAYONG SPARK, PA WELDING TAYO” AT “PAG WALA KANANG NARARAMDAMANG
                    KILIG KIKILITIIN KITA.” ANG CUTE MO TALAGA, CHICAAA KO. KAYA MAY DUGTONG AKO
                    DOON: KUNG MANLAMIG KA, PAPAINITIN KITA — SA YAKAP, SA LAMBING, AT SA KAKULITAN
                    NG CHICOOO MO.
                  </p>

                  <p>
                    PERO HIGIT SA TAWA AT KULIT, SERYOSO AKO SA LAHAT NG BINITAWAN KONG SALITA
                    SA’YO. KAPAG DUMATING ANG BAGYO, GAGAWA AKO NG SHELTER PARA SA ATIN. KAPAG
                    MAULAN, KUKUHA AKO NG PAYONG. AT KAPAG PAKIRAMDAM MO HINDI KA LIGTAS O PAGOD KA
                    NA, AKO ANG MAGIGING SAFE SPACE MO.
                  </p>

                  <p>
                    HINDI KO RIN MALILIMUTAN YUNG TATLONG PANGAKO KO SA’YO: WALANG IWANAN.
                    PANININDIGAN KITA. AT ILALABAN NATIN ’TO. HINDI MAN PERPEKTO ANG BAWAT ARAW,
                    PIPILIIN PA RIN KITANG MAHALIN NANG MAHINAHON, TAPAT, AT BUONG PUSO.
                  </p>

                  <p>
                    ITONG GINTONG SINGSING DITO SA 2:22 AY SIMBOLO NG MGA PANGAKO NATIN AT NG BUKAS
                    NA PINAGDARASAL KO KASAMA KA — MAY PASENSYA, MAY RESPETO, AT WALANG MINAMADALI.
                    BALANG ARAW, SA TAMANG PANAHON NG PANGINOON, BUBUO TAYO NG HOUSEHOLD OF FAITH
                    WITH CHRIST AS OUR SOLID FOUNDATION.
                  </p>

                  <p>
                    HANGGANG SA DUMATING ANG LAHAT NG MAGAGANDANG ARAW NA ’YON, DITO MUNA AKO SA
                    TABI MO — NAGHIHINTAY NANG MAY PASENSYA, NAGMAMAHAL NANG TOTOO, AT LAGING
                    NAGPAPASALAMAT NA IKAW ANG CHICAAA KO.
                  </p>
                </div>

                <p className="pk-letter-closing">
                  SA BAWAT 2:22, AT SA LAHAT NG ORAS SA PAGITAN, IKAW ANG PIPILIIN KO.
                  <span>MAHAL NA MAHAL KITA, CHICAAA KO · YOUR CHICOOO ♡</span>
                </p>

                <button type="button" className="pk-letter-fold" onClick={openOrFoldLetter}>
                  ITUPI MUNA ANG SULAT
                </button>
              </article>
            )}
          </section>
        </main>

        <footer className="pk-footer">
          <Link to="/" className="pk-footer-back">
            ← BALIK SA LIBRARY
          </Link>
          <span className="pk-footer-center">2:22 · PANGAKO · ORAS-ORAS</span>
          <span className="pk-footer-sign">WITH LOVE, YOUR CHICOOO ♡</span>
        </footer>
      </div>
    </div>
  );
}
