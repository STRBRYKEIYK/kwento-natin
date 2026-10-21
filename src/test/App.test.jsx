import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { photos } from '../data/content';
import { audioInstances } from './setup';

function mount() {
  return render(<StrictMode><MotionConfig reducedMotion="user"><LazyMotion features={domAnimation} strict><App /></LazyMotion></MotionConfig></StrictMode>);
}
const activeAudio = () => audioInstances.find(audio => audio.src);
async function openQuiet(user) {
  await user.click(screen.getByRole('button', { name: 'Basahin muna nang tahimik ♡' }));
  await waitFor(() => expect(document.activeElement.id).toBe('sec-intro'));
}

describe('love letter experience', () => {
  it('starts with an accessible envelope and no automatic music', () => {
    mount();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Chica ko,');
    expect(screen.getByRole('button', { name: /Buksan ang liham/ })).toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(audioInstances.every(audio => audio.playCalls === 0)).toBe(true);
  });

  it('opens quietly, focuses the letter, and keeps chapter shortcuts folded', async () => {
    const user = userEvent.setup(); mount(); await openQuiet(user);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(document.querySelector('.chapter-directory')).not.toHaveAttribute('open');
    expect(audioInstances.every(audio => audio.playCalls === 0)).toBe(true);
    expect(screen.getByRole('button', { name: /Basahin muli ang liham/ }).querySelector('.envelope-flap')).toBeInTheDocument();
  });

  it('plays from the explicit envelope click', async () => {
    const user = userEvent.setup(); mount();
    await user.click(screen.getByRole('button', { name: /Buksan ang liham/ }));
    expect(activeAudio().playCalls).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'I-pause ang kanta' })).toBeInTheDocument();
  });

  it('preserves the full personal letter and every displayed photo', async () => {
    const user = userEvent.setup(); mount(); await openQuiet(user);
    expect(document.querySelectorAll('figure.photo')).toHaveLength(27);
    expect(screen.getByText(/Salamat sa pakikinig sa bawat kanta ko/)).toBeInTheDocument();
    expect(screen.getByText(/I love you sooo muchhh, mwuaaaa!/)).toBeInTheDocument();
    expect(document.querySelectorAll('button button')).toHaveLength(0);
  });

  it('restores a saved chapter and opens it in quiet mode', async () => {
    localStorage.setItem('kwento-reading', JSON.stringify('sec-10'));
    const user = userEvent.setup(); mount();
    await user.click(screen.getByRole('button', { name: 'Ituloy sa Oktubre →' }));
    await waitFor(() => expect(document.activeElement.id).toBe('sec-10'));
    expect(activeAudio().paused).toBe(true);
    expect(activeAudio().src).toMatch(/paru-paro\.mp3$/);
  });

  it('updates active chapter and saved reading position as the page scrolls', async () => {
    const user = userEvent.setup(); mount(); await openQuiet(user);
    act(() => window.scrollTo({ top: 8900 }));
    await waitFor(() => expect(localStorage.getItem('kwento-reading')).toBe('"sec-10"'));
    expect(screen.getByRole('button', { name: 'Oktubre' })).toHaveAttribute('aria-current', 'location');
    expect(activeAudio().paused).toBe(true);
  });

  it('persists photo colors and supports reversible bulk color changes', async () => {
    const user = userEvent.setup(); mount(); await openQuiet(user);
    const color = screen.getByRole('button', { name: `Kulayan o ibalik sa black and white: ${photos[0].alt}` });
    await user.click(color);
    expect(color).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(localStorage.getItem('kwento-colors'))).toContain(photos[0].src);
    await user.click(screen.getByRole('button', { name: /Kulayan ang lahat ng litrato/ }));
    expect(document.querySelectorAll('.photo.is-colored')).toHaveLength(27);
    await user.click(screen.getByRole('button', { name: /Ibalik sa black and white ang lahat/ }));
    expect(document.querySelectorAll('.photo.is-colored')).toHaveLength(0);
  });

  it('opens fullscreen, wraps photos using buttons and keys, and restores focus on close', async () => {
    const user = userEvent.setup(); mount();
    const zoom = screen.getByRole('button', { name: `Tingnan nang buo: ${photos[0].alt}` });
    await user.click(zoom);
    const dialog = screen.getByRole('dialog');
    expect(document.body).toHaveClass('modal-open');
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Isara ang larawan' }));
    await user.click(within(dialog).getByRole('button', { name: 'Nakaraang larawan' }));
    await waitFor(() => expect(within(dialog).getByRole('img')).toHaveAttribute('alt', photos.at(-1).alt));
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(within(dialog).getByRole('img')).toHaveAttribute('alt', photos[0].alt));
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    await waitFor(() => expect(dialog.open).toBe(false));
    expect(document.activeElement).toBe(zoom);
    expect(document.body).not.toHaveClass('modal-open');
  });

  it('supports horizontal touch swipes in fullscreen', async () => {
    const user = userEvent.setup(); mount();
    await user.click(screen.getByRole('button', { name: `Tingnan nang buo: ${photos[0].alt}` }));
    const dialog = screen.getByRole('dialog');
    const image = within(dialog).getByRole('img');
    for (const [type, x] of [['pointerdown', 220], ['pointerup', 80]]) {
      const event = new Event(type, { bubbles: true });
      Object.assign(event, { isPrimary: true, pointerType: 'touch', clientX: x, clientY: 180 });
      fireEvent(image, event);
    }
    await waitFor(() => expect(within(dialog).getByRole('img')).toHaveAttribute('alt', photos[1].alt));
  });

  it('keeps a chosen song while scrolling and supports re-enabling chapter following', async () => {
    const user = userEvent.setup(); mount(); await openQuiet(user);
    await user.click(screen.getByRole('button', { name: 'Listahan ng kanta' }));
    const playlist = document.getElementById('playlist');
    await user.click(within(playlist).getByRole('button', { name: /Forevermore/ }));
    expect(screen.getByRole('button', { name: 'Listahan ng kanta' })).toHaveFocus();
    expect(playlist).toHaveAttribute('inert');
    act(() => window.scrollTo({ top: 8900 }));
    await waitFor(() => expect(localStorage.getItem('kwento-reading')).toBe('"sec-10"'));
    expect(activeAudio().src).toMatch(/forevermore\.mp3$/);
    await user.click(screen.getByRole('button', { name: 'Listahan ng kanta' }));
    await user.click(screen.getByRole('button', { name: 'Sabay sa kwento: Off' }));
    expect(activeAudio().src).toMatch(/paru-paro\.mp3$/);
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Listahan ng kanta' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('restores legacy theme values and persists theme changes', async () => {
    localStorage.setItem('kwento-theme', 'dark');
    const user = userEvent.setup(); mount();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await user.click(screen.getByRole('button', { name: 'Gamitin ang light theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('kwento-theme')).toBe('"light"');
  });
});
