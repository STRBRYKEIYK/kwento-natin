import { useEffect, useRef, useState } from 'react';
import story from '../letter/data/story.json';
import './OneElevenPage.css';

const photoById = Object.fromEntries(story.photos.map(photo => [photo.id, photo]));
export const oneElevenMemories = [
  ['cover', 'Mayo 7, 2025 · Binondo', 'Yung pagbalik sa ’yo.', 'Bago pa ang lahat ng litrato rito, may araw na nagkita ulit tayo. Ang saya na may simula tayong pwedeng balikan.'],
  ['a0', 'Agosto 6 · S Maison', 'Red ka. Black ako. Tayo ulit.', 'Spider-Man, parehong jacket, at ikaw sa katabing upuan. Kung uulitin ko ang gabing ’yon, doon pa rin ako uupo.'],
  ['b1', 'Setyembre 4 · Birthday celebration', '24 tulips. Isang birthday girl.', 'Late man ang celebration, ang saya kong makita kang kasama ang mga bulaklak at si Chicobara. Yung ngiti mo ang gusto kong maalala.'],
  ['b6', 'Setyembre 11 · Mga kwintas natin', 'May pangalan ka nang dala.', 'Monogram ko para sa ’yo, monogram mo para sa ’kin. Ang liit na bagay, pero ang sarap tingnan at maalala kung kanino ako uuwi.'],
  ['b7', 'Setyembre 11 · Galing sa ’yo', 'Pareho na tayong may capybara.', 'Si Chicabara at yung crochet flowers mo. Tinabi ko sila, kasama ng saya na may mga bagay dito sa ’kin na galing sa ’yo.'],
  ['c4', 'Oktubre · Ang pangako', 'Hawak ko ang kamay mo.', 'Kasama ng singsing na ’yan, may pangakong araw-araw kong gustong tuparin: pipiliin kita, at aalagaan ang meron tayo.'],
  ['c6', 'Isa sa mga makulit nating sandali', 'Pati fries, nadamay sa kakulitan.', 'Gusto ko yung ganito tayo. Walang kailangang magandang pose. Magkasama lang, tapos tawanan na naman.'],
  ['o20-10', 'Oktubre 20 · Yung yakap mo', 'Dito muna ako.', 'Sabi mo, sobrang happy ka that day. Ako rin, asawa. Kapag nakikita ko ’to, parang dala ko ulit yung yakap mo pauwi.'],
  ['o29-13', 'Oktubre 29 · Photobooth', 'Wala nang props. Tayo lang.', 'Ang dami nating sombrero at pose noong araw na ’yon. Pero gusto ko rin itong simple lang: magkadikit, nakangiti, magkasama.'],
  ['n05-04', 'Nobyembre 5 · Yung sinend mo', '“Si Chicoobara muna kiss ko.”', 'Nandito pa rin itong litrato mo. Natatawa pa rin ako, at oo, ako na lang sana. Miss na kita, asawa ko.'],
].map(([id, date, title, note]) => ({ ...photoById[id], date, title, note, src: `/${photoById[id].src}` })).concat({
  id: 'binondo-nov17', date: 'Nobyembre 17 · Binondo', title: 'At may bago na naman tayong babalikan.',
  note: 'Mula sa unang litrato sa Binondo hanggang dito, ang dami na nating naitago. Gusto ko pa ng maraming araw, maraming picture, at maraming “isa pa, asawa.”',
  src: '/assets/photos/BINONDO DATE NOV 17/photo_425@18-11-2026_00-34-28.jpg',
  alt: 'Magkatabi sina Chico at Chica sa date nila sa Binondo noong Nobyembre 17',
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
    document.title = '1:11 · Ang paborito kong balikan, ikaw';
    return () => { document.title = previous; };
  }, []);

  useEffect(() => {
    if (opened) heading.current?.focus({ preventScroll: true });
  }, [opened, letterOpen]);

  useEffect(() => { setImageFailed(false); }, [active]);

  function select(index) {
    setActive(index);
    setLetterOpen(false);
  }

  return (
    <main className="one-eleven">
      <div className="oe-grain" aria-hidden="true" />
      <header className="oe-topbar">
        <a href="/" aria-label="Bumalik sa library">C <span aria-hidden="true">♡</span> C</a>
        <span>PARA SA CHICAAA KO</span>
        <span className="oe-time">1:11</span>
      </header>

      {!opened ? (
        <section className="oe-cover">
          <div className="oe-cover-photos" aria-hidden="true">
            {[8, 1, 7].map((index, i) => <div className={`oe-print oe-print-${i}`} key={index}>
              <img src={oneElevenMemories[index].src} alt="" />
              <span>{['tayo, sa bawat frame', 'yung simula ulit', 'pahinga ko, ikaw'][i]}</span>
            </div>)}
          </div>
          <div className="oe-cover-copy">
            <p className="oe-eyebrow">ISANG ORAS. LABING-ISANG ALAALA.</p>
            <h1>Ang paborito kong<br />balikan, <em>ikaw.</em></h1>
            <p className="oe-intro">Chicaaa, may tinabi akong ilang sandali natin.<br />Samahan mo ’kong balikan?</p>
            <button className="oe-primary" type="button" onClick={() => setOpened(true)}>Buksan ang mga alaala <span aria-hidden="true">♡</span></button>
            <p className="oe-footnote">Dahan-dahan lang, asawa. Sa ’yo ang oras na ’to.</p>
          </div>
          <span className="oe-cover-sign">with love, your Chicooo</span>
        </section>
      ) : (
        <section className="oe-open" aria-label="Mga alaala natin">
          <div className="oe-reading-header">
            <p className="oe-eyebrow">{letterOpen ? 'AT SA LAHAT NG SUSUNOD PA' : 'MGA SANDALING GUSTO KONG ITAGO'}</p>
            <span>{letterOpen ? 'ISANG MUNTING LIHAM' : `${String(active + 1).padStart(2, '0')} / 11`}</span>
          </div>

          {letterOpen ? (
            <article className="oe-letter">
              <div className="oe-letter-mark" aria-hidden="true">1:11</div>
              <h2 ref={heading} tabIndex={-1}>Asawa kooo,</h2>
              <p>Ang sarap lang balikan, ’no? Yung sine, mga bulaklak, kakulitan, at mga yakap na ayaw ko pang bitawan.</p>
              <p>Pinili ko itong mga litrato kasi gusto kong maalala mo kung gaano ako kasaya na kasama kita. Kahit sa mga araw na wala tayong bagong picture, ikaw pa rin ang gusto kong kausap, kakulitan, at katabi.</p>
              <p>Ngayong 1:11, gusto lang kitang sabihan ulit: mahal na mahal kita. Salamat sa mga alaalang ’to, Chicaaa ko. Gusto ko pang gumawa ng marami, kasama ka.</p>
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
                  <figcaption>{memory.date}</figcaption>
                </figure>
                <div className="oe-memory-copy">
                  <span className="oe-memory-number" aria-hidden="true">{String(active + 1).padStart(2, '0')}</span>
                  <h2 ref={heading} tabIndex={-1}>{memory.title}</h2>
                  <p>{memory.note}</p>
                  <div className="oe-navigation">
                    <button className="oe-secondary" type="button" disabled={active === 0} onClick={() => select(active - 1)}>Nauna</button>
                    <button className="oe-primary" type="button" onClick={() => active === 10 ? setLetterOpen(true) : select(active + 1)}>{active === 10 ? 'May sulat pa ’ko sa ’yo' : 'Isa pang alaala'}</button>
                  </div>
                </div>
              </div>
              <nav className="oe-filmstrip" aria-label="Pumili ng alaala">
                {oneElevenMemories.map((photo, index) => <button type="button" key={photo.id} aria-label={`Alaala ${index + 1}: ${photo.title}`} aria-current={index === active ? 'true' : undefined} onClick={() => select(index)}>
                  <img src={photo.src} alt="" loading="lazy" /><span>{String(index + 1).padStart(2, '0')}</span>
                </button>)}
              </nav>
            </>
          )}
          <p className="oe-bottom-note">Labing-isang litrato. Ang dami pang dahilan para mahalin ka.</p>
        </section>
      )}

      <dialog className="oe-lightbox" ref={dialog} aria-label="Pinalaking litrato">
        <button className="oe-lightbox-close" type="button" onClick={() => dialog.current.close()} autoFocus>Isara ×</button>
        <img src={memory.src} alt={memory.alt} />
        <p>{memory.date}</p>
      </dialog>
    </main>
  );
}
