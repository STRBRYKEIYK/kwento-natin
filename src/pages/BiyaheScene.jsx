import { useId } from 'react';

const rideBackdropPhoto = `${import.meta.env.DEV ? '/public' : ''}/scenes/biyahe-ride-realistic.png`;
const stopBackdropPhoto = `${import.meta.env.DEV ? '/public' : ''}/scenes/biyahe-stop-realistic.png`;

const SCENE_TAGS = {
  'maagang-alis': 'SA DAAN · MAAGANG ALIS',
  'munting-kainan': 'NAKAPARK · MUNTING KAINAN',
  'magandang-view': 'NAKAPARK · MAGANDANG VIEW',
  'extra-yakap': 'NAKAPARK · EXTRA YAKAP',
};

const TILE_OFFSETS = [0, 640];

const LANE_DASHES = [24, 184, 344, 504];

const FAR_SHOULDER_WEAR = [
  { x: 18, y: 6, w: 34, o: 0.14 },
  { x: 112, y: 9, w: 22, o: 0.1 },
  { x: 196, y: 5, w: 42, o: 0.13 },
  { x: 314, y: 8, w: 28, o: 0.11 },
  { x: 426, y: 6, w: 38, o: 0.13 },
  { x: 544, y: 9, w: 24, o: 0.1 },
];

const ASPHALT_GRAINS = [
  { x: 26, y: 20, w: 28, h: 1.1, o: 0.09, light: true },
  { x: 88, y: 28, w: 42, h: 1.3, o: 0.15, light: false },
  { x: 146, y: 48, w: 24, h: 1.1, o: 0.08, light: true },
  { x: 212, y: 56, w: 50, h: 1.5, o: 0.16, light: false },
  { x: 268, y: 22, w: 32, h: 1.1, o: 0.08, light: true },
  { x: 332, y: 68, w: 38, h: 1.2, o: 0.1, light: true },
  { x: 396, y: 46, w: 46, h: 1.4, o: 0.14, light: false },
  { x: 454, y: 74, w: 26, h: 1.1, o: 0.09, light: true },
  { x: 518, y: 30, w: 40, h: 1.3, o: 0.14, light: false },
  { x: 576, y: 62, w: 34, h: 1.2, o: 0.09, light: true },
  { x: 64, y: 76, w: 44, h: 1.4, o: 0.14, light: false },
  { x: 174, y: 70, w: 22, h: 1.1, o: 0.08, light: true },
  { x: 294, y: 52, w: 30, h: 1.2, o: 0.09, light: true },
  { x: 486, y: 50, w: 36, h: 1.3, o: 0.13, light: false },
];

const FOREGROUND_VERGE = [
  { x: 18, y: 96, rx: 24, ry: 2.1, o: 0.28, light: false },
  { x: 76, y: 92, rx: 11, ry: 1.1, o: 0.12, light: true },
  { x: 132, y: 102, rx: 32, ry: 2.5, o: 0.32, light: false },
  { x: 204, y: 95, rx: 14, ry: 1.1, o: 0.11, light: true },
  { x: 264, y: 104, rx: 28, ry: 2.4, o: 0.3, light: false },
  { x: 342, y: 93, rx: 12, ry: 1.1, o: 0.12, light: true },
  { x: 398, y: 101, rx: 36, ry: 2.5, o: 0.32, light: false },
  { x: 478, y: 96, rx: 16, ry: 1.1, o: 0.11, light: true },
  { x: 544, y: 103, rx: 30, ry: 2.4, o: 0.28, light: false },
  { x: 604, y: 92, rx: 11, ry: 1.1, o: 0.11, light: true },
];

export default function BiyaheScene({
  mode = 'ride',
  moment = 'maagang-alis',
  children,
}) {
  const uid = useId().replace(/:/g, '');
  const isPaused = mode === 'pause';
  const normalizedMode = isPaused ? 'pause' : 'ride';
  const activeMoment = moment || (isPaused ? 'magandang-view' : 'maagang-alis');
  const isFoodStop = isPaused && activeMoment === 'munting-kainan';
  const isHugStop = isPaused && activeMoment === 'extra-yakap';
  const isViewStop =
    isPaused && (activeMoment === 'magandang-view' || (!isFoodStop && !isHugStop));
  const isIllustratedStop = isFoodStop || isHugStop;

  const sceneTag =
    SCENE_TAGS[activeMoment] ||
    (isPaused ? 'NAKAPARK · MAGANDANG VIEW' : 'SA DAAN · DAHAN-DAHAN');

  const gRoadSheen = `bhs-rsheen-${uid}`;
  const gPauseSky = `bhs-psky-${uid}`;
  const gMoonGlow = `bhs-mglow-${uid}`;
  const gValleyMist = `bhs-mist-${uid}`;
  const gTurnout = `bhs-turn-${uid}`;
  const gWarmLamp = `bhs-lamp-${uid}`;
  const gGroundPool = `bhs-gpool-${uid}`;

  const pauseSkyTop = isFoodStop ? '#120d0c' : isHugStop ? '#0b0b13' : '#0c0c15';
  const pauseSkyMid = isFoodStop ? '#281b14' : isHugStop ? '#1f161b' : '#241a1d';
  const pauseSkyLow = isFoodStop ? '#5b361f' : isHugStop ? '#472c24' : '#734527';
  const pauseHorizon = isFoodStop ? '#b06d38' : isHugStop ? '#965a3b' : '#c68142';

  return (
    <div
      className={`bh-ride-scene ${isPaused ? 'is-paused' : 'is-riding'} is-moment-${activeMoment}${
        isViewStop ? ' is-view-stop' : ''
      }${isIllustratedStop ? ' is-illustrated-stop' : ''}`}
      data-mode={normalizedMode}
      data-moment={activeMoment}
    >
      <div className="bh-scene-backdrop" aria-hidden="true">
        {/* RIDE MODE: CINEMATIC PHOTOGRAPHIC ROADSIDE ENVIRONMENT + QUIET MOVING ASPHALT */}
        <div className="bh-scene-ride-layer bh-ride-photo-stage" aria-hidden="true">
          <img
            className="bh-ride-photo-img"
            src={rideBackdropPhoto}
            alt=""
            aria-hidden="true"
            decoding="async"
            draggable="false"
          />

          <div className="bh-ride-photo-atmosphere" aria-hidden="true" />

          <div className="bh-ride-road-deck" aria-hidden="true">
            <svg
              className="bh-ride-road-svg"
              viewBox="0 0 640 112"
              preserveAspectRatio="xMidYMax slice"
              focusable="false"
            >
              <defs>
                <linearGradient id={gRoadSheen} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#121214" stopOpacity="0" />
                  <stop offset="22%" stopColor="#141416" stopOpacity="0.12" />
                  <stop offset="72%" stopColor="#0f0f10" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#09090a" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Subtle asphalt depth & tire-track wear bands */}
              <rect x="0" y="0" width="640" height="112" fill={`url(#${gRoadSheen})`} />
              <rect x="0" y="42" width="640" height="18" fill="#09090b" fillOpacity="0.11" />
              <rect x="0" y="68" width="640" height="14" fill="#09090b" fillOpacity="0.09" />

              {/* Subtle near-side weathered edge strip */}
              <line
                x1="0"
                y1="88"
                x2="640"
                y2="88"
                stroke="#d6d0c4"
                strokeOpacity="0.14"
                strokeWidth="1.4"
              />

              {/* Far shoulder aggregate wear below photographic edge line — slowest parallax plane */}
              <g className="bh-road-far-track">
                {TILE_OFFSETS.map((offset) => (
                  <g key={`far-${offset}`} transform={`translate(${offset} 0)`}>
                    {FAR_SHOULDER_WEAR.map((item, idx) => (
                      <rect
                        key={`fw-${idx}`}
                        x={item.x}
                        y={item.y}
                        width={item.w}
                        height="1.1"
                        rx="0.55"
                        fill="#e4ded2"
                        fillOpacity={item.o}
                      />
                    ))}
                  </g>
                ))}
              </g>

              {/* Mid-road centerline dashes & asphalt micro-grain — slow safe cruise (seamless 640px loop) */}
              <g className="bh-road-mid-track">
                {TILE_OFFSETS.map((offset) => (
                  <g key={`mid-${offset}`} transform={`translate(${offset} 0)`}>
                    {LANE_DASHES.map((x) => (
                      <rect
                        key={`dash-${x}`}
                        x={x}
                        y="36"
                        width="48"
                        height="2.4"
                        rx="1.1"
                        fill="#e6dcc9"
                        fillOpacity="0.38"
                      />
                    ))}
                    {ASPHALT_GRAINS.map((grain, idx) => (
                      <rect
                        key={`gr-${idx}`}
                        x={grain.x}
                        y={grain.y}
                        width={grain.w}
                        height={grain.h}
                        rx="0.55"
                        fill={grain.light ? '#dbd6cc' : '#08080a'}
                        fillOpacity={grain.o}
                      />
                    ))}
                  </g>
                ))}
              </g>

              {/* Immediate foreground verge & coarse shoulder depth — slightly faster parallax */}
              <g className="bh-road-near-track">
                {TILE_OFFSETS.map((offset) => (
                  <g key={`near-${offset}`} transform={`translate(${offset} 0)`}>
                    {FOREGROUND_VERGE.map((item, idx) => (
                      <ellipse
                        key={`fg-${idx}`}
                        cx={item.x}
                        cy={item.y}
                        rx={item.rx}
                        ry={item.ry}
                        fill={item.light ? '#cfc9bd' : '#09090b'}
                        fillOpacity={item.o}
                      />
                    ))}
                  </g>
                ))}
              </g>
            </svg>
          </div>

          {/* Grounded contact shadow & soft pre-dawn asphalt light graze under the riding scooter */}
          <div className="bh-ride-contact-shadow" aria-hidden="true" />
          <div className="bh-ride-headlight-graze" aria-hidden="true" />
        </div>

        {/* PAUSE MODE (MAGANDANG VIEW): PHOTOREAL SCENIC OVERLOOK BACKDROP */}
        <div className="bh-scene-pause-photo-layer bh-pause-photo-stage" aria-hidden="true">
          <img
            className="bh-pause-photo-img"
            src={stopBackdropPhoto}
            alt=""
            aria-hidden="true"
            decoding="async"
            draggable="false"
          />

          <div className="bh-pause-photo-atmosphere" aria-hidden="true" />

          {/* Grounded turnout contact shadow under the full-size parked scooter */}
          <div className="bh-pause-contact-shadow" aria-hidden="true" />
        </div>

        {/* PAUSE MODE (FOOD / HUG STOPS): ILLUSTRATED MOMENT-SPECIFIC BACKDROP */}
        <div className="bh-scene-pause-layer bh-pause-scene-stage" aria-hidden="true">
          <svg
            className="bh-scene-svg"
            viewBox="0 0 640 350"
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
          >
            <defs>
              <linearGradient id={gPauseSky} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={pauseSkyTop} />
                <stop offset="44%" stopColor={pauseSkyMid} />
                <stop offset="78%" stopColor={pauseSkyLow} />
                <stop offset="100%" stopColor={pauseHorizon} />
              </linearGradient>

              <radialGradient id={gMoonGlow} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffedc8" stopOpacity="0.42" />
                <stop offset="45%" stopColor="#f0be74" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#f0be74" stopOpacity="0" />
              </radialGradient>

              <linearGradient id={gValleyMist} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f3c584" stopOpacity="0" />
                <stop offset="55%" stopColor="#eab068" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#140f0d" stopOpacity="0" />
              </linearGradient>

              <linearGradient id={gTurnout} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#261e19" />
                <stop offset="40%" stopColor="#191411" />
                <stop offset="100%" stopColor="#0e0b0a" />
              </linearGradient>

              <radialGradient id={gWarmLamp} cx="50%" cy="22%" r="68%">
                <stop offset="0%" stopColor="#ffdfa4" stopOpacity="0.46" />
                <stop offset="45%" stopColor="#e8a653" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#e8a653" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={gGroundPool} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#050403" stopOpacity="0.72" />
                <stop offset="68%" stopColor="#050403" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#050403" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect x="0" y="0" width="640" height="270" fill={`url(#${gPauseSky})`} />

            {/* Twilight valley mist */}
            <rect x="0" y="198" width="640" height="72" fill={`url(#${gValleyMist})`} />

            {/* Still twilight stars */}
            <g fill="#faecd2" fillOpacity={isFoodStop ? '0.52' : '0.84'}>
              <circle cx="134" cy="46" r="1.4" />
              <circle cx="176" cy="72" r="1.1" />
              <circle cx="222" cy="36" r="1.6" />
              <circle cx="274" cy="64" r="1.1" />
              <circle cx="368" cy="44" r="1.4" />
              <circle cx="416" cy="74" r="1.2" />
              <circle cx="516" cy="96" r="1.3" />
              <circle cx="548" cy="54" r="1.5" />
              <circle cx="88" cy="84" r="1.3" />
            </g>

            {/* Crescent moon & calm twilight halo */}
            <g transform="translate(480 62)">
              <circle r="44" fill={`url(#${gMoonGlow})`} opacity={isFoodStop ? '0.5' : '0.95'} />
              <path
                d="M-4 -14 A15 15 0 1 0 15 5 A12.2 12.2 0 1 1 -4 -14 Z"
                fill="#fbe6be"
                fillOpacity={isFoodStop ? '0.68' : '0.94'}
              />
            </g>

            {/* Layered scenic overlook mountains */}
            <path
              d="M0 266 L0 206 L86 164 L164 196 L262 146 L354 194 L444 150 L534 190 L640 162 L640 266 Z"
              fill="#221916"
              fillOpacity="0.9"
            />
            <path
              d="M0 206 L86 164 L164 196 L262 146 L354 194 L444 150 L534 190 L640 162"
              fill="none"
              stroke="#eab473"
              strokeOpacity="0.22"
              strokeWidth="1.2"
            />
            <path
              d="M0 266 L0 228 L122 198 L228 222 L338 194 L452 224 L564 198 L640 218 L640 266 Z"
              fill="#171210"
            />

            {/* Overlook guardrail behind parked bay */}
            <g stroke="#6c513c" strokeOpacity="0.65">
              <line x1="0" y1="248" x2="640" y2="248" strokeWidth="2.4" />
              <line x1="0" y1="257" x2="640" y2="257" strokeWidth="1.3" strokeOpacity="0.45" />
              {[44, 118, 192, 266, 374, 448, 522, 596].map((x) => (
                <line key={`rail-${x}`} x1={x} y1="244" x2={x} y2="268" strokeWidth="2.8" strokeLinecap="round" />
              ))}
            </g>

            {/* Grounded stone/gravel scenic turnout apron */}
            <rect x="0" y="266" width="640" height="84" fill={`url(#${gTurnout})`} />
            <path
              d="M0 268 Q320 262 640 268"
              fill="none"
              stroke="#d4a977"
              strokeOpacity="0.34"
              strokeWidth="1.6"
            />
            <g fill="#d4a977" fillOpacity="0.16">
              <circle cx="148" cy="296" r="1.4" />
              <circle cx="192" cy="318" r="1.1" />
              <circle cx="246" cy="332" r="1.3" />
              <circle cx="408" cy="328" r="1.2" />
              <circle cx="476" cy="306" r="1.5" />
              <circle cx="516" cy="322" r="1.1" />
            </g>

            {/* MOMENT ACCENT 2: MUNTING KAINAN — COZY ROADSIDE DINER AWNING, WARM LIGHTS & MUGS */}
            {isFoodStop && (
              <g className="bh-scene-accent-food">
                {/* Warm diner lantern spill across turnout */}
                <ellipse cx="164" cy="248" rx="112" ry="74" fill={`url(#${gWarmLamp})`} />

                {/* Hanging cozy cafe string lights */}
                <path
                  d="M72 126 Q152 152 238 134"
                  fill="none"
                  stroke="#9c7552"
                  strokeOpacity="0.55"
                  strokeWidth="1.1"
                />
                {[
                  [104, 136],
                  [134, 142],
                  [166, 144],
                  [198, 141],
                  [226, 136],
                ].map(([cx, cy], idx) => (
                  <g key={`bulb-${idx}`}>
                    <circle cx={cx} cy={cy + 3} r="8" fill="#f5be6b" fillOpacity="0.18" />
                    <circle cx={cx} cy={cy + 3} r="2.3" fill="#ffebc4" />
                  </g>
                ))}

                {/* Small roadside kainan stall & timber awning on left */}
                <g transform="translate(106 164)">
                  <path d="M0 16 L102 6 L112 22 L-6 26 Z" fill="#3a251a" stroke="#c89660" strokeOpacity="0.6" strokeWidth="1.2" />
                  <line x1="12" y1="26" x2="12" y2="104" stroke="#53392a" strokeWidth="3.2" />
                  <line x1="94" y1="22" x2="94" y2="104" stroke="#53392a" strokeWidth="3.2" />
                  {/* Warm counter window */}
                  <rect x="20" y="34" width="66" height="36" rx="4" fill="#f0b663" fillOpacity="0.18" stroke="#d49e63" strokeOpacity="0.45" strokeWidth="1" />
                  {/* Counter shelf with two steaming mugs & water bottle */}
                  <rect x="14" y="68" width="78" height="5" rx="2" fill="#4d3527" stroke="#c99966" strokeOpacity="0.5" strokeWidth="1" />
                  {/* Mug 1 */}
                  <rect x="26" y="56" width="12" height="12" rx="2.5" fill="#2a1d17" stroke="#f0be74" strokeWidth="1.2" />
                  <path d="M38 59 H41 C42.6 59 42.6 64 41 64 H38" fill="none" stroke="#f0be74" strokeWidth="1.1" />
                  <path d="M30 53 C30 50 32 50 32 47" fill="none" stroke="#ffebd0" strokeOpacity="0.65" strokeWidth="1.1" strokeLinecap="round" />
                  {/* Mug 2 */}
                  <rect x="48" y="57" width="12" height="11" rx="2.5" fill="#2a1d17" stroke="#f0be74" strokeWidth="1.2" />
                  <path d="M60 60 H63 C64.5 60 64.5 64.5 63 64.5 H60" fill="none" stroke="#f0be74" strokeWidth="1.1" />
                  <path d="M53 54 C53 51 55 51 55 48" fill="none" stroke="#ffebd0" strokeOpacity="0.65" strokeWidth="1.1" strokeLinecap="round" />
                  {/* Water bottle */}
                  <rect x="72" y="52" width="7" height="16" rx="2" fill="#9bc2db" fillOpacity="0.26" stroke="#c7dce8" strokeOpacity="0.7" strokeWidth="1" />
                  <rect x="73.5" y="49.5" width="4" height="2.5" rx="0.8" fill="#c7dce8" fillOpacity="0.7" />
                </g>

                {/* Two helmets resting safely on a side bench on the right */}
                <g transform="translate(464 232)">
                  <rect x="-4" y="18" width="58" height="4" rx="2" fill="#3a291f" />
                  <path d="M2 18 C2 9 8 4 15 4.8 C20.5 5.4 24 9.8 23.5 18 Z" fill="#2b201a" stroke="#d4a977" strokeWidth="1.3" />
                  <path d="M27 18 C27 9.6 32.5 5 39 5.8 C44 6.4 47.4 10.5 47 18 Z" fill="#2b201a" stroke="#d4a977" strokeWidth="1.3" />
                </g>
              </g>
            )}

            {/* MOMENT ACCENT 3: EXTRA YAKAP SA PARK — WARM PARK LAMP, BENCH & STARLIGHT */}
            {isHugStop && (
              <g className="bh-scene-accent-hug">
                {/* Warm park lamp halo */}
                <ellipse cx="156" cy="186" rx="116" ry="104" fill={`url(#${gWarmLamp})`} />

                {/* Vintage park lamp post on left */}
                <g transform="translate(156 106)">
                  <line x1="0" y1="22" x2="0" y2="162" stroke="#47372d" strokeWidth="3.6" strokeLinecap="round" />
                  <path d="M-9 162 H9 L6 154 H-6 Z" fill="#3a2c24" />
                  {/* Lantern housing */}
                  <path d="M-8 10 H8 L6 24 H-6 Z" fill="#ffe6b3" fillOpacity="0.88" stroke="#d4a977" strokeWidth="1.2" />
                  <path d="M-11 10 L0 2 L11 10 Z" fill="#3a2c24" stroke="#b3885c" strokeWidth="1.1" />
                  <circle cx="0" cy="17" r="18" fill="#f7c879" fillOpacity="0.24" />
                </g>

                {/* Quiet park bench + two resting helmets on right */}
                <g transform="translate(454 222)">
                  <rect x="0" y="14" width="66" height="4.5" rx="2" fill="#3f2d22" stroke="#b3885c" strokeOpacity="0.5" strokeWidth="1" />
                  <rect x="2" y="25" width="62" height="5" rx="2" fill="#4a3427" stroke="#c89b6a" strokeOpacity="0.5" strokeWidth="1" />
                  <line x1="10" y1="14" x2="10" y2="44" stroke="#352720" strokeWidth="3" />
                  <line x1="56" y1="14" x2="56" y2="44" stroke="#352720" strokeWidth="3" />
                  {/* Two helmets nestled close together on the bench */}
                  <path d="M12 25 C12 16 17.5 11.4 24.4 12 C29.6 12.6 33 16.8 32.5 25 Z" fill="#2b201a" stroke="#e2ba89" strokeWidth="1.35" />
                  <path d="M33.5 25 C33.5 16.6 38.8 12.2 45.2 12.8 C50 13.4 53.2 17.4 52.8 25 Z" fill="#2b201a" stroke="#e2ba89" strokeWidth="1.35" />
                </g>

                {/* Delicate heart-shaped constellation glint high in the 11:11 sky */}
                <g transform="translate(320 56)" stroke="#f5cf93" strokeOpacity="0.34" strokeWidth="0.9" fill="#fff0d4">
                  <path
                    d="M0 16 L-12 4 L-9 -6 L0 -1 L9 -6 L12 4 Z"
                    fill="none"
                  />
                  <circle cx="0" cy="16" r="1.5" />
                  <circle cx="-12" cy="4" r="1.4" />
                  <circle cx="-9" cy="-6" r="1.5" />
                  <circle cx="0" cy="-1" r="1.3" />
                  <circle cx="9" cy="-6" r="1.5" />
                  <circle cx="12" cy="4" r="1.4" />
                </g>
              </g>
            )}

            {/* Grounded shadow pool under the parked scooter */}
            <ellipse cx="320" cy="296" rx="158" ry="16" fill={`url(#${gGroundPool})`} />
          </svg>
        </div>
      </div>

      {/* Stable child slot — never remounted across mode/moment switches */}
      <div className="bh-scene-model">{children}</div>

      <div className="bh-scene-vignette" aria-hidden="true" />

      <div className="bh-scene-hud" aria-hidden="true">
        <span className="bh-scene-hud-dot" />
        <span>{sceneTag}</span>
      </div>
    </div>
  );
}
