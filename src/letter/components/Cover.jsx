import { m, useReducedMotion } from 'framer-motion';
import { sections } from '../data/content';
import { Photo } from './PhotoAlbum';
import { Tulip } from './Icon';

export function Cover({ phase, onOpen, onOpened, resumeId }) {
  const reduced = useReducedMotion();
  const opened = phase !== 'closed';
  const resume = sections.find(section => section.id === resumeId && section.id !== 'sec-intro');
  return <header className="cover" id="cover">
    <div className="cover-meta"><span>Isang liham sa ikatlong buwan natin</span><span>Chico &amp; Chica ♡</span></div>
    <div className="cover-hero">
      <m.div className="title-block" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
        <Tulip />
        <p className="kicker">May mga salitang para sa ’yo lang.</p>
        <h1>Para sa<br /><em>Chica ko,</em></h1>
        <p className="cover-dedication">Kung hindi kita mayakap ngayon, sana maramdaman mo muna ako rito. Sa bawat salita, sa bawat larawan, sa bawat kantang para sa ’yo.</p>
        <p className="cover-signature">Buong puso, ang Chico mo ♡</p>
        <div className="cover-sub"><span>Tatlong buwan ng tayo.<br />At pipiliin pa rin kita.</span><time dateTime="2026-11-06">Nob. 6, 2026</time></div>
      </m.div>
      <div className="cover-keepsake">
        <Photo id="cover" />
        <m.button className="envelope" type="button" id="open" aria-busy={phase === 'opening'}
          aria-label={opened ? 'Basahin muli ang liham, kasama ang mga kanta ni Chico' : 'Buksan ang liham, kasama ang mga kantang kinanta ni Chico'}
          onClick={() => onOpen(false)} whileHover={reduced ? undefined : { y: -3 }} whileTap={reduced ? undefined : { scale: .98 }}>
          <m.span className="envelope-paper" aria-hidden="true" initial={false}
            animate={{ y: opened ? -55 : 0 }} transition={{ duration: reduced ? 0 : .55, delay: reduced ? 0 : .2 }}
            onAnimationComplete={() => { if (phase === 'opening') onOpened(); }}>
            Chica ko,<small>Sa bawat pahina, ikaw ang mahal ko.</small>
          </m.span>
          <span className="envelope-front" aria-hidden="true" />
          <m.span className="envelope-flap" aria-hidden="true" initial={false} animate={{ rotateX: opened ? 180 : 0 }} transition={{ duration: reduced ? 0 : .6 }} />
          <span className="envelope-address" aria-hidden="true">Para sa ’yo lang.<small>mula sa taong mahal na mahal ka</small></span>
          <m.span className="wax-seal" aria-hidden="true" initial={false} animate={{ opacity: opened ? 0 : 1, scale: opened ? .6 : 1 }} transition={{ duration: reduced ? 0 : .2 }}>♡</m.span>
          <span className="envelope-action" aria-hidden="true">{opened ? 'Basahin muli ang liham ♡' : 'Buksan ang liham ♡'}</span>
        </m.button>
      </div>
    </div>
    <div className="cover-actions">
      <p>Buksan mo kapag may sandali ka.<br className="phone-break" /> Aawitan din kita habang nagbabasa.</p>
      <button className="text-button" type="button" onClick={() => onOpen(true)}>Basahin muna nang tahimik ♡</button>
      {resume && <button className="resume-button" type="button" onClick={() => onOpen(true, resume.id)}>Ituloy sa {resume.label} →</button>}
    </div>
  </header>;
}
