import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegaloPages.css';

export default function RegaloGardenPage() {
  const navigate = useNavigate();
  const sceneRef = useRef(null);
  const imgRef = useRef(null);
  const glowRef = useRef(null);
  const raf = useRef(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [gyro, setGyro] = useState(false);

  const onMove = useCallback((e) => {
    const el = sceneRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    target.current.x = ((e.clientX - cx) / (r.width / 2)) * 18;
    target.current.y = (-(e.clientY - cy) / (r.height / 2)) * 18;
    if (glowRef.current) {
      glowRef.current.style.left = ((e.clientX - r.left) / r.width * 100) + '%';
      glowRef.current.style.top = ((e.clientY - r.top) / r.height * 100) + '%';
    }
  }, []);

  useEffect(() => {
    document.title = "CHICAAAA'S LITTLE GARDEN";
    const timer = setTimeout(() => setReady(true), 300);

    let orientHandler = null;
    if (window.DeviceOrientationEvent) {
      orientHandler = (e) => {
        if (e.gamma == null || e.beta == null) return;
        setGyro(true);
        target.current.x = Math.max(-18, Math.min(18, e.gamma * 0.6));
        target.current.y = Math.max(-18, Math.min(18, (e.beta - 45) * 0.4));
      };
      window.addEventListener('deviceorientation', orientHandler);
    }

    function loop() {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      if (imgRef.current) {
        imgRef.current.style.transform =
          `perspective(800px) rotateY(${current.current.x}deg) rotateX(${current.current.y}deg) scale3d(1.05,1.05,1.05)`;
      }
      raf.current = requestAnimationFrame(loop);
    }
    raf.current = requestAnimationFrame(loop);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf.current);
      if (orientHandler) window.removeEventListener('deviceorientation', orientHandler);
    };
  }, []);

  return (
    <div className="regalo-page garden-page">
      <nav className="regalo-nav">
        <button type="button" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          LIBRARY
        </button>
      </nav>

      <header className="regalo-header">
        <p className="regalo-eye">REGALO NI CHICO</p>
        <h1>Chicaaaa&rsquo;s Little Garden</h1>
        <p className="regalo-sub">I-hover mo o i-tilt ang phone mo para tumingin sa paligid ng hardin.</p>
      </header>

      <div
        className={`garden-scene ${ready ? 'ready' : ''}`}
        ref={sceneRef}
        onMouseMove={onMove}
        onMouseLeave={() => { target.current.x = 0; target.current.y = 0; }}
      >
        <div className="garden-depth">
          <img
            ref={imgRef}
            className="garden-img"
            src="/menu/img/garden.png"
            alt="Chicaaaa's Little Garden — miniature garden sa loob ng glass dome"
            width="800"
            height="800"
            draggable="false"
          />
          <div className="garden-glow" ref={glowRef} />
          <div className="garden-particles" aria-hidden="true">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="gp"
                style={{
                  '--dx': `${(Math.random() - 0.5) * 60}px`,
                  '--dy': `${-Math.random() * 80 - 20}px`,
                  '--d': `${Math.random() * 4 + 3}s`,
                  '--delay': `${Math.random() * 5}s`,
                  '--x': `${Math.random() * 100}%`,
                  '--y': `${60 + Math.random() * 30}%`,
                  '--sz': `${Math.random() * 3 + 2}px`,
                }}
              />
            ))}
          </div>
        </div>
        <p className="garden-hint">
          {gyro ? 'I-TILT ANG PHONE MO' : 'I-HOVER ANG MOUSE MO SA GARDEN'}
        </p>
      </div>

      <div className="regalo-letter">
        <p className="letter-to">To my Asawaaaa Koooo,</p>
        <p>If I could plant every beautiful feeling you&rsquo;ve brought into my life, I would give you a garden that blooms endlessly.</p>
        <p>Every flower would carry a little reminder of how precious you are to me, and every new blossom would represent another beautiful memory I hope to share with you.</p>
        <p>This little garden is yours, Chicaaa Koooo. Not because flowers last forever, but because I want to keep nurturing the love they represent, with patience, tenderness, and care.</p>
        <p className="letter-sign">Lovingly planted,<br />Your Chicooo &hearts;</p>
      </div>

      <footer className="regalo-footer">
        <p>FOR MY CHICAAAA &mdash; A LITTLE GARDEN, A LOVE STILL BLOOMING.</p>
      </footer>
    </div>
  );
}
