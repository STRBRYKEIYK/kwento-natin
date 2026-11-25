import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegaloPages.css';

export default function RegaloMomentsPage() {
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'BEAUTIFUL MOMENTS — PARA KAY CHICAAA';
    const timer = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(timer);
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
        <p className="regalo-sub">Bawat sandali mo, naging alaala ko.</p>
      </header>

      <div className={`regalo-showcase polaroid-wrap ${revealed ? 'revealed' : ''}`}>
        <div className="polaroid">
          <div className="polaroid-inner">
            <img
              src="/menu/img/moments.png"
              alt="Polaroid photo — The Woman Who Turned Little Moments into Beautiful Memories"
              width="800"
              height="800"
              draggable="false"
            />
          </div>
        </div>
      </div>

      <div className="regalo-quote">
        <blockquote>
          &ldquo;The Woman Who Turned Little Moments into Beautiful Memories.&rdquo;
        </blockquote>
        <p className="quote-attr">&mdash; Your Chicooo, about his Chicaaa</p>
      </div>

      <footer className="regalo-footer">
        <p>PARA KAY CHICAAA &mdash; BAWAT SANDALI AY ESPESYAL KASAMA KA.</p>
      </footer>
    </div>
  );
}
