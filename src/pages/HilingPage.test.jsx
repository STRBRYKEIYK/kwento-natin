import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HilingPage, { HILING_KEY, WISHES } from './HilingPage.jsx';

beforeEach(() => {
  localStorage.clear();
  vi.mocked(window.matchMedia).mockReturnValue({ matches: false });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

function renderPage() {
  render(<MemoryRouter><HilingPage /></MemoryRouter>);
  return userEvent.setup();
}

describe('11:11 Hiling', () => {
  it('opens at any hour, lets her choose, edit, fold and send a wish, then revisit it', async () => {
    const user = renderPage();
    expect(document.title).toContain('11:11 · HILING');
    await user.click(screen.getByRole('button', { name: /Buksan ang bintana/ }));
    const input = screen.getByRole('textbox', { name: /O isulat/ });
    expect(input).toHaveFocus();
    expect(screen.getByRole('button', { name: /Itupi ang hiling/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Mabagal na umaga' }));
    expect(input).toHaveValue(WISHES[0].wish);
    await user.click(screen.getByRole('button', { name: /Itupi ang hiling/ }));
    expect(screen.getByRole('heading', { name: /Handa na/ })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: /May babaguhin/ }));
    expect(screen.getByRole('textbox')).toHaveValue(WISHES[0].wish);
    await user.click(screen.getByRole('button', { name: /Itupi ang hiling/ }));
    await user.click(screen.getByRole('button', { name: /Paliparin ang hiling/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Lumilipad');
    await user.click(screen.getByRole('button', { name: /Buksan na ang sagot/ }));
    expect(screen.getByRole('heading', { name: 'Chicaaa ko,' })).toHaveFocus();
    expect(screen.getByText(WISHES[0].reply)).toBeVisible();
    expect(JSON.parse(localStorage.getItem(HILING_KEY))).toEqual({ wish: WISHES[0].wish, replyId: 'umaga' });
    cleanup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /Balikan ang huli/ }));
    expect(screen.getByText(WISHES[0].reply)).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Isa pang hiling/ }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('treats edited presets as personal wishes and ignores whitespace', async () => {
    const user = renderPage();
    await user.click(screen.getByRole('button', { name: /Buksan ang bintana/ }));
    await user.click(screen.getByRole('button', { name: 'Isang tahanan' }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '   ');
    expect(screen.getByRole('button', { name: /Itupi ang hiling/ })).toBeDisabled();
    await user.clear(input);
    await user.type(input, 'Sana matuloy ang mga pangarap ko.');
    expect(screen.getByRole('button', { name: 'Isang tahanan' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: /Itupi ang hiling/ }));
    await user.click(screen.getByRole('button', { name: /Paliparin ang hiling/ }));
    await user.click(screen.getByRole('button', { name: /Buksan na ang sagot/ }));
    expect(screen.getByText(/Hindi ko man alam lahat/)).toBeVisible();
    expect(JSON.parse(localStorage.getItem(HILING_KEY)).replyId).toBeNull();
  });

  it('finishes the flight automatically and skips waiting with reduced motion', async () => {
    const user = renderPage();
    await user.click(screen.getByRole('button', { name: /Buksan ang bintana/ }));
    await user.click(screen.getByRole('button', { name: 'Isang pahinga' }));
    await user.click(screen.getByRole('button', { name: /Itupi ang hiling/ }));
    vi.useFakeTimers();
    act(() => screen.getByRole('button', { name: /Paliparin ang hiling/ }).click());
    await act(async () => { await vi.advanceTimersByTimeAsync(2200); });
    expect(screen.getByText(WISHES[2].reply)).toBeVisible();
    vi.useRealTimers();
    cleanup();
    localStorage.clear();
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true });
    renderPage();
    await user.click(screen.getByRole('button', { name: /Buksan ang bintana/ }));
    await user.click(screen.getByRole('button', { name: 'Malayo, kasama ka' }));
    await user.click(screen.getByRole('button', { name: /Itupi ang hiling/ }));
    vi.useFakeTimers();
    act(() => screen.getByRole('button', { name: /Paliparin ang hiling/ }).click());
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(screen.getByText(WISHES[1].reply)).toBeVisible();
  });

  it('handles broken saved data and unavailable storage without losing the reply', async () => {
    localStorage.setItem(HILING_KEY, '{bad json');
    const user = renderPage();
    expect(screen.queryByRole('button', { name: /Balikan ang huli/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Buksan ang bintana/ }));
    await user.click(screen.getByRole('button', { name: 'Isang tahanan' }));
    await user.click(screen.getByRole('button', { name: /Itupi ang hiling/ }));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Full'); });
    await user.click(screen.getByRole('button', { name: /Paliparin ang hiling/ }));
    await user.click(screen.getByRole('button', { name: /Buksan na ang sagot/ }));
    expect(screen.getByText(WISHES[3].reply)).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Hindi naitabi');
  });
});
