import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { PhotoAlbumContext } from './components/PhotoAlbum';
import { Cover } from './components/Cover';
import { Header } from './components/Header';
import { MusicPlayer } from './components/MusicPlayer';
import { PhotoViewer } from './components/PhotoViewer';
import { Story } from './components/Story';
import { photos, sections, tracks } from './data/content';
import { usePersistentState } from './hooks/usePersistentState';
import { useReading } from './hooks/useReading';
import { useSoundtrack } from './hooks/useSoundtrack';
import { useTheme } from './hooks/useTheme';

const validSection = value => sections.some(section => section.id === value);
const validColors = value => Array.isArray(value) && value.every(src => photos.some(photo => photo.src === src));

export default function App() {
  const [reading, setReading] = useState(false);
  const [phase, setPhase] = useState('closed');
  const [destination, setDestination] = useState(null);
  const [resumeId, setResumeId] = usePersistentState('kwento-reading', 'sec-intro', validSection);
  const [colorPaths, setColorPaths] = usePersistentState('kwento-colors', [], validColors);
  const [photoIndex, setPhotoIndex] = useState(null);
  const storyRef = useRef(null);
  const originRef = useRef(null);
  const openingTarget = useRef('sec-intro');
  const opening = useRef(false);
  const reduced = useReducedMotion();
  const { dark, toggleTheme } = useTheme();
  const soundtrack = useSoundtrack();
  const colored = useMemo(() => new Set(colorPaths), [colorPaths]);

  const jump = useCallback(id => {
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - (document.querySelector('.topbar')?.offsetHeight || 0) - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
    if (id !== 'cover') target.focus({ preventScroll: true });
  }, [reduced]);

  const onSection = useCallback(section => {
    setResumeId(section.id);
    soundtrack.followChapter(section.track);
  }, [setResumeId, soundtrack.followChapter]);
  const activeId = useReading(reading, onSection);

  const finishOpening = useCallback(() => {
    opening.current = false;
    setPhase('open');
    setReading(true);
    setDestination({ id: openingTarget.current });
  }, []);

  const openLetter = useCallback((quiet, target = 'sec-intro') => {
    if (opening.current) return;
    openingTarget.current = target;
    const section = sections.find(item => item.id === target) || sections[0];
    soundtrack.select(tracks.findIndex(track => track.key === section.track), { shouldPlay: !quiet });
    if (phase === 'closed' && !reduced) { opening.current = true; setPhase('opening'); }
    else finishOpening();
  }, [finishOpening, phase, reduced, soundtrack.select]);

  useEffect(() => {
    if (!reading || !destination) return;
    const frame = requestAnimationFrame(() => { jump(destination.id); setDestination(null); });
    return () => cancelAnimationFrame(frame);
  }, [destination, jump, reading]);

  const togglePhoto = useCallback(src => setColorPaths(current => current.includes(src) ? current.filter(path => path !== src) : [...current, src]), [setColorPaths]);
  const openPhoto = useCallback((id, button) => {
    const index = photos.findIndex(photo => photo.id === id);
    originRef.current = button;
    setColorPaths(current => current.includes(photos[index].src) ? current : [...current, photos[index].src]);
    setPhotoIndex(index);
  }, [setColorPaths]);
  const closePhoto = useCallback(() => setPhotoIndex(null), []);
  const stepPhoto = useCallback(direction => {
    if (photoIndex === null) return;
    const index = (photoIndex + direction + photos.length) % photos.length;
    setColorPaths(current => current.includes(photos[index].src) ? current : [...current, photos[index].src]);
    setPhotoIndex(index);
  }, [photoIndex, setColorPaths]);
  const album = useMemo(() => ({ colored, onToggle: togglePhoto, onZoom: openPhoto }), [colored, openPhoto, togglePhoto]);

  return <PhotoAlbumContext.Provider value={album}>
    <Header reading={reading} activeId={activeId} onJump={jump} dark={dark} onTheme={toggleTheme}
      coloredCount={colored.size} total={photos.length} onColorAll={() => setColorPaths(colored.size === photos.length ? [] : photos.map(photo => photo.src))} storyRef={storyRef} />
    <Cover phase={phase} onOpen={openLetter} onOpened={finishOpening} resumeId={resumeId} />
    {reading && <Story storyRef={storyRef} onJump={jump} soundtrack={soundtrack} />}
    {reading && <MusicPlayer soundtrack={soundtrack} />}
    <PhotoViewer index={photoIndex} onClose={closePhoto} onStep={stepPhoto} originRef={originRef} />
  </PhotoAlbumContext.Provider>;
}
