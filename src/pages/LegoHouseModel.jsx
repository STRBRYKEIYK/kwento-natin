import { useEffect, useRef, useState } from 'react';
import poster from '../../public/menu/img/lego-house.svg';

const MODEL = `${import.meta.env.DEV ? '/public' : ''}/models/lego-house.glb`;
const ORBIT = '25deg 72deg 105%';

export default function LegoHouseModel() {
  const viewer = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const model = viewer.current;
    let cancelled = false;
    const onLoad = () => {
      if (!cancelled) { setLoaded(true); setFailed(false); setProgress(100); }
    };
    const onError = () => {
      if (!cancelled) { setLoaded(false); setFailed(true); }
    };
    const onProgress = event => {
      if (!cancelled) setProgress(Math.round(Math.max(0, Math.min(1, event.detail?.totalProgress || 0)) * 100));
    };
    model.addEventListener('load', onLoad);
    model.addEventListener('error', onError);
    model.addEventListener('progress', onProgress);
    import('@google/model-viewer').then(async ({ ModelViewerElement }) => {
      if (cancelled) return;
      ModelViewerElement.dracoDecoderLocation = import.meta.env.DEV ? '/public/models/draco/' : '/models/draco/';
      await customElements.whenDefined('model-viewer');
      if (!cancelled && model.loaded) onLoad();
    }).catch(onError);
    return () => {
      cancelled = true;
      model.removeEventListener('load', onLoad);
      model.removeEventListener('error', onError);
      model.removeEventListener('progress', onProgress);
    };
  }, [attempt]);

  function retry() {
    setLoaded(false);
    setFailed(false);
    setProgress(0);
    setAttempt(value => value + 1);
  }

  function resetView() {
    if (!viewer.current) return;
    viewer.current.cameraOrbit = ORBIT;
    viewer.current.fieldOfView = '30deg';
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) viewer.current.jumpCameraToGoal?.();
  }

  return <div className={`lh-3d-stage${loaded ? ' is-loaded' : ''}${failed ? ' is-failed' : ''}`}>
    <model-viewer key={attempt} ref={viewer} src={attempt ? `${MODEL}?retry=${attempt}` : MODEL} poster={poster}
      alt="ISANG MUNTING LEGO HOUSE — TAHANAN AT MGA PANGARAP NA BINUBUO NINA CHICO AT CHICA, ONE LITTLE PIECE AT A TIME."
      camera-controls disable-pan disable-zoom touch-action="pan-y" loading="eager" reveal="auto"
      camera-orbit={ORBIT} field-of-view="30deg" min-camera-orbit="auto 35deg auto" max-camera-orbit="auto 100deg auto"
      environment-image="neutral" exposure="1.1" shadow-intensity="0.8" shadow-softness="1" interaction-prompt="none">
      <div slot="progress-bar" />
    </model-viewer>
    {!loaded && !failed && <div className="lh-model-status" role="status">
      <span>INIHAHANDA ANG MUNTING TAHANAN… {progress}%</span>
      <progress value={progress} max="100" aria-label="PAGHAHANDA NG LEGO HOUSE" />
    </div>}
    {failed && <div className="lh-model-status" role="alert">
      <p>HINDI PA LUMITAW ANG TAHANAN. NANDITO PA RIN ANG SULAT MO, MAHAL.</p>
      <button type="button" onClick={retry}>SUBUKAN ULIT</button>
    </div>}
    <div className="lh-model-controls">
      <span>{loaded ? 'HILAIN PARA PAIKUTIN' : 'ONE LITTLE PIECE AT A TIME'}</span>
      <button type="button" onClick={resetView} disabled={!loaded}>IBALIK ANG TINGIN</button>
    </div>
  </div>;
}
