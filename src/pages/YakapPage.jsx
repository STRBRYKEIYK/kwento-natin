import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import modelUrl from '../../public/models/yakap-delivery.glb?url';
import posterUrl from '../../public/models/yakap-poster.png';
import './YakapPage.css';

const MODEL = modelUrl;
const HUGS = [
  'Isang mahigpit na yakap para sa Chicaaa ko. Dito ka muna, asawa ko.',
  'Isa pa po. Yung medyo matagal, hanggang gumaan ang araw mo.',
  'At isa pa. Hindi nauubos ang lambing ng Chico mo para sa’yo.',
];

// Load the renderer only on this page; the rest of the Library stays light.
export async function loadYakapViewer() {
  const { ModelViewerElement } = await import('@google/model-viewer');
  ModelViewerElement.dracoDecoderLocation = import.meta.env.DEV ? '/public/models/draco/' : '/models/draco/';
  return customElements.whenDefined('model-viewer');
}

function Heart({ className = '', ...props }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M12 20.5S3 15.1 3 8.9C3 3.8 9.1 2 12 6.6 14.9 2 21 3.8 21 8.9c0 6.2-9 11.6-9 11.6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>;
}

export default function YakapPage() {
  const viewer = useRef(null);
  const noteTitle = useRef(null);
  const [opened, setOpened] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hugs, setHugs] = useState(0);

  useEffect(() => {
    const oldTitle = document.title;
    const theme = document.querySelector('meta[name="theme-color"]');
    const oldTheme = theme?.content;
    document.title = '12:12 · Yakap — Para sa Chicaaa ko';
    if (theme) theme.content = '#281b29';
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => {
      document.title = oldTitle;
      if (theme) theme.content = oldTheme;
      preference.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const model = viewer.current;
    const onLoad = () => { setLoaded(true); setFailed(false); };
    const onError = () => { setLoaded(false); setFailed(true); };
    const onProgress = event => setProgress(Math.round((event.detail?.totalProgress || 0) * 100));
    model.addEventListener('load', onLoad);
    model.addEventListener('error', onError);
    model.addEventListener('progress', onProgress);
    loadYakapViewer().then(() => {
      if (!cancelled && model.loaded) onLoad();
    }).catch(() => { if (!cancelled) onError(); });
    return () => {
      cancelled = true;
      model.removeEventListener('load', onLoad);
      model.removeEventListener('error', onError);
      model.removeEventListener('progress', onProgress);
    };
  }, [attempt]);

  useEffect(() => { if (opened) noteTitle.current?.focus({ preventScroll: true }); }, [opened]);

  const resetView = () => {
    const model = viewer.current;
    model.resetTurntableRotation?.();
    model.cameraOrbit = '-15deg 78deg 105%';
    model.cameraTarget = 'auto auto auto';
  };

  return (
    <div className={`yakap${opened ? ' yk-opened' : ''}`}>
      <div className="yk-grain" aria-hidden="true" />
      <div className="yk-shell">
        <nav className="yk-nav" aria-label="Navigation">
          <Link to="/" className="yk-library">LIBRARY NI CHICO<span>PARA KAY CHICA</span></Link>
          <span className="yk-nav-note">A little closer, even from here.</span>
          <span className="yk-time">12:12 <Heart /></span>
        </nav>

        <main className="yk-main">
          <div className="yk-copy">
            <p className="yk-eyebrow"><span /> A SPECIAL DELIVERY · 12:12</p>
            {!opened ? <>
              <h1>May yakap kang<br /><em>parating.</em></h1>
              <p className="yk-intro">Chicaaa ko, may pinadala po akong munting kasama. May yakap siyang puso, may dalang mga tulips… at lahat ng lambing na gusto kong ibigay sa’yo.</p>
              <p className="yk-handwritten">Psst. Galing sa Chico mo. ♡</p>
              <button type="button" className="yk-primary" onClick={() => setOpened(true)}><Heart /> Buksan ang yakap</button>
              <p className="yk-under-button">PARA SA’YO LANG, ASAWA KO.</p>
            </> : <>
              <h1>Sa lahat ng oras,<br /><em>sa’yo ang yakap ko.</em></h1>
              <article className="yk-letter" aria-labelledby="yk-note-title">
                <span className="yk-letter-stamp" aria-hidden="true"><Heart /></span>
                <p className="yk-letter-label">ISANG MUNTING SULAT · MULA KAY CHICO</p>
                <h2 id="yk-note-title" ref={noteTitle} tabIndex={-1}>CHICAAAA KOOOO,</h2>
                <p>12:12 POOOO, ASAWAAAA KOOOO. MAY MUNTING DELIVERY PO AKO PARA SA’YOOOO: ISANG CAPYBARA NA MAY YAKAP NA PUSO AT MAY DALANG MGA TULIPS. LAHAT PO ’YAN, PARA SA PINAKAPABORITO KONG TAO. IKAW PO ’YUN, MI CHICAAAA. ♡</p>
                <p>KUNG PUWEDE LANG PONG IPADAAN SA SCREEN ANG ISANG YAKAP, YUNG MAHIGPIT AT MEDYO MATAGAL, MATAGAL NA PO KITANG NIYAKAP. YUNG PUWEDE KANG SUMANDAL MUNA, HUMINGA NANG MALALIM, AT MAGPAHINGA SA TABI KO. KAYA SI MUNTING CAPYBARA MUNA ANG PINADALA KO, KASAMA ANG LAHAT NG LAMBING NG CHICO MOOOO.</p>
                <p>YUNG MGA TULIPS, PARA PO SA NGITI MONG GUSTO KONG MAKITA PALAGI. SANA KAHIT DITO MUNA, MARAMDAMAN MONG MAY NAG-IISIP KUNG PAANO KA MAPAPANGITI. MAY TAONG MASAYANG MAGLAAN NG ORAS PARA GUMAWA NG MUNTING BAGAY NA PARA SA’YO LANG.</p>
                <p>SALAMAT PO SA MGA KWENTO MO, SA TAWA MO, SA MGA SIMPLENG KUMUSTAHAN NATIN, AT SA MGA ALAALANG PATULOY NATING BINUBUO. ANG SARAP BALIKAN NG MGA ARAW NATIN, ASAWA KO. KAHIT YUNG MGA MALIIT NA SANDALI, MAY LUGAR SA PUSO KO KASI KASAMA KITA.</p>
                <p>GUSTO KO PONG MASUNDAN PA ’YUN NG MARAMING LAKAD, MARAMING KAIN, MARAMING KWENTUHAN, AT MGA TAHIMIK NA SANDALING MASAYA TAYONG MAGKATABI. GUSTO KONG PATULOY KANG MAKILALA AT MAHALIN SA MGA PARAANG MARAMDAMAN MO SA ARAW-ARAW.</p>
                <p>SA 12:12 NA ITO, ANG HILING KO PO AY MAY KONTING GAAN NA MAKARATING SA’YO. KAPAG PAGOD KA, SANA MAY PAHINGA. KAPAG MARAMI KANG INIISIP, SANA MAY KATAHIMIKAN. AT KAPAG KAILANGAN MO NG LAMBING, SANA MAALALA MONG MAY YAKAP ANG CHICO MO NA NAKATABI PARA SA’YO.</p>
                <p>HAWAK NI CAPYBARA YUNG PUSO KO, AT SA’YO PO TALAGA ’YAN, ASAWAAAA. BALIKAN MO LANG PO SIYA KAPAG GUSTO MO NG MUNTING KASAMA. MAY MGA BULAKLAK AT ISANG YAKAP DITO NA PALAGING PARA SA’YOOOO.</p>
                <p className="yk-signature">MAHAL NA MAHAL KITAAAA, CHICAAAA KOOOO.<br /><span>WITH ALL MY LOVE, YOUR CHICOOO ♡</span></p>
              </article>
              <div className="yk-hug-actions">
                <button type="button" className="yk-primary" onClick={() => setHugs(value => value + 1)}><Heart /> {hugs ? 'Isa pang yakap' : 'Yakap, please'}</button>
                <button type="button" className="yk-text-button" onClick={() => setOpened(false)}>Itupi muna ang sulat</button>
              </div>
              <p className="yk-hug-message" role="status">{hugs ? HUGS[(hugs - 1) % HUGS.length] : 'Isang yakap, kahit dito muna.'}</p>
            </>}
          </div>

          <section className="yk-visual" aria-label="Ang capybara na may yakap na puso at dalang tulips">
            <div className="yk-scene">
              <div className="yk-halo" aria-hidden="true" />
              <div className="yk-orbit yk-orbit-one" aria-hidden="true" />
              <div className="yk-orbit yk-orbit-two" aria-hidden="true" />
              <p className="yk-scene-whisper">ingatan mo ’tong puso ko, ha?</p>
              <Heart className="yk-doodle yk-doodle-one" /><Heart className="yk-doodle yk-doodle-two" />
              <div className="yk-podium" aria-hidden="true"><span /></div>
              <model-viewer key={attempt} ref={viewer} src={MODEL} poster={posterUrl} alt="Isang malambot na capybara, yakap ang pulang puso, may berdeng backpack at may hawak na bouquet ng tulips — para sa Chicaaa ko."
                camera-controls disable-zoom disable-pan touch-action="pan-y" loading="eager" reveal="auto"
                camera-orbit="-15deg 78deg 105%" field-of-view="30deg" min-camera-orbit="auto 45deg auto" max-camera-orbit="auto 100deg auto"
                auto-rotate={loaded && spinning && !reducedMotion && !failed} auto-rotate-delay="8000" rotation-per-second="6deg"
                environment-image="neutral" exposure="1.15" shadow-intensity="1" shadow-softness="1" interaction-prompt="none">
                <div slot="progress-bar" />
              </model-viewer>
              {!loaded && !failed && <div className="yk-loading" role="status"><Heart /><span>Paparating na ang yakap…</span><progress max="100" value={progress} aria-label="Pag-load ng capybara" /></div>}
              {failed && <div className="yk-loading yk-error" role="alert"><Heart /><p>Medyo nahirapang makarating ang munting kasama natin.</p><button type="button" className="yk-primary" onClick={() => { setFailed(false); setLoaded(false); setProgress(0); setAttempt(value => value + 1); }}>Subukan ulit</button><span>Nandito pa rin ang sulat at yakap mo.</span></div>}
              <span className="yk-delivery-tag">HANDLE WITH LOVE<Heart /><small>FOR MY CHICAAA</small></span>
              {hugs > 0 && <div key={hugs} className="yk-heart-burst" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <Heart key={i} style={{ '--i': i }} />)}</div>}
            </div>
            <div className="yk-model-controls">
              <p>{loaded ? 'HILAHIN PARA PAIKUTIN · SA’YO LAHAT NG ANGULO' : 'ISANG MUNTING KASAMA, PARA SA’YO'}</p>
              <div>
                <button type="button" disabled={!loaded || reducedMotion || failed} aria-pressed={spinning && !reducedMotion} onClick={() => setSpinning(value => !value)}>{spinning && !reducedMotion ? 'I-pause ang ikot' : 'Paikutin'}</button>
                <span aria-hidden="true">/</span><button type="button" disabled={!loaded || failed} onClick={resetView}>Ibalik ang tingin</button>
              </div>
            </div>
          </section>
        </main>

        <footer className="yk-footer"><span>12:12 · ISANG YAKAP NA PUWEDE MONG BALIKAN.</span><span>WITH ALL MY LOVE, YOUR CHICOOO <Heart /></span></footer>
      </div>
    </div>
  );
}
