import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

export const audioInstances = [];
export class MockAudio extends window.EventTarget {
  constructor() {
    super();
    this.paused = true;
    this.currentTime = 0;
    this.duration = 180;
    this.volume = 1;
    this.error = null;
    this.playCalls = 0;
    this.failNext = null;
    this.pendingNext = null;
    audioInstances.push(this);
  }
  set src(value) { this.source = value; this.currentTime = 0; }
  get src() { return this.source || ''; }
  play() {
    this.playCalls++;
    if (this.failNext) { const failure = this.failNext; this.failNext = null; return Promise.reject(failure); }
    if (this.pendingNext) { const promise = this.pendingNext; this.pendingNext = null; return promise; }
    this.paused = false;
    this.emit('play');
    return Promise.resolve();
  }
  pause() { this.paused = true; this.emit('pause'); }
  load() { this.error = null; }
  emit(name) { this.dispatchEvent(new window.Event(name)); }
}

export const sectionTops = { cover: 0, story: 1000, 'sec-intro': 1060, 'sec-08': 2200, 'sec-09': 6000, 'sec-10': 9000, 'sec-letter': 12000, 'sec-11': 14000, 'sec-finale': 16000 };
let scrollPosition = 0;
beforeEach(() => {
  localStorage.clear();
  audioInstances.length = 0;
  scrollPosition = 0;
  vi.stubGlobal('Audio', MockAudio);
  vi.stubGlobal('matchMedia', vi.fn(query => ({ matches: query.includes('reduced-motion'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback) { this.callback = callback; }
    observe(target) { this.callback([{ target, isIntersecting: true, intersectionRatio: 1, boundingClientRect: target.getBoundingClientRect(), time: 0 }]); }
    unobserve() {} disconnect() {}
  });
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollPosition });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 18000 });
  Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 800 });
  vi.spyOn(window, 'scrollTo').mockImplementation(options => {
    scrollPosition = options.top || 0;
    window.dispatchEvent(new window.Event('scroll'));
  });
  HTMLElement.prototype.scrollTo = vi.fn();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return new DOMRect(0, (sectionTops[this.id] || 0) - scrollPosition, 600, this.id === 'story' ? 17000 : 1000);
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { return this.classList.contains('topbar') ? 80 : 1000; } });
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
});
afterEach(() => {
  cleanup();
  document.body.classList.remove('modal-open');
  delete document.documentElement.dataset.theme;
  delete window.KWENTO_AUDIO;
  vi.unstubAllGlobals();
});
