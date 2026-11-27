import { readFileSync } from 'node:fs';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LegoHousePage from './LegoHousePage.jsx';

const mount = () => render(<MemoryRouter><LegoHousePage houseStage={<div>SUPPLIED HOUSE MODEL</div>} /></MemoryRouter>);

describe('3:33 PM · A LEGO HOUSE', () => {
  it('opens at any hour, preserves every supplied paragraph, and returns keyboard focus on Escape', async () => {
    const user = userEvent.setup();
    mount();
    const opener = screen.getByRole('button', { name: 'BUKSAN ANG SULAT SA 3:33 PM' });
    opener.focus();
    await user.keyboard('{Enter}');
    const letter = screen.getByRole('region', { name: '3:33 PM POOOO, ASAWAAAA KOOOO! ❤️' });
    expect(within(letter).getByRole('heading')).toHaveFocus();
    const brief = readFileSync(`${process.cwd()}/docs/lego-house-design-brief.txt`, 'utf8');
    const paragraphs = brief.slice(brief.indexOf('3:33 PM POOOO,'), brief.indexOf('\n\nImplement your three owned files')).trim().split(/\r?\n\r?\n/);
    expect(paragraphs).toHaveLength(7);
    for (const paragraph of paragraphs) expect(letter).toHaveTextContent(paragraph);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('region', { name: /3:33 PM POOOO/ })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(opener).toHaveAttribute('aria-expanded', 'false');
  });

  it('frames, removes, completes, and rebuilds the four dreams', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getAllByRole('button', { name: 'I-FRAME AT ISABIT' })[0]);
    expect(screen.getByText('1 SA 4 NAKA-FRAME SA WALL')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'NAKA-FRAME SA WALL', pressed: true }));
    expect(screen.getByText('0 SA 4 NAKA-FRAME SA WALL')).toBeInTheDocument();
    for (const button of screen.getAllByRole('button', { name: 'I-FRAME AT ISABIT' })) await user.click(button);
    expect(screen.getAllByRole('button', { name: 'NAKA-FRAME SA WALL', pressed: true })).toHaveLength(4);
    expect(screen.getByText('LAHAT NG 4 NA PANGARAP AY NAKA-FRAME NA SA WALL.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'AYUSIN AT BUUIN ULIT' }));
    expect(screen.getAllByRole('button', { name: 'I-FRAME AT ISABIT', pressed: false })).toHaveLength(4);
  });

  it('renders the supplied stage, links back to the library, and restores the previous title', () => {
    const previous = document.title;
    const { unmount } = mount();
    expect(screen.getByText('SUPPLIED HOUSE MODEL')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /LIBRARY NI CHICO/ })).toHaveAttribute('href', '/');
    expect(document.title).toContain('3:33 PM · A LEGO HOUSE');
    unmount();
    expect(document.title).toBe(previous);
  });
});
