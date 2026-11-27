import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import HaponPage from './HaponPage.jsx';

const mount = () => render(<MemoryRouter><HaponPage /></MemoryRouter>);

describe('12:12 Hapon Natin', () => {
  it('opens the afternoon letter immediately, even outside 12:12, and focuses its heading', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-27T18:00:00+08:00'));
    vi.useRealTimers();
    const user = userEvent.setup();
    mount();
    expect(screen.queryByRole('heading', { name: 'Chicaaaa koooo,' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Tabi muna tayo/ }));
    expect(screen.getByRole('heading', { name: 'Chicaaaa koooo,' })).toHaveFocus();
    expect(screen.getByText(/gusto ko lang munang mahalin ka/)).toBeVisible();
    expect(screen.getAllByRole('button', { name: /Isang sulat/ }).every(button => button.getAttribute('aria-pressed') === 'true')).toBe(true);
  });

  it('lets her open each picnic surprise independently and revisit the letter', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole('button', { name: 'Buksan ang bulaklak mo' }));
    expect(screen.getByRole('heading', { name: 'Isang bulaklak para sa’yo.' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: /May sulat pa ’ko/ }));
    expect(screen.getByRole('heading', { name: 'Chicaaaa koooo,' })).toBeVisible();
    await user.click(screen.getAllByRole('button', { name: /Isang pahinga/ })[0]);
    expect(screen.getByRole('heading', { name: 'Yung isang baso, sa’yo.' })).toHaveFocus();
    expect(screen.getByText('SA’YO LAHAT NG LAMBING NA ’TO, ASAWA.')).toBeVisible();
    await user.click(screen.getAllByRole('button', { name: /Isang sulat/ })[0]);
    expect(screen.getByRole('heading', { name: 'Chicaaaa koooo,' })).toHaveFocus();
  });

  it('works with a keyboard and restores the document title on exit', async () => {
    const previous = document.title;
    const user = userEvent.setup();
    const { unmount } = mount();
    const letter = screen.getByRole('button', { name: 'Buksan ang sulat ni Chico' });
    letter.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'Chicaaaa koooo,' })).toHaveFocus();
    expect(document.title).toContain('Hapon Natin');
    unmount();
    expect(document.title).toBe(previous);
  });

  it('returns to the picnic and reopens the same note without relying on URL fragments', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const originalScroll = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    try {
      mount();
      expect(scrollIntoView).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Buksan ang munting pahinga' }));
      expect(screen.getByRole('heading', { name: 'Yung isang baso, sa’yo.' })).toHaveFocus();
      expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'start', behavior: 'instant' });
      await user.click(screen.getByRole('button', { name: 'Balik sa picnic' }));
      expect(screen.getByRole('heading', { name: /Sa gitna ng araw/ })).toHaveFocus();
      expect(screen.queryByRole('heading', { name: 'Yung isang baso, sa’yo.' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Buksan ang munting pahinga' }));
      expect(screen.getByRole('heading', { name: 'Yung isang baso, sa’yo.' })).toHaveFocus();
      const calls = scrollIntoView.mock.calls.length;
      await user.click(screen.getByRole('button', { name: 'Buksan ang munting pahinga' }));
      expect(scrollIntoView.mock.calls.length).toBe(calls + 1);
    } finally {
      if (originalScroll) HTMLElement.prototype.scrollIntoView = originalScroll;
      else delete HTMLElement.prototype.scrollIntoView;
    }
  });
});
