import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BiyaheMotorcycle from './BiyaheMotorcycle.jsx';

vi.mock('./motorcycleViewerRuntime.js', () => ({ loadMotorcycleViewer: async () => ({ ModelViewerElement: class {} }) }));

describe('the supplied motorcycle viewer', () => {
  it('reports progress, loads the supplied model, and resets the camera', () => {
    const { container } = render(<BiyaheMotorcycle />);
    const model = container.querySelector('model-viewer');
    const reset = screen.getByRole('button', { name: 'IBALIK ANG TINGIN' });
    expect(model).toHaveAttribute('src', '/public/models/biyahe-scooter.glb');
    expect(model).toHaveAttribute('camera-orbit', '180deg 75deg 105%');
    expect(model).not.toHaveAttribute('camera-controls');
    expect(reset).toBeDisabled();
    fireEvent(model, new CustomEvent('progress', { detail: { totalProgress: 0.6 } }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '60');
    fireEvent(model, new Event('load'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(reset).toBeEnabled();
    model.cameraOrbit = '100deg 90deg 150%';
    fireEvent.click(reset);
    expect(model.cameraOrbit).toBe('180deg 75deg 105%');
  });

  it('recovers from a failed model request with a fresh viewer', async () => {
    const user = userEvent.setup();
    const { container } = render(<BiyaheMotorcycle />);
    const model = container.querySelector('model-viewer');
    fireEvent(model, new Event('error'));
    expect(screen.getByRole('alert')).toHaveTextContent('NANDITO PA RIN ANG SULAT MO');
    await user.click(screen.getByRole('button', { name: 'SUBUKAN ULIT' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(container.querySelector('model-viewer')).not.toBe(model);
    expect(container.querySelector('model-viewer')).toHaveAttribute('src', '/public/models/biyahe-scooter.glb?retry=1');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  });
});
