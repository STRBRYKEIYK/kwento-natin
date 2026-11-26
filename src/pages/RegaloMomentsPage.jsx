import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegaloPages.css';

export default function RegaloMomentsPage() {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const raf = useRef(0);
  const tiltTarget = useRef({ x: 0, y: 0 });
  const tiltCur = useRef({ x: 0, y: 0 });

  const onMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el || flipped) return;
    const r = el.getBoundingClientRect();
    tiltTarget.current.x = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 6;
    tiltTarget.current.y = (-(e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 6;
  }, [flipped]);

  useEffect(() => {
    document.title = 'BEAUTIFUL MOMENTS — PARA KAY CHICAAA';

    function loop() {
      tiltCur.current.x += (tiltTarget.current.x - tiltCur.current.x) * 0.1;
      tiltCur.current.y += (tiltTarget.current.y - tiltCur.current.y) * 0.1;
      setTilt({ x: tiltCur.current.x, y: tiltCur.current.y });
      raf.current = requestAnimationFrame(loop);
    }
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div className="regalo-page moments-page">
      <nav className="regalo-nav">
        <button type="button" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          LIBRARY
        </button>
      </nav>

      <header className="regalo-header">
        <p className="regalo-eye">REGALO NI CHICO</p>
        <h1>Beautiful Moments</h1>
        <p className="regalo-sub">I-flip ang polaroid para makita ang mensahe sa likod.</p>
      </header>

      <div className="moments-stage">
        <button
          ref={cardRef}
          type="button"
          className={`moments-card ${flipped ? 'flipped' : ''}`}
          onClick={() => { setFlipped(f => !f); tiltTarget.current = { x: 0, y: 0 }; }}
          onMouseMove={onMove}
          onMouseLeave={() => { tiltTarget.current = { x: 0, y: 0 }; }}
          style={!flipped ? {
            transform: `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          } : undefined}
          aria-label={flipped ? 'I-flip pabalik sa litrato' : 'I-flip para makita ang mensahe'}
        >
          <div className="mc-front">
            <div className="polaroid-frame">
              <img
                src="/menu/img/moments.png"
                alt="Polaroid namin ni Chica"
                width="800"
                height="800"
                draggable="false"
              />
            </div>
          </div>
          <div className="mc-back">
            <div className="mc-back-inner">
              <div className="mc-tape" aria-hidden="true" />
              <p className="mc-hw mc-hw-to">Para sa Chicaaa ko,</p>
              <p className="mc-hw">Ikaw ang babae na ginawang espesyal ang bawat ordinaryong sandali.</p>
              <p className="mc-hw">Hindi ko kailangan ng malaking okasyon para maging masaya &mdash; kailangan ko lang na kasama ka.</p>
              <p className="mc-hw">Salamat sa bawat tawa, bawat tingin, bawat sandaling pinili mong kasama ako.</p>
              <p className="mc-hw mc-hw-sign">Mahal na mahal kita,<br/>Your Chicooo &hearts;</p>
              <div className="mc-doodles" aria-hidden="true">
                <svg viewBox="0 0 60 60"><path d="M30 52l-2.5-2.3C15.5 38.4 8 31.6 8 23.5 8 17 13 12 19.5 12c3.6 0 7 1.7 9.2 4.3L30 18l1.3-1.7C33.5 13.7 36.9 12 40.5 12 47 12 52 17 52 23.5c0 8.1-7.5 14.9-19.5 26.3L30 52z" /></svg>
              </div>
            </div>
          </div>
        </button>
        <p className="flip-hint">{flipped ? 'I-TAP PARA BUMALIK SA LITRATO' : 'I-TAP ANG POLAROID PARA I-FLIP'}</p>
      </div>

      <footer className="regalo-footer">
        <p>PARA KAY CHICAAA &mdash; BAWAT SANDALI AY ESPESYAL KASAMA KA.</p>
      </footer>
    </div>
  );
}
