import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import TabiPage from './TabiPage.jsx';

const mount = () => render(<MemoryRouter><TabiPage /></MemoryRouter>);

describe('the special 1:11 for Chicaaa', () => {
  it('opens the letter without waiting for 1:11 and gives the letter keyboard focus', async () => {
    const user = userEvent.setup();
    mount();
    const opener = screen.getByRole('button', { name: /Buksan ang sulat/i });
    opener.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: /Chicaaa ko/i })).toHaveFocus();
  });

  it('provides the Library link and restores the title when leaving', () => {
    const previous = document.title;
    const { unmount } = mount();
    expect(screen.getByRole('link', { name: /Library ni Chico/i })).toHaveAttribute('href', '/');
    expect(document.title).toContain('1:11');
    unmount();
    expect(document.title).toBe(previous);
  });
});
