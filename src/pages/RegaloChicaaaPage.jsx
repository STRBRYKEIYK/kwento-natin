import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegaloPages.css';

export default function RegaloChicaaaPage() {
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'PARA KAY CHICAAA — CARD & VOUCHER';
  }, []);

  return (
    <div className="regalo-page chicaaa-page">
      <nav className="regalo-nav">
        <button type="button" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          LIBRARY
        </button>
      </nav>

      <header className="regalo-header">
        <p className="regalo-eye">REGALO NI CHICO</p>
        <h1>Para Kay Chicaaa</h1>
        <p className="regalo-sub">Isang card at isang voucher — unlimited love mula kay Chicooo mo.</p>
      </header>

      <div className="chicaaa-tabs">
        <button
          type="button"
          className={active === 0 ? 'active' : ''}
          onClick={() => { setActive(0); setFlipped(false); }}
        >
          LOVE CARD
        </button>
        <button
          type="button"
          className={active === 1 ? 'active' : ''}
          onClick={() => { setActive(1); setFlipped(false); }}
        >
          LOVE VOUCHER
        </button>
      </div>

      <div className="chicaaa-cards">
        <div className={`chicaaa-card-wrap ${active === 0 ? 'show' : 'hide'}`}>
          <button
            type="button"
            className={`card-flipper ${flipped && active === 0 ? 'flipped' : ''}`}
            onClick={() => setFlipped(f => !f)}
            aria-label={flipped ? 'I-flip pabalik' : 'I-flip ang card'}
          >
            <div className="card-front">
              <img
                src="/menu/img/chicaaa-card.png"
                alt="For My Chicaaa — love card with roses and gold text"
                width="800"
                height="800"
                draggable="false"
              />
            </div>
            <div className="card-back">
              <div className="card-back-content">
                <p className="cb-to">For My Chicaaa,</p>
                <p>You make the ordinary moments feel special.</p>
                <p>Thank you for being in my heart, my thoughts, and my favorite memories.</p>
                <p className="cb-sign">Love, your Chicooo &hearts;</p>
              </div>
            </div>
          </button>
          <p className="flip-hint">{flipped && active === 0 ? 'I-TAP PARA BUMALIK' : 'I-TAP PARA I-FLIP'}</p>
        </div>

        <div className={`chicaaa-card-wrap ${active === 1 ? 'show' : 'hide'}`}>
          <button
            type="button"
            className={`card-flipper voucher-flipper ${flipped && active === 1 ? 'flipped' : ''}`}
            onClick={() => setFlipped(f => !f)}
            aria-label={flipped ? 'I-flip pabalik' : 'I-flip ang voucher'}
          >
            <div className="card-front">
              <img
                src="/menu/img/love-voucher.png"
                alt="Special Love Voucher For My Chicaaa — Unlimited"
                width="800"
                height="533"
                draggable="false"
              />
            </div>
            <div className="card-back voucher-back">
              <div className="card-back-content">
                <p className="cb-title">REDEEMABLE FOR:</p>
                <ul className="voucher-list">
                  <li>Endless sweet dates</li>
                  <li>Warm hugs</li>
                  <li>Forehead kisses</li>
                  <li>All the lambing your Chicooo can give</li>
                </ul>
                <p className="cb-sign">With all my love &hearts;</p>
                <p className="cb-fine">NO EXPIRATION &middot; UNLIMITED USES</p>
              </div>
            </div>
          </button>
          <p className="flip-hint">{flipped && active === 1 ? 'I-TAP PARA BUMALIK' : 'I-TAP PARA I-FLIP'}</p>
        </div>
      </div>

      <footer className="regalo-footer">
        <p>FOR MY CHICAAA &mdash; WITH ALL MY LOVE, YOUR CHICOOO.</p>
      </footer>
    </div>
  );
}
