import { useId } from 'react';

const SCENE_TAGS = {
  'maagang-alis': 'SA DAAN · MAAGANG ALIS',
  'munting-kainan': 'NAKAPARK · MUNTING KAINAN',
  'magandang-view': 'NAKAPARK · MAGANDANG VIEW',
  'extra-yakap': 'NAKAPARK · EXTRA YAKAP',
};

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
  const isViewStop =
    isPaused && (activeMoment === 'magandang-view' || (!isFoodStop && activeMoment !== 'extra-yakap'));
  const isHugStop = isPaused && activeMoment === 'extra-yakap';

  const sceneTag =
    SCENE_TAGS[activeMoment] ||
    (isPaused ? 'NAKAPARK · MAGANDANG VIEW' : 'SA DAAN · DAHAN-DAHAN');

  const gRideSky = `bhs-rsky-${uid}`;
  const gRideSun = `bhs-rsun-${uid}`;
  const gRoad = `bhs-road-${uid}`;
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
      className={`bh-ride-scene ${isPaused ? 'is-paused' : 'is-riding'} is-moment-${activeMoment}`}
      data-mode={normalizedMode}
      data-moment={activeMoment}
    >
      <div className="bh-scene-backdrop" aria-hidden="true">
        <svg
          className="bh-scene-svg"
          viewBox="0 0 640 350"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
        >
          <defs>
            <linearGradient id={gRideSky} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0c0f17" />
              <stop offset="46%" stopColor="#1d181b" />
              <stop offset="76%" stopColor="#462b1c" />
              <stop offset="100%" stopColor="#774827" />
            </linearGradient>

            <radialGradient id={gRideSun} cx="50%" cy="100%" r="72%">
              <stop offset="0%" stopColor="#f4c27a" stopOpacity="0.48" />
              <stop offset="48%" stopColor="#c47c41" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1b1412" stopOpacity="0" />
            </radialGradient>

            <linearGradient id={gRoad} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#201a17" />
              <stop offset="35%" stopColor="#15110f" />
              <stop offset="100%" stopColor="#0b0908" />
            </linearGradient>

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

          {/* RIDE MODE: EARLY MORNING OPEN ROAD TOURING SCENERY */}
          <g className="bh-scene-ride-layer">
            <rect x="0" y="0" width="640" height="270" fill={`url(#${gRideSky})`} />
            <ellipse cx="320" cy="264" rx="280" ry="120" fill={`url(#${gRideSun})`} />

            {/* Soft pre-dawn stars fading out near the top */}
            <g fill="#f7e7cc" fillOpacity="0.42">
              <circle cx="152" cy="46" r="1.2" />
              <circle cx="246" cy="34" r="1" />
              <circle cx="388" cy="40" r="1.3" />
              <circle cx="486" cy="54" r="1.1" />
              <circle cx="546" cy="76" r="1" />
            </g>

            {/* Distant gliding mountain range (seamless 640px loop) */}
            <g className="bh-scene-ridge-track">
              <path
                d="M0 264 L0 218 L72 192 L154 214 L244 176 L336 206 L422 184 L518 212 L592 196 L640 218 L712 192 L794 214 L884 176 L976 206 L1062 184 L1158 212 L1232 196 L1280 218 L1280 264 Z"
                fill="#1f1715"
                fillOpacity="0.92"
              />
              <path
                d="M0 218 L72 192 L154 214 L244 176 L336 206 L422 184 L518 212 L592 196 L640 218 L712 192 L794 214 L884 176 L976 206 L1062 184 L1158 212 L1232 196 L1280 218"
                fill="none"
                stroke="#d89e64"
                strokeOpacity="0.22"
                strokeWidth="1.2"
              />
            </g>

            {/* Midground rolling hills + roadside trees & guide posts (seamless 640px loop) */}
            <g className="bh-scene-mid-track">
              <path
                d="M0 268 L0 244 Q80 226 160 242 T320 240 T480 244 T640 244 Q720 226 800 242 T960 240 T1120 244 T1280 244 L1280 268 Z"
                fill="#16110f"
              />
              {[42, 168, 286, 412, 548, 682, 808, 926, 1052, 1188].map((x) => (
                <g key={`tree-${x}`} transform={`translate(${x} 244)`}>
                  <polygon points="0,-24 -10,4 10,4" fill="#120e0d" />
                  <polygon points="0,-16 -12,12 12,12" fill="#120e0d" />
                  <rect x="-1.6" y="10" width="3.2" height="12" fill="#120e0d" />
                </g>
              ))}
              {[104, 264, 424, 584, 744, 904, 1064, 1224].map((x) => (
                <g key={`post-${x}`} transform={`translate(${x} 254)`}>
                  <rect x="-1.5" y="0" width="3" height="14" rx="1" fill="#3a2c24" />
                  <rect x="-1.5" y="2" width="3" height="3.2" fill="#f0be74" fillOpacity="0.82" />
                </g>
              ))}
            </g>

            {/* Gentle dawn breeze streamlines along the upper frame */}
            <g className="bh-scene-breeze-track" stroke="#f5d9ad" strokeLinecap="round" fill="none">
              <path d="M24 88 H116" strokeOpacity="0.2" strokeWidth="1.4" />
              <path d="M210 68 H282" strokeOpacity="0.16" strokeWidth="1.2" />
              <path d="M418 96 H526" strokeOpacity="0.22" strokeWidth="1.4" />
              <path d="M558 134 H620" strokeOpacity="0.14" strokeWidth="1.1" />
              <path d="M664 88 H756" strokeOpacity="0.2" strokeWidth="1.4" />
              <path d="M850 68 H922" strokeOpacity="0.16" strokeWidth="1.2" />
              <path d="M1058 96 H1166" strokeOpacity="0.22" strokeWidth="1.4" />
              <path d="M1198 134 H1260" strokeOpacity="0.14" strokeWidth="1.1" />
            </g>

            {/* Touring asphalt road deck */}
            <rect x="0" y="264" width="640" height="86" fill={`url(#${gRoad})`} />
            <line x1="0" y1="266" x2="640" y2="266" stroke="#d4a977" strokeOpacity="0.4" strokeWidth="1.6" />
            <line x1="0" y1="274" x2="640" y2="274" stroke="#9e7550" strokeOpacity="0.22" strokeWidth="1" />
            <line x1="0" y1="336" x2="640" y2="336" stroke="#d4a977" strokeOpacity="0.24" strokeWidth="1.4" />

            {/* Moving amber road centerline dashes (seamless 640px loop) */}
            <g className="bh-scene-road-track">
              {[18, 124, 230, 336, 442, 548, 658, 764, 870, 976, 1082, 1188].map((x) => (
                <rect
                  key={`dash-${x}`}
                  x={x}
                  y="302"
                  width="56"
                  height="3.4"
                  rx="1.7"
                  fill="#f0be74"
                  fillOpacity="0.68"
                />
              ))}
              {[58, 198, 358, 498, 698, 838, 998, 1138].map((x) => (
                <rect
                  key={`grain-${x}`}
                  x={x}
                  y="285"
                  width="34"
                  height="1.4"
                  rx="0.7"
                  fill="#d4a977"
                  fillOpacity="0.24"
                />
              ))}
              {[12, 168, 312, 472, 652, 808, 952, 1112].map((x) => (
                <rect
                  key={`grain2-${x}`}
                  x={x}
                  y="322"
                  width="42"
                  height="1.5"
                  rx="0.75"
                  fill="#d4a977"
                  fillOpacity="0.2"
                />
              ))}
            </g>

            {/* Grounded scooter shadow on road */}
            <ellipse cx="320" cy="296" rx="154" ry="15" fill={`url(#${gGroundPool})`} />
          </g>

          {/* PAUSE MODE: STILL PARKED SCENIC OVERLOOK & MOMENT-SPECIFIC DETAILS */}
          <g className="bh-scene-pause-layer">
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
              strokeOpacity={isViewStop ? '0.36' : '0.22'}
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

            {/* MOMENT ACCENT 1: MAGANDANG VIEW — TWO HELMETS + DISTANT VALLEY LIGHTS */}
            {isViewStop && (
              <g className="bh-scene-accent-view">
                {/* Distant twinkling valley town lights far below the ridge */}
                <g fill="#f6ca82">
                  <circle cx="446" cy="236" r="1.4" fillOpacity="0.72" />
                  <circle cx="458" cy="239" r="1.1" fillOpacity="0.58" />
                  <circle cx="472" cy="235" r="1.6" fillOpacity="0.8" />
                  <circle cx="484" cy="240" r="1.1" fillOpacity="0.62" />
                  <circle cx="496" cy="237" r="1.5" fillOpacity="0.74" />
                  <circle cx="510" cy="234" r="1.2" fillOpacity="0.66" />
                  <circle cx="522" cy="239" r="1.3" fillOpacity="0.6" />
                  <circle cx="176" cy="237" r="1.2" fillOpacity="0.54" />
                  <circle cx="190" cy="240" r="1.1" fillOpacity="0.48" />
                </g>

                {/* Wooden overlook viewing ledge + Two Helmets resting side-by-side */}
                <g transform="translate(126 226)">
                  <rect x="-8" y="21" width="76" height="5" rx="2.5" fill="#3a291f" stroke="#a67c53" strokeOpacity="0.45" strokeWidth="1" />
                  {/* Chico's helmet */}
                  <path
                    d="M2 21 C2 9.5 9.5 3.5 18 4.4 C24.5 5 29 10.5 28.4 21 Z"
                    fill="#2b201a"
                    stroke="#d9ae7c"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.5 10.5 H27.2 V16 H15.6 Z"
                    fill="#f3c57f"
                    fillOpacity="0.34"
                    stroke="#f3c57f"
                    strokeOpacity="0.65"
                    strokeWidth="1"
                  />
                  {/* Chica's helmet nestled beside it */}
                  <path
                    d="M32 21 C32 10.5 38.8 5 46.8 5.8 C52.8 6.4 57 11.4 56.4 21 Z"
                    fill="#2b201a"
                    stroke="#e3bc8c"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M43.8 11.4 H55.2 V16.4 H44.8 Z"
                    fill="#f3c57f"
                    fillOpacity="0.34"
                    stroke="#f3c57f"
                    strokeOpacity="0.65"
                    strokeWidth="1"
                  />
                </g>
              </g>
            )}

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
          </g>
        </svg>
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
