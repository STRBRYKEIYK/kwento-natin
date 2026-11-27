import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PangakoRing from './PangakoRing.jsx';

vi.mock('@google/model-viewer', () => ({ ModelViewerElement: class {} }));

describe('PANGAKO ring viewer', () => {
  it('keeps the illustration while loading, reports progress, and resets the loaded camera', async () => {
    const user = userEvent.setup();
    const { container } = render(<PangakoRing fallback={<p>RING ILLUSTRATION</p>} />);
    const model = container.querySelector('model-viewer');
    expect(model.getAttribute('src')).toContain('/models/pangako-ring.glb');
    expect(screen.getByText('RING ILLUSTRATION')).toBeVisible();
    fireEvent(model, new CustomEvent('progress', { detail: { totalProgress: 0.4 } }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '40');
    fireEvent(model, new Event('load'));
    expect(screen.queryByText('RING ILLUSTRATION')).not.toBeInTheDocument();
    expect(screen.getByText('HILAIN PARA PAIKUTIN')).toBeVisible();
    model.cameraOrbit = '180deg 60deg 105%';
    await user.click(screen.getByRole('button', { name: 'IBALIK ANG TINGIN' }));
    expect(model.cameraOrbit).toBe('75deg 75deg 105%');
  });

  it('keeps the illustration on failure and retries with a fresh viewer', async () => {
    const user = userEvent.setup();
    const { container } = render(<PangakoRing fallback={<p>RING ILLUSTRATION</p>} />);
    const original = container.querySelector('model-viewer');
    fireEvent(original, new Event('error'));
    expect(screen.getByRole('alert')).toHaveTextContent('HINDI PA LUMITAW');
    expect(screen.getByText('RING ILLUSTRATION')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'SUBUKAN ULIT' }));
    const retry = container.querySelector('model-viewer');
    expect(retry).not.toBe(original);
    fireEvent(original, new Event('load'));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    fireEvent(retry, new Event('load'));
    expect(screen.getByRole('button', { name: 'IBALIK ANG TINGIN' })).toBeVisible();
  });
});
