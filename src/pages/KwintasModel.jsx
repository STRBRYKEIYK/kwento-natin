import { useEffect, useRef, useState } from 'react';

const MODEL = `${import.meta.env.DEV ? '/public' : ''}/models/kwintas.glb`;
export const NECKLACE_ORBIT = '0deg 25deg 105%';

export default function KwintasModel() {
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
    viewer.current.cameraOrbit = NECKLACE_ORBIT;
    viewer.current.fieldOfView = '30deg';
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) viewer.current.jumpCameraToGoal?.();
  }

  return <div className={`kw-model-stage${loaded ? ' is-loaded' : ''}${failed ? ' is-failed' : ''}`}>
    <model-viewer key={attempt} ref={viewer} class="kw-model-viewer"
      src={attempt ? `${MODEL}?retry=${attempt}` : MODEL}
      alt="ANG DALAWANG MONOGRAM NA KWINTAS NINA CHICO AT CHICA, MAGKATABI."
      camera-controls disable-pan touch-action="pan-y" loading="lazy" reveal="auto"
      camera-orbit={NECKLACE_ORBIT} field-of-view="30deg"
      min-camera-orbit="auto 5deg 60%" max-camera-orbit="auto 85deg 160%"
      environment-image="neutral" exposure="1.1" shadow-intensity="0.6" shadow-softness="1" interaction-prompt="none">
      <div slot="progress-bar" />
    </model-viewer>
    {!loaded && !failed && <div className="kw-model-status" role="status">
      <span>INIHAHANDA ANG KWINTAS NATIN… {progress}%</span>
      <progress value={progress} max="100" aria-label="PAGHAHANDA NG KWINTAS" />
    </div>}
    {failed && <div className="kw-model-status" role="alert">
      <p>HINDI LUMITAW ANG 3D KWINTAS. MAAARI MO PA RING TIGNAN ANG MGA LITRATO AT BASAHIN ANG KWENTO NATIN.</p>
      <button type="button" onClick={retry}>SUBUKAN ULIT</button>
    </div>}
    <div className="kw-model-controls">
      <span>{loaded ? 'HILAIN PARA PAIKUTIN · KURUTIN PARA ILAPIT' : 'DALAWANG PANGALAN, MALAPIT SA PUSO'}</span>
      <button type="button" onClick={resetView} disabled={!loaded}>IBALIK ANG TINGIN</button>
    </div>
  </div>;
}
