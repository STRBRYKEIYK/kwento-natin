import { useEffect, useRef } from 'react';
import { m, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { sections } from '../data/content';
import { Icon } from './Icon';

function ReadingProgress({ storyRef }) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 30 });
  return <m.div className="reading-progress" style={{ scaleX: reduced ? scrollYProgress : smooth }} aria-hidden="true" />;
}

export function Header({ reading, activeId, onJump, dark, onTheme, coloredCount, total, onColorAll, storyRef }) {
  const headerRef = useRef(null);
  const navigationRef = useRef(null);
  useEffect(() => {
    const measure = () => document.documentElement.style.setProperty('--header-height', `${headerRef.current.offsetHeight}px`);
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(headerRef.current);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [reading]);
  useEffect(() => {
    const nav = navigationRef.current;
    const active = nav?.querySelector('[aria-current="location"]');
    if (active) nav.scrollTo({ left: active.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + active.offsetWidth / 2, behavior: 'auto' });
  }, [activeId, reading]);
  const allColored = coloredCount === total;
  return <div className="topbar" ref={headerRef}>
    <button className="brand" type="button" onClick={() => onJump('cover')} aria-label="Bumalik sa pabalat">
      Kwento <em>Natin.</em><span>{reading ? 'Isang liham para sa ’yo ♡' : 'Mula kay Chico, para kay Chica ♡'}</span>
    </button>
    {reading && <nav className="chapter-nav" aria-label="Mga kabanata" ref={navigationRef}>
      {sections.slice(0, -1).map(section => <button key={section.id} type="button" aria-current={(activeId === section.id || (activeId === 'sec-finale' && section.id === 'sec-11')) ? 'location' : undefined}
        onClick={() => onJump(section.id)}>{section.label}</button>)}
    </nav>}
    <div className="header-actions">
      {reading && <button className={`color-all ${allColored ? 'is-complete' : ''}`} type="button" onClick={onColorAll} aria-pressed={allColored}
        aria-label={`${allColored ? 'Ibalik sa black and white' : 'Kulayan'} ang lahat ng litrato (${coloredCount} sa ${total})`}>
        <Icon name="heart" size={15} /><span>{coloredCount}/{total}</span>
      </button>}
      <button className="icon-button theme-button" type="button" onClick={onTheme} aria-label={dark ? 'Gamitin ang light theme' : 'Gamitin ang dark theme'}><Icon name={dark ? 'sun' : 'moon'} size={19} /></button>
    </div>
    {reading && <ReadingProgress storyRef={storyRef} />}
  </div>;
}
