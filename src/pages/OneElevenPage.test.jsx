import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OneElevenPage, { oneElevenMemories } from './OneElevenPage.jsx';
import { DATES } from './petsaData.js';

afterEach(cleanup);

describe('the new 1:11 surprise', () => {
  it('uses exactly eleven distinct real photos', () => {
    expect(oneElevenMemories).toHaveLength(11);
    expect(new Set(oneElevenMemories.map(photo => photo.src)).size).toBe(11);
    for (const photo of oneElevenMemories) {
      expect(existsSync(resolve('public', decodeURIComponent(photo.src.slice(1))))).toBe(true);
      expect(photo.alt).toBeTruthy();
    }
  });

  it('matches all eleven PETSA dates in order and uses a photo from each exact album', () => {
    expect(oneElevenMemories.map(memory => memory.iso)).toEqual(DATES.map(date => date.date));
    oneElevenMemories.forEach((memory, index) => {
      expect(DATES[index].files).toContain(memory.file);
      expect(memory.file).not.toBe(DATES[index].files[0]);
      expect(memory.albumHref).toBe(`/menu/petsa?d=${index}`);
      expect(existsSync(resolve('public', decodeURIComponent(memory.thumb.slice(1))))).toBe(true);
    });
  });

  it('opens without a time lock, lets her browse, reveals the letter and replays', async () => {
    const user = userEvent.setup();
    render(<OneElevenPage />);
    expect(screen.queryByRole('navigation', { name: 'Pumili ng alaala' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Buksan ang mga alaala/ }));
    expect(screen.getByRole('link', { name: /Buksan ang buong album/ })).toHaveAttribute('href', '/menu/petsa?d=0');
    expect(screen.getByRole('button', { name: 'Nauna' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Alaala 11:/ }));
    expect(screen.getByRole('heading', { name: oneElevenMemories[10].title })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nauna' }));
    expect(screen.getByRole('heading', { name: oneElevenMemories[9].title })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Isa pang alaala' }));
    await user.click(screen.getByRole('button', { name: 'May sulat pa ’ko sa ’yo' }));
    expect(screen.getByRole('heading', { name: 'Asawa kooo,' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Balikan ulit natin' }));
    expect(screen.getByRole('heading', { name: oneElevenMemories[0].title })).toBeInTheDocument();
  });
});
