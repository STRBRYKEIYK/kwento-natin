import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../library/styles.css';
import './LegoHousePage.css';

const DREAM_FRAMES = [
  {
    id: 'plano',
    piece: 'PIECE 01',
    title: 'BAGONG PLANO',
    caption: 'ISA-ISANG PANGARAP NA PINAGDUDUGTONG HANGGANG MAGKAROON NG MALINAW NA HUGIS ANG BUKAS NA GUSTO NATIN.',
    tag: 'UNTI-UNTING HUGIS',
    brickColor: 'terracotta',
  },
  {
    id: 'maingat',
    piece: 'PIECE 02',
    title: 'MAS MAINGAT NA PAGBUO',
    caption: 'KAPAG MAY HINDI NABUO NANG TAMA SA UNANG SUBOK, KALMADONG AAYUSIN AT BUBUUIN ULIT NANG MAGKASAMA.',
    tag: 'MAY PASENSYA',
    brickColor: 'ochre',
  },
  {
    id: 'natututunan',
    piece: 'PIECE 03',
    title: 'BAWAT NATUTUTUNAN',
    caption: 'HINDI LANG ANG KALALABASAN ANG MAHALAGA — KUNDI ANG ORAS NA MAGKASAMA HABANG BINUBUO ITO.',
    tag: 'SABAY SA HAKBANG',
    brickColor: 'sage',
  },
  {
    id: 'tahanan',
    piece: 'PIECE 04',
    title: 'FUTURE HOME WALL',
    caption: 'MGA MUNTING PAALALA NG LAHAT NG PINAGSIKAPAN AT NATUPAD NATIN — ONE LITTLE PIECE AT A TIME.',
    tag: 'PAGMAMAHAL NA INAAALAGAAN',
    brickColor: 'walnut',
  },
];

function BrickEmblem({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 28 22" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="24" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="6" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FrameIcon({ framed = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        fill={framed ? 'currentColor' : 'none'}
        fillOpacity={framed ? '0.16' : '0'}
      />
      <rect x="7" y="8" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="2.2" r="1.2" fill="currentColor" />
    </svg>
  );
}

function PieceMotif({ variant }) {
  if (variant === 'plano') {
    return (
      <svg viewBox="0 0 64 42" fill="none" aria-hidden="true">
        <rect x="8" y="20" width="22" height="14" rx="2" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="15" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="21" y="15" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="34" y="14" width="22" height="20" rx="2" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.5" />
        <rect x="38" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="47" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (variant === 'maingat') {
    return (
      <svg viewBox="0 0 64 42" fill="none" aria-hidden="true">
        <rect x="14" y="22" width="36" height="12" rx="2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.5" />
        <rect x="20" y="9" width="24" height="11" rx="2" fill="currentColor" fillOpacity="0.26" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M32 4V8M29 6L32 8.5L35 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (variant === 'natututunan') {
    return (
      <svg viewBox="0 0 64 42" fill="none" aria-hidden="true">
        <rect x="10" y="26" width="16" height="10" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <rect x="24" y="18" width="16" height="18" rx="2" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.5" />
        <rect x="38" y="10" width="16" height="26" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 42" fill="none" aria-hidden="true">
      <path d="M12 20L32 7L52 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="18" y="20" width="28" height="16" rx="2" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.5" />
      <rect x="28" y="26" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function LegoHouseIllustration({ framedCount = 0, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const gRoof = `lh-roof-${uid}`;
  const gRoofLit = `lh-roof-lit-${uid}`;
  const gWall = `lh-wall-${uid}`;
  const gShade = `lh-shade-${uid}`;
  const gWin = `lh-win-${uid}`;
  const gDoor = `lh-door-${uid}`;
  const gBase = `lh-base-${uid}`;
  const gAura = `lh-aura-${uid}`;
  const gShadow = `lh-shadow-${uid}`;
  const lit = framedCount > 0;

  return (
    <div className={`lh-house-fallback ${className}`.trim()}>
      <svg
        className="lh-house-svg"
        viewBox="0 0 460 390"
        role="img"
        aria-label="ISANG MUNTING BAHAY NA BINUO MULA SA MALILIIT NA LEGO PIECES — SIMBOLO NG MGA PANGARAP AT FUTURE HOME NINA CHICO AT CHICA."
      >
        <defs>
          <radialGradient id={gAura} cx="50%" cy="46%" r="50%">
            <stop offset="0%" stopColor="#ffefc7" stopOpacity={lit ? '0.92' : '0.68'} />
            <stop offset="52%" stopColor="#e8b86d" stopOpacity={lit ? '0.26' : '0.14'} />
            <stop offset="100%" stopColor="#e8b86d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={gRoof} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cf5d42" />
            <stop offset="100%" stopColor="#a73d26" />
          </linearGradient>
          <linearGradient id={gRoofLit} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e3795d" />
            <stop offset="100%" stopColor="#bc4a31" />
          </linearGradient>
          <linearGradient id={gWall} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fcf7ee" />
            <stop offset="100%" stopColor="#ebdfcc" />
          </linearGradient>
          <linearGradient id={gShade} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2d2ba" />
            <stop offset="100%" stopColor="#d3bfa2" />
          </linearGradient>
          <linearGradient id={gWin} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lit ? '#fff0bd' : '#fce4a6'} />
            <stop offset="100%" stopColor={lit ? '#e8a846' : '#dba14b'} />
          </linearGradient>
          <linearGradient id={gDoor} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7a4e34" />
            <stop offset="100%" stopColor="#50301e" />
          </linearGradient>
          <linearGradient id={gBase} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#69856d" />
            <stop offset="100%" stopColor="#48604d" />
          </linearGradient>
          <radialGradient id={gShadow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2d1e15" stopOpacity="0.28" />
            <stop offset="68%" stopColor="#2d1e15" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#2d1e15" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="230" cy="186" r="168" fill={`url(#${gAura})`} />
        <ellipse cx="230" cy="340" rx="164" ry="20" fill={`url(#${gShadow})`} />

        <g transform="translate(230 226)">
          <g className="lh-house-float">
          {/* Baseplate */}
          <rect x="-152" y="88" width="304" height="20" rx="4" fill={`url(#${gBase})`} stroke="#384c3c" strokeWidth="1.5" />
          <g fill="#7d9a81" stroke="#384c3c" strokeWidth="1">
            <rect x="-140" y="81" width="18" height="7" rx="1.5" />
            <rect x="-114" y="81" width="18" height="7" rx="1.5" />
            <rect x="96" y="81" width="18" height="7" rx="1.5" />
            <rect x="122" y="81" width="18" height="7" rx="1.5" />
          </g>

          {/* Chimney */}
          <rect x="52" y="-114" width="36" height="58" rx="2" fill="#b84a32" stroke="#7d2f1e" strokeWidth="1.4" />
          <rect x="47" y="-123" width="46" height="10" rx="2" fill="#cf5d42" stroke="#7d2f1e" strokeWidth="1.4" />
          <rect x="55" y="-130" width="12" height="7" rx="1.5" fill="#e1775c" stroke="#7d2f1e" strokeWidth="1.1" />
          <rect x="73" y="-130" width="12" height="7" rx="1.5" fill="#e1775c" stroke="#7d2f1e" strokeWidth="1.1" />
          <path
            className="lh-chimney-heart"
            d="M70 -142 C70 -150 59 -153 59 -145 C59 -139 70 -133 70 -133 C70 -133 81 -139 81 -145 C81 -153 70 -150 70 -142 Z"
            fill="#c8563c"
          />

          {/* Cream Brick Walls */}
          <rect x="-102" y="-26" width="204" height="114" rx="2.5" fill={`url(#${gWall})`} stroke="#b19a80" strokeWidth="1.4" />
          <rect x="74" y="-26" width="28" height="114" fill={`url(#${gShade})`} />
          <g stroke="#b69f85" strokeOpacity="0.52" strokeWidth="1">
            <line x1="-102" y1="-4" x2="102" y2="-4" />
            <line x1="-102" y1="18" x2="102" y2="18" />
            <line x1="-102" y1="40" x2="102" y2="40" />
            <line x1="-102" y1="62" x2="102" y2="62" />
            <line x1="74" y1="-26" x2="74" y2="88" />
            <line x1="-68" y1="-26" x2="-68" y2="-4" />
            <line x1="-18" y1="-26" x2="-18" y2="-4" />
            <line x1="34" y1="-26" x2="34" y2="-4" />
            <line x1="-82" y1="18" x2="-82" y2="40" />
            <line x1="48" y1="40" x2="48" y2="62" />
          </g>

          {/* Warm Ochre Brick Accents */}
          <rect x="-102" y="18" width="22" height="22" fill="#e5b357" stroke="#ad7e2e" strokeWidth="1.1" />
          <rect x="-102" y="62" width="30" height="26" fill="#d9a347" stroke="#a27428" strokeWidth="1.1" />
          <rect x="74" y="-4" width="28" height="22" fill="#e0ab4e" stroke="#a6782a" strokeWidth="1.1" />
          <rect x="74" y="40" width="28" height="22" fill="#cf983c" stroke="#9b6e24" strokeWidth="1.1" />

          {/* Stepped Brick Roof */}
          <g stroke="#7d2f1e" strokeWidth="1.3">
            <rect x="-126" y="-40" width="252" height="16" rx="2" fill={`url(#${gRoof})`} />
            <rect x="-106" y="-56" width="212" height="16" rx="2" fill={`url(#${gRoofLit})`} />
            <rect x="-86" y="-72" width="172" height="16" rx="2" fill={`url(#${gRoof})`} />
            <rect x="-66" y="-88" width="132" height="16" rx="2" fill={`url(#${gRoofLit})`} />
            <rect x="-46" y="-104" width="92" height="16" rx="2" fill={`url(#${gRoof})`} />
            <rect x="-26" y="-118" width="52" height="14" rx="2" fill="#d9674c" />
            <rect x="-18" y="-125" width="12" height="7" rx="1.5" fill="#e88267" />
            <rect x="6" y="-125" width="12" height="7" rx="1.5" fill="#e88267" />
            <rect x="-118" y="-46" width="10" height="6" rx="1.5" fill="#e1775c" />
            <rect x="108" y="-46" width="10" height="6" rx="1.5" fill="#c75338" />
            <rect x="-98" y="-62" width="10" height="6" rx="1.5" fill="#e1775c" />
            <rect x="88" y="-62" width="10" height="6" rx="1.5" fill="#c75338" />
            <rect x="-78" y="-78" width="10" height="6" rx="1.5" fill="#e1775c" />
            <rect x="68" y="-78" width="10" height="6" rx="1.5" fill="#c75338" />
            <rect x="-58" y="-94" width="10" height="6" rx="1.5" fill="#e1775c" />
            <rect x="48" y="-94" width="10" height="6" rx="1.5" fill="#c75338" />
          </g>

          {/* Gable Window */}
          <circle cx="0" cy="-72" r="14" fill="#5e3a25" stroke="#fbf5ea" strokeWidth="3.2" />
          <circle cx="0" cy="-72" r="10" fill={`url(#${gWin})`} />
          <line x1="0" y1="-82" x2="0" y2="-62" stroke="#5e3a25" strokeWidth="1.6" />
          <line x1="-10" y1="-72" x2="10" y2="-72" stroke="#5e3a25" strokeWidth="1.6" />

          {/* Front Door */}
          <rect x="-22" y="26" width="44" height="62" rx="3" fill="#fbf5ea" stroke="#8d684f" strokeWidth="1.3" />
          <rect x="-17" y="31" width="34" height="57" rx="1.5" fill={`url(#${gDoor})`} />
          <rect x="-10" y="38" width="20" height="17" rx="1" fill={`url(#${gWin})`} stroke="#3e2415" strokeWidth="1.1" />
          <line x1="0" y1="38" x2="0" y2="55" stroke="#3e2415" strokeWidth="1.2" />
          <circle cx="10" cy="65" r="2.7" fill="#f3d284" />
          <rect x="-27" y="83" width="54" height="7" rx="1.5" fill="#d2bfa4" stroke="#967f66" strokeWidth="1.1" />

          {/* Left & Right Windows */}
          <rect x="-78" y="8" width="42" height="40" rx="2.5" fill="#ffffff" stroke="#8c6c56" strokeWidth="1.4" />
          <rect x="-73" y="13" width="32" height="30" fill={`url(#${gWin})`} />
          <line x1="-57" y1="13" x2="-57" y2="43" stroke="#ffffff" strokeWidth="2.4" />
          <line x1="-73" y1="28" x2="-41" y2="28" stroke="#ffffff" strokeWidth="2.4" />
          <rect x="-82" y="47" width="50" height="8" rx="1.5" fill="#8b593c" stroke="#5c3924" strokeWidth="1.1" />
          <circle cx="-69" cy="44" r="4" fill="#c8563c" />
          <circle cx="-57" cy="43" r="4.4" fill="#e5b357" />
          <circle cx="-45" cy="44" r="4" fill="#68846c" />

          <rect x="34" y="8" width="36" height="40" rx="2.5" fill="#ffffff" stroke="#8c6c56" strokeWidth="1.4" />
          <rect x="39" y="13" width="26" height="30" fill={`url(#${gWin})`} />
          <line x1="52" y1="13" x2="52" y2="43" stroke="#ffffff" strokeWidth="2.4" />
          <line x1="39" y1="28" x2="65" y2="28" stroke="#ffffff" strokeWidth="2.4" />
          <rect x="30" y="47" width="44" height="8" rx="1.5" fill="#8b593c" stroke="#5c3924" strokeWidth="1.1" />
          <circle cx="43" cy="44" r="4" fill="#68846c" />
          <circle cx="53" cy="43" r="4.4" fill="#c8563c" />
          <circle cx="63" cy="44" r="3.6" fill="#e5b357" />

          {/* Two Loose Little Bricks Waiting to Join */}
          <g transform="translate(-134 65)">
            <rect x="0" y="5" width="26" height="13" rx="1.8" fill="#cf5d42" stroke="#7d2f1e" strokeWidth="1.1" />
            <rect x="4" y="0" width="7" height="5" rx="1.2" fill="#e1775c" stroke="#7d2f1e" strokeWidth="1" />
            <rect x="15" y="0" width="7" height="5" rx="1.2" fill="#e1775c" stroke="#7d2f1e" strokeWidth="1" />
          </g>
          <g transform="translate(112 67)">
            <rect x="0" y="5" width="25" height="11" rx="1.8" fill="#e5b357" stroke="#9d6f24" strokeWidth="1.1" />
            <rect x="4" y="0" width="7" height="5" rx="1.2" fill="#f3cd7e" stroke="#9d6f24" strokeWidth="1" />
            <rect x="14" y="0" width="7" height="5" rx="1.2" fill="#f3cd7e" stroke="#9d6f24" strokeWidth="1" />
          </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function LegoHousePage({ houseStage = null }) {
  const [letterOpen, setLetterOpen] = useState(false);
  const [framedIds, setFramedIds] = useState([]);

  const letterOpenerRef = useRef(null);
  const letterHeadingRef = useRef(null);
  const letterSectionRef = useRef(null);
  const wallSectionRef = useRef(null);

  const framedCount = framedIds.length;
  const allFramed = framedCount === DREAM_FRAMES.length;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '3:33 PM · A LEGO HOUSE — PARA SA CHICAAA KO';
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

  function openOrFoldLetter() {
    if (letterOpen) {
      setLetterOpen(false);
      letterOpenerRef.current?.focus({ preventScroll: true });
    } else {
      setLetterOpen(true);
    }
  }

  function handleLetterKeyDown(event) {
    if (event.key === 'Escape' && letterOpen) {
      event.preventDefault();
      setLetterOpen(false);
      letterOpenerRef.current?.focus({ preventScroll: true });
    }
  }

  function toggleFrame(id) {
    setFramedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function rebuildWallCarefully() {
    setFramedIds([]);
  }

  function jumpToWall() {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    wallSectionRef.current?.scrollIntoView?.({
      block: 'start',
      behavior: reduced ? 'instant' : 'smooth',
    });
  }

  return (
    <div className="lego-house" lang="tl">
      <div className="lh-shell">
        <header className="lh-nav">
          <Link to="/" className="lh-brand">
            LIBRARY NI CHICO
            <span>PARA KAY CHICA</span>
          </Link>
          <span className="lh-nav-center">ORAS-ORAS · ONE LITTLE PIECE AT A TIME</span>
          <span className="lh-nav-time" aria-label="3:33 PM">
            3:33 PM <BrickEmblem />
          </span>
        </header>

        <main>
          <section className="lh-hero" aria-labelledby="lh-hero-title">
            <div className="lh-stage-col">
              <div className={`lh-stage${framedCount > 0 ? ' lh-stage-warm' : ''}${allFramed ? ' lh-stage-complete' : ''}`}>
                <div className="lh-stage-frame" aria-hidden="true" />
                <div className="lh-stage-sunbeam" aria-hidden="true" />

                <div className="lh-stage-top">
                  <span>A LEGO HOUSE</span>
                  <BrickEmblem />
                  <span>3:33 PM</span>
                </div>

                <span className="lh-stage-clock" aria-hidden="true">
                  3:33
                </span>

                <div className="lh-stage-slot">
                  {houseStage || <LegoHouseIllustration framedCount={framedCount} />}
                </div>

                <div className="lh-stage-dock" role="status" aria-live="polite">
                  <span>
                    {allFramed
                      ? 'NAKA-FRAME NA ANG MGA MUNTING PANGARAP SA WALL.'
                      : framedCount > 0
                        ? 'UNTI-UNTING NABUBUO ANG FUTURE HOME WALL NATIN.'
                        : 'ONE LITTLE PIECE AT A TIME · PARA SA ATIN.'}
                  </span>
                  <span className="lh-stage-dock-count">
                    {framedCount} / {DREAM_FRAMES.length}
                  </span>
                </div>
              </div>

              <p className="lh-stage-caption">
                <span>ISANG MUNTING TAHANANG UNTI-UNTING BINUBUO NANG MAGKASAMA.</span>
                <span>PARA SA CHICAAAA KOOOO. ❤️</span>
              </p>
            </div>

            <div className="lh-copy-col">
              <p className="lh-eyebrow">
                <span className="lh-eyebrow-rule" aria-hidden="true" />
                3:33 PM · MULA SA CHICOOO MO
              </p>

              <h1 id="lh-hero-title" className="lh-title">
                A LEGO HOUSE.
                <em>ONE LITTLE PIECE AT A TIME.</em>
              </h1>

              <p className="lh-lede">
                CHICAAAA KOOOO, MAY 3:33 PM AKONG GINAWA PARA SA’YO. ISANG MUNTING TAHANAN NA
                BINUBUO MULA SA MALILIIT NA PIECES — TULAD NG MGA PANGARAP AT PLANONG UNTI-UNTI
                NATING PINAGDUDUGTONG NANG MAGKASAMA.
              </p>

              <p className="lh-note">
                KAPAG MAY HINDI NABUO NANG TAMA, PWEDE NATING AYUSIN AT BUUIN ULIT NANG MAS MAINGAT.
                AT KAPAG MAY NABUO NANG MAGANDA, ISASABIT NATIN SA WALL NG FUTURE HOME NATIN.
              </p>

              <div className="lh-hero-actions">
                <button
                  ref={letterOpenerRef}
                  type="button"
                  className="lh-primary-btn"
                  aria-expanded={letterOpen}
                  aria-controls="lh-letter"
                  onClick={openOrFoldLetter}
                >
                  <BrickEmblem />
                  {letterOpen ? 'ITUPI MUNA ANG SULAT' : 'BUKSAN ANG SULAT SA 3:33 PM'}
                </button>
                <button type="button" className="lh-ghost-btn" onClick={jumpToWall}>
                  I-FRAME ANG MGA PANGARAP
                </button>
              </div>

              <div className="lh-blueprint-strip" aria-label="MGA HALIGI NG 3:33 PM">
                <div className="lh-blueprint-item">
                  <span>01</span>
                  <strong>TAHANANG BINUBUO</strong>
                </div>
                <div className="lh-blueprint-item">
                  <span>02</span>
                  <strong>PANGARAP NA TUTUPARIN</strong>
                </div>
                <div className="lh-blueprint-item">
                  <span>03</span>
                  <strong>PAGMAMAHAL NA INAAALAGAAN</strong>
                </div>
              </div>
            </div>
          </section>

          <section
            ref={letterSectionRef}
            id="lh-letter"
            className="lh-letter-section"
            aria-labelledby="lh-letter-heading"
            hidden={!letterOpen}
            onKeyDown={handleLetterKeyDown}
          >
            {letterOpen && (
              <article className="lh-letter-card">
                <div className="lh-letter-top">
                  <span>3:33 PM · SULAT MULA SA CHICOOO MO</span>
                  <span>A LEGO HOUSE</span>
                </div>

                <h2 id="lh-letter-heading" ref={letterHeadingRef} tabIndex={-1}>
                  3:33 PM POOOO, ASAWAAAA KOOOO! ❤️
                </h2>

                <div className="lh-letter-body">
                  <p>
                    CHICAAAA KOOOO, ALAM MO POOOO, NAIISIP KO LANG KUNG GAANO KAGANDA YUNG MAY MGA
                    PANGARAP TAYONG UNTI-UNTING BINUBUO NANG MAGKASAMAAAA. PARANG MGA MUNTING PIECES
                    NA ISA-ISA NATING PINAGDUDUGTONG, HANGGANG SA UNTI-UNTING NAGKAKAROON NG HUGIS
                    YUNG BUHAY NA MATAGAL NA NATING GUSTOOOO. 🥹
                  </p>

                  <p>
                    AT ALAM MO POOOO, ASAWAAAA? KAPAG MAY MGA BAGAY NA HINDI NABUO NANG TAMA, PWEDE
                    NAMAN NATIN YUNG AYUSIN AT BUUIN ULIT NANG MAS MAINGATTTT. AT KAPAG MAY MGA BAGAY
                    NAMANG NABUO NATIN NANG MAGANDA, GUSTO KO PONG I-FRAME YUN AT ISABIT SA WALL NG
                    FUTURE HOME NATINNNN, PARA MAY MGA MUNTING PAALALA TAYO NG LAHAT NG PINAGSIKAPAN
                    AT NATUPAD NATINNNN. ❤️
                  </p>

                  <p>
                    KASI CHICAAAA KOOOO, HINDI LANG YUNG MAGANDANG KALALABASAN ANG MAHALAGA SA AKIN,
                    KUNDI YUNG PAGKAKATAONG MAKASAMA KA HABANG BINUBUO NATIN YUNNNN. SA BAWAT BAGONG
                    PLANO, BAWAT NATUTUTUNAN, AT BAWAT PANGARAP NA SABAY NATING INAAABOTTTT.
                  </p>

                  <p>
                    AT BALANG ARAW POOOO, GUSTO KONG MAKATABI KA HABANG TINITINGNAN NATIN YUNG MGA
                    NAKA-FRAME SA WALL, TAPOS SASABIHIN KO LANG, “ASAWAAAA KOOOO, TINGNAN MO POOOO,
                    ANG DAMI NA PALA NATING NABUO NANG MAGKASAMAAAA.” 🥹
                  </p>

                  <p>
                    3:33 PM — ONE LITTLE PIECE AT A TIME, MAY TAHANAN TAYONG BINUBUO, MAY MGA
                    PANGARAP TAYONG TUTUPARIN, AT MAY PAGMAMAHAL TAYONG PATULOY NA AALAGAANNNN.
                  </p>
                </div>

                <p className="lh-letter-closing">
                  MAHAL NA MAHAL KITAAAA, CHICAAAA KOOOO. MWUAAAAAAAA! ❤️
                </p>

                <div className="lh-letter-footer">
                  <span className="lh-letter-sign">3:33 PM · WITH LOVE, YOUR CHICOOO</span>
                  <button type="button" className="lh-letter-fold" onClick={openOrFoldLetter}>
                    ITUPI MUNA ANG SULAT
                  </button>
                </div>
              </article>
            )}
          </section>

          <section
            ref={wallSectionRef}
            className="lh-wall-section"
            aria-labelledby="lh-wall-title"
          >
            <div className="lh-wall-head">
              <div>
                <p className="lh-section-kicker">FUTURE HOME GALLERY WALL</p>
                <h2 id="lh-wall-title">
                  MGA MUNTING PANGARAP <em>NA ISASABIT SA WALL.</em>
                </h2>
                <p className="lh-wall-intro">
                  PINDUTIN ANG BAWAT PIECE PARA I-FRAME AT ISABIT SA WALL NG FUTURE HOME NATIN.
                  PWEDE RIN NATING AYUSIN ULIT KAHIT KAILAN, NANG MAS MAINGAT.
                </p>
              </div>

              <div className="lh-wall-controls">
                <p className="lh-wall-status" role="status" aria-live="polite">
                  {allFramed
                    ? 'LAHAT NG 4 NA PANGARAP AY NAKA-FRAME NA SA WALL.'
                    : `${framedCount} SA ${DREAM_FRAMES.length} NAKA-FRAME SA WALL`}
                </p>
                {framedCount > 0 && (
                  <button
                    type="button"
                    className="lh-rebuild-btn"
                    onClick={rebuildWallCarefully}
                  >
                    AYUSIN AT BUUIN ULIT
                  </button>
                )}
              </div>
            </div>

            <div className="lh-gallery-wall">
              {DREAM_FRAMES.map((item, index) => {
                const isFramed = framedIds.includes(item.id);
                return (
                  <article
                    key={item.id}
                    className={`lh-frame lh-frame-${item.brickColor}${isFramed ? ' is-framed' : ''}${index % 2 === 1 ? ' lh-frame-offset' : ''}`}
                  >
                    <div className="lh-frame-pin" aria-hidden="true">
                      <span className="lh-pin-dot" />
                      <span className="lh-pin-wire" />
                    </div>

                    <div className="lh-frame-mat">
                      <div className="lh-frame-meta">
                        <span>{item.piece}</span>
                        <span>{isFramed ? 'NAKA-FRAME NA' : 'HANDA NANG BUUIN'}</span>
                      </div>

                      <div className="lh-frame-artwork">
                        <PieceMotif variant={item.id} />
                      </div>

                      <h3 className="lh-frame-title">{item.title}</h3>
                      <p className="lh-frame-caption">{item.caption}</p>
                      <p className="lh-frame-tag">{item.tag}</p>

                      <button
                        type="button"
                        className="lh-frame-btn"
                        aria-pressed={isFramed}
                        onClick={() => toggleFrame(item.id)}
                      >
                        <FrameIcon framed={isFramed} />
                        {isFramed ? 'NAKA-FRAME SA WALL' : 'I-FRAME AT ISABIT'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {allFramed && (
              <p className="lh-wall-complete" role="status">
                NAKA-FRAME NA ANG LAHAT NG MUNTING PANGARAP SA WALL NG FUTURE HOME NATIN — ONE
                LITTLE PIECE AT A TIME, MAGKASAMA NATIN ITONG BUBUUIN. ❤️
              </p>
            )}
          </section>
        </main>

        <footer className="lh-footer">
          <Link to="/" className="lh-footer-back">
            ← BALIK SA LIBRARY
          </Link>
          <span className="lh-footer-center">3:33 PM · A LEGO HOUSE · ORAS-ORAS</span>
          <span className="lh-footer-sign">ONE LITTLE PIECE AT A TIME ❤️</span>
        </footer>
      </div>
    </div>
  );
}
