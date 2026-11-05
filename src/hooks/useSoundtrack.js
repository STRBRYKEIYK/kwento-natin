import { useCallback, useEffect, useRef, useState } from 'react';
import { assetUrl, tracks } from '../data/content';
import { createAudioMixer, CROSSFADE_MS, PAUSE_FADE_MS } from '../audio/createAudioMixer';

export function useSoundtrack() {
  const [mixer] = useState(createAudioMixer);
  const active = useRef(mixer.decks[0]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [follow, setFollowState] = useState(false);
  const current = useRef(-1);
  const wantsPlay = useRef(false);
  const followRef = useRef(false);
  const chapterTrack = useRef('palagi');
  const request = useRef(0);

  const setFollow = useCallback(value => {
    followRef.current = value;
    setFollowState(value);
  }, []);

  const play = useCallback(() => {
    const audio = active.current;
    const generation = ++request.current;
    wantsPlay.current = true;
    setError('');
    setLoading(true);
    if (audio.error) audio.load();
    // Start both operations inside the user gesture, before awaiting either one.
    const ready = mixer.unlock();
    if (audio.ended) audio.currentTime = 0;
    Promise.all([ready, audio.play()]).then(() => {
      if (generation !== request.current || audio !== active.current || !wantsPlay.current) {
        if (audio !== active.current || !wantsPlay.current) mixer.stop(audio);
        return;
      }
      setLoading(false);
      setPlaying(true);
      mixer.fade(audio, 1, CROSSFADE_MS);
      for (const outgoing of mixer.decks) {
        if (outgoing !== audio) mixer.fade(outgoing, 0, CROSSFADE_MS, () => mixer.stop(outgoing));
      }
    }).catch(reason => {
      if (generation !== request.current || reason.name === 'AbortError') return;
      setLoading(false);
      setPlaying(false);
      wantsPlay.current = false;
      mixer.decks.forEach(deck => mixer.fade(deck, 0, PAUSE_FADE_MS, () => mixer.stop(deck)));
      setError(reason.name === 'NotAllowedError'
        ? 'Pindutin ang play para simulan ang kanta.'
        : 'Hindi ma-play ang kanta. Subukang muli o pumili ng ibang kanta.');
    });
  }, [mixer]);

  const pause = useCallback(() => {
    ++request.current;
    wantsPlay.current = false;
    setPlaying(false);
    setLoading(false);
    mixer.decks.forEach(audio => mixer.fade(audio, 0, PAUSE_FADE_MS, () => mixer.stop(audio)));
  }, [mixer]);

  const select = useCallback((nextIndex, { shouldPlay = true, manual = false } = {}) => {
    const normalized = (nextIndex + tracks.length) % tracks.length;
    if (manual) setFollow(false);
    wantsPlay.current = shouldPlay;
    if (current.current !== normalized) {
      ++request.current;
      // Keep the louder deck playing during rapid skips or a buffering request.
      const outgoing = mixer.decks.filter(audio => !audio.paused && !audio.ended)
        .sort((a, b) => mixer.level(b) - mixer.level(a))[0];
      const audio = outgoing ? mixer.decks.find(deck => deck !== outgoing) : active.current;
      if (outgoing) mixer.cancel(outgoing);
      active.current = audio;
      mixer.stop(audio);
      current.current = normalized;
      setIndex(normalized);
      setTime(0);
      setDuration(0);
      setError('');
      const key = tracks[normalized].key;
      audio.src = window.KWENTO_AUDIO?.[key] || assetUrl(`assets/audio/${key}.mp3`);
    }
    if (shouldPlay) play();
    else {
      ++request.current;
      mixer.decks.forEach(mixer.stop);
      setPlaying(false);
      setLoading(false);
    }
  }, [mixer, play, setFollow]);

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
    const audio = active.current;
    setFollow(false);
    if (audio.currentTime > 4) {
      audio.currentTime = 0;
      setTime(0);
    } else select(current.current - 1, { manual: true });
  }, [select, setFollow]);
  const toggle = useCallback(() => {
    if (wantsPlay.current) pause();
    else if (current.current < 0) select(0);
    else play();
  }, [pause, play, select]);
  const seek = useCallback(seconds => {
    const audio = active.current;
    if (!Number.isFinite(seconds) || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, seconds));
    setTime(audio.currentTime);
  }, []);

  useEffect(() => {
    const subscriptions = mixer.decks.map(audio => {
      const events = {
        play: () => {
          if (audio !== active.current || !wantsPlay.current) { mixer.stop(audio); return; }
          setPlaying(true);
        },
        pause: () => { if (audio === active.current) setPlaying(false); },
        waiting: () => { if (audio === active.current && wantsPlay.current) setLoading(true); },
        canplay: () => { if (audio === active.current) setLoading(false); },
        timeupdate: () => {
          if (audio !== active.current) return;
          setTime(audio.currentTime || 0);
          if (wantsPlay.current && !audio.paused && !audio.ended && Number.isFinite(audio.duration)
            && audio.duration > CROSSFADE_MS / 1000 && audio.currentTime > 0
            && audio.duration - audio.currentTime <= CROSSFADE_MS / 1000) select(current.current + 1);
        },
        loadedmetadata: () => {
          if (audio !== active.current) return;
          setTime(audio.currentTime || 0);
          setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
        },
        ended: () => {
          if (audio === active.current && wantsPlay.current) select(current.current + 1);
        },
        error: () => {
          if (audio !== active.current) return;
          ++request.current;
          wantsPlay.current = false;
          mixer.decks.forEach(mixer.stop);
          setLoading(false);
          setPlaying(false);
          setError('Hindi ma-load ang kanta. Subukang muli o pumili ng ibang kanta.');
        },
      };
      for (const [name, handler] of Object.entries(events)) audio.addEventListener(name, handler);
      return () => {
        for (const [name, handler] of Object.entries(events)) audio.removeEventListener(name, handler);
      };
    });
    return () => {
      ++request.current;
      wantsPlay.current = false;
      subscriptions.forEach(unsubscribe => unsubscribe());
      mixer.dispose();
    };
  }, [mixer, select]);

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
