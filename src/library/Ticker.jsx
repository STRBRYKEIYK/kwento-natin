import { useRef, useEffect } from 'react';

export function Ticker({ items }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.innerHTML = track.innerHTML + track.innerHTML;
  }, []);

  return (
    <div className="ticker" aria-hidden="true">
      <div className="track" ref={trackRef}>
        {items.map((item, i) => (
          <span key={i} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </div>
    </div>
  );
}
