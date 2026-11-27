import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PangakoPage from './PangakoPage.jsx';

const mount = props => render(<MemoryRouter><PangakoPage {...props} /></MemoryRouter>);

describe('2:22 PANGAKO', () => {
  it('opens the CAPS letter at any time, focuses it, and restores focus when folded', async () => {
    const user = userEvent.setup();
    const previous = document.title;
    const { container, unmount } = mount();
    const opener = screen.getByRole('button', { name: 'BUKSAN ANG SULAT SA 2:22' });
    expect(screen.queryByRole('heading', { name: 'CHICAAA KO,' })).not.toBeInTheDocument();
    await user.click(opener);
    expect(screen.getByRole('heading', { name: 'CHICAAA KO,' })).toHaveFocus();
    expect(opener).toHaveAttribute('aria-expanded', 'true');
    const copy = container.querySelector('.pk-letter-body').textContent;
    expect(copy).toBe(copy.toUpperCase());
    await user.click(screen.getAllByRole('button', { name: 'ITUPI MUNA ANG SULAT' }).at(-1));
    expect(opener).toHaveFocus();
    expect(opener).toHaveAttribute('aria-expanded', 'false');
    expect(document.title).toContain('2:22 · PANGAKO');
    unmount();
    expect(document.title).toBe(previous);
  });

  it('navigates promises by keyboard and keeps individual holds when switching', async () => {
    const user = userEvent.setup();
    mount();
    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('PAG WALA NA TAYONG SPARK, PA WELDING TAYO');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('KIKILITIIN KITA');
    await user.click(screen.getByRole('button', { name: 'HAWAKAN ANG PANGAKONG ’TO' }));
    expect(screen.getByRole('button', { name: 'HAWAK NA ANG PANGAKONG ’TO' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(tabs[2]);
    expect(screen.getByRole('button', { name: 'HAWAKAN ANG PANGAKONG ’TO' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(tabs[1]);
    expect(screen.getByRole('button', { name: 'HAWAK NA ANG PANGAKONG ’TO' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'SUSUNOD NA PANGAKO →' }));
    expect(tabs[2]).toHaveFocus();
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('completes all five promises without blocking the letter and accepts a future model stage', async () => {
    const user = userEvent.setup();
    mount({ ringStage: <div data-testid="ring-model">RING MODEL</div> });
    expect(screen.getByTestId('ring-model')).toBeVisible();
    for (const tab of screen.getAllByRole('tab')) {
      await user.click(tab);
      await user.click(screen.getByRole('button', { name: 'HAWAKAN ANG PANGAKONG ’TO' }));
    }
    expect(screen.getByText(/LAHAT NG LIMANG PANGAKO AY HAWAK NA NATIN/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'BUKSAN ANG SULAT SA 2:22' }));
    expect(screen.getByRole('heading', { name: 'CHICAAA KO,' })).toBeVisible();
  });
});
