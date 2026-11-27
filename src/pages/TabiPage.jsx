import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import poster from '../../public/menu/img/tabi.svg';
import '../library/styles.css';
import './TabiPage.css';

const MODEL = `${import.meta.env.DEV ? '/public' : ''}/models/chica-y-chico.glb?finish=soft-matte-v1`;

function Heart({ className = '' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20S3 14.8 3 8.6C3 3.5 9 2.4 12 6.6c3-4.2 9-3.1 9 2C21 14.8 12 20 12 20Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>;
}

export default function TabiPage() {
  const viewer = useRef(null);
  const opener = useRef(null);
  const letterHeading = useRef(null);
  const [opened, setOpened] = useState(false);
  const [holding, setHolding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const previous = document.title;
    document.title = '1:11 · TABI MUNA TAYO — PARA SA CHICAAA KO';
    return () => { document.title = previous; };
  }, []);

  useEffect(() => {
    const model = viewer.current;
    let cancelled = false;
    const onLoad = () => { setLoaded(true); setFailed(false); };
    const onError = () => { setFailed(true); setLoaded(false); };
    const onProgress = event => setProgress(Math.round((event.detail?.totalProgress || 0) * 100));
    model.addEventListener('load', onLoad);
    model.addEventListener('error', onError);
    model.addEventListener('progress', onProgress);
    import('@google/model-viewer').then(async ({ ModelViewerElement }) => {
      ModelViewerElement.dracoDecoderLocation = import.meta.env.DEV ? '/public/models/draco/' : '/models/draco/';
      await customElements.whenDefined('model-viewer');
      if (!cancelled && model.loaded) onLoad();
    }).catch(() => { if (!cancelled) onError(); });
    return () => {
      cancelled = true;
      model.removeEventListener('load', onLoad);
      model.removeEventListener('error', onError);
      model.removeEventListener('progress', onProgress);
    };
  }, [attempt]);

  useEffect(() => {
    if (opened) letterHeading.current?.focus({ preventScroll: true });
  }, [opened]);

  function foldLetter() {
    setOpened(false);
    opener.current?.focus({ preventScroll: true });
  }

  function resetView() {
    if (viewer.current) viewer.current.cameraOrbit = '0deg 78deg 105%';
  }

  return <div className="tabi" lang="tl">
    <div className="tb-shell">
      <header className="tb-nav">
        <Link to="/" className="tb-brand">Library ni Chico<span>Para kay Chica</span></Link>
        <span className="tb-nav-whisper">Isang sandaling para sa atin.</span>
        <span className="tb-nav-time">1:11 <Heart /></span>
      </header>

      <main className="tb-main">
        <section className="tb-visual" aria-label="Sina Chica at Chico, magkatabi">
          <div className={`tb-stage${holding ? ' tb-holding' : ''}`}>
            <div className="tb-stage-top"><span>CHICA Y CHICO</span><Heart /></div>
            <span className="tb-stage-clock" aria-hidden="true">1:11</span>
            <div className="tb-halo" aria-hidden="true" />
            <model-viewer key={attempt} ref={viewer} src={MODEL} poster={poster}
              alt="Magkatabing sina Chica at Chico: may salamin, sheep hat si Chica at capybara hat si Chico."
              camera-controls disable-pan disable-zoom touch-action="pan-y" loading="eager" reveal="auto"
              camera-orbit="0deg 78deg 105%" field-of-view="30deg" min-camera-orbit="auto 45deg auto" max-camera-orbit="auto 100deg auto"
              environment-image="neutral" exposure="1.1" shadow-intensity="0.8" shadow-softness="1" interaction-prompt="none">
              <div slot="progress-bar" />
            </model-viewer>
            {!loaded && !failed && <div className="tb-loading" role="status"><Heart /><span>Sandali lang, magtatabi na tayo…</span><progress value={progress} max="100" aria-label="Paghahanda ng munting tayo" /></div>}
            {failed && <div className="tb-loading tb-error" role="alert"><Heart /><p>Hindi pa lumitaw ang munting tayo.</p><button type="button" onClick={() => { setFailed(false); setProgress(0); setAttempt(value => value + 1); }}>Subukan ulit</button><small>Nandito pa rin ang sulat mo, mahal.</small></div>}
            <div className="tb-dock"><span>{loaded ? 'Hilain para paikutin' : 'Tayo, magkatabi.'}</span><button type="button" onClick={resetView} disabled={!loaded}>Ibalik ang tingin</button></div>
          </div>
          <p className="tb-visual-caption"><span>IKAW AT AKO, SA ISANG MUNTING SANDALI.</span><span>dito ka sa tabi ko. ♡</span></p>
        </section>

        <div className="tb-copy">
          <p className="tb-eyebrow">1:11 · MULA SA CHICOOO MO</p>
          <h1>Sa oras na ’to,<br /><em>tabi muna tayo.</em></h1>
          <p className="tb-intro">Chicaaa ko, may munting 1:11 akong ginawa para sa’yo. Tayo, magkatabi, kasama ang lahat ng lambing ng Chicooo mo.</p>
          <p className="tb-handwritten">Kahit dito muna, magkatabi tayo.</p>
          <button ref={opener} type="button" className="tb-primary" aria-expanded={opened} aria-controls="tb-letter" onClick={() => opened ? foldLetter() : setOpened(true)}><Heart />{opened ? 'Itupi muna ang sulat' : 'Buksan ang sulat'}</button>
          <p className="tb-under-button">MAY MUNTING LAMBING ANG CHICOOO MO.</p>

          {opened && <article id="tb-letter" className="tb-letter" aria-labelledby="tb-letter-heading">
            <p className="tb-letter-label">ISANG MALUMANAY NA 1:11</p>
            <h2 id="tb-letter-heading" ref={letterHeading} tabIndex={-1}>CHICAAA KO,</h2>
            <p>1:11 PO, ASAWA KO. KUNG KATABI LANG KITA NGAYON, IAABOT KO MUNA ANG KAMAY KO. KUNG GUSTO MO, PUWEDE KANG SUMANDAL. PUWEDE RIN TAYONG TAHIMIK LANG. GUSTO KONG MAKASAMA KA SA PARAANG KOMPORTABLE KA.</p>
            <p>SALAMAT SA PAGBABAHAGI MO NG MGA KWENTO AT NARARAMDAMAN MO SA’KIN, MAHAL. GUSTO KITANG PATULOY NA MAKILALA, PAKINGGAN, AT ALAGAAN. SA MGA SIMPLENG KUMUSTA, SA ORAS NA INILALAAN KO PARA SA’YO, AT SA MGA MUNTING GINAGAWA KO, GUSTO KONG MARAMDAMAN MONG MAHAL NA MAHAL KITA.</p>
            <p>KAPAG GUSTO MONG MAGKWENTO, MAKIKINIG AKO. KAPAG GUSTO MONG MAGPAHINGA, TABI MUNA TAYO. ANG SARAP ISIPIN NA PUWEDE TAYONG MAGING MASAYA SA MGA SIMPLENG SANDALI—MAGKAHAWAK ANG KAMAY, NAGKUKWENTUHAN, O TAHIMIK LANG NA MAGKASAMA.</p>
            <p>ITONG MUNTING TAYO, MAGKATABI AT NAKANGITI, IPINAAALALA SA’KIN KUNG GAANO KAHALAGA ANG MGA SIMPLENG SANDALING KASAMA KA. YUNG PAGHAWAK SA KAMAY MO, PAKIKINIG SA KWENTO MO, AT PAG-AALAGANG GUSTO KONG IPARAMDAM SA MGA GINAGAWA KO.</p>
            <p>SA 1:11 NA ’TO, SANA MAY MUNTING LAMBING NA MAKARATING SA’YO. ISANG HALIK SA NOO, ISANG YAKAP, AT NGITING GALING SA CHICOOO MO. NANDITO LANG ITONG SULAT, AT ANG PAGMAMAHAL KO, KAPAG GUSTO MONG BALIKAN. EXCITED NA AKO SA SUSUNOD NATING PAGKIKITA, CHICAAA KO. ♡</p>
            <p className="tb-signature">MAHAL NA MAHAL KITA, CHICAAA KO.<span>YOUR CHICOOO ♡</span></p>
            <button type="button" className="tb-text-button" onClick={foldLetter}>Itupi ang sulat</button>
          </article>}

          <div className="tb-hold">
            <button type="button" aria-pressed={holding} className="tb-hold-button" onClick={() => setHolding(value => !value)}><Heart />{holding ? 'Magkahawak na tayo' : 'Hawak-kamay muna?'}</button>
            <p role="status">{holding ? 'Dahan-dahan lang, mahal. Nandito ang kamay ko.' : 'Isang munting lambing, kung gusto mo.'}</p>
          </div>
        </div>
      </main>
      <footer className="tb-footer"><span>1:11 · PARA SA CHICAAA KO</span><span>Sa’yo ang sandaling ’to. <Heart /></span></footer>
    </div>
  </div>;
}
