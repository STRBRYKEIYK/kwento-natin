import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegaloPages.css';

export default function RegaloGardenPage() {
  const [zoomed, setZoomed] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const imgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "CHICAAAA'S LITTLE GARDEN";
    const timer = setTimeout(() => setSparkle(true), 600);
    return () => clearTimeout(timer);
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
        <h1>Chicaaaa's Little Garden</h1>
        <p className="regalo-sub">Para sa asawa kong mahal ko — isang hardin na hindi malalanta.</p>
      </header>

      <div className={`regalo-showcase ${zoomed ? 'zoomed' : ''} ${sparkle ? 'sparkle' : ''}`}>
        <button
          type="button"
          className="regalo-img-btn"
          onClick={() => setZoomed(z => !z)}
          aria-label={zoomed ? 'I-close ang zoom' : 'I-zoom ang litrato'}
        >
          <img
            ref={imgRef}
            src="/menu/img/garden.png"
            alt="Chicaaaa's Little Garden — isang miniature garden sa loob ng glass dome, may mga bulaklak, lantern, at love letter"
            width="800"
            height="800"
            draggable="false"
          />
          {sparkle && (
            <div className="sparkles" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="spark" style={{ '--d': `${Math.random() * 3 + 1}s`, '--x': `${Math.random() * 100}%`, '--y': `${Math.random() * 100}%`, '--s': `${Math.random() * 0.6 + 0.4}` }} />
              ))}
            </div>
          )}
        </button>
      </div>

      <div className="regalo-letter">
        <p className="letter-to">To my Asawaaaa Koooo,</p>
        <p>If I could plant every beautiful feeling you've brought into my life, I would give you a garden that blooms endlessly.</p>
        <p>Every flower would carry a little reminder of how precious you are to me, and every new blossom would represent another beautiful memory I hope to share with you.</p>
        <p>This little garden is yours, Chicaaa Koooo. Not because flowers last forever, but because I want to keep nurturing the love they represent, with patience, tenderness, and care.</p>
        <p className="letter-sign">Lovingly planted,<br />Your Chicooo &hearts;</p>
      </div>

      <footer className="regalo-footer">
        <p>FOR MY CHICAAAA — A LITTLE GARDEN, A LOVE STILL BLOOMING.</p>
      </footer>
    </div>
  );
}
