import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LegoHouseModel from './LegoHouseModel.jsx';

vi.mock('@google/model-viewer', () => ({ ModelViewerElement: class {} }));

describe('the supplied LEGO house viewer', () => {
  it('shows loading progress and enables camera reset after loading', () => {
    const { container } = render(<LegoHouseModel />);
    const model = container.querySelector('model-viewer');
    const reset = screen.getByRole('button', { name: 'IBALIK ANG TINGIN' });
    expect(reset).toBeDisabled();
    fireEvent(model, new CustomEvent('progress', { detail: { totalProgress: 0.6 } }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '60');
    fireEvent(model, new Event('load'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(reset).toBeEnabled();
    model.cameraOrbit = '100deg 90deg 150%';
    fireEvent.click(reset);
    expect(model.cameraOrbit).toBe('25deg 72deg 105%');
  });

  it('offers a retry with a fresh viewer when the model fails', async () => {
    const user = userEvent.setup();
    const { container } = render(<LegoHouseModel />);
    const model = container.querySelector('model-viewer');
    fireEvent(model, new Event('error'));
    expect(screen.getByRole('alert')).toHaveTextContent('NANDITO PA RIN ANG SULAT MO');
    await user.click(screen.getByRole('button', { name: 'SUBUKAN ULIT' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(container.querySelector('model-viewer')).not.toBe(model);
    expect(container.querySelector('model-viewer')).toHaveAttribute('src', '/public/models/lego-house.glb?retry=1');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  });
});
