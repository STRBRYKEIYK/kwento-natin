import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSoundtrack } from '../hooks/useSoundtrack';
import { audioInstances, currentAudio } from './setup';
import { CROSSFADE_MS, PAUSE_FADE_MS } from '../audio/createAudioMixer';

const setup = () => {
  const hook = renderHook(useSoundtrack);
  return { ...hook, audio: audioInstances.at(-2), decks: audioInstances.slice(-2) };
};

afterEach(() => vi.useRealTimers());

describe('soundtrack behavior', () => {
  it('loads a track in quiet mode without playing', () => {
    const { result, audio } = setup();
    act(() => result.current.select(0, { shouldPlay: false }));
    expect(audio.src).toMatch(/palagi\.mp3$/);
    expect(audio.playCalls).toBe(0);
    expect(result.current.follow).toBe(false);
    act(() => result.current.followChapter('forevermore'));
    expect(result.current.track.title).toBe('Palagi');
  });

  it('keeps pause intent across chapters', async () => {
    const { result, audio } = setup();
    await act(async () => result.current.select(0));
    act(() => result.current.toggleFollow());
    act(() => result.current.pause());
    act(() => result.current.followChapter('tangerine-boulevard'));
    expect(currentAudio().src).toMatch(/tangerine-boulevard\.mp3$/);
    expect(currentAudio().paused).toBe(true);
    expect(audio.playCalls).toBe(1);
  });

  it('does not replace manually selected music on a chapter change', async () => {
    const { result, audio } = setup();
    await act(async () => result.current.select(1, { manual: true }));
    act(() => result.current.followChapter('forevermore'));
    expect(currentAudio().src).toMatch(/binibini\.mp3$/);
    expect(result.current.follow).toBe(false);
    await act(async () => result.current.toggleFollow());
    expect(currentAudio().src).toMatch(/forevermore\.mp3$/);
  });

  it('wraps at both ends of the playlist', async () => {
    const { result } = setup();
    await act(async () => result.current.select(0));
    await act(async () => result.current.previous());
    expect(result.current.track.title).toBe('Forevermore');
    await act(async () => result.current.next());
    expect(result.current.track.title).toBe('Palagi');
  });

  it('restarts the current track when previous is pressed after four seconds', async () => {
    const { result, audio } = setup();
    await act(async () => result.current.select(2));
    audio.currentTime = 10;
    act(() => result.current.previous());
    expect(audio.currentTime).toBe(0);
    expect(result.current.track.title).toBe('Aura');
  });

  it('advances on ended and resets progress while loading another song', async () => {
    const { result, audio } = setup();
    await act(async () => result.current.select(0));
    act(() => { audio.currentTime = 30; audio.emit('loadedmetadata'); audio.emit('timeupdate'); });
    expect(result.current.time).toBe(30);
    await act(async () => audio.emit('ended'));
    expect(result.current.track.title).toBe('Binibini');
    expect(result.current.time).toBe(0);
    expect(result.current.duration).toBe(0);
  });

  it('handles blocked playback with actionable feedback', async () => {
    const { result, audio } = setup();
    audio.failNext = new DOMException('blocked', 'NotAllowedError');
    await act(async () => result.current.select(0));
    expect(result.current.error).toMatch(/Pindutin ang play/);
    expect(result.current.playing).toBe(false);
    await act(async () => result.current.toggle());
    expect(result.current.error).toBe('');
    expect(result.current.playing).toBe(true);
  });

  it('ignores rejected play promises belonging to an older track', async () => {
    const { result, audio } = setup();
    let rejectOld;
    audio.pendingNext = new Promise((resolve, reject) => { rejectOld = reject; });
    act(() => result.current.select(0));
    await act(async () => result.current.select(1));
    await act(async () => rejectOld(new Error('old request failed')));
    expect(result.current.error).toBe('');
    expect(result.current.track.title).toBe('Binibini');
    expect(result.current.playing).toBe(true);
  });

  it('shows media file errors and clamps seeking to a finite duration', () => {
    const { result, audio } = setup();
    act(() => result.current.select(0, { shouldPlay: false }));
    act(() => { audio.emit('error'); audio.emit('loadedmetadata'); result.current.seek(900); });
    expect(result.current.error).toMatch(/Hindi ma-load/);
    expect(audio.currentTime).toBe(180);
    act(() => result.current.seek(-5));
    expect(audio.currentTime).toBe(0);
    act(() => result.current.seek(NaN));
    expect(audio.currentTime).toBe(0);
  });

  it('accepts configured audio sources without changing playlist keys', async () => {
    window.KWENTO_AUDIO = { palagi: 'https://example.test/palagi.mp3' };
    const { result, audio } = setup();
    await act(async () => result.current.select(0));
    expect(audio.src).toBe(window.KWENTO_AUDIO.palagi);
  });

  it('overlaps songs, changes their volume gradually, and stops the outgoing deck', async () => {
    vi.useFakeTimers();
    const { result, audio } = setup();
    await act(async () => result.current.select(0));
    expect(audio.volume).toBe(0);
    act(() => vi.advanceTimersByTime(CROSSFADE_MS));
    expect(audio.volume).toBe(1);
    await act(async () => result.current.select(1, { manual: true }));
    const incoming = currentAudio();
    expect(incoming).not.toBe(audio);
    expect(incoming.volume).toBe(0);
    expect(audio.paused).toBe(false);
    act(() => vi.advanceTimersByTime(CROSSFADE_MS / 2));
    expect(audio.volume).toBeGreaterThan(.35);
    expect(audio.volume).toBeLessThan(.65);
    expect(incoming.volume).toBeGreaterThan(.35);
    expect(incoming.volume).toBeLessThan(.65);
    act(() => vi.advanceTimersByTime(CROSSFADE_MS / 2));
    expect(audio.paused).toBe(true);
    expect(audio.volume).toBe(0);
    expect(incoming.paused).toBe(false);
    expect(incoming.volume).toBe(1);
  });

  it('holds the old song while the incoming song buffers', async () => {
    vi.useFakeTimers();
    const { result, audio, decks } = setup();
    await act(async () => result.current.select(0));
    act(() => vi.advanceTimersByTime(CROSSFADE_MS));
    let ready;
    decks[1].pendingNext = new Promise(resolve => { ready = resolve; });
    act(() => result.current.select(1));
    act(() => vi.advanceTimersByTime(CROSSFADE_MS * 2));
    expect(audio.volume).toBe(1);
    expect(audio.paused).toBe(false);
    expect(result.current.loading).toBe(true);
    await act(async () => { decks[1].paused = false; ready(); });
    act(() => vi.advanceTimersByTime(CROSSFADE_MS));
    expect(audio.paused).toBe(true);
    expect(decks[1].volume).toBe(1);
  });

  it('fades both decks on pause and stays silent when a pending play resolves late', async () => {
    vi.useFakeTimers();
    const { result, audio, decks } = setup();
    await act(async () => result.current.select(0));
    act(() => vi.advanceTimersByTime(CROSSFADE_MS));
    let ready;
    decks[1].pendingNext = new Promise(resolve => { ready = resolve; });
    act(() => result.current.select(1));
    act(() => result.current.pause());
    expect(result.current.playing).toBe(false);
    expect(audio.paused).toBe(false);
    act(() => vi.advanceTimersByTime(PAUSE_FADE_MS / 2));
    expect(audio.volume).toBeGreaterThan(0);
    expect(audio.volume).toBeLessThan(1);
    act(() => vi.advanceTimersByTime(PAUSE_FADE_MS / 2));
    await act(async () => { decks[1].paused = false; ready(); });
    expect(decks.every(deck => deck.paused && deck.volume === 0)).toBe(true);
    expect(result.current.playing).toBe(false);
  });

  it('recycles the quieter deck on rapid skips and ignores outgoing events', async () => {
    vi.useFakeTimers();
    const { result, audio, decks } = setup();
    await act(async () => result.current.select(0));
    act(() => vi.advanceTimersByTime(CROSSFADE_MS));
    await act(async () => result.current.select(1));
    act(() => vi.advanceTimersByTime(200));
    await act(async () => result.current.select(2));
    expect(currentAudio()).toBe(decks[1]);
    expect(audio.paused).toBe(false);
    expect(audio.volume).toBeGreaterThan(.7);
    act(() => { audio.emit('pause'); audio.emit('error'); audio.emit('ended'); });
    expect(result.current.track.title).toBe('Aura');
    expect(result.current.error).toBe('');
    expect(result.current.playing).toBe(true);
    act(() => vi.advanceTimersByTime(CROSSFADE_MS));
    expect(audio.paused).toBe(true);
    expect(currentAudio().volume).toBe(1);
  });

  it('starts the next track before the current one ends without advancing twice', async () => {
    vi.useFakeTimers();
    const { result, audio } = setup();
    await act(async () => result.current.select(0));
    act(() => vi.advanceTimersByTime(CROSSFADE_MS));
    await act(async () => { audio.currentTime = 179; audio.emit('timeupdate'); });
    expect(result.current.track.title).toBe('Binibini');
    expect(audio.paused).toBe(false);
    act(() => audio.emit('ended'));
    expect(result.current.track.title).toBe('Binibini');
  });

  it('silences failed transitions and cancels fades when unmounted', async () => {
    vi.useFakeTimers();
    const { result, audio, decks, unmount } = setup();
    await act(async () => result.current.select(0));
    act(() => vi.advanceTimersByTime(CROSSFADE_MS));
    decks[1].failNext = new Error('missing track');
    await act(async () => result.current.select(1));
    expect(result.current.error).toMatch(/Hindi ma-play/);
    act(() => vi.advanceTimersByTime(PAUSE_FADE_MS));
    expect(audio.paused).toBe(true);
    await act(async () => result.current.select(2));
    unmount();
    expect(decks.every(deck => deck.paused && deck.volume === 0)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
