import { afterEach, expect, it, vi } from 'vitest';
import { createAudioMixer, CROSSFADE_MS } from '../audio/createAudioMixer';

afterEach(() => vi.useRealTimers());

it('uses an audio gain envelope when native media volume cannot provide the fades', async () => {
  vi.useFakeTimers();
  const outputs = [];
  const sources = [];
  const context = {
    state: 'suspended', currentTime: 10, destination: {},
    resume: vi.fn(async () => { context.state = 'running'; }),
    close: vi.fn(async () => { context.state = 'closed'; }),
    createMediaElementSource: vi.fn(audio => {
      const source = { audio, connect: vi.fn() };
      sources.push(source);
      return source;
    }),
    createGain: vi.fn(() => {
      const node = {
        gain: { cancelScheduledValues: vi.fn(), setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      };
      outputs.push(node);
      return node;
    }),
  };
  const AudioContext = vi.fn(function () { return context; });
  vi.stubGlobal('AudioContext', AudioContext);
  const mixer = createAudioMixer();
  expect(AudioContext).not.toHaveBeenCalled();
  await mixer.unlock();
  expect(context.resume).toHaveBeenCalledOnce();
  expect(sources.map(source => source.audio)).toEqual(mixer.decks);
  expect(outputs.every(output => output.connect.mock.calls[0][0] === context.destination)).toBe(true);
  expect(sources.every((source, i) => source.connect.mock.calls[0][0] === outputs[i])).toBe(true);
  const [outgoing, incoming] = mixer.decks;
  await outgoing.play();
  mixer.fade(outgoing, 1, CROSSFADE_MS);
  expect(outputs[0].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(1, 11.2);
  vi.advanceTimersByTime(CROSSFADE_MS);
  await incoming.play();
  mixer.fade(outgoing, 0, CROSSFADE_MS, () => mixer.stop(outgoing));
  mixer.fade(incoming, 1, CROSSFADE_MS);
  vi.advanceTimersByTime(CROSSFADE_MS / 2);
  expect(mixer.level(outgoing)).toBeCloseTo(.5);
  expect(mixer.level(incoming)).toBeCloseTo(.5);
  // Native volume stays at unity; gain nodes do the actual mixing on iOS too.
  expect(mixer.decks.every(audio => audio.volume === 1)).toBe(true);
  await mixer.unlock();
  expect(AudioContext).toHaveBeenCalledOnce();
  mixer.dispose();
  expect(context.close).toHaveBeenCalledOnce();
  expect(mixer.decks.every(audio => audio.paused)).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});

it('falls back to media volume when an AudioContext cannot be created', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('AudioContext', function () { throw new Error('unavailable'); });
  const mixer = createAudioMixer();
  await mixer.unlock();
  const audio = mixer.decks[0];
  await audio.play();
  mixer.fade(audio, 1, CROSSFADE_MS);
  vi.advanceTimersByTime(CROSSFADE_MS / 2);
  expect(audio.volume).toBeGreaterThan(.35);
  expect(audio.volume).toBeLessThan(.65);
  mixer.dispose();
  expect(audio.volume).toBe(0);
  expect(audio.paused).toBe(true);
});
