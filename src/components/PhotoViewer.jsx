import { useEffect, useRef } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { assetUrl, photos } from '../data/content';
import { Icon } from './Icon';

export function PhotoViewer({ index, onClose, onStep, originRef }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const swipe = useRef(null);
  const suppressClick = useRef(false);
  const reduced = useReducedMotion();
  const photo = index === null ? null : photos[index];
  useEffect(() => {
    const dialog = dialogRef.current;
    if (index !== null && !dialog.open) {
      dialog.showModal();
      document.body.classList.add('modal-open');
      closeRef.current.focus();
    } else if (index === null) {
      if (dialog.open) dialog.close();
      document.body.classList.remove('modal-open');
      originRef.current?.focus({ preventScroll: true });
    }
  }, [index, originRef]);
  useEffect(() => () => { document.body.classList.remove('modal-open'); }, []);
  return <dialog ref={dialogRef} className="photo-viewer" aria-label="Buong larawan" aria-describedby="photo-caption"
    onCancel={event => { event.preventDefault(); onClose(); }} onClose={onClose}
    onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); onStep(event.key === 'ArrowLeft' ? -1 : 1); }
    }}
    onPointerDown={event => {
      suppressClick.current = false;
      swipe.current = event.isPrimary && event.pointerType === 'touch' && !event.target.closest('button') ? { x: event.clientX, y: event.clientY } : null;
    }}
    onPointerUp={event => {
      if (!swipe.current) return;
      const dx = event.clientX - swipe.current.x, dy = event.clientY - swipe.current.y;
      swipe.current = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { suppressClick.current = true; onStep(dx < 0 ? 1 : -1); }
    }} onPointerCancel={() => { swipe.current = null; }}
    onClick={event => { if (event.target === dialogRef.current && !suppressClick.current) onClose(); }}>
    <div className="viewer-top"><span>Mga alaalang atin ♡</span><button ref={closeRef} className="icon-button" type="button" aria-label="Isara ang larawan" onClick={onClose}><Icon name="close" /></button></div>
    <div className="viewer-stage"><AnimatePresence initial={false} mode="wait">
      {photo && <m.figure key={photo.id} initial={{ opacity: 0, x: reduced ? 0 : 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : -16 }} transition={{ duration: reduced ? 0 : .18 }}>
        <img src={assetUrl(photo.src)} alt={photo.alt} /><figcaption id="photo-caption">{photo.caption}</figcaption>
      </m.figure>}
    </AnimatePresence></div>
    <div className="viewer-controls"><button className="icon-button" type="button" aria-label="Nakaraang larawan" onClick={() => onStep(-1)}><Icon name="left" /></button>
      <span aria-live="polite">{photo ? `${index + 1} / ${photos.length}` : ''}</span>
      <button className="icon-button" type="button" aria-label="Susunod na larawan" onClick={() => onStep(1)}><Icon name="right" /></button>
    </div>
  </dialog>;
}
