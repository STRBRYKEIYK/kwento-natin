import { useEffect, useState } from 'react';
import { sections } from '../data/content';

export function useReading(enabled, onSection) {
  const [activeId, setActiveId] = useState('sec-intro');
  useEffect(() => {
    if (!enabled) return;
    let frame = null;
    let previous = null;
    const update = () => {
      frame = null;
      const first = document.getElementById('sec-intro');
      if (!first || first.getBoundingClientRect().top > window.innerHeight * .6) return;
      const marker = Math.max(window.innerHeight * .35, document.querySelector('.topbar').offsetHeight + 16);
      let current = sections[0];
      for (const section of sections) {
        if (document.getElementById(section.id)?.getBoundingClientRect().top <= marker) current = section;
      }
      if (current.id !== previous) {
        previous = current.id;
        setActiveId(current.id);
        onSection(current);
      }
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [enabled, onSection]);
  return activeId;
}
