import { useEffect, useRef, useState } from 'react';
import { LibraryLayout } from '../library/LibraryLayout.jsx';
import { BackLink } from '../library/BackLink.jsx';
import './ThreeThirtyThreePage.css';

const NOTES = [
  { label: 'LAPIT', title: 'DITO KA SA TABI KO.', paragraphs: [
    'ASAWAAAA KOOOO! MAY ISANG SALITA TAYONG KAYANG GAWING NGITI. “AIRCON.” SA IBA, PAMPALAMIG LANG. SA ’KIN, IKAW AGAD ANG NAIISIP KO. YUNG GUSTO KITANG MAKITA, MAKALAPIT, AT MAY ORAS NA TAYONG DALAWA LANG. HSHSHSHS! ♡',
    'GUSTO KONG MAKITA YUNG MUKHA MO KAPAG NAGKAKATINGINAN TAYO, TAPOS PAREHO NA TAYONG NAPAPANGITI. YUNG WALA PA TAYONG SINASABI, PERO PARANG ALAM NA NATIN KUNG ANONG NASA ISIP NG ISA’T ISA. ANG KULIT LANG NA MAY SARILI NA TAYONG MUNTING WIKA.',
    'KAYA DITO KA MUNA, CHICAAA KO. TABI KA SA ’KIN. KWENTO MO YUNG ARAW MO, SABIHIN MO KUNG ANONG GUSTO MONG KAININ, O TAWANAN MO LANG AKO HABANG KUNWARI KALMADO AKO. KASI ANG TOTOO? EXCITED LANG TALAGA AKONG MAKASAMA KA ULIT.',
  ] },
  { label: 'YAKAP', title: 'MALAMIG? MAY YAKAP AKO.', paragraphs: [
    'MAY CONCERN LANG PO AKO SA TEMPERATURE, ASAWAAAA. KUNG PALAMIG NANG PALAMIG YUNG AIRCON, BAKA KAILANGAN NATIN NG MAS MAHABANG YAKAP. PARA LANG PO SA IKAKABUTI NATIN. VERY SERIOUS NA USAPAN ’TO. HSHSHSHS! ♡',
    'PERO ALAM MO, GUSTO KO TALAGA YUNG YAKAP NA HINDI PA NAGMAMADALING BUMITAW. YUNG MAKAKAHINGA KA NANG MALALIM, MAKAKAPAGPAHINGA, AT PWEDE MONG ILAPIT YUNG SARILI MO SA ’KIN NANG WALANG KAILANGANG SABIHIN. GUSTO KONG MARAMDAMAN MONG MAY CHICOOO KANG MASAYANG NANDIYAN PARA SA ’YO.',
    'MAY HALIK SA NOO, MAY HAWAK SA KAMAY, AT MAY PAULIT-ULIT NA “MAHAL KITA” KAHIT ALAM MO NA. KAPAG NAMISS MO ’KO, ITO MUNA YUNG YAKAP KO SA SCREEN. SA SUSUNOD NA MAGKASAMA TAYO, GUSTO KONG IBIGAY SA ’YO YUNG TOTOO—KUNG GAANO KAHABA ANG GUSTO MO.',
  ] },
  { label: 'TAYO', title: 'IKAW ANG GUSTO KONG KASAMA.', paragraphs: [
    'HOTEL AVA MALATE. MAY SARILI NA TAYONG KAHULUGAN SA LUGAR NA ’YON, AT MAY SARILI TAYONG CODE. PERO SA BAWAT “AIRCON,” IKAW YUNG GUSTO KONG BALIKAN. YUNG LAMBING MO. YUNG LAPIT MO. YUNG ORAS NA PWEDE TAYONG MAGING TAYO LANG.',
    'NAKAKATUWA ISIPIN NA KAHIT ISANG ORDINARYONG SALITA, KAYA NA NATING LAGYAN NG GANITONG KAKULITAN. MAY PASARING, MAY NGITI, MAY KONTING KUNWARING WALANG ALAM. PERO CHICAAA KO, ALAM MO NAMANG IKAW LANG YUNG GUSTO KONG KASABWAT SA MGA GANITONG BIRUAN. HSHSHSHS!',
    'GUSTO KONG MAY MARAMI PA TAYONG ORAS NA GANITO: NAGTATAWANAN, NAGLALAMBINGAN, NAGPAPAHINGA, AT HINDI MUNA INIISIP YUNG PAG-UWI. WALANG KAILANGANG PERPEKTONG PLANO. SABIHIN MO LANG KUNG ANONG GUSTO MO. GUSTO KONG MASAYA KA, KOMPORTABLE KA, AT ALAM MONG MAHAL NA MAHAL KITA.',
  ] },
];

const FORECASTS = [
  { temperature: 24, title: 'MAY KONTING LAMIG.', text: 'RECOMMENDATION: TABI KA MUNA SA ’KIN. CHECK NATIN KUNG EFFECTIVE YUNG YAKAP. ♡' },
  { temperature: 20, title: 'LUMALAMIG NA, ASAWA.', text: 'HIGH CHANCE OF CUDDLES. MAY KASAMANG HALIK SA NOO AT CHICOOONG AYAW PANG BUMITAW. HSHSHSHS!' },
  { temperature: 16, title: 'YAKAP WEATHER NA ’TO!', text: 'KUMOT? CHECK. KATABI? AKO NA. SA SOBRANG LAMIG, MAY OFFICIAL REQUEST AKONG MAS LUMAPIT SA ’YO. ♡' },
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
  const [cooling, setCooling] = useState(0);
  const heading = useRef(null);
  const input = useRef(null);
  const note = NOTES[active];
  const forecast = FORECASTS[cooling];

  useEffect(() => {
    const previous = document.title;
    document.title = 'AIRCON · TAYO MUNA';
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
    setCooling(0);
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
                <h1 id="tt-title">SANDALI, ASAWA.<br /><em>TAYO MUNA.</em></h1>
                <p className="tt-intro">MAY ORAS PARA SA LAHAT.<br />ITONG 3:33, PARA SA ’TING DALAWA.<br />MAY KAKULITAN, MAY LAMBING, AT MAY CHICOOONG GUSTO KANG MAKATABI.</p>
                <form className="tt-unlock" onSubmit={unlock}>
                  <label htmlFor="tt-code">ALAM MO YUNG CODE NATIN?</label>
                  <div className="tt-input-row">
                    <input ref={input} id="tt-code" value={keyword} onChange={event => { setKeyword(event.target.value); setError(false); }}
                      placeholder="YUNG ISANG SALITA…" autoComplete="off" autoCapitalize="none" spellCheck={false}
                      aria-invalid={error} aria-describedby={error ? 'tt-error' : hint ? 'tt-hint' : undefined} />
                    <button className="tt-primary" type="submit">BUKSAN</button>
                  </div>
                  {error && <p className="tt-feedback" id="tt-error" role="alert">ISA PANG TRY, ASAWA. YUNG PAMPALAMIG. ♡</p>}
                  <button className="tt-hint-button" type="button" aria-expanded={hint} aria-controls="tt-hint" onClick={() => setHint(value => !value)}>{hint ? 'ITAGO ANG CLUE' : 'PAHINGI NG CLUE'}</button>
                  <p className="tt-hint" id="tt-hint" hidden={!hint}>MALAMIG SA LOOB, PERO GUSTO PA RIN KITANG KATABI. A I R C O N.</p>
                </form>
                <p className="tt-cover-sign">MAY TATLONG LAMBING AT MAHABANG SULAT AKONG TINABI PARA SA ’YO.<br /><span>YOUR CHICOOO ♡</span></p>
              </div>

              <div className="tt-door" aria-hidden="true">
                <div className="tt-door-rule" />
                <div className="tt-door-plaque"><span>OUR LITTLE ESCAPE</span><b>3:33</b><span>JUST YOU &amp; ME</span></div>
                <div className="tt-handle"><i /><span /></div>
                <div className="tt-door-tag"><span className="tt-tag-hole" /><Snowflake /><p>TAYO<br /><em>MUNA.</em></p><span>THE WORLD CAN WAIT.</span></div>
              </div>
            </section>
          ) : (
            <section className="tt-room" aria-label="ANG AIRCON NATIN">
              <div className="tt-room-bar"><p className="tt-eyebrow">NAKUHA MO. SYEMPRE NAMAN. ♡</p><button className="tt-text-button" type="button" onClick={close}>ISARA MUNA</button></div>
              <div className="tt-room-grid">
                <aside className="tt-remote" aria-label="TATLONG LAMBING">
                  <div className="tt-remote-brand">CHICO &amp; CHICA</div>
                  <div className="tt-display"><span><Snowflake /> AIRCON MODE</span><b>3:33</b><span>SA ’YO LANG ANG ORAS KO</span></div>
                  <p className="tt-remote-instruction">PILI KA NG LAMBING, ASAWA.</p>
                  <div className="tt-remote-buttons">
                    {NOTES.map((item, index) => <button key={item.label} type="button" aria-pressed={!letter && active === index} onClick={() => { setLetter(false); select(index); }}><span aria-hidden="true">{['♡', '∞', '♥'][index]}</span>{item.label}</button>)}
                  </div>
                  <section className="tt-weather" aria-labelledby="tt-weather-label">
                    <h2 id="tt-weather-label">LAMIG CHECK</h2>
                    <div className="tt-temperature">
                      <button type="button" aria-label="PALAMIGIN PA" disabled={cooling === FORECASTS.length - 1} onClick={() => setCooling(value => Math.min(FORECASTS.length - 1, value + 1))}>−</button>
                      <output aria-label="TEMPERATURA">{forecast.temperature}°C</output>
                      <button type="button" aria-label="BAWASAN ANG LAMIG" disabled={cooling === 0} onClick={() => setCooling(value => Math.max(0, value - 1))}>+</button>
                    </div>
                    <div className="tt-forecast" role="status" aria-live="polite" aria-atomic="true"><strong>{forecast.title}</strong><p>{forecast.text}</p></div>
                  </section>
                  <p className="tt-remote-bottom">MALAMIG ANG AIRCON.<br />MAY YAKAP NAMAN AKO.</p>
                </aside>

                <article className={`tt-note${letter ? ' tt-letter' : ''}`}>
                  <p className="tt-eyebrow">{letter ? 'PARA SA LAHAT NG SUSUNOD NA 3:33' : `3:33 · ${note.label.toUpperCase()}`}</p>
                  <h2 ref={heading} tabIndex={-1}>{letter ? 'ASAWAAAA KOOOO,' : note.title}</h2>
                  {letter ? <div className="tt-letter-copy">
                    <p>3:33 POOOO, CHICAAAA KOOOO! MAY ISA PO AKONG REPORT: KAHIT ISANG SALITA LANG YUNG “AIRCON,” ANG DAMI NA AGAD NITONG KASAMANG NGITI SA ’KIN. HINDI KO ALAM KUNG PAANO NAGING GANITO KAKULIT YUNG ISANG ORDINARYONG BAGAY, PERO HETO AKO NGAYON, GUMAWA PA NG BUONG MUNTING LUGAR PARA LANG SABIHING GUSTO NA ULIT KITANG MAKATABI. HSHSHSHS! ♡</p>
                    <p>NAKAKATUWA KASI MAY MGA BAGAY NA TAYONG DALAWA LANG YUNG NAKAKAINTINDI. MAY MGA SALITANG KAPAG SINABI MO, MAY KASUNOD NANG TAWA. MAY MGA PASARING NA KAHIT KUNWARI WALA LANG, ALAM NA NATIN YUNG IBIG SABIHIN. ANG SAYA MONG MAGING KASABWAT, ASAWA. GUSTO KO YUNG KAKULITAN NATING KAHIT SA SIMPLENG USAPAN, MAY PARAAN PARA MAGPALAMBING.</p>
                    <p>AT SYEMPRE, MAY OFFICIAL CONCERN PO AKO: KUNG SOBRANG LAMIG NG AIRCON, SINO PO YUNG MAGTATABI SA ’YO? AKO NA PO, VOLUNTEER NA AGAD. HINDI NA KAILANGAN NG INTERVIEW. MAY EXPERIENCE NA PO AKO SA PAGMAMAHAL SA CHICAAA KO, AT VERY WILLING PO AKONG MAG-OVERTIME SA YAKAP. HSHSHSHS! ♡</p>
                    <p>PERO SA LIKOD NG LAHAT NG KAKULITAN KO, MAY SIMPLE LANG TALAGA AKONG GUSTO. GUSTO KITANG MAKASAMA NANG MALAPIT. YUNG NAKIKITA KO YUNG NGITI MO NANG HINDI DUMAAN SA SCREEN. YUNG KAPAG MAY NAKAKATAWA, MARIRINIG KO AGAD YUNG TAWA MO SA TABI KO. YUNG KAPAG GUSTO KITANG HAWAKAN SA KAMAY, NANDIYAN LANG YUNG KAMAY MO.</p>
                    <p>KAPAG NAIISIP KO YUNG HOTEL AVA MALATE, IKAW AGAD YUNG KASUNOD. YUNG ORAS NA PARA SA ’TIN. YUNG SAYA NA MAKASAMA KA NANG MAS MALAPIT, NA HINDI KO KAILANGANG SABIHING “SANA NANDITO KA”—KASI NANDIYAN KA NA. GUSTO KONG MAY ORAS TAYONG HINDI MUNA NAGBIBILANG NG MINUTONG NATITIRA BAGO UMUWI.</p>
                    <p>GUSTO KO NG MAHABANG YAKAP. YUNG PWEDE MONG IPATONG YUNG ULO MO SA ’KIN, TAPOS MAKIKINIG LANG AKO SA KUNG ANONG GUSTO MONG IKUWENTO. KUNG PAGOD KA, PAHINGA KA MUNA. KUNG MAY GUSTO KANG PAGTAWANAN, TAWA TAYO. KUNG GUSTO MO LANG NG TAHIMIK, PWEDE RIN. MASAYA AKONG KATABI KA KAHIT WALA TAYONG MALAKING GINAGAWA.</p>
                    <p>AT OO, MAY MGA HALIK NA GUSTO KONG IBIGAY SA ’YO. MAY HALIK SA NOO BAGO KITA YAKAPIN ULIT. MAY HAWAK SA KAMAY HABANG NAG-UUSAP TAYO. MAY MGA SANDALING GUSTO LANG KITANG TINGNAN AT SABIHING, “ANG GANDA MO, ASAWA KO.” KAPAG SINABI KO ’YON, SANA MANIWALA KA. KASI GANITO TALAGA AKO KASAYA NA IKAW YUNG KASAMA KO.</p>
                    <p>GUSTO KONG MAY KAKULITAN PA RIN KAHIT NAGLALAMBINGAN TAYO. YUNG BIGLA AKONG MAY SASABIHING KALOKOHAN, TAPOS MAPAPATAWA KITA. YUNG KUNWARI SOBRANG SERIOUS NATIN SA TEMPERATURE SETTINGS, PERO ANG TOTOO, NAGHAHANAP LANG AKO NG ISA PANG DAHILAN PARA LUMAPIT. ALAM MO NA AKO, CHICAAA KO. MEDYO HALATA NA PO ANG MOTIBO NG ASAWA MO. HSHSHSHS!</p>
                    <p>PERO SABIHIN MO RIN SA ’KIN KUNG ANONG GUSTO MO, HA? ANONG KAKAININ NATIN, KUNG NILALAMIG KA, KUNG GUSTO MO PANG MAGPAHINGA, O KUNG GUSTO MO LANG AKONG YAKAPIN. GUSTO KONG KOMPORTABLE KA. GUSTO KONG MARINIG KA. MAS MASAYA YUNG ORAS NATIN KAPAG PAREHO TAYONG MAY PUWANG MAGING MALAMBING, MAKULIT, O TAHIMIK KUNG ’YON YUNG GUSTO NATIN.</p>
                    <p>SALAMAT KASI MAY IKAW NA GUSTO KONG PAGLAANAN NG GANITONG ORAS. MAY IKAW NA GUSTO KONG SULATAN KAHIT WALA NAMANG OCCASION. MAY IKAW NA NAAALALA KO SA MGA ORAS NA GANITO, TAPOS ANG UNANG NAIISIP KO AY, “ANO KAYANG PWEDENG GAWIN PARA MAPANGITI YUNG ASAWA KO?” KAYA HETO, MAY SARILI KA NANG AIRCON REMOTE NA ANG KAYANG I-ADJUST AY YUNG DAMI NG LAMBING. HSHSHSHS!</p>
                    <p>SA NGAYON, ITONG PAGE MUNA YUNG PAABOT KONG YAKAP. PINDUTIN MO YUNG MGA BUTTON, BALIKAN MO YUNG MGA SULAT, AT TAWA KA NANG KONTI SA MGA KALOKOHAN KO. WALANG EXPIRATION YUNG “MAHAL KITA” DITO. KAHIT TAPOS NA YUNG 3:33, GUSTO PA RIN KITANG MAKASAMA. KAHIT HINDI MALAMIG, GUSTO PA RIN KITANG KATABI.</p>
                    <p>HANGGANG SA SUSUNOD NATING “AIRCON,” MAY CHICOOO KANG EXCITED SA SUSUNOD NA YAKAP, SA SUSUNOD NA TAWA, AT SA SUSUNOD NA ORAS NA TAYO MUNA. MAY MARAMI PA AKONG GUSTONG IKUWENTO SA ’YO. MAY MARAMI PA AKONG GUSTONG MARINIG MULA SA ’YO. AT MAY MARAMI PA AKONG DAHILAN PARA SABIHING ANG SARAP MONG MAHALIN, ASAWA KO.</p>
                    <p className="tt-handwriting">3:33. MALAPIT KA MAN O MALAYO,<br />GUSTO KITANG KATABI.</p>
                    <p className="tt-signature">MAHAL NA MAHAL KITAAAA, CHICAAAA KOOOO!<br />MWAAAAAAAAAAAHHHH! ♡<br />YOUR CHICOOO</p>
                    <button className="tt-secondary" type="button" onClick={() => { setLetter(false); select(0); }}>ISA PANG YAKAP</button>
                  </div> : <>
                    <div className="tt-note-copy">{note.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
                    <div className="tt-note-footer"><span>{visited.length} / 3 LAMBING, PARA SA ’YO</span>
                      {visited.length === 3 ? <button className="tt-primary" type="button" onClick={() => setLetter(true)}>MAY SULAT PA ’KO</button> :
                        <button className="tt-primary" type="button" onClick={() => select(NOTES.findIndex((_, index) => !visited.includes(index)))}>ISA PANG LAMBING</button>}
                    </div>
                  </>}
                </article>
              </div>
              <p className="tt-room-footnote">WALANG HINAHABOL NA ORAS DITO. BALIKAN MO KAHIT KAILAN.</p>
            </section>
          )}
          <footer className="tt-footer"><span>AIRCON · TAYO MUNA</span><span>WITH LOVE, ALWAYS.</span></footer>
        </main>
      </div>
    </LibraryLayout>
  );
}
