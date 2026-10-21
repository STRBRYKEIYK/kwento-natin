import { useEffect, useRef, useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { formatTime, tracks } from '../data/content';
import { Icon } from './Icon';

export function MusicPlayer({ soundtrack }) {
  const [open, setOpen] = useState(false);
  const playerRef = useRef(null);
  const toggleRef = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const outside = event => { if (!playerRef.current.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') { setOpen(false); toggleRef.current.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <m.aside className="music-player" ref={playerRef} aria-label="Mga kantang kinanta ni Chico"
    initial={reduced ? false : { opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .45 }}>
    <m.div className="playlist" id="playlist" inert={!open} aria-hidden={!open} initial={false}
      animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: reduced ? 0 : .25 }}>
      <div className="playlist-scroll">
        <div className="playlist-heading"><strong>Mga kanta para sa ’yo</strong><button className="follow-button" type="button" aria-pressed={soundtrack.follow} onClick={soundtrack.toggleFollow}>Sabay sa kwento: {soundtrack.follow ? 'On' : 'Off'}</button></div>
        <p>Kusang papalit ang kanta sa bawat kabanata kapag naka-on. Pumili ng kanta para manatili rito.</p>
        <ol>{tracks.map((track, i) => <li key={track.key}><button type="button" aria-current={soundtrack.index === i ? 'true' : undefined}
          onClick={() => { soundtrack.select(i, { manual: true }); setOpen(false); toggleRef.current.focus(); }}>
          <span aria-hidden="true">{soundtrack.index === i ? '♡' : String(i + 1).padStart(2, '0')}</span><strong>{track.title}</strong><small>{track.chapter}</small>
        </button></li>)}</ol>
      </div>
    </m.div>
    {soundtrack.error && <p className="audio-error" role="status">{soundtrack.error}</p>}
    <label className="seek"><span className="sr-only">Posisyon ng kanta</span><input type="range" min="0" max={soundtrack.duration || 1} step="1" value={Math.min(soundtrack.time, soundtrack.duration || 1)} disabled={!soundtrack.duration}
      aria-valuetext={`${formatTime(soundtrack.time)} sa ${formatTime(soundtrack.duration)}`} onChange={event => soundtrack.seek(Number(event.target.value))} /></label>
    <div className="player-row">
      <div className="now-playing"><small>Kinakanta ni Chico</small><strong>{soundtrack.track.title}</strong><time>{formatTime(soundtrack.time)} / {formatTime(soundtrack.duration)}</time></div>
      <div className="playback-controls">
        <button className="icon-button" type="button" aria-label="Nakaraang kanta" onClick={soundtrack.previous}><Icon name="previous" size={18} /></button>
        <button className="icon-button play-button" type="button" aria-label={soundtrack.playing ? 'I-pause ang kanta' : 'I-play ang kanta'} aria-busy={soundtrack.loading} onClick={soundtrack.toggle}>
          <Icon name={soundtrack.playing ? 'pause' : 'play'} size={21} />
        </button>
        <button className="icon-button" type="button" aria-label="Susunod na kanta" onClick={soundtrack.next}><Icon name="next" size={18} /></button>
        <button className={`icon-button ${open ? 'is-active' : ''}`} ref={toggleRef} type="button" aria-label="Listahan ng kanta" aria-controls="playlist" aria-expanded={open} onClick={() => setOpen(value => !value)}><Icon name="list" /></button>
      </div>
    </div>
  </m.aside>;
}
