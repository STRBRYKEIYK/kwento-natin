import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSoundtrack } from '../hooks/useSoundtrack';
import { audioInstances } from './setup';

const setup = () => {
  const hook = renderHook(useSoundtrack);
  return { ...hook, audio: audioInstances.at(-1) };
};

describe('soundtrack behavior', () => {
  it('loads a track in quiet mode without playing', () => {
    const { result, audio } = setup();
    act(() => result.current.select(0, { shouldPlay: false }));
    expect(audio.src).toMatch(/palagi\.mp3$/);
    expect(audio.playCalls).toBe(0);
  });

  it('keeps pause intent across chapters', async () => {
    const { result, audio } = setup();
    await act(async () => result.current.select(0));
    act(() => result.current.pause());
    act(() => result.current.followChapter('tangerine-boulevard'));
    expect(audio.src).toMatch(/tangerine-boulevard\.mp3$/);
    expect(audio.paused).toBe(true);
    expect(audio.playCalls).toBe(1);
  });

  it('does not replace manually selected music on a chapter change', async () => {
    const { result, audio } = setup();
    await act(async () => result.current.select(1, { manual: true }));
    act(() => result.current.followChapter('forevermore'));
    expect(audio.src).toMatch(/binibini\.mp3$/);
    expect(result.current.follow).toBe(false);
    await act(async () => result.current.toggleFollow());
    expect(audio.src).toMatch(/forevermore\.mp3$/);
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
});
