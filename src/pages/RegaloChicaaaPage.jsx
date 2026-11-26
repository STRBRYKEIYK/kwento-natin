import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegaloPages.css';

function Heart({ style }) {
  return (
    <span className="confetti-heart" style={style}>
      <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
    </span>
  );
}

export default function RegaloChicaaaPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [voucherFlipped, setVoucherFlipped] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [shakeVoucher, setShakeVoucher] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    document.title = 'PARA KAY CHICAAA — CARD & VOUCHER';
  }, []);

  const spawnHearts = useCallback(() => {
    const batch = Array.from({ length: 25 }).map(() => ({
      id: nextId.current++,
      x: Math.random() * 100,
      size: Math.random() * 18 + 10,
      dur: Math.random() * 1.5 + 1.5,
      delay: Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 80,
      color: ['#c9a84c', '#e8d48b', '#ff6b8a', '#ff4466', '#ffb3c1'][Math.floor(Math.random() * 5)],
    }));
    setHearts(prev => [...prev, ...batch]);
    setTimeout(() => setHearts(prev => prev.filter(h => !batch.find(b => b.id === h.id))), 3500);
  }, []);

  const handleRedeem = () => {
    if (redeemed) {
      spawnHearts();
      return;
    }
    setShakeVoucher(true);
    setTimeout(() => setShakeVoucher(false), 600);
    setTimeout(() => {
      setRedeemed(true);
      spawnHearts();
      try { navigator.vibrate?.([50, 30, 50, 30, 100]); } catch {}
    }, 300);
  };

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
        <p className="regalo-sub">Isang card at isang voucher &mdash; para sa pinakaespesyal na tao sa buhay ko.</p>
      </header>

      <div className="chicaaa-tabs">
        <button
          type="button"
          className={active === 0 ? 'active' : ''}
          onClick={() => setActive(0)}
        >
          LOVE CARD
        </button>
        <button
          type="button"
          className={active === 1 ? 'active' : ''}
          onClick={() => setActive(1)}
        >
          LOVE VOUCHER
        </button>
      </div>

      {/* CARD */}
      <div className={`chicaaa-panel ${active === 0 ? 'show' : 'hide'}`}>
        <div className="chicaaa-stage">
          <button
            type="button"
            className={`flip3d ${cardFlipped ? 'flipped' : ''}`}
            onClick={() => setCardFlipped(f => !f)}
            aria-label={cardFlipped ? 'I-flip pabalik ang card' : 'I-flip ang card'}
          >
            <div className="flip3d-front">
              <img
                src="/menu/img/chicaaa-card.png"
                alt="For My Chicaaa — love card"
                width="800"
                height="800"
                draggable="false"
              />
            </div>
            <div className="flip3d-back card-back-styled">
              <div className="cbs-inner">
                <div className="cbs-border" />
                <p className="cbs-for">For My Chicaaa</p>
                <div className="cbs-divider"><span /><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg><span /></div>
                <p className="cbs-msg">You make the ordinary moments feel special.</p>
                <p className="cbs-msg">Thank you for being in my heart, my thoughts, and my favorite memories.</p>
                <p className="cbs-sign">Love, your Chicooo &hearts;</p>
              </div>
            </div>
          </button>
          <p className="flip-hint">{cardFlipped ? 'I-TAP PARA BUMALIK' : 'I-TAP ANG CARD PARA I-FLIP'}</p>
        </div>
      </div>

      {/* VOUCHER */}
      <div className={`chicaaa-panel ${active === 1 ? 'show' : 'hide'}`}>
        <div className="chicaaa-stage">
          <div className={`voucher-container ${shakeVoucher ? 'shake' : ''}`}>
            <button
              type="button"
              className={`flip3d voucher-aspect ${voucherFlipped ? 'flipped' : ''}`}
              onClick={() => setVoucherFlipped(f => !f)}
              aria-label={voucherFlipped ? 'I-flip pabalik ang voucher' : 'I-flip ang voucher'}
            >
              <div className="flip3d-front">
                <img
                  src="/menu/img/love-voucher.png"
                  alt="Special Love Voucher For My Chicaaa — Unlimited"
                  width="800"
                  height="533"
                  draggable="false"
                />
              </div>
              <div className="flip3d-back voucher-back-styled">
                <div className="vbs-inner">
                  <p className="vbs-title">REDEEMABLE FOR</p>
                  <ul className="vbs-list">
                    <li><span className="vbs-check">&#10003;</span> Endless sweet dates</li>
                    <li><span className="vbs-check">&#10003;</span> Warm hugs anytime</li>
                    <li><span className="vbs-check">&#10003;</span> Forehead kisses</li>
                    <li><span className="vbs-check">&#10003;</span> All the lambing your Chicooo can give</li>
                  </ul>
                  <p className="vbs-fine">NO EXPIRATION &middot; UNLIMITED USES</p>
                  <p className="vbs-sign">With all my love &hearts;</p>
                </div>
              </div>
            </button>
            <p className="flip-hint">{voucherFlipped ? 'I-TAP PARA BUMALIK' : 'I-TAP ANG VOUCHER PARA I-FLIP'}</p>
          </div>

          <button
            type="button"
            className={`redeem-btn ${redeemed ? 'redeemed' : ''}`}
            onClick={handleRedeem}
          >
            {redeemed ? 'REDEEMED ❤ I-TAP ULIT PARA SA IBA PANG LAMBING' : 'I-REDEEM ANG VOUCHER'}
          </button>

          {hearts.length > 0 && (
            <div className="confetti-layer" aria-hidden="true">
              {hearts.map(h => (
                <Heart
                  key={h.id}
                  style={{
                    '--hx': h.x + '%',
                    '--hs': h.size + 'px',
                    '--hd': h.dur + 's',
                    '--hdelay': h.delay + 's',
                    '--hdrift': h.drift + 'px',
                    '--hcolor': h.color,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="regalo-footer">
        <p>FOR MY CHICAAA &mdash; WITH ALL MY LOVE, YOUR CHICOOO.</p>
      </footer>
    </div>
  );
}
