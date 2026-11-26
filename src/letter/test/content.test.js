import { mediaObject, mediaUrl } from '../../media.js';
import { describe, expect, it, vi } from 'vitest';
import { photos, tracks, chapters, letter, formatTime } from '../data/content';
import { readPreference } from '../hooks/usePersistentState';

describe('content and saved preferences', () => {
  it('preserves the memories through November 5, with case-correct asset paths', () => {
    expect(photos).toHaveLength(61);
    expect(new Set(photos.map(photo => photo.id)).size).toBe(61);
    expect(tracks).toHaveLength(11);
    const videos = chapters.flatMap(chapter => chapter.blocks.filter(block => block.type === 'video'));
    const files = [...photos.map(photo => photo.src), ...tracks.map(track => `assets/audio/${track.key}.mp3`),
      ...videos.flatMap(video => [video.src, video.poster])];
    for (const file of files) {
      expect(mediaObject(file)?.verified, file).toBe(true);
      expect(mediaUrl(file), file).toMatch(/^https:\/\/firebasestorage\.googleapis\.com\//);
    }
    expect(chapters).toHaveLength(6);
    expect(letter.paragraphs).toHaveLength(9);
    const bytes = photos.reduce((sum, photo) => sum + mediaObject(photo.src).bytes, 0);
    console.info(`Displayed source photos: ${(bytes / 1024 / 1024).toFixed(2)} MB; loaded lazily after the cover.`);
  });

  it('falls back on malformed, outdated, or unavailable saved data', () => {
    const valid = value => Array.isArray(value);
    localStorage.setItem('kwento-colors', '{bad json');
    expect(readPreference('kwento-colors', [], valid)).toEqual([]);
    localStorage.setItem('kwento-reading', '"unknown-section"');
    expect(readPreference('kwento-reading', 'sec-intro', value => value === 'sec-intro')).toBe('sec-intro');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage denied'); });
    expect(readPreference('kwento-theme', 'light')).toBe('light');
  });

  it('formats unknown and valid audio durations without invalid numbers', () => {
    expect(formatTime(Infinity)).toBe('0:00');
    expect(formatTime(NaN)).toBe('0:00');
    expect(formatTime(125.8)).toBe('2:05');
  });
});
