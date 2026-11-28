import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import KwintasPage from './KwintasPage.jsx';
import KwintasModel from './KwintasModel.jsx';
import { NECKLACE_ORDER } from './kwintasOrder.js';

vi.mock('@google/model-viewer', () => ({ ModelViewerElement: class {} }));

function renderPage(stage = <KwintasModel />) {
  return render(<MemoryRouter><KwintasPage necklaceStage={stage} /></MemoryRouter>);
}

describe('11:11 necklace story', () => {
  it('leads with the actual 3D stage, followed immediately by the linen showcase', () => {
    const { container } = renderPage();
    const sections = [...container.querySelector('main').children].filter(element => element.tagName === 'SECTION');
    expect(sections[0]).toHaveAttribute('id', 'kw-3d-stage');
    expect(sections[0].querySelector('model-viewer')).not.toBeNull();
    const linen = sections[1].querySelector('img');
    expect(linen).toHaveAttribute('alt', expect.stringContaining('LINEN'));
    expect(container.querySelectorAll('model-viewer')).toHaveLength(1);
    expect(container.querySelectorAll('main img')).toHaveLength(6);
  });

  it('shows both full name meanings without order specifications or receipt details', () => {
    renderPage(<div>3D STAGE</div>);
    for (const order of NECKLACE_ORDER) {
      const card = screen.getAllByRole('heading', { name: order.name, exact: true })
        .map(heading => heading.closest('article')).find(article => article && !article.closest('details'));
      expect(card).not.toBeNull();
      expect(card).toHaveTextContent(order.meaning);
    }
    expect(document.querySelector('details')).toBeNull();
    expect(document.querySelector('main').textContent).not.toMatch(/MNGBUNDLE2LESS|Original Design|RUSH|Snake \(Best Seller\)|20–22|16–18|Feature on Socials|₱/i);
  });

  it('keeps every showcase image rendered through model loading, errors, retry and success', async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    expect(document.title).toBe('11:11 · ANG KWINTAS NATIN — PARA SA CHICAAAA KO');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ANG KWINTAS NATIN');
    const images = [...container.querySelectorAll('main img')];
    expect(images).toHaveLength(6);
    expect(images.every(image => image.src.includes('firebasestorage.googleapis.com'))).toBe(true);
    const model = container.querySelector('model-viewer');
    fireEvent(model, new Event('error'));
    expect([...container.querySelectorAll('main img')]).toEqual(images);
    await user.click(screen.getByRole('button', { name: 'SUBUKAN ULIT' }));
    fireEvent(container.querySelector('model-viewer'), new Event('load'));
    expect([...container.querySelectorAll('main img')]).toEqual(images);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('opens and folds the letter by keyboard and returns focus to its opener', async () => {
    const user = userEvent.setup();
    renderPage(<div>3D STAGE</div>);
    const opener = screen.getByRole('button', { name: /BUKSAN ANG SULAT SA 11:11/ });
    expect(opener).toHaveAttribute('aria-expanded', 'false');
    await user.click(opener);
    const letter = screen.getByRole('region', { name: 'CHICAAAA KOOOO, ASAWAAAA KOOOO,' });
    expect(opener).toHaveAttribute('aria-expanded', 'true');
    expect(within(letter).getByRole('heading')).toHaveFocus();
    expect(letter).toHaveTextContent('SETYEMBRE 6');
    expect(letter).toHaveTextContent('SETYEMBRE 11');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('region', { name: 'CHICAAAA KOOOO, ASAWAAAA KOOOO,' })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('navigates all story chapters by keyboard and marks memories independently', async () => {
    const user = userEvent.setup();
    renderPage(<div>3D STAGE</div>);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(5);
    tabs[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('AGOSTO 28');
    await user.click(screen.getByRole('button', { name: /INGATAN ANG ALAALANG/ }));
    expect(screen.getByRole('button', { name: /ININGATAN SA PUSO/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(tabs[2]);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('SETYEMBRE 6');
    await user.click(tabs[4]);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('LAGI MO PA SUOT YING NECKLACE');
  });

  it('enlarges the actual photos, navigates by arrows and closes with Escape', async () => {
    const user = userEvent.setup();
    renderPage(<div>3D STAGE</div>);
    const opener = screen.getByRole('button', { name: /PALAKIHIN ANG AKTWAL NA LITRATO: SA ITIM/ });
    await user.click(opener);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('alt', expect.stringContaining('AKTWAL NA LITRATO'));
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByRole('heading')).toHaveTextContent('KEITH');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('keeps keyboard focus in the lightbox and restores scroll and background access', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'clip';
    const { container, unmount } = renderPage(<div>3D STAGE</div>);
    await user.click(screen.getByRole('button', { name: /PALAKIHIN ANG AKTWAL NA LITRATO: SA ITIM/ }));
    const dialog = screen.getByRole('dialog');
    const controls = within(dialog).getAllByRole('button');
    expect(controls[0]).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    expect(container.querySelector('.kw-shell')).toHaveAttribute('inert');
    await user.tab({ shift: true });
    expect(controls.at(-1)).toHaveFocus();
    await user.tab();
    expect(controls[0]).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('clip');
    expect(container.querySelector('.kw-shell')).not.toHaveAttribute('inert');
    await user.click(screen.getByRole('button', { name: /PALAKIHIN ANG AKTWAL NA LITRATO: SA ITIM/ }));
    unmount();
    expect(document.body.style.overflow).toBe('clip');
    document.body.style.overflow = '';
  });
});
