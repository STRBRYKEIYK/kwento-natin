import { useEffect, useRef, useState } from 'react';
import './PangakoRing.css';

const MODEL = `${import.meta.env.DEV ? '/public' : ''}/models/pangako-ring.glb`;
const DEFAULT_ORBIT = '75deg 75deg 105%';
const DEFAULT_FOV = '30deg';

export default function PangakoRing({ fallback = null }) {
  const viewerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const model = viewerRef.current;
    if (!model) return undefined;

    let cancelled = false;

    const onLoad = () => {
      if (cancelled) return;
      setLoaded(true);
      setFailed(false);
      setProgress(100);
    };

    const onError = () => {
      if (cancelled) return;
      setFailed(true);
      setLoaded(false);
    };

    const onProgress = (event) => {
      if (cancelled) return;
      const ratio = event.detail?.totalProgress ?? 0;
      setProgress(Math.max(0, Math.min(100, Math.round(ratio * 100))));
    };

    model.addEventListener('load', onLoad);
    model.addEventListener('error', onError);
    model.addEventListener('progress', onProgress);

    import('@google/model-viewer')
      .then(async (mod) => {
        if (cancelled) return;
        const ModelViewerElement = mod?.ModelViewerElement;
        if (ModelViewerElement) {
          ModelViewerElement.dracoDecoderLocation = import.meta.env.DEV
            ? '/public/models/draco/'
            : '/models/draco/';
        }
        if (typeof customElements !== 'undefined' && typeof customElements.whenDefined === 'function') {
          await customElements.whenDefined('model-viewer');
        }
        if (!cancelled && model.loaded) {
          onLoad();
        }
      })
      .catch(() => {
        if (!cancelled) onError();
      });

    return () => {
      cancelled = true;
      model.removeEventListener('load', onLoad);
      model.removeEventListener('error', onError);
      model.removeEventListener('progress', onProgress);
    };
  }, [attempt]);

  function handleRetry() {
    setFailed(false);
    setLoaded(false);
    setProgress(0);
    setAttempt((value) => value + 1);
  }

  function resetView() {
    const model = viewerRef.current;
    if (!model) return;
    model.cameraOrbit = DEFAULT_ORBIT;
    model.fieldOfView = DEFAULT_FOV;
    if (typeof model.jumpCameraToGoal === 'function') {
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reduced) model.jumpCameraToGoal();
    }
  }

  return (
    <div className={`pkr-viewer${loaded ? ' pkr-loaded' : ''}${failed ? ' pkr-failed' : ''}`}>
      <div className="pkr-canvas-wrap">
        {!loaded && fallback && (
          <div className="pkr-fallback">
            {fallback}
          </div>
        )}

        <model-viewer
          key={attempt}
          ref={viewerRef}
          className="pkr-model"
          src={MODEL}
          alt="MANIPIS AT MAKINTAB NA DILAW NA GINTONG OPEN RING NA MAY MALIIT NA BILOG NA SOLITAIRE DIAMOND SA GITNA NG PAGITAN — SIMBOLO NG MGA PANGAKO NINA CHICO AT CHICA."
          camera-controls
          disable-pan
          disable-zoom
          touch-action="pan-y"
          loading="eager"
          reveal="auto"
          camera-orbit={DEFAULT_ORBIT}
          field-of-view={DEFAULT_FOV}
          min-camera-orbit="auto 35deg auto"
          max-camera-orbit="auto 110deg auto"
          environment-image="neutral"
          exposure="1.15"
          shadow-intensity="0.85"
          shadow-softness="1"
          interaction-prompt="none"
        >
          <div slot="progress-bar" />
        </model-viewer>
      </div>

      {!loaded && !failed && (
        <div className="pkr-bar pkr-bar-loading" role="status" aria-live="polite">
          <div className="pkr-loading-row">
            <span>INIHAHANDA ANG 3D NA SINGSING…</span>
            <span className="pkr-pct">{progress}%</span>
          </div>
          <progress
            className="pkr-progress"
            value={progress}
            max="100"
            aria-label="PAGHAHANDA NG 3D NA SINGSING"
          />
        </div>
      )}

      {failed && (
        <div className="pkr-bar pkr-bar-error" role="alert">
          <div className="pkr-error-copy">
            <span>HINDI PA LUMITAW ANG 3D NA SINGSING.</span>
            <small>NANDITO PA RIN ANG MGA PANGAKO MO.</small>
          </div>
          <button type="button" className="pkr-retry-btn" onClick={handleRetry}>
            SUBUKAN ULIT
          </button>
        </div>
      )}

      {loaded && (
        <div className="pkr-bar pkr-bar-controls">
          <span className="pkr-hint">HILAIN PARA PAIKUTIN</span>
          <button type="button" className="pkr-reset-btn" onClick={resetView}>
            IBALIK ANG TINGIN
          </button>
        </div>
      )}
    </div>
  );
}
