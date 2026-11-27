import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import BiyahePage from './BiyahePage.jsx';
import BiyaheMotorcycle from './BiyaheMotorcycle.jsx';

vi.mock('./motorcycleViewerRuntime.js', () => ({ loadMotorcycleViewer: async () => ({ ModelViewerElement: class {} }) }));

describe('ride controls connected to the actual motorcycle stage', () => {
  it('updates the real scene through repeated stop/resume clicks without reloading the GLB', async () => {
    const user = userEvent.setup();
    const { container } = render(<StrictMode><MemoryRouter>
      <BiyahePage motorcycleStage={({ mode, moment }) => <BiyaheMotorcycle mode={mode} moment={moment} />} />
    </MemoryRouter></StrictMode>);
    const viewer = container.querySelector('model-viewer');
    expect(viewer).toBeInTheDocument();
    fireEvent(viewer, new Event('load'));
    const scene = () => container.querySelector('.bh-ride-scene');
    expect(scene()).toHaveAttribute('data-mode', 'ride');
    for (let cycle = 0; cycle < 3; cycle++) {
      await user.click(screen.getByRole('button', { name: 'HINTO MUNA SA VIEW' }));
      expect(scene()).toHaveAttribute('data-mode', 'pause');
      expect(scene()).toHaveAttribute('data-moment', 'magandang-view');
      expect(viewer).toHaveAttribute('camera-controls');
      viewer.cameraOrbit = '20deg 90deg 150%';
      viewer.fieldOfView = '45deg';
      viewer.jumpCameraToGoal = vi.fn();
      await user.click(screen.getByRole('button', { name: 'TULOY SA BIYAHE' }));
      expect(scene()).toHaveAttribute('data-mode', 'ride');
      expect(scene()).toHaveAttribute('data-moment', 'maagang-alis');
      expect(container.querySelector('model-viewer')).toBe(viewer);
      expect(viewer).not.toHaveAttribute('camera-controls');
      expect(viewer.cameraOrbit).toBe('180deg 75deg 105%');
      expect(viewer.fieldOfView).toBe('30deg');
      expect(viewer.jumpCameraToGoal).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'IBALIK ANG TINGIN' })).toBeEnabled();
    }
    for (const [code, moment] of [['02', 'munting-kainan'], ['04', 'extra-yakap']]) {
      await user.click(screen.getByRole('button', { name: new RegExp(`SANDALI ${code}`) }));
      expect(scene()).toHaveAttribute('data-mode', 'pause');
      expect(scene()).toHaveAttribute('data-moment', moment);
      expect(container.querySelector('.bh-stage-dock')).toHaveTextContent(code === '02' ? 'HINTO SA MUNTING KAINAN' : 'EXTRA YAKAP SA PARK');
      expect(container.querySelector('.bh-stage-dock')).not.toHaveTextContent('TANGGAL HELMET');
      await user.click(screen.getByRole('button', { name: 'HINTO SA MAGANDANG VIEW', exact: true }));
      expect(scene()).toHaveAttribute('data-moment', 'magandang-view');
    }
    expect(container.querySelector('model-viewer')).toBe(viewer);
    expect(viewer).toHaveAttribute('src', '/public/models/biyahe-scooter.glb');
  });
});
