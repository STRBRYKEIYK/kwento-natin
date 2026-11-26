import { useEffect, useRef, useState } from 'react';
import { LibraryLayout } from '../library/LibraryLayout.jsx';
import { BackLink } from '../library/BackLink.jsx';
import './ThreeThirtyThreePage.css';

const NOTES = [
  { label: 'Lapit', title: 'Dito ka sa tabi ko.', text: 'May isang salita tayong kayang gawing ngiti. “Aircon.” Ikaw agad ang naiisip ko. Yung gusto kitang makita, makalapit, at may oras na tayong dalawa lang.' },
  { label: 'Yakap', title: 'Malamig? May yakap ako.', text: 'Kung may isang bagay akong gustong patagalin, yung oras na katabi kita. Yung pwede kitang yakapin, makinig sa kwento mo, at sabihing namiss kita habang nandiyan ka na.' },
  { label: 'Tayo', title: 'Ikaw ang gusto kong kasama.', text: 'Hotel Ava Malate. May sarili na tayong kahulugan sa lugar na ’yon, at may sarili tayong code. Pero sa bawat “aircon,” ikaw yung gusto kong balikan. Yung lambing mo. Yung lapit mo. Tayo.' },
];

function Snowflake() {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M16 3v26M4.7 9.5l22.6 13M4.7 22.5l22.6-13M12 6l4 4 4-4M12 26l4-4 4 4M5.5 14l5.5-1.5L9.5 7M22.5 25L21 19.5l5.5-1.5M5.5 18l5.5 1.5L9.5 25M22.5 7L21 12.5l5.5 1.5" />
  </svg>;
}

export default function ThreeThirtyThreePage() {
  const [opened, setOpened] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState(false);
  const [hint, setHint] = useState(false);
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState([0]);
  const [letter, setLetter] = useState(false);
  const heading = useRef(null);
  const input = useRef(null);
  const note = NOTES[active];

  useEffect(() => {
    const previous = document.title;
    document.title = '3:33 · TAYO MUNA';
    return () => { document.title = previous; };
  }, []);

  useEffect(() => {
    if (opened) heading.current?.focus();
  }, [opened, active, letter]);

  function unlock(event) {
    event.preventDefault();
    if (keyword.trim().toLowerCase() === 'aircon') {
      setOpened(true);
      setError(false);
    } else {
      setError(true);
      input.current?.focus();
    }
  }

  function select(index) {
    setActive(index);
    setVisited(previous => previous.includes(index) ? previous : [...previous, index]);
  }

  function close() {
    setOpened(false);
    setKeyword('');
    setError(false);
    setHint(false);
    setActive(0);
    setVisited([0]);
    setLetter(false);
    requestAnimationFrame(() => input.current?.focus());
  }

  return (
    <LibraryLayout>
      <div className="three-thirty-three" lang="tl">
        <main className="tt-shell">
          <header className="tt-topbar">
            <BackLink />
            <span>PARA SA CHICAAA KO</span>
            <span className="tt-small-clock">3:33</span>
          </header>

          {!opened ? (
            <section className="tt-cover" aria-labelledby="tt-title">
              <div className="tt-cover-copy">
                <p className="tt-eyebrow">ISANG MUNTING SECRET NATIN</p>
                <h1 id="tt-title">Sandali, asawa.<br /><em>Tayo muna.</em></h1>
                <p className="tt-intro">May oras para sa lahat.<br />Itong 3:33, para sa ’ting dalawa.</p>
                <form className="tt-unlock" onSubmit={unlock}>
                  <label htmlFor="tt-code">Alam mo yung code natin?</label>
                  <div className="tt-input-row">
                    <input ref={input} id="tt-code" value={keyword} onChange={event => { setKeyword(event.target.value); setError(false); }}
                      placeholder="Yung isang salita…" autoComplete="off" autoCapitalize="none" spellCheck={false}
                      aria-invalid={error} aria-describedby={error ? 'tt-error' : hint ? 'tt-hint' : undefined} />
                    <button className="tt-primary" type="submit">Buksan</button>
                  </div>
                  {error && <p className="tt-feedback" id="tt-error" role="alert">Isa pang try, asawa. Yung pampalamig. ♡</p>}
                  <button className="tt-hint-button" type="button" aria-expanded={hint} aria-controls="tt-hint" onClick={() => setHint(value => !value)}>{hint ? 'Itago ang clue' : 'Pahingi ng clue'}</button>
                  <p className="tt-hint" id="tt-hint" hidden={!hint}>Malamig sa loob, pero gusto pa rin kitang katabi. A I R C O N.</p>
                </form>
                <p className="tt-cover-sign">May lambing akong tinabi para sa ’yo.<br /><span>Your Chicooo</span></p>
              </div>

              <div className="tt-door" aria-hidden="true">
                <div className="tt-door-rule" />
                <div className="tt-door-plaque"><span>OUR LITTLE ESCAPE</span><b>3:33</b><span>JUST YOU &amp; ME</span></div>
                <div className="tt-handle"><i /><span /></div>
                <div className="tt-door-tag"><span className="tt-tag-hole" /><Snowflake /><p>Tayo<br /><em>muna.</em></p><span>THE WORLD CAN WAIT.</span></div>
              </div>
            </section>
          ) : (
            <section className="tt-room" aria-label="Ang 3:33 natin">
              <div className="tt-room-bar"><p className="tt-eyebrow">NAKUHA MO. SYEMPRE NAMAN. ♡</p><button className="tt-text-button" type="button" onClick={close}>Isara muna</button></div>
              <div className="tt-room-grid">
                <aside className="tt-remote" aria-label="Tatlong lambing">
                  <div className="tt-remote-brand">CHICO &amp; CHICA</div>
                  <div className="tt-display"><span><Snowflake /> AIRCON MODE</span><b>3:33</b><span>SA ’YO LANG ANG ORAS KO</span></div>
                  <p className="tt-remote-instruction">Pili ka ng lambing, asawa.</p>
                  <div className="tt-remote-buttons">
                    {NOTES.map((item, index) => <button key={item.label} type="button" aria-pressed={!letter && active === index} onClick={() => { setLetter(false); select(index); }}><span aria-hidden="true">{['♡', '∞', '♥'][index]}</span>{item.label}</button>)}
                  </div>
                  <p className="tt-remote-bottom">MALAMIG ANG AIRCON.<br />MAY YAKAP NAMAN AKO.</p>
                </aside>

                <article className={`tt-note${letter ? ' tt-letter' : ''}`}>
                  <p className="tt-eyebrow">{letter ? 'PARA SA LAHAT NG SUSUNOD NA 3:33' : `3:33 · ${note.label.toUpperCase()}`}</p>
                  <h2 ref={heading} tabIndex={-1}>{letter ? 'Asawa kooo,' : note.title}</h2>
                  {letter ? <div className="tt-letter-copy">
                    <p>Isang “aircon” lang, alam na natin. Nakakatuwa na may mga salitang ordinaryo sa iba, pero pagdating sa ’tin, may kasamang ngiti at lambing.</p>
                    <p>Sa 3:33 na ’to, gusto lang kitang ilapit sa ’kin kahit dito muna. Isipin mo na katabi mo ’ko. May yakap kang pwedeng tagalan, may halik sa noo, at may Chicooo kang ayaw munang bumitaw.</p>
                    <p>Kapag naiisip ko yung Hotel Ava Malate, ikaw agad yung kasunod. Yung oras na para sa ’tin. Yung saya na makasama ka nang mas malapit, na hindi ko kailangang sabihing “sana nandito ka”—kasi nandiyan ka na.</p>
                    <p>Gusto kong may marami pa tayong ganitong sandali. May kakulitan, may lambing, may pahinga. Pwede ring tahimik lang, basta komportable ka at magkatabi tayo.</p>
                    <p>Hanggang sa susunod nating “aircon,” may yakap muna akong iniwan dito. Balikan mo kapag namimiss mo ’ko, asawa. Ako rin, gusto na ulit kitang makasama.</p>
                    <p className="tt-handwriting">3:33. Malapit ka man o malayo,<br />gusto kitang katabi.</p>
                    <p className="tt-signature">Mahal na mahal kita.<br />Your Chicooo ♡</p>
                    <button className="tt-secondary" type="button" onClick={() => { setLetter(false); select(0); }}>Isa pang yakap</button>
                  </div> : <>
                    <p className="tt-note-copy">{note.text}</p>
                    <div className="tt-note-footer"><span>{visited.length} / 3 LAMBING, PARA SA ’YO</span>
                      {visited.length === 3 ? <button className="tt-primary" type="button" onClick={() => setLetter(true)}>May sulat pa ’ko</button> :
                        <button className="tt-primary" type="button" onClick={() => select(NOTES.findIndex((_, index) => !visited.includes(index)))}>Isa pang lambing</button>}
                    </div>
                  </>}
                </article>
              </div>
              <p className="tt-room-footnote">Walang hinahabol na oras dito. Balikan mo kahit kailan.</p>
            </section>
          )}
          <footer className="tt-footer"><span>3:33 · TAYO MUNA</span><span>WITH LOVE, ALWAYS.</span></footer>
        </main>
      </div>
    </LibraryLayout>
  );
}
