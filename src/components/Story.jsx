import { m, useReducedMotion } from 'framer-motion';
import { chapters, directory, dreams, intro, letter, tracks } from '../data/content';
import { Photo } from './PhotoAlbum';
import { Reveal } from './Reveal';

function ChapterHeading({ number, kicker, month, title }) {
  return <Reveal className="chapter-heading"><span className="chapter-number" aria-hidden="true">{number}</span><div>
    <span className="chapter-kicker">{kicker}</span><h2>{month}</h2><p>{title}</p>
  </div></Reveal>;
}

function SongNote({ track, soundtrack }) {
  const active = soundtrack.track.key === track && soundtrack.playing;
  const index = tracks.findIndex(song => song.key === track);
  return <button className={`song-note ${active ? 'is-playing' : ''}`} type="button" aria-pressed={active}
    onClick={() => {
      if (soundtrack.track.key === track && soundtrack.playing) soundtrack.pause();
      else soundtrack.select(index, { manual: true });
    }}>
    <span className="equalizer" aria-hidden="true"><i /><i /><i /></span>
    {active ? 'Pinapakinggan: ' : 'Pakinggan mo: '}{tracks[index].title}<span className="song-note-credit">kinanta para sa ’yo</span>
  </button>;
}

function ChapterBlock({ block }) {
  if (block.type === 'prose') return <Reveal className="prose">{block.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</Reveal>;
  if (block.type === 'note') return <Reveal as="p" className="handwritten-note">{block.text}</Reveal>;
  if (block.type === 'quote') return <Reveal as="blockquote" className="quote">{block.text}<cite>{block.attribution}</cite></Reveal>;
  return <div className={`photo-grid ${block.layout === 'lock' ? 'photo-grid--lock' : ''}`}>{block.photos.map(id => <Photo key={id} id={id} />)}</div>;
}

export function Story({ storyRef, onJump, soundtrack }) {
  const reduced = useReducedMotion();
  return <m.main ref={storyRef} className="story" id="story" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
    <span className="paper-heart" aria-hidden="true">♡</span>
    <section className="intro section" id="sec-intro" tabIndex={-1} aria-label="Simula ng liham">
      {intro.map((paragraph, i) => <Reveal as="p" className={i === 0 ? 'intro-lead' : ''} key={i}>{paragraph}</Reveal>)}
      <Reveal className="tap-note"><span aria-hidden="true">♡</span><p><strong>P.S. I-tap mo ang mga litrato.</strong> Black and white muna, gaya ng gusto mo. Pero sa bawat pindot mo, babalik ang kulay. Ganyan ka sa mundo ko.</p></Reveal>
      <details className="chapter-directory"><summary>Mga alaalang nakatupi sa liham na ’to<span>piliin ang gusto mong balikan</span></summary>
        <nav className="chapter-links" aria-label="Piliin ang kabanata">{directory.map(item => <a href={`#${item.id}`} key={item.id} onClick={event => { event.preventDefault(); onJump(item.id); }}>
          <small>{item.label}</small><strong>{item.title}</strong><span>{item.description}</span>
        </a>)}</nav>
      </details>
    </section>
    {chapters.map(chapter => <section className="chapter section" key={chapter.id} id={chapter.id} tabIndex={-1} aria-label={chapter.month}>
      <ChapterHeading {...chapter} />
      {chapter.blocks.map((block, i) => <ChapterBlock key={i} block={block} />)}
      <SongNote track={chapter.track} soundtrack={soundtrack} />
    </section>)}
    <section className="letter-section section" id="sec-letter" tabIndex={-1} aria-label="Personal na liham">
      <Reveal className="letter"><span className="letter-stamp">{letter.stamp}</span><span className="letter-seal" aria-hidden="true">♡</span>
        <h2>Asawa ko,<em>may gusto pa akong sabihin…</em></h2>
        {letter.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        <div className="signature"><span>Sa ’yo, sa bawat araw,</span><strong>Ang iyong Chico ♡</strong></div>
        <p className="postscript">{letter.postscript}</p>
      </Reveal>
    </section>
    <section className="next section" id="sec-11" tabIndex={-1} aria-label="Ang mga susunod nating kabanata">
      <ChapterHeading number="11" kicker="Susunod na kabanata" month="At sa susunod" title="Yung mga kabanatang isusulat pa natin" />
      <ol className="dreams">{dreams.map((dream, i) => <li key={i}><Reveal><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><p>{dream}</p></Reveal></li>)}</ol>
    </section>
    <section className="finale section" id="sec-finale" tabIndex={-1} aria-label="Sa bawat 6">
      <Photo id="end" /><Reveal><h2>Sa susunod na 6,<br />ikaw pa rin, mahal.</h2><p>At sa lahat ng araw sa pagitan. Buong puso, palagi. ♡</p>
        <button className="again-button" type="button" onClick={() => onJump('cover')}>Balikan ang simula ng liham ♡</button>
      </Reveal>
    </section>
  </m.main>;
}
