import { StrictMode } from 'react';
import { readFileSync } from 'node:fs';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import BiyahePage from './BiyahePage.jsx';

const mount = props => render(<StrictMode><MemoryRouter><BiyahePage {...props} /></MemoryRouter></StrictMode>);

describe('11:11 PM · Biyahe Natin', () => {
  it('opens at any hour, preserves all 14 supplied paragraphs and emphasis, and returns focus on Escape', async () => {
    const user = userEvent.setup();
    mount();
    const opener = screen.getByRole('button', { name: 'BUKSAN ANG SULAT SA 11:11 PM' });
    opener.focus();
    await user.keyboard('{Enter}');
    const letter = screen.getByRole('region', { name: '11:11 PM POOOO, ASAWAAAA KOOOO! 🥹❤️' });
    expect(within(letter).getByRole('heading')).toHaveFocus();
    const brief = readFileSync(`${process.cwd()}/docs/biyahe-design-brief.txt`, 'utf8');
    const paragraphs = brief.slice(brief.indexOf('*11:11 PM POOOO,'), brief.indexOf('\n\nEND EXACT LETTER')).trim().split(/\r?\n\r?\n/);
    expect(paragraphs).toHaveLength(14);
    for (const paragraph of paragraphs) expect(letter).toHaveTextContent(paragraph.replaceAll('*', ''));
    const emphases = [...brief.slice(brief.indexOf('*11:11 PM POOOO,'), brief.indexOf('\n\nEND EXACT LETTER')).matchAll(/\*([^*]+)\*/g)].map(match => match[1]);
    const renderedEmphases = [...letter.querySelectorAll('em')].map(node => node.textContent.replace(/\s+/g, ' ').trim());
    expect(renderedEmphases).toEqual(emphases);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('region', { name: /11:11 PM POOOO/ })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(opener).toHaveAttribute('aria-expanded', 'false');
  });

  it('switches between riding, rest stops and each future moment', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole('button', { name: 'HINTO MUNA SA VIEW' }));
    expect(screen.getByRole('button', { name: 'TULOY SA BIYAHE' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /SANDALI 03/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'TULOY SA BIYAHE' }));
    expect(screen.getByRole('button', { name: /SANDALI 01/ })).toHaveAttribute('aria-pressed', 'true');
    for (const code of ['02', '03', '04', '01']) {
      const moment = screen.getByRole('button', { name: new RegExp(`SANDALI ${code}`) });
      await user.click(moment);
      expect(moment).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: code === '01' ? 'TAKBO NANG DAHAN-DAHAN' : 'HINTO SA MAGANDANG VIEW' })).toHaveAttribute('aria-pressed', 'true');
    }
  });

  it('works without a model, accepts the later model stage, and links to the library', () => {
    const previous = document.title;
    const view = mount();
    expect(screen.getByRole('img', { name: /DARK BRONZE HONDA/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LIBRARY NI CHICO PARA KAY CHICA' })).toHaveAttribute('href', '/');
    view.unmount();
    expect(document.title).toBe(previous);
    mount({ motorcycleStage: <div>SUPPLIED MOTORCYCLE MODEL</div> });
    expect(screen.getByText('SUPPLIED MOTORCYCLE MODEL')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /DARK BRONZE HONDA/ })).not.toBeInTheDocument();
  });
});
