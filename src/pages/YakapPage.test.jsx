import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import YakapPage from './YakapPage.jsx';

vi.mock('@google/model-viewer', () => ({ ModelViewerElement: {} }));

function setup() {
  const result = render(<MemoryRouter><YakapPage /></MemoryRouter>);
  return { ...result, user: userEvent.setup(), model: result.container.querySelector('model-viewer') };
}

describe('12:12 Yakap', () => {
  it('opens the letter at any hour and offers repeat hugs without needing the model to finish loading', async () => {
    const { user } = setup();
    expect(document.title).toContain('12:12 · Yakap');
    expect(screen.queryByRole('heading', { name: 'CHICAAAA KOOOO,' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Buksan ang yakap' }));
    expect(screen.getByRole('heading', { name: 'CHICAAAA KOOOO,' })).toHaveFocus();
    const letter = screen.getByRole('article');
    expect(letter.textContent).toBe(letter.textContent.toUpperCase());
    expect(letter.textContent.split(/\s+/).length).toBeGreaterThan(250);
    await user.click(screen.getByRole('button', { name: 'Yakap, please' }));
    expect(screen.getByText(/Isang mahigpit na yakap/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Isa pang yakap' }));
    expect(screen.getByText(/Yung medyo matagal/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Itupi muna ang sulat' }));
    expect(screen.getByRole('button', { name: 'Buksan ang yakap' })).toBeVisible();
  });

  it('keeps the letter usable after a model failure and retries a fresh viewer', async () => {
    const { user, model, container } = setup();
    fireEvent(model, new Event('error'));
    expect(screen.getByRole('alert')).toHaveTextContent(/Medyo nahirapan/);
    await user.click(screen.getByRole('button', { name: 'Buksan ang yakap' }));
    expect(screen.getByRole('heading', { name: 'CHICAAAA KOOOO,' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Subukan ulit' }));
    expect(container.querySelector('model-viewer')).not.toBe(model);
    fireEvent(container.querySelector('model-viewer'), new Event('load'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('supports pausing and restoring the camera, and respects changes to reduced motion', async () => {
    const changeListeners = [];
    vi.mocked(window.matchMedia).mockReturnValue({ matches: false, addEventListener: (_event, callback) => changeListeners.push(callback), removeEventListener: vi.fn() });
    const { user, model } = setup();
    fireEvent(model, new Event('load'));
    expect(model).toHaveAttribute('auto-rotate');
    await user.click(screen.getByRole('button', { name: 'I-pause ang ikot' }));
    expect(model).not.toHaveAttribute('auto-rotate');
    await user.click(screen.getByRole('button', { name: 'Paikutin' }));
    expect(model).toHaveAttribute('auto-rotate');
    model.resetTurntableRotation = vi.fn();
    await user.click(screen.getByRole('button', { name: 'Ibalik ang tingin' }));
    expect(model.resetTurntableRotation).toHaveBeenCalledOnce();
    expect(model.cameraOrbit).toBe('-15deg 78deg 105%');
    vi.mocked(window.matchMedia).mock.results.at(-1).value.matches = true;
    act(() => changeListeners.forEach(callback => callback()));
    expect(model).not.toHaveAttribute('auto-rotate');
    expect(screen.getByRole('button', { name: 'Paikutin' })).toBeDisabled();
  });
});
