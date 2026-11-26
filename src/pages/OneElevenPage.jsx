import { useEffect, useRef, useState } from 'react';
import { DATES, imgSrc, thumbSrc } from './petsaData.js';
import { LibraryLayout } from '../library/LibraryLayout.jsx';
import { BackLink } from '../library/BackLink.jsx';
import { Ticker } from '../library/Ticker.jsx';
import './OneElevenPage.css';

const dateNotes = {
  '2026-08-06': ['Red ka. Black ako. Tayo ulit.', 'Spider-Man, parehong jacket, at ikaw sa katabing upuan. Dito nagsimula itong labing-isang pagkikita natin. Kung uulitin ko ang gabing ’yon, doon pa rin ako uupo.', 'Sina Chico at Chica sa sinehan noong Agosto 6'],
  '2026-08-13': ['Isang linggo, gusto na ulit kitang makita.', 'Pareho tayong may salamin, pareho pa ang pose. Ang saya nitong litrato natin—nakangiti lang, magkatabi. Gusto ko pa ng maraming ganitong araw kasama ka.', 'Magkatabi sina Chico at Chica, parehong nakapatong ang baba sa kamay'],
  '2026-09-04': ['Birthday girl ko, kasama na kita.', 'Late birthday celebration mo. May 24 na tulips, si Chicobara, at mga litrato nating gusto kong itago. Ang saya kong naging bahagi ako ng celebration mo, asawa.', 'Sina Chico at Chica sa late birthday celebration noong Setyembre 4'],
  '2026-09-11': ['May dala na tayong pangalan ng isa’t isa.', 'Late monthsary natin, mga kwintas, si Chicabara at yung crochet flowers mo. Ang daming regalo noong araw na ’yon. Pero yung oras na magkasama tayo, gusto ko ring itago rito.', 'Selfie nina Chico at Chica noong Setyembre 11'],
  '2026-09-22': ['Magkatabi ulit. Ngiti ulit.', 'Kapag binabalikan ko itong litrato natin, napapangiti ako. Ang saya sa mukha ko, tapos ikaw nasa tabi ko. Gusto kong magkaroon pa tayo ng maraming ganitong kuha.', 'Magkatabing nakangiti sina Chico at Chica noong Setyembre 22'],
  '2026-10-01': ['May munting ilaw na magpapaalala sa ’yo.', 'Capybara lamp day natin. Si mini Chicabara, nagpapaliwanag. Ang cute lang na pati sa mga bagay sa paligid natin, may mga paalala na ng isa’t isa.', 'Selfie nina Chico at Chica noong capybara lamp day'],
  '2026-10-09': ['Pati Vicks inhaler, kasama sa kakulitan.', 'Gusto ko yung ganito tayo. Walang kailangang magandang pose—magkasama lang, tapos pati Vicks inhaler nagiging kalokohan na natin. Kapag binabalikan ko ’to, gusto na ulit kitang makasama.', 'Sina Chico at Chica na parehong may Vicks inhaler sa ilong'],
  '2026-10-17': ['Yung lambing na gusto kong balikan.', 'Isa sa pinaka-memorable nating araw. Nakikita ko itong kiss natin, tapos gusto kong bumalik sa sandaling katabi kita. Sa susunod nating pagkikita, may yakap ulit akong nakaabang.', 'Hinahalikan ni Chico si Chica sa pisngi noong Oktubre 17'],
  '2026-10-20': ['Yung saya na nauwi natin pareho.', 'Sabi mo, sobrang happy ka that day. Ako rin, asawa. Yung mga selfie, kiss, at yakap mo—dala ko pa rin yung saya kapag tinitingnan ko itong mga litrato natin.', 'Yakap ni Chica si Chico mula sa likod habang nakangiti si Chico'],
  '2026-10-29': ['Yung ngiti ko, ikaw ang dahilan.', 'Photobooth natin, mga makukulit na sombrero, at dalawang set ng litrato. Sa dami ng frame, ito yung isa sa gusto kong itago: may kiss mo sa pisngi, at hindi ko maitago yung saya.', 'Hinahalikan ni Chica si Chico sa pisngi habang nakangiti siya sa photobooth'],
  '2026-11-17': ['Labing-isang pagkikita. Gusto ko pa.', 'Binondo date natin. Ito muna ang pinakahuling pahina sa labing-isang pagkikita natin. Pero gusto ko nang madagdagan: marami pang lakad, marami pang litrato, marami pang araw na kasama ka.', 'Magkatabi sina Chico at Chica sa Binondo noong Nobyembre 17'],
};

const selectedPhotoPositions = [3, 20, 2, 34, 2, 12, 45, 10, 10, 15, 28];

export const oneElevenMemories = DATES.map((date, index) => {
  const [title, note, alt] = dateNotes[date.date];
  const file = date.files[selectedPhotoPositions[index] - 1];
  return { id: date.date, iso: date.date, date: date.label, title, note, alt, file,
    src: imgSrc(date, file), thumb: thumbSrc(date, file), albumHref: `/menu/petsa?d=${index}` };
});

export default function OneElevenPage() {
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const heading = useRef(null);
  const dialog = useRef(null);
  const memory = oneElevenMemories[active];

  useEffect(() => {
    const previous = document.title;
    document.title = '1:11 · ANG PABORITO KONG BALIKAN, IKAW';
    return () => { document.title = previous; };
  }, []);

  useEffect(() => {
    if (opened) heading.current?.focus({ preventScroll: true });
  }, [opened, letterOpen, active]);

  useEffect(() => { setImageFailed(false); }, [active]);

  function select(index) {
    setActive(index);
    setLetterOpen(false);
  }

  return (
    <LibraryLayout>
    <div className="one-eleven" lang="tl">
      <Ticker items={['PARA SA CHICAAA KO <b>♥</b>', '1:11 · LABING-ISANG PAGKIKITA', 'MULA AGOSTO 6 HANGGANG NOBYEMBRE 17', 'IKAW SA BAWAT ISA <b>♥</b>']} />
    <main className="oe-shell">
      <header className="oe-topbar">
        <BackLink />
        <span>PARA SA CHICAAA KO</span>
        <span className="oe-time">1:11</span>
      </header>

      {!opened ? (
        <section className="oe-cover">
          <div className="oe-cover-photos" aria-hidden="true">
            {[9, 0, 8].map((index, i) => <div className={`oe-print oe-print-${i}`} key={index}>
              <img src={oneElevenMemories[index].src} alt="" />
              <span>{['tayo, sa bawat frame', 'yung simula ulit', 'pahinga ko, ikaw'][i]}</span>
            </div>)}
          </div>
          <div className="oe-cover-copy">
            <div className="oe-cover-clock" aria-hidden="true">1:11<span>SA BAWAT ORAS, IKAW.</span></div>
            <p className="oe-eyebrow">1:11 · LABING-ISANG PAGKIKITA NATIN.</p>
            <h1 className="lib-h1">Ang paborito kong<br />balikan, <em>ikaw.</em></h1>
            <p className="oe-intro">Mula Agosto 6 hanggang Nobyembre 17.<br />Labing-isang araw na nakasama kita.<br />Samahan mo ’kong balikan, asawa?</p>
            <button className="oe-primary" type="button" onClick={() => setOpened(true)}>Buksan ang mga alaala <span aria-hidden="true">♡</span></button>
            <p className="oe-footnote">Dahan-dahan lang, asawa. Sa ’yo ang oras na ’to.</p>
          </div>
          <span className="oe-cover-sign">with love, your Chicooo</span>
        </section>
      ) : (
        <section className="oe-open" aria-label="Mga alaala natin">
          <div className="oe-reading-header">
            <p className="oe-eyebrow">{letterOpen ? 'AT SA LAHAT NG SUSUNOD PA' : 'LABING-ISANG PAGKIKITA NATIN'}</p>
            <span>{letterOpen ? 'ISANG MUNTING LIHAM' : `PAGKIKITA ${String(active + 1).padStart(2, '0')} / 11`}</span>
          </div>

          {letterOpen ? (
            <article className="oe-letter">
              <div className="oe-letter-mark" aria-hidden="true">1:11</div>
              <h2 ref={heading} tabIndex={-1}>Asawa kooo,</h2>
              <p>Labing-isang pagkikita. Mula Agosto 6 hanggang Nobyembre 17, may labing-isang petsa na pwede nating balikan dito. Sa bawat isa, may ibang litrato, ibang pose, at panibagong dahilan para gustuhin kong makita ka ulit.</p>
              <p>Ang sarap lang balikan, ’no? Yung sine, mga bulaklak, kakulitan, at mga yakap na ayaw ko pang bitawan.</p>
              <p>Habang tinitingnan ko ulit itong mga litrato, naaalala ko yung maliliit na detalye natin. Yung red at black na jacket sa sinehan. Yung 24 na tulips at si Chicobara. Yung mga kwintas na may dala nating pangalan ng isa’t isa. Ang dami palang paraan para maalala kita kahit hindi kita katabi.</p>
              <p>Pinili ko itong mga litrato kasi gusto kong maalala mo kung gaano ako kasaya na kasama kita. Kahit sa mga araw na wala tayong bagong picture, ikaw pa rin ang gusto kong kausap, kakulitan, at katabi.</p>
              <p>Naaalala ko yung sinabi mong sobrang happy ka noong Oktubre 20. Ako rin, asawa. Yung yakap mo, yung mga selfie natin, pati yung pag-aalala hanggang makauwi tayo—ang sarap isipin na may araw tayong pareho nating inuwiang masaya.</p>
              <p>Tapos yung photobooth natin. Iba-ibang sombrero, iba-ibang pose, pero ikaw lang yung gusto kong katabi sa bawat frame. Kahit yung mga makulit nating litrato, gusto kong itago. Kasi tayo ’yon. Masaya, malambing, at minsan hindi talaga kayang magseryoso.</p>
              <p>Salamat sa oras mo, sa pakikinig sa mga kanta ko, sa mga tawag, at sa mga simpleng paalala na magpahinga at kumain. Napapansin ko ’yon, mahal. Gusto ko ring maiparamdam sa ’yo yung pag-aalagang palagi mong ibinibigay sa ’kin.</p>
              <p>Hindi man magkalapit ang Pandacan at Angono, gusto kong maramdaman mong may kasama ka. May Chicooo kang gustong makinig sa kwento ng araw mo, gustong makita kang nakangiti, at gustong makasama ka ulit sa susunod nating date.</p>
              <p>Para sa 1:11 na ’to, gusto lang kitang sabihan ulit: mahal na mahal kita. Salamat sa mga alaalang ’to, Chicaaa ko. Gusto ko pa ng maraming lakad, maraming tawa, maraming yakap, at maraming picture na hindi natin mapili kung alin ang pinaka-favorite.</p>
              <p>At habang hinihintay natin yung susunod na pagkikita, nandito muna itong munting lugar para sa ’tin. Balikan mo kapag namimiss mo ’ko. Ako, sigurado akong babalikan ko rin ’to—kasi nasa bawat litrato yung taong gusto ko pang makasama sa maraming araw na darating.</p>
              <p className="oe-handwriting">Sa susunod nating picture,<br />tabi ulit tayo, ha?</p>
              <p className="oe-signature">Your Chicooo <span aria-hidden="true">♡</span></p>
              <button className="oe-secondary" type="button" onClick={() => select(0)}>Balikan ulit natin</button>
            </article>
          ) : (
            <>
              <div className="oe-memory" key={memory.id}>
                <figure className="oe-photo">
                  {imageFailed ? <div className="oe-image-error"><p>Hindi nag-load ang litrato.</p><button type="button" onClick={() => setImageFailed(false)}>Subukan ulit</button></div> :
                    <button className="oe-photo-button" type="button" onClick={() => dialog.current?.showModal()} aria-label={`Palakihin ang litrato: ${memory.title}`}>
                      <img src={memory.src} alt={memory.alt} onError={() => setImageFailed(true)} />
                      <span>I-TAP PARA PALAKIHIN</span>
                    </button>}
                  <figcaption><time dateTime={memory.iso}>{memory.date}</time></figcaption>
                </figure>
                <div className="oe-memory-copy">
                  <span className="oe-memory-number" aria-hidden="true">{String(active + 1).padStart(2, '0')}</span>
                  <h2 ref={heading} tabIndex={-1}>{memory.title}</h2>
                  <p>{memory.note}</p>
                  <a className="oe-album-link" href={memory.albumHref} target="_blank" rel="noopener noreferrer">Buksan ang buong album <span className="oe-sr-only">sa bagong tab</span></a>
                  <div className="oe-navigation">
                    <button className="oe-secondary" type="button" disabled={active === 0} onClick={() => select(active - 1)}>Nauna</button>
                    <button className="oe-primary" type="button" onClick={() => active === 10 ? setLetterOpen(true) : select(active + 1)}>{active === 10 ? 'May sulat pa ’ko sa ’yo' : 'Isa pang alaala'}</button>
                  </div>
                </div>
              </div>
              <nav className="oe-filmstrip" aria-label="Pumili ng alaala">
                {oneElevenMemories.map((photo, index) => <button type="button" key={photo.id} aria-label={`Alaala ${index + 1}: ${photo.title}`} aria-current={index === active ? 'true' : undefined} onClick={() => select(index)}>
                  <img src={photo.thumb} alt="" loading="lazy" /><span>{photo.date}</span>
                </button>)}
              </nav>
            </>
          )}
          <p className="oe-bottom-note">Labing-isang pagkikita. Ikaw sa bawat isa. At sa mga susunod pa.</p>
        </section>
      )}

      <dialog className="oe-lightbox" ref={dialog} aria-label="Pinalaking litrato">
        <button className="oe-lightbox-close" type="button" onClick={() => dialog.current?.close()} autoFocus>Isara ×</button>
        <img src={memory.src} alt={memory.alt} />
        <p>{memory.date}</p>
      </dialog>
    </main>
    </div>
    </LibraryLayout>
  );
}
