import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import { expect, it, vi } from 'vitest';
import App from '../App';
import { audioInstances } from './setup';

vi.mock('framer-motion', async importOriginal => ({ ...await importOriginal(), useReducedMotion: () => false }));

it('finishes the actual Framer Motion opening before revealing and focusing the letter', async () => {
  render(<MotionConfig reducedMotion="never"><LazyMotion features={domAnimation} strict><App /></LazyMotion></MotionConfig>);
  fireEvent.click(screen.getByRole('button', { name: 'Basahin muna nang tahimik ♡' }));
  expect(screen.queryByRole('main')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Basahin muli ang liham/ }));
  expect(audioInstances.every(audio => audio.playCalls === 0)).toBe(true);
  await waitFor(() => expect(document.activeElement.id).toBe('sec-intro'), { timeout: 2500 });
  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(audioInstances.every(audio => audio.paused)).toBe(true);
});
