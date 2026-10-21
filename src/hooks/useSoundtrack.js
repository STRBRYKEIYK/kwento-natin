import { useCallback, useEffect, useRef, useState } from 'react';
import { assetUrl, tracks } from '../data/content';

export function useSoundtrack() {
  const [audio] = useState(() => {
    const element = new Audio();
    element.preload = 'metadata';
    return element;
  });
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [follow, setFollowState] = useState(true);
  const current = useRef(-1);
  const wantsPlay = useRef(false);
  const followRef = useRef(true);
  const chapterTrack = useRef('palagi');
  const request = useRef(0);

  const setFollow = useCallback(value => {
    followRef.current = value;
    setFollowState(value);
  }, []);

  const play = useCallback(() => {
    const generation = ++request.current;
    wantsPlay.current = true;
    setError('');
    setLoading(true);
    if (audio.error) audio.load();
    audio.play().then(() => {
      if (generation === request.current) setLoading(false);
    }).catch(reason => {
      if (generation !== request.current || reason.name === 'AbortError') return;
      setLoading(false);
      setPlaying(false);
      setError(reason.name === 'NotAllowedError'
        ? 'Pindutin ang play para simulan ang kanta.'
        : 'Hindi ma-play ang kanta. Subukang muli o pumili ng ibang kanta.');
    });
  }, [audio]);

  const pause = useCallback(() => {
    ++request.current;
    wantsPlay.current = false;
    audio.pause();
    setPlaying(false);
    setLoading(false);
  }, [audio]);

  const select = useCallback((nextIndex, { shouldPlay = true, manual = false } = {}) => {
    const normalized = (nextIndex + tracks.length) % tracks.length;
    if (manual) setFollow(false);
    wantsPlay.current = shouldPlay;
    if (current.current !== normalized) {
      ++request.current;
      audio.pause();
      current.current = normalized;
      setIndex(normalized);
      setTime(0);
      setDuration(0);
      setError('');
      const key = tracks[normalized].key;
      audio.src = window.KWENTO_AUDIO?.[key] || assetUrl(`assets/audio/${key}.mp3`);
    }
    if (shouldPlay) play();
    else pause();
  }, [audio, pause, play, setFollow]);

  const followChapter = useCallback(key => {
    chapterTrack.current = key;
    const nextIndex = tracks.findIndex(track => track.key === key);
    if (followRef.current && nextIndex >= 0 && current.current !== nextIndex) {
      select(nextIndex, { shouldPlay: wantsPlay.current });
    }
  }, [select]);

  const toggleFollow = useCallback(() => {
    const enabled = !followRef.current;
    setFollow(enabled);
    if (enabled) followChapter(chapterTrack.current);
  }, [followChapter, setFollow]);

  const next = useCallback(() => select(current.current + 1, { manual: true }), [select]);
  const previous = useCallback(() => {
    setFollow(false);
    if (audio.currentTime > 4) {
      audio.currentTime = 0;
      setTime(0);
    } else select(current.current - 1, { manual: true });
  }, [audio, select, setFollow]);
  const toggle = useCallback(() => {
    if (!audio.paused) pause();
    else if (current.current < 0) select(0);
    else play();
  }, [audio, pause, play, select]);
  const seek = useCallback(seconds => {
    if (!Number.isFinite(seconds) || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, seconds));
    setTime(audio.currentTime);
  }, [audio]);

  useEffect(() => {
    const events = {
      play: () => { setPlaying(true); setLoading(false); },
      pause: () => setPlaying(false),
      waiting: () => setLoading(true),
      canplay: () => setLoading(false),
      timeupdate: () => setTime(audio.currentTime || 0),
      loadedmetadata: () => {
        setTime(audio.currentTime || 0);
        setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      },
      ended: () => select(current.current + 1),
      error: () => {
        setLoading(false);
        setPlaying(false);
        setError('Hindi ma-load ang kanta. Subukang muli o pumili ng ibang kanta.');
      },
    };
    for (const [name, handler] of Object.entries(events)) audio.addEventListener(name, handler);
    return () => {
      ++request.current;
      for (const [name, handler] of Object.entries(events)) audio.removeEventListener(name, handler);
      audio.pause();
    };
  }, [audio, select]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const handlers = { play, pause, previoustrack: previous, nexttrack: next, seekto: event => seek(event.seekTime) };
    for (const [name, handler] of Object.entries(handlers)) {
      try { navigator.mediaSession.setActionHandler(name, handler); } catch { /* Optional browser actions. */ }
    }
    return () => {
      for (const name of Object.keys(handlers)) {
        try { navigator.mediaSession.setActionHandler(name, null); } catch { /* Optional browser actions. */ }
      }
    };
  }, [next, pause, play, previous, seek]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    if ('MediaMetadata' in window) navigator.mediaSession.metadata = new MediaMetadata({
      title: tracks[index].title, artist: 'Kinanta ni Chico', album: 'Kwento Natin',
    });
  }, [index, playing]);

  return { index, track: tracks[index], playing, loading, time, duration, error, follow,
    select, toggle, pause, next, previous, seek, toggleFollow, followChapter };
}
