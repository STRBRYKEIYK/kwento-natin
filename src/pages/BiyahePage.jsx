import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../library/styles.css';
import './BiyahePage.css';

const DREAM_MOMENTS = [
  {
    id: 'maagang-alis',
    code: 'SANDALI 01',
    title: 'MAAGANG ALIS',
    mode: 'ride',
    label: 'PANGARAP NA SIMULA',
    dockBadge: 'DAHAN-DAHAN SA DAAN',
    dockDetail: 'NAKAYAKAP KA SA LIKOD · LIGTAS KITANG IHAHATID, ASAWA KO.',
    scene:
      'MAAGA TAYONG AALIS HABANG MALAMIG PA ANG HANGIN — MAY MGA LUGAR TAYONG GUSTONG PUNTAHAN, AT MAY MGA DAANG UNANG BESES PA LANG NATING MADADAANAN NANG MAGKASAMA.',
    note: 'IKAW ANG BACKRIDE KO, NAKAYAKAP SA AKIN; AKO ANG LIGTAS MONG DRIVER.',
  },
  {
    id: 'munting-kainan',
    code: 'SANDALI 02',
    title: 'MUNTING KAINAN',
    mode: 'pause',
    label: 'TAMANG PAHINGA',
    dockBadge: 'HINTO SA MUNTING KAINAN',
    dockDetail: 'TUBIG AT MAINIT NA PAGKAIN · TAMANG PAHINGA BAGO TUMULOY ULIT.',
    scene:
      'PAMINSAN-MINSAN TATAPOS TAYO SA ISANG MUNTING KAINAN SA TABI NG DAAN — MAY TUBIG, MAY MAINIT NA PAGKAIN, AT ORAS PARA MAGPAHINGA BAGO TUMULOY ULIT.',
    note: 'NON-NEGOTIABLE RULE NG CHICOOO MONG RIDER: WALANG GUTOM, WALANG PAGOD.',
  },
  {
    id: 'magandang-view',
    code: 'SANDALI 03',
    title: 'HINTO SA MAGANDANG VIEW',
    mode: 'pause',
    label: 'FAVORITE PART NG CHICOOO MO',
    dockBadge: 'HINTO SA MAGANDANG VIEW',
    dockDetail: 'TANGGAL HELMET · MAGKATABI, HAWAK-KAMAY AT HALIK SA NOO.',
    scene:
      'TATANGGALIN NATIN ANG DALAWANG HELMET, MAGKATABI LANG NA TITINGIN SA MALAYO — HINDI KAILANGANG MAY MARAMING SABIHIN. HAWAK-KAMAY AT ISANG HALIK SA NOO.',
    note: 'TAHIMIK NA TANAWIN SA ISANG BAGONG LUGAR NA MAGKASAMA NATING TUTUKLASIN.',
  },
  {
    id: 'extra-yakap',
    code: 'SANDALI 04',
    title: 'EXTRA YAKAP SA PARK',
    mode: 'pause',
    label: 'PAGKATAPOS NG BAWAT RIDE',
    dockBadge: 'EXTRA YAKAP SA PARK',
    dockDetail: 'NAKAPARK NA ANG MOTOR · EXTRA YAKAP MUNA BAGO UMUWI.',
    scene:
      'PAGKATAPOS NATIN MAGPARK, MAY EXTRA YAKAP MUNA — AT PAG-UWI, ANG PINAKAGUSTO KONG MARINIG: “CHICOOO, SAAN NAMAN TAYO NEXT TIME?”',
    note: 'ISA NA NAMANG ADVENTURE NA SABAY NATING PAGPAPLANUHAN.',
  },
];

function HelmetPairIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 36 22" fill="none" aria-hidden="true">
      <path
        d="M3 16.5C3 9.8 7.6 5.5 13.5 6.2C17.8 6.7 20.5 10.2 20 16.5H3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11.5 10H19.4V13.8H12.2L11.5 10Z" fill="currentColor" fillOpacity="0.26" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M17.5 16.5C17.5 10.6 21.6 6.8 27 7.4C31 7.9 33.4 11 33 16.5H17.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M25.2 10.8H32.2V14H25.8L25.2 10.8Z" fill="currentColor" fillOpacity="0.26" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function MomentIcon({ variant }) {
  if (variant === 'maagang-alis') {
    return (
      <svg viewBox="0 0 56 38" fill="none" aria-hidden="true">
        <path d="M6 30H50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 30C18.5 22 23 17 28 17C33 17 37.5 22 40 30" stroke="currentColor" strokeWidth="1.5" />
        <path d="M28 8V12M15 13L18 16M41 13L38 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M24 30L27 24M32 30L29 24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === 'munting-kainan') {
    return (
      <svg viewBox="0 0 56 38" fill="none" aria-hidden="true">
        <path d="M15 16H36V24C36 28.4 32.4 32 28 32H23C18.6 32 15 28.4 15 24V16Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M36 18H40C42.2 18 44 19.8 44 22C44 24.2 42.2 26 40 26H36" stroke="currentColor" strokeWidth="1.5" />
        <path d="M21 12C21 9.5 23 9.5 23 7M29 12C29 9.5 31 9.5 31 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === 'magandang-view') {
    return (
      <svg viewBox="0 0 56 38" fill="none" aria-hidden="true">
        <path d="M6 31L20 14L30 24L38 16L50 31H6Z" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="40" cy="9" r="3.2" fill="currentColor" fillOpacity="0.32" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 56 38" fill="none" aria-hidden="true">
      <path
        d="M28 31C28 31 15 23.8 15 15.6C15 11.5 18.2 8.8 21.8 8.8C24.5 8.8 26.8 10.4 28 12.6C29.2 10.4 31.5 8.8 34.2 8.8C37.8 8.8 41 11.5 41 15.6C41 23.8 28 31 28 31Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Adv160Illustration({ mode = 'ride', className = '' }) {
  const uid = useId().replace(/:/g, '');
  const gSky = `bh-sky-${uid}`;
  const gBeam = `bh-beam-${uid}`;
  const gBronze = `bh-bronze-${uid}`;
  const gBronzeHi = `bh-bronze-hi-${uid}`;
  const gWheel = `bh-wheel-${uid}`;
  const gSeat = `bh-seat-${uid}`;
  const gScreen = `bh-screen-${uid}`;
  const gExhaust = `bh-exhaust-${uid}`;
  const gShadow = `bh-shadow-${uid}`;
  const isPaused = mode === 'pause';

  return (
    <div className={`bh-bike-fallback ${isPaused ? 'is-paused' : 'is-riding'} ${className}`.trim()}>
      <svg
        className="bh-bike-svg"
        viewBox="0 0 640 420"
        role="img"
        aria-label="DARK BRONZE HONDA ADV 160 RS NA MAY ITIM NA UPUAN, MATAAS NA MALINAW NA WINDSCREEN, AT BRONZE NA GULONG — NAKAHANDA PARA SA PANGARAP NA BIYAHE NINA CHICO AT CHICA."
      >
        <defs>
          <radialGradient id={gSky} cx="50%" cy="54%" r="54%">
            <stop offset="0%" stopColor={isPaused ? '#f1bc70' : '#d29756'} stopOpacity={isPaused ? '0.32' : '0.2'} />
            <stop offset="52%" stopColor="#6c4b33" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#120e0d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={gBeam} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#ffedc2" stopOpacity={isPaused ? '0.34' : '0.68'} />
            <stop offset="46%" stopColor="#eab362" stopOpacity={isPaused ? '0.1' : '0.24'} />
            <stop offset="100%" stopColor="#eab362" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={gBronze} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8f6a4b" />
            <stop offset="42%" stopColor="#5e422e" />
            <stop offset="82%" stopColor="#3c291d" />
            <stop offset="100%" stopColor="#261a12" />
          </linearGradient>
          <linearGradient id={gBronzeHi} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cc9f72" />
            <stop offset="56%" stopColor="#876042" />
            <stop offset="100%" stopColor="#4c3424" />
          </linearGradient>
          <linearGradient id={gWheel} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dab17f" />
            <stop offset="50%" stopColor="#9c734c" />
            <stop offset="100%" stopColor="#60432b" />
          </linearGradient>
          <linearGradient id={gSeat} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#373230" />
            <stop offset="48%" stopColor="#1e1b1a" />
            <stop offset="100%" stopColor="#0f0d0d" />
          </linearGradient>
          <linearGradient id={gScreen} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f8fc" stopOpacity="0.48" />
            <stop offset="48%" stopColor="#d2e0ee" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#9ab0c5" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={gExhaust} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#282422" />
            <stop offset="68%" stopColor="#48423e" />
            <stop offset="100%" stopColor="#958c83" />
          </linearGradient>
          <radialGradient id={gShadow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#050403" stopOpacity="0.78" />
            <stop offset="72%" stopColor="#050403" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#050403" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Twilight Horizon Glow */}
        <ellipse cx="320" cy="240" rx="280" ry="140" fill={`url(#${gSky})`} />

        {/* Subtle Night Sky Stars & Crescent (brighter when paused at a scenic view) */}
        <g className="bh-sky-stars" fill="#f7e6c9">
          <circle cx="114" cy="82" r="1.7" />
          <circle cx="182" cy="54" r="1.3" />
          <circle cx="436" cy="58" r="1.8" />
          <circle cx="518" cy="96" r="1.5" />
          <circle cx="556" cy="146" r="1.3" />
          <circle cx="84" cy="146" r="1.4" />
          <path d="M484 62 A18 18 0 1 0 508 86 A15 15 0 1 1 484 62 Z" fillOpacity={isPaused ? '0.84' : '0.46'} />
        </g>

        {/* Distant Scenic Mountain Silhouette */}
        <path
          d="M28 336 L112 268 L188 296 L284 226 L372 276 L468 218 L554 274 L612 248 V336 Z"
          fill="#1b1512"
          fillOpacity="0.88"
        />
        <path
          d="M28 336 L146 294 L268 314 L392 274 L518 308 L612 288 V336 Z"
          fill="#14100e"
        />

        {/* Two Helmets Resting at the Scenic Overlook when Paused */}
        <g className="bh-view-helmets" transform="translate(86 306)" aria-hidden="true">
          <path d="M0 16 C0 7 6 2 13 3 C18 4 22 8 21 16 Z" fill="#2a211c" stroke="#d4a977" strokeWidth="1.4" />
          <path d="M10 8 H20 V12.5 H11 Z" fill="#f0be74" fillOpacity="0.34" />
          <path d="M24 16 C24 8 30 3.5 36.5 4.2 C41 4.8 44 8.5 43.5 16 Z" fill="#2a211c" stroke="#d4a977" strokeWidth="1.4" />
          <path d="M33.5 9 H42.5 V12.8 H34.2 Z" fill="#f0be74" fillOpacity="0.34" />
        </g>

        {/* Road Horizon & Animated Cruise Dashes */}
        <line x1="28" y1="336" x2="612" y2="336" stroke="#c89d6c" strokeOpacity="0.38" strokeWidth="1.6" />
        <g className="bh-road-dashes" stroke="#eab362" strokeOpacity={isPaused ? '0.2' : '0.52'} strokeWidth="2.6" strokeLinecap="round">
          <line x1="66" y1="354" x2="118" y2="354" />
          <line x1="176" y1="354" x2="232" y2="354" />
          <line x1="296" y1="354" x2="352" y2="354" />
          <line x1="416" y1="354" x2="472" y2="354" />
          <line x1="530" y1="354" x2="582" y2="354" />
        </g>

        {/* Ground Shadow */}
        <ellipse cx="316" cy="336" rx="188" ry="15" fill={`url(#${gShadow})`} />

        {/* Motorcycle Assembly */}
        <g transform="translate(314 252)">
          <g className="bh-bike-motion">
            {/* Warm Headlight Cone */}
            <path
              className="bh-headlight-cone"
              d="M148 -42 L314 -82 L314 38 L148 -18 Z"
              fill={`url(#${gBeam})`}
            />

            {/* Rear Swingarm & Engine Block */}
            <path d="M-120 28 L-36 22 L-28 42 L-116 44 Z" fill="#23201e" stroke="#3c3531" strokeWidth="1.3" />
            <ellipse cx="-54" cy="33" rx="23" ry="12" fill="#2f2a27" stroke="#534942" strokeWidth="1.2" />

            {/* Iconic ADV 160 Gold-Subtank Rear Shock */}
            <g transform="rotate(-18 -88 20)">
              <rect x="-94" y="-21" width="10" height="47" rx="3" fill="#221e1c" stroke="#c99b63" strokeWidth="1.4" />
              <rect x="-102" y="-18" width="8" height="20" rx="3" fill="#d7a86b" stroke="#7c5a33" strokeWidth="1" />
              <line x1="-94" y1="-8" x2="-84" y2="-8" stroke="#e4be86" strokeWidth="1.7" />
              <line x1="-94" y1="0" x2="-84" y2="0" stroke="#e4be86" strokeWidth="1.7" />
              <line x1="-94" y1="8" x2="-84" y2="8" stroke="#e4be86" strokeWidth="1.7" />
              <line x1="-94" y1="16" x2="-84" y2="16" stroke="#e4be86" strokeWidth="1.7" />
            </g>

            {/* Rear Bronze Wheel */}
            <g transform="translate(-114 39)">
              <g className="bh-wheel-spin">
                <circle r="48" fill="#171514" stroke="#312b28" strokeWidth="3.5" />
                <circle r="43" fill="none" stroke="#26211f" strokeWidth="2.5" strokeDasharray="8 5" />
                <circle r="31" fill="#100e0d" stroke={`url(#${gWheel})`} strokeWidth="5.4" />
                <circle r="27" fill="none" stroke="#e3bc8d" strokeOpacity="0.38" strokeWidth="1" />
                <g stroke={`url(#${gWheel})`} strokeWidth="2.8" strokeLinecap="round">
                  <line x1="0" y1="-27" x2="0" y2="27" />
                  <line x1="-27" y1="0" x2="27" y2="0" />
                  <line x1="-19" y1="-19" x2="19" y2="19" />
                  <line x1="-19" y1="19" x2="19" y2="-19" />
                  <line x1="-10" y1="-25" x2="10" y2="25" />
                  <line x1="-25" y1="-10" x2="25" y2="10" />
                </g>
                <circle r="12" fill="#2d2621" stroke="#c89e6e" strokeWidth="1.6" />
                <circle r="5" fill="#161311" stroke="#8f6c4a" strokeWidth="1.2" />
              </g>
            </g>

            {/* Front Bronze Wheel */}
            <g transform="translate(124 36)">
              <g className="bh-wheel-spin">
                <circle r="51" fill="#171514" stroke="#312b28" strokeWidth="3.5" />
                <circle r="46" fill="none" stroke="#26211f" strokeWidth="2.5" strokeDasharray="9 5" />
                <circle r="34" fill="#100e0d" stroke={`url(#${gWheel})`} strokeWidth="5.4" />
                <circle r="29" fill="none" stroke="#e3bc8d" strokeOpacity="0.38" strokeWidth="1" />
                <circle r="19" fill="none" stroke="#968d85" strokeOpacity="0.58" strokeWidth="2" strokeDasharray="6 3" />
                <g stroke={`url(#${gWheel})`} strokeWidth="2.8" strokeLinecap="round">
                  <line x1="0" y1="-29" x2="0" y2="29" />
                  <line x1="-29" y1="0" x2="29" y2="0" />
                  <line x1="-21" y1="-21" x2="21" y2="21" />
                  <line x1="-21" y1="21" x2="21" y2="-21" />
                  <line x1="-11" y1="-27" x2="11" y2="27" />
                  <line x1="-27" y1="-11" x2="27" y2="11" />
                </g>
                <circle r="11" fill="#2d2621" stroke="#c89e6e" strokeWidth="1.6" />
                <circle r="4.8" fill="#161311" stroke="#8f6c4a" strokeWidth="1.2" />
              </g>
            </g>

            {/* Front Telescopic Fork & High Front Fender */}
            <line x1="90" y1="-50" x2="124" y2="36" stroke="#534942" strokeWidth="10.5" strokeLinecap="round" />
            <line x1="90" y1="-50" x2="109" y2="-2" stroke="#8f8074" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="109" y1="-2" x2="124" y2="36" stroke="#282321" strokeWidth="9" strokeLinecap="round" />
            <path d="M85 -8 C108 -21 142 -21 164 -5 L154 3 C133 -8 109 -8 90 2 Z" fill={`url(#${gBronze})`} stroke="#a07752" strokeWidth="1.2" />

            {/* Matte Black Center Tunnel & Cruiser Footboards */}
            <path d="M-68 50 L46 50 L90 14 L76 -10 L14 13 L-46 10 Z" fill="#191615" stroke="#3f3631" strokeWidth="1.4" />
            <path d="M-34 37 L42 37 L72 10 L64 3 L37 29 L-29 29 Z" fill="#2d2724" stroke="#7c5d43" strokeOpacity="0.55" strokeWidth="1.1" />

            {/* Dark Bronze Side Body Fairing & Tail */}
            <path d="M-146 -42 L-58 -34 L18 -13 L43 13 L-39 22 L-119 -8 L-153 -29 Z" fill={`url(#${gBronze})`} stroke="#aa7f58" strokeOpacity="0.74" strokeWidth="1.4" />
            <path d="M-142 -37 L-55 -29 L11 -11 L-10 -3 L-111 -16 Z" fill={`url(#${gBronzeHi})`} fillOpacity="0.74" />
            {/* RS Crimson Stripe & Badge */}
            <path d="M-114 -21 L-45 -13 L-35 -8 L-106 -15 Z" fill="#d1483b" />
            <text x="-66" y="-17" fontFamily="sans-serif" fontSize="8.8" fontWeight="800" letterSpacing="1.6" fill="#f6e7d4">ADV 160</text>
            <text x="-16" y="-17" fontFamily="sans-serif" fontSize="8.8" fontWeight="900" letterSpacing="1.2" fill="#e65345">RS</text>

            {/* Dark Bronze Sculpted Front Nose Fairing */}
            <path d="M37 11 L71 -61 L124 -58 L151 -34 L141 -16 L95 -3 L60 16 Z" fill={`url(#${gBronze})`} stroke="#b38860" strokeOpacity="0.8" strokeWidth="1.5" />
            <path d="M72 -56 L119 -53 L141 -34 L108 -27 L66 -35 Z" fill={`url(#${gBronzeHi})`} fillOpacity="0.68" />
            <path d="M68 -26 L111 -21 L100 -10 L60 -13 Z" fill="#161312" stroke="#5b4331" strokeWidth="1" />

            {/* Twin LED Headlight & Crimson Taillight */}
            <path d="M121 -50 L149 -34 L143 -26 L116 -39 Z" fill="#fff2d2" stroke="#f0be74" strokeWidth="1.2" />
            <path d="M126 -45 L145 -34" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <path d="M-151 -37 L-142 -40 L-140 -29 L-151 -27 Z" fill="#e25142" />

            {/* Two-Level Black Seat */}
            <path d="M-130 -45 C-108 -55 -72 -55 -42 -45 C-22 -38 -11 -26 18 -24 C35 -22 44 -14 37 -6 L-47 -13 L-125 -32 Z" fill={`url(#${gSeat})`} stroke="#4d4642" strokeWidth="1.3" />
            <path d="M-119 -42 C-95 -48 -69 -48 -42 -39 C-21 -31 -5 -21 26 -19" fill="none" stroke="#5d544e" strokeOpacity="0.65" strokeWidth="1.1" strokeDasharray="3.5 2.5" />

            {/* Rear Grab Rail */}
            <path d="M-157 -47 L-121 -48 L-116 -42 L-153 -39 Z" fill="#322d2a" stroke="#7d6e63" strokeWidth="1.1" />

            {/* Handlebars & Tall Mirror */}
            <path d="M66 -60 L76 -82 L93 -84" fill="none" stroke="#36302d" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="71" cy="-82" r="6.4" fill="#1a1716" stroke="#8b7b6e" strokeWidth="1.5" />
            <path d="M82 -84 L90 -109 L111 -112" fill="none" stroke="#453e3a" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M101 -117 L122 -115 C125 -115 125 -106 117 -106 L100 -108 Z" fill="#231f1d" stroke="#857568" strokeWidth="1.1" />

            {/* Tall Clear Windscreen */}
            <path d="M96 -60 L116 -130 C119 -140 130 -140 135 -129 L134 -56 Z" fill={`url(#${gScreen})`} stroke="#e6f0fa" strokeOpacity="0.72" strokeWidth="1.6" />
            <line x1="111" y1="-121" x2="122" y2="-69" stroke="#ffffff" strokeOpacity="0.48" strokeWidth="2" strokeLinecap="round" />
            <line x1="120" y1="-114" x2="127" y2="-79" stroke="#ffffff" strokeOpacity="0.24" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="106" y1="-58" x2="116" y2="-90" stroke="#2c2725" strokeWidth="3.2" strokeLinecap="round" />

            {/* Upswept Exhaust Muffler */}
            <g transform="rotate(-22 -95 37)">
              <path d="M-132 29 L-45 26 L-39 43 L-129 47 Z" fill={`url(#${gExhaust})`} stroke="#7b7168" strokeWidth="1.3" />
              <path d="M-121 33 L-61 31 L-58 39 L-119 41 Z" fill="#221f1d" stroke="#5b524b" strokeWidth="0.9" />
              <path d="M-140 31 L-130 29 L-128 46 L-138 43 Z" fill="#b3a99f" stroke="#5e564f" strokeWidth="1" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function BiyahePage({ motorcycleStage = null }) {
  const [letterOpen, setLetterOpen] = useState(false);
  const [activeMomentId, setActiveMomentId] = useState(DREAM_MOMENTS[0].id);

  const letterOpenerRef = useRef(null);
  const letterHeadingRef = useRef(null);
  const letterSectionRef = useRef(null);
  const momentsSectionRef = useRef(null);

  const activeMoment =
    DREAM_MOMENTS.find((moment) => moment.id === activeMomentId) || DREAM_MOMENTS[0];
  const rideMode = activeMoment.mode;
  const isPaused = rideMode === 'pause';

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '11:11 PM · BIYAHE NATIN — PARA SA CHICAAA KO';
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

  useEffect(() => {
    if (!letterOpen) return;
    function onWindowKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setLetterOpen(false);
        letterOpenerRef.current?.focus({ preventScroll: true });
      }
    }
    window.addEventListener('keydown', onWindowKeyDown);
    return () => window.removeEventListener('keydown', onWindowKeyDown);
  }, [letterOpen]);

  function openOrCloseLetter() {
    if (letterOpen) {
      setLetterOpen(false);
      letterOpenerRef.current?.focus({ preventScroll: true });
    } else {
      setLetterOpen(true);
    }
  }

  function closeLetter() {
    setLetterOpen(false);
    letterOpenerRef.current?.focus({ preventScroll: true });
  }

  function toggleRidePause() {
    setActiveMomentId(isPaused ? 'maagang-alis' : 'magandang-view');
  }

  function selectMoment(moment) {
    setActiveMomentId(moment.id);
  }

  function jumpToMoments() {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    momentsSectionRef.current?.scrollIntoView?.({
      block: 'start',
      behavior: reduced ? 'instant' : 'smooth',
    });
  }

  const renderedMotorcycleStage =
    typeof motorcycleStage === 'function'
      ? motorcycleStage({ mode: rideMode, moment: activeMoment.id })
      : motorcycleStage || <Adv160Illustration mode={rideMode} />;

  return (
    <div className="biyahe-page" lang="tl">
      <div className="bh-shell">
        <header className="bh-nav">
          <Link to="/" className="bh-brand" aria-label="LIBRARY NI CHICO PARA KAY CHICA">
            LIBRARY NI CHICO
            <span>PARA KAY CHICA</span>
          </Link>
          <span className="bh-nav-whisper">PANGARAP NA BIYAHE · TWO HELMETS, ONE ADV 160 RS</span>
          <span className="bh-nav-time" aria-label="11:11 PM">
            11:11 PM <HelmetPairIcon />
          </span>
        </header>

        <main>
          <section className="bh-hero" aria-labelledby="bh-hero-title">
            <div className="bh-stage-col">
              <div
                className={`bh-stage${isPaused ? ' is-paused' : ' is-riding'}`}
                data-mode={rideMode}
                data-moment={activeMoment.id}
              >
                <div className="bh-stage-frame" aria-hidden="true" />
                <div className="bh-stage-horizon" aria-hidden="true" />

                <div className="bh-stage-top">
                  <span>HONDA ADV 160 RS</span>
                  <HelmetPairIcon />
                  <span>11:11 PM</span>
                </div>

                <span className="bh-stage-clock" aria-hidden="true">
                  11:11
                </span>

                <div className="bh-stage-slot">
                  {renderedMotorcycleStage}
                </div>

                <div className="bh-stage-dock" data-mode={rideMode} data-moment={activeMoment.id}>
                  <div className="bh-dock-copy" role="status" aria-live="polite">
                    <div className="bh-dock-header">
                      <span className="bh-dock-dot" aria-hidden="true" />
                      <span className="bh-dock-badge">{activeMoment.dockBadge}</span>
                      <span className="bh-dock-state">{isPaused ? 'NAKAPARK' : 'SA DAAN'}</span>
                    </div>
                    <span className="bh-dock-detail">{activeMoment.dockDetail}</span>
                  </div>

                  <button
                    type="button"
                    className="bh-mode-toggle"
                    aria-pressed={isPaused}
                    data-mode={rideMode}
                    onClick={toggleRidePause}
                  >
                    <span className="bh-mode-toggle-icon" aria-hidden="true">
                      {isPaused ? '▶' : '❚❚'}
                    </span>
                    {isPaused ? 'TULOY SA BIYAHE' : 'HINTO MUNA SA VIEW'}
                  </button>
                </div>
              </div>

              <p className="bh-stage-caption">
                <span>DARK BRONZE ADV 160 RS · BLACK SEAT · TALL WINDSCREEN · BRONZE WHEELS</span>
                <span>ikaw ang backride ko. ❤️</span>
              </p>
            </div>

            <div className="bh-copy-col">
              <p className="bh-eyebrow">
                <span className="bh-eyebrow-rule" aria-hidden="true" />
                11:11 PM · MULA SA CHICOOO MO
              </p>

              <h1 id="bh-hero-title" className="bh-title">
                BIYAHE NATIN.
                <em>TWO HELMETS, ONE ADV 160 RS.</em>
              </h1>

              <p className="bh-lede">
                CHICAAAA KOOOO, MAY MATAGAL NA AKONG PANGARAP NA RIDE KASAMA KA — MAAGANG ALIS,
                MGA BAGONG DAANG SABAY NATING TUTUKLASIN, AT IKAW ANG BACKRIDE NG CHICOOO MONG
                DRIVER.
              </p>

              <p className="bh-note">
                HINDI LANG ANG DESTINATION ANG INAABANGAN KO — KUNDI ANG BAWAT SANDALING MAGKASAMA
                TAYO, ANG TAHIMIK NA HINTO SA MAGANDANG VIEW, AT ANG EXTRA YAKAP PAGKATAPOS MAGPARK.
              </p>

              <div className="bh-hero-actions">
                <button
                  ref={letterOpenerRef}
                  type="button"
                  className="bh-primary-btn"
                  aria-expanded={letterOpen}
                  aria-controls="bh-letter"
                  onClick={openOrCloseLetter}
                >
                  <HelmetPairIcon />
                  {letterOpen ? 'ITUPI MUNA ANG SULAT' : 'BUKSAN ANG SULAT SA 11:11 PM'}
                </button>
                <button type="button" className="bh-ghost-btn" onClick={jumpToMoments}>
                  IMAGINE NATIN ANG BIYAHE
                </button>
              </div>

              <div className="bh-pillars" aria-label="MGA PANGARAP SA 11:11 PM">
                <div className="bh-pillar-item">
                  <span>01</span>
                  <strong>LIGTAS NA BIYAHE</strong>
                </div>
                <div className="bh-pillar-item">
                  <span>02</span>
                  <strong>TAMANG PAHINGA AT KAIN</strong>
                </div>
                <div className="bh-pillar-item">
                  <span>03</span>
                  <strong>EXTRA YAKAP SA PARK</strong>
                </div>
              </div>
            </div>
          </section>

          {letterOpen && (
            <section
              ref={letterSectionRef}
              id="bh-letter"
              className="bh-letter-section"
              aria-labelledby="bh-letter-heading"
            >
              <article className="bh-letter-card">
                <div className="bh-letter-top">
                  <span>11:11 PM · LIHAM MULA SA CHICOOO MO</span>
                  <button
                    type="button"
                    className="bh-letter-close"
                    onClick={closeLetter}
                    aria-label="ISARA ANG SULAT"
                  >
                    ISARA ×
                  </button>
                </div>

                <h2 id="bh-letter-heading" ref={letterHeadingRef} tabIndex={-1}>
                  <em>11:11 PM POOOO, ASAWAAAA KOOOO!</em> 🥹❤️
                </h2>

                <div className="bh-letter-body">
                  <p>
                    CHICAAAA KOOOO, MAY ISA PO AKONG MATAGAL NANG GUSTONG MARANASAN KASAMA KAAAA, AT
                    PARANG MAS LALO AKONG NAEEXCITE HABANG INIISIP KOOOO HSHSHSHSHS!
                  </p>

                  <p className="bh-letter-highlight">
                    <em>
                      IMAGINE MO POOOO, ISANG MAHABANG RIDE NATIN SA HONDA ADV 160 RS, IKAW ANG
                      BACKRIDE KO, AT AKO NAMAN ANG CHICOOO MONG DRIVER NA MAY NAPAKAHALAGANG
                      RESPONSIBILIDAD... ANG MAIHATID ANG ASAWAAAA NIYA NANG LIGTAS SA BAWAT
                      DESTINATIONNNN!
                    </em>{' '}
                    ❤️
                  </p>

                  <p>
                    YUNG TIPONG MAAGA TAYONG AALIS, MAY MGA LUGAR TAYONG GUSTONG PUNTAHAN, PERO MAY
                    MGA DAAN DIN TAYONG UNANG BESES PA LANG MADADAANANNNN. HABANG TUMATAKBO TAYO
                    NANG DAHAN-DAHAN SA MGA MAGAGANDANG TANAWIN, NAKAYAKAP KA SA AKIN, AT
                    PAMINSAN-MINSAN TATAPOS TAYO SA ISANG MUNTING KAINAN PARA MAGPAHINGA AT
                    KUMAINNNN.
                  </p>

                  <p className="bh-letter-whisper">
                    <em>PERO MAY ISA PO AKONG FAVORITE PART SA GANITONG RIDE, ASAWAAAA...</em>
                  </p>

                  <p>
                    YUNG MGA SANDALING HUMIHINTO TAYO SA ISANG MAGANDANG VIEW, TATANGGALIN NATIN
                    YUNG HELMETS NATIN, TAPOS MAGKATABI LANG TAYONG TITINGIN SA MALAYO. HINDI
                    KAILANGANG MAY MARAMING SABIHIN. GUSTO KO LANG HAWAKAN YUNG KAMAY MO, HALIKAN KA
                    SA NOO, AT MA-ENJOY YUNG PAGKAKATAONG NASA ISANG BAGONG LUGAR TAYO NANG
                    MAGKASAMAAAA. 🥹
                  </p>

                  <p>AT SYEMPREEEE, MAY ISA PONG NON-NEGOTIABLE RULE ANG CHICOOO MONG RIDER!</p>

                  <p className="bh-letter-rule">
                    <em>
                      BAWAT MAHABANG BIYAHE, MAY TAMANG PAHINGA, MAY TUBIG, MAY PAGKAIN, AT MAY
                      EXTRA YAKAP PAGKATAPOS NATIN MAGPARK!
                    </em>{' '}
                    HSHSHSHSHS!
                  </p>

                  <p>
                    PERO ALAM MO POOOO, CHICAAAA KOOOO, HINDI LANG YUNG MGA DESTINATION ANG
                    INAABANGAN KO. GUSTO KO RIN YUNG BAWAT KILOMETRONG MAGKASAMA TAYO, YUNG MGA
                    LUGAR NA MATUTUKLASAN NATIN, AT YUNG MGA KWENTONG MAIUUWING NATIN PAGKATAPOS NG
                    BAWAT RIDE.
                  </p>

                  <p className="bh-letter-motto">
                    <em>
                      11:11 PM — TWO HELMETS, ONE ADV 160 RS, COUNTLESS ROADS TO EXPLORE, AT ISANG
                      CHICOOO NA MATAGAL NANG GUSTONG ISAMA ANG ASAWAAAA NIYA SA MGA BIYAHENG
                      ITOOOO.
                    </em>
                  </p>

                  <p>AT KAPAG NAKAUWI NA TAYO, MAY ISA PA PO AKONG GUSTONG MARINIG...</p>

                  <p className="bh-letter-quote">
                    <em>“CHICOOO, SAAN NAMAN TAYO NEXT TIME?”</em>
                  </p>

                  <p>
                    TAPOS AKO POOOO, NAKANGITI NANG SOBRA, KASI ALAM KONG MAY ISA NA NAMAN TAYONG
                    ADVENTURE NA SABAY PAGPAPLANUHANNNN! 🥹❤️
                  </p>
                </div>

                <p className="bh-letter-closing">
                  MAHAL NA MAHAL KITAAAA, ASAWAAAA KOOOO! MWUAAAAAAAAAA! ❤️
                </p>

                <div className="bh-letter-footer">
                  <span className="bh-letter-sign">11:11 PM · CHICOOO MONG RIDER</span>
                  <button type="button" className="bh-letter-fold" onClick={closeLetter}>
                    ITUPI MUNA ANG SULAT
                  </button>
                </div>
              </article>
            </section>
          )}

          <section
            ref={momentsSectionRef}
            className="bh-moments-section"
            aria-labelledby="bh-moments-title"
          >
            <div className="bh-moments-head">
              <div>
                <p className="bh-section-kicker">MGA PANGARAP NA SANDALI SA BIYAHE</p>
                <h2 id="bh-moments-title">
                  IMAGINE NATIN <em>ANG FUTURE RIDE NATIN.</em>
                </h2>
                <p className="bh-moments-intro">
                  PUMILI NG ISANG PANGARAP NA SANDALI SA IBABA O MAGPALIT MULA SA DAHAN-DAHANG TAKBO
                  PATUNGONG TAHIMIK NA HINTO SA VIEW — LAHAT ITO, SABAY PA NATING TUTUPARIN.
                </p>
              </div>

              <div className="bh-moments-mode-switch" role="group" aria-label="MODO NG IMAGINED RIDE">
                <button
                  type="button"
                  className={`bh-switch-btn${!isPaused ? ' is-active' : ''}`}
                  aria-pressed={!isPaused}
                  onClick={() => setActiveMomentId('maagang-alis')}
                >
                  TAKBO NANG DAHAN-DAHAN
                </button>
                <button
                  type="button"
                  className={`bh-switch-btn${isPaused ? ' is-active' : ''}`}
                  aria-pressed={isPaused}
                  onClick={() => setActiveMomentId('magandang-view')}
                >
                  HINTO SA MAGANDANG VIEW
                </button>
              </div>
            </div>

            <div className="bh-moments-grid">
              {DREAM_MOMENTS.map((moment) => {
                const selected = moment.id === activeMoment.id;
                return (
                  <button
                    key={moment.id}
                    type="button"
                    className={`bh-moment-card${selected ? ' is-selected' : ''}`}
                    aria-pressed={selected}
                    onClick={() => selectMoment(moment)}
                  >
                    <div className="bh-moment-top">
                      <span>{moment.code}</span>
                      <span className="bh-moment-pill">
                        {moment.mode === 'ride' ? 'SA DAAN' : 'PAHINGA'}
                      </span>
                    </div>
                    <div className="bh-moment-icon">
                      <MomentIcon variant={moment.id} />
                    </div>
                    <strong className="bh-moment-title">{moment.title}</strong>
                    <span className="bh-moment-sub">{moment.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="bh-moment-preview" role="status" aria-live="polite">
              <div className="bh-preview-meta">
                <span>{activeMoment.code}</span>
                <span>{activeMoment.label}</span>
              </div>
              <p className="bh-preview-scene">{activeMoment.scene}</p>
              <p className="bh-preview-note">{activeMoment.note}</p>
            </div>
          </section>
        </main>

        <footer className="bh-footer">
          <Link to="/" className="bh-footer-back">
            ← BALIK SA LIBRARY NI CHICO
          </Link>
          <span className="bh-footer-center">11:11 PM · BIYAHE NATIN · ORAS-ORAS</span>
          <span className="bh-footer-sign">SAAN NAMAN TAYO NEXT TIME? ❤️</span>
        </footer>
      </div>
    </div>
  );
}
