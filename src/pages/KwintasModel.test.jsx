import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import KwintasModel, { NECKLACE_ORBIT } from './KwintasModel.jsx';

vi.mock('@google/model-viewer', () => ({ ModelViewerElement: class {} }));

describe('necklace model controls', () => {
  it('reports load progress, enables controls and resets to the top view', async () => {
    const user = userEvent.setup();
    const { container } = render(<KwintasModel />);
    const model = container.querySelector('model-viewer');
    expect(model.getAttribute('src')).toContain('/models/kwintas.glb');
    expect(model).not.toHaveAttribute('poster');
    expect(screen.getByRole('button', { name: 'IBALIK ANG TINGIN' })).toBeDisabled();
    fireEvent(model, new CustomEvent('progress', { detail: { totalProgress: 0.45 } }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '45');
    fireEvent(model, new Event('load'));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    model.cameraOrbit = '180deg 80deg 150%';
    await user.click(screen.getByRole('button', { name: 'IBALIK ANG TINGIN' }));
    expect(model.cameraOrbit).toBe(NECKLACE_ORBIT);
  });

  it('recovers after an error with a fresh viewer and ignores stale events', async () => {
    const user = userEvent.setup();
    const { container } = render(<KwintasModel />);
    const original = container.querySelector('model-viewer');
    fireEvent(original, new Event('error'));
    expect(screen.getByRole('alert')).toHaveTextContent('MGA LITRATO');
    await user.click(screen.getByRole('button', { name: 'SUBUKAN ULIT' }));
    const retry = container.querySelector('model-viewer');
    expect(retry).not.toBe(original);
    expect(retry.getAttribute('src')).toContain('?retry=1');
    fireEvent(original, new Event('load'));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    fireEvent(retry, new Event('load'));
    expect(screen.getByRole('button', { name: 'IBALIK ANG TINGIN' })).toBeEnabled();
  });
});
