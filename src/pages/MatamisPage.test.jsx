import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MatamisPage, { BAKE_SECONDS, INGREDIENTS } from './MatamisPage.jsx';

afterEach(() => { cleanup(); vi.useRealTimers(); });

function renderPage(options) {
  render(<MemoryRouter><MatamisPage /></MemoryRouter>);
  return userEvent.setup(options);
}

async function addAll(user) {
  for (const card of screen.getAllByRole('button', { pressed: false })) await user.click(card);
}

describe('10:10 matamis', () => {
  it('counts the ingredients, lets her take one back, and only allows baking when all ten are in', async () => {
    const user = renderPage();
    expect(document.title).toBe('10:10 · MATAMIS');
    expect(INGREDIENTS).toHaveLength(10);
    expect(screen.getAllByText('0 / 10').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'KULANG PA ANG 10' })).toBeDisabled();

    const smile = screen.getByRole('button', { name: /NGITI MO/ });
    await user.click(smile);
    expect(smile).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('img', { name: 'ANG KEK MO: 1 SA 10 SANGKAP NA' })).toBeInTheDocument();
    await user.click(smile);
    expect(smile).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'KULANG PA ANG 10' })).toBeDisabled();

    await addAll(user);
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(10);
    expect(screen.getAllByRole('button', { name: 'IHURNO NA' }).length).toBeGreaterThan(0);
    expect(screen.getByText('SAMPU NA! TAMA NA ANG TIMPLA, ASAWA KO.')).toBeVisible();
  });

  it('bakes for ten seconds, serves the cake, opens the letter, and starts over', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = renderPage({ advanceTimers: vi.advanceTimersByTime });
    await addAll(user);
    await user.click(screen.getAllByRole('button', { name: 'IHURNO NA' })[0]);
    expect(screen.getByText('SA HURNO')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('PINAPAINIT PA ANG HURNO');
    expect(screen.getAllByRole('button', { name: 'NASA HURNO PA…' })[0]).toBeDisabled();
    expect(screen.queryByRole('button', { name: /NGITI MO/ })).not.toBeInTheDocument();

    // Each tick schedules the next one after React re-renders, so advance one second at a time.
    const tick = async seconds => {
      for (let i = 0; i < seconds; i += 1) await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    };
    await tick(5);
    expect(screen.getByRole('status')).toHaveTextContent('KONTING TIIS PA');
    await tick(BAKE_SECONDS - 5);

    expect(screen.getByRole('heading', { name: 'TAPOS NA, ASAWA KO!' })).toHaveFocus();
    expect(screen.queryByText(/MAHAL NA MAHAL KITAAAA/)).not.toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'TIKMAN MO' })[0]);
    expect(screen.getByRole('heading', { name: 'ASAWAAAA KOOOO,' })).toHaveFocus();
    expect(screen.getByText(/MAHAL NA MAHAL KITAAAA/)).toBeVisible();

    await user.click(screen.getAllByRole('button', { name: 'TIMPLAHIN ULIT' })[0]);
    expect(screen.getAllByText('0 / 10').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /NGITI MO/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByText(/MAHAL NA MAHAL KITAAAA/)).not.toBeInTheDocument();
  });
});
