export const CROSSFADE_MS = 1200;
export const PAUSE_FADE_MS = 220;

export function createAudioMixer() {
  const decks = Array.from({ length: 2 }, () => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audio.volume = 0;
    return audio;
  });
  const levels = new Map(decks.map(audio => [audio, 0]));
  const fades = new Map();
  const gains = new Map();
  let context;

  const level = audio => {
    const fade = fades.get(audio);
    if (!fade) return levels.get(audio);
    const progress = Math.min(1, Math.max(0, (performance.now() - fade.started) / fade.duration));
    return fade.from + (fade.to - fade.from) * progress;
  };
  const writeLevel = (audio, value) => {
    const gain = gains.get(audio);
    if (gain) {
      gain.cancelScheduledValues(context.currentTime);
      gain.setValueAtTime(value, context.currentTime);
    } else audio.volume = value;
    levels.set(audio, value);
  };
  const cancel = audio => {
    const value = level(audio);
    const fade = fades.get(audio);
    if (fade) {
      clearTimeout(fade.timer);
      cancelAnimationFrame(fade.frame);
      fades.delete(audio);
    }
    writeLevel(audio, value);
    return value;
  };
  const stop = audio => {
    cancel(audio);
    writeLevel(audio, 0);
    audio.pause();
  };
  const fade = (audio, to, duration, onFinish) => {
    const from = cancel(audio);
    if (audio.paused || from === to) {
      writeLevel(audio, to);
      onFinish?.();
      return;
    }
    const transition = { from, to, duration, started: performance.now(), frame: null, timer: null };
    fades.set(audio, transition);
    const gain = gains.get(audio);
    if (gain) {
      gain.linearRampToValueAtTime(to, context.currentTime + duration / 1000);
    } else {
      const tick = () => {
        if (fades.get(audio) !== transition) return;
        audio.volume = level(audio);
        transition.frame = requestAnimationFrame(tick);
      };
      transition.frame = requestAnimationFrame(tick);
    }
    transition.timer = setTimeout(() => {
      if (fades.get(audio) !== transition) return;
      cancelAnimationFrame(transition.frame);
      fades.delete(audio);
      writeLevel(audio, to);
      onFinish?.();
    }, duration);
  };
  const unlock = async () => {
    // Gain nodes also work on mobile browsers that ignore HTMLAudioElement.volume.
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!context && AudioContext) {
      try { context = new AudioContext(); } catch { /* Use media volume when Web Audio is unavailable. */ }
      if (context) {
        for (const audio of decks) {
          const gain = context.createGain();
          gain.gain.setValueAtTime(level(audio), context.currentTime);
          context.createMediaElementSource(audio).connect(gain);
          gain.connect(context.destination);
          gains.set(audio, gain.gain);
          audio.volume = 1;
        }
      }
    }
    if (context && context.state !== 'running') await context.resume();
  };
  const dispose = () => {
    decks.forEach(stop);
    if (context) {
      // Closing an already-running context is asynchronous; silence it first.
      context.close().catch(() => {});
      context = undefined;
      gains.clear();
    }
  };
  return { decks, level, cancel, stop, fade, unlock, dispose };
}
