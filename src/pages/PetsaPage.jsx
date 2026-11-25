import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LibraryLayout } from '../library/LibraryLayout.jsx';
import { Ticker } from '../library/Ticker.jsx';
import { BackLink } from '../library/BackLink.jsx';
import { DATES, imgSrc, thumbSrc, videoSrc, videoThumbSrc, getMedia } from './petsaData.js';
import './PetsaPage.css';

const fbApp = initializeApp({
  apiKey: 'AIzaSyDt5xOekBmIC-GnNDqlpDcRRX2KQPZchTA',
  authDomain: 'chica-keicodes-dev.firebaseapp.com',
  projectId: 'chica-keicodes-dev',
  storageBucket: 'chica-keicodes-dev.firebasestorage.app',
  messagingSenderId: '359088819077',
  appId: '1:359088819077:web:e88d4d052b25289735d2ec',
});
const db = getFirestore(fbApp);
const storage = getStorage(fbApp);

const HASH_CHICA = '87e4e4a0ef9f70519b544309fe8b04dbac53b1f20803140d8ee6b60c11c33b23';
const HASH_CHICO = 'f7efc290658b96cf48efcbf0c9720476d8fae0e9314a9da04f16aa0ccb4735ca';
const MONTHS_TL = ['Enero','Pebrero','Marso','Abril','Mayo','Hunyo','Hulyo','Agosto','Setyembre','Oktubre','Nobyembre','Disyembre'];

async function sha256(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function tickerItems() {
  const unit = ['PETSA', 'MGA DATE NATIN', '♡'];
  const out = [];
  for (let i = 0; i < 4; i++) unit.forEach(s => out.push(s));
  return out;
}

function DateCard({ d, index, onClick }) {
  const media = getMedia(d);
  const first = media[0];
  const src = d.isFirebase
    ? (d.firebaseUrls[0] || '')
    : first.type === 'photo' ? thumbSrc(d, first.file) : videoThumbSrc(d, first.file);
  const countLabel = d.files.length + ' litrato' + (d.videos?.length ? ', ' + d.videos.length + ' video' : '');

  return (
    <button className="card" type="button" onClick={onClick}
      aria-label={`${d.label}${d.place ? ' · ' + d.place : ''} — ${d.isFirebase ? d.firebaseUrls.length + ' litrato' : countLabel}`}>
      <div className="card-img">
        <img src={src} alt="" loading={index < 4 ? 'eager' : 'lazy'} width={400} height={533} />
      </div>
      <span className="card-count">{d.isFirebase ? d.firebaseUrls.length : media.length} ♡</span>
      {d.addedBy && <span className="card-new">{d.addedBy === 'chica' ? 'NI CHICA' : 'NI CHICO'}</span>}
      <div className="card-body">
        <p className="card-date">{d.label}</p>
        {d.place && <p className="card-desc">{d.place}</p>}
        {d.desc && <p className="card-desc">{d.desc}</p>}
      </div>
    </button>
  );
}

function GalleryPanel({ dateEntry, media, onClose, onOpenLb }) {
  if (!dateEntry) return null;
  const photoCount = media.filter(m => m.type === 'photo' || m.url).length;
  const videoCount = media.filter(m => m.type === 'video' && !m.url).length;
  const parts = [];
  if (photoCount) parts.push(photoCount + ' LITRATO');
  if (videoCount) parts.push(videoCount + ' VIDEO');

  return (
    <div className="panel">
      <div className="pn-top">
        <button className="pn-close" type="button" onClick={onClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>BALIK
        </button>
        <p className="pn-title">PETSA</p>
      </div>
      <div className="pn-hero">
        <h2>{dateEntry.label}{dateEntry.place ? ' · ' + dateEntry.place : ''}</h2>
        <p>
          {dateEntry.desc ? dateEntry.desc + ' · ' : ''}
          <span className="cnt">{parts.join(' · ') || '0'}</span>
          {dateEntry.addedBy && <> · <span className="cnt">IDINAGDAG NI {dateEntry.addedBy.toUpperCase()}</span></>}
        </p>
      </div>
      <div className="pn-grid">
        {media.map((item, j) => (
          <button key={j} type="button" onClick={() => onOpenLb(j)}
            aria-label={`${item.type === 'video' ? 'Video' : 'Litrato'} ${j + 1}`}>
            <div className="img-wrap">
              <img
                src={item.url || (item.type === 'photo' ? thumbSrc(dateEntry, item.file) : videoThumbSrc(dateEntry, item.file))}
                alt="" loading={j < 12 ? 'eager' : 'lazy'} width={200} height={267} />
              {item.type === 'video' && !item.url && <span className="vid-badge" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Lightbox({ media, dateEntry, index, onClose, onStep }) {
  const imgRef = useRef(null);
  const vidRef = useRef(null);
  const sxRef = useRef(0);

  useEffect(() => {
    if (index === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); onStep(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); onStep(-1); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [index, onClose, onStep]);

  const onPointerDown = useCallback((e) => { sxRef.current = e.clientX; e.target.setPointerCapture(e.pointerId); }, []);
  const onPointerUp = useCallback((e) => {
    const dx = e.clientX - sxRef.current;
    if (Math.abs(dx) > 40) onStep(dx < 0 ? 1 : -1);
  }, [onStep]);

  if (index === null || !dateEntry) return null;
  const item = media[index];
  const isVideo = item.type === 'video' && !item.url;

  return (
    <div className="lb">
      <div className="lb-top">
        <button className="lb-x" type="button" aria-label="Isara" onClick={onClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        <p className="lb-count"><b>{index + 1}</b> / {media.length}</p>
      </div>
      {isVideo ? (
        <video className="lb-vid" ref={vidRef} controls playsInline preload="metadata"
          src={videoSrc(dateEntry, item.file)} poster={videoThumbSrc(dateEntry, item.file)}
          onPointerDown={onPointerDown} onPointerUp={onPointerUp} />
      ) : (
        <img className="lb-img" ref={imgRef} alt="" draggable={false}
          src={item.url || imgSrc(dateEntry, item.file)}
          onPointerDown={onPointerDown} onPointerUp={onPointerUp} />
      )}
      <div className="lb-nav">
        <button type="button" aria-label="Nakaraang litrato" disabled={index === 0} onClick={() => onStep(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button type="button" aria-label="Susunod na litrato" disabled={index === media.length - 1} onClick={() => onStep(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}

function AuthOverlay({ onAuth }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const tryAuth = async () => {
    const c = code.trim();
    if (!c) { setErr('MAGLAGAY NG PASSCODE'); return; }
    const h = await sha256(c);
    if (h === HASH_CHICA) onAuth('chica');
    else if (h === HASH_CHICO) onAuth('chico');
    else { setErr('MALI ANG PASSCODE'); setCode(''); inputRef.current?.focus(); }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-box">
        <h2>Sino Ka?</h2>
        <p>PASSCODE PARA MAKAPAG-ADD</p>
        <input ref={inputRef} type="password" inputMode="numeric" maxLength={6} placeholder="······" autoComplete="off"
          value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') tryAuth(); }} />
        <p className="auth-err">{err}</p>
        <button type="button" onClick={tryAuth}>PUMASOK</button>
        <p className="auth-hint">HINT: BIRTHDAY NG MAHAL MO</p>
      </div>
    </div>
  );
}

function EntryForm({ user, onClose, onSaved }) {
  const [date, setDate] = useState('');
  const [label, setLabel] = useState('');
  const [place, setPlace] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const handleDateChange = (v) => {
    setDate(v);
    if (!label) {
      const d = new Date(v + 'T12:00:00');
      if (!isNaN(d)) setLabel(MONTHS_TL[d.getMonth()] + ' ' + d.getDate());
    }
  };

  const addFiles = (picked) => {
    const imgs = Array.from(picked).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...imgs.map(f => ({ file: f, url: URL.createObjectURL(f) }))]);
  };

  const removeFile = (idx) => { setFiles(prev => prev.filter((_, i) => i !== idx)); };

  const save = async () => {
    if (!date) { setStatus('PUMILI NG PETSA'); return; }
    if (!label.trim()) { setStatus('MAGLAGAY NG LABEL'); return; }
    if (!files.length) { setStatus('MAGLAGAY NG KAHIT ISANG LITRATO'); return; }
    setSaving(true);
    try {
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        setStatus(`NAG-UUPLOAD... ${i + 1}/${files.length}`);
        const f = files[i].file;
        const ext = f.name.split('.').pop() || 'jpg';
        const sRef = storageRef(storage, `entries/${date}/${Date.now()}_${i}.${ext}`);
        await uploadBytes(sRef, f);
        urls.push(await getDownloadURL(sRef));
      }
      setStatus('SINASAVE SA DATABASE...');
      await addDoc(collection(db, 'entries'), {
        date, label: label.trim(), place: place.trim(), desc: desc.trim(),
        files: urls, addedBy: user, createdAt: serverTimestamp(),
      });
      setStatus('NA-SAVE NA! ♡');
      setTimeout(() => { onSaved(); }, 1200);
    } catch (err) {
      setStatus('ERROR: ' + err.message);
      setSaving(false);
    }
  };

  return (
    <div className="form-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="entry-form">
        <h3>Bagong Petsa</h3>
        <p className="ef-who">NAGDADAGDAG: {user.toUpperCase()}</p>
        <div className="ef-row">
          <label>PETSA</label>
          <input type="date" value={date} onChange={e => handleDateChange(e.target.value)} />
        </div>
        <div className="ef-row">
          <label>LABEL (HALIMBAWA: NOBYEMBRE 25)</label>
          <input type="text" placeholder="Nobyembre 25" value={label} onChange={e => setLabel(e.target.value)} />
        </div>
        <div className="ef-row">
          <label>LUGAR (OPTIONAL)</label>
          <input type="text" placeholder="Binondo" value={place} onChange={e => setPlace(e.target.value)} />
        </div>
        <div className="ef-row">
          <label>DESCRIPTION (OPTIONAL)</label>
          <textarea rows={2} placeholder="Kwento ng araw na 'to..." value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="ef-row">
          <label>MGA LITRATO</label>
          <label className="ef-file">
            <input type="file" accept="image/*" multiple onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
            TAP PARA PUMILI NG LITRATO
          </label>
          <div className="ef-photos">
            {files.map((f, i) => (
              <div key={i} className="thumb-wrap">
                <img className="thumb" src={f.url} alt="" />
                <button className="thumb-rm" type="button" onClick={() => removeFile(i)}>×</button>
              </div>
            ))}
          </div>
        </div>
        <div className="ef-btns">
          <button className="ef-cancel" type="button" onClick={onClose}>CANCEL</button>
          <button className="ef-save" type="button" disabled={saving} onClick={save}>I-SAVE</button>
        </div>
        <p className="ef-status">{status}</p>
      </div>
    </div>
  );
}

export default function PetsaPage() {
  const [searchParams] = useSearchParams();
  const [fbEntries, setFbEntries] = useState([]);
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('petsa.user'); return s === 'chica' || s === 'chico' ? s : null; } catch { return null; }
  });
  const [showAuth, setShowAuth] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(null);
  const [lbIdx, setLbIdx] = useState(null);

  const allDates = useMemo(() => {
    const existing = new Set(DATES.map(d => d.date));
    const newOnes = fbEntries.filter(e => !existing.has(e.date));
    return [...DATES, ...newOnes];
  }, [fbEntries]);

  const totalPhotos = useMemo(() => allDates.reduce((n, d) => n + (d.isFirebase ? d.firebaseUrls.length : d.files.length), 0), [allDates]);
  const totalVideos = useMemo(() => allDates.reduce((n, d) => n + (d.videos?.length || 0), 0), [allDates]);

  const curDate = galleryIdx !== null ? allDates[galleryIdx] : null;
  const curMedia = useMemo(() => {
    if (!curDate) return [];
    if (curDate.isFirebase) return curDate.firebaseUrls.map(url => ({ type: 'photo', url }));
    return getMedia(curDate);
  }, [curDate]);

  useEffect(() => { document.title = 'PETSA · MGA DATE NATIN'; }, []);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'entries'), orderBy('date', 'asc')));
        const entries = [];
        snap.forEach(doc => {
          const d = doc.data();
          entries.push({
            date: d.date, label: d.label || '', place: d.place || '', desc: d.desc || '',
            folder: '', files: [], firebaseUrls: d.files || [], addedBy: d.addedBy || '', isFirebase: true,
          });
        });
        setFbEntries(entries);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const dParam = searchParams.get('d');
    if (dParam !== null) {
      const di = parseInt(dParam, 10);
      if (di >= 0 && di < allDates.length) setGalleryIdx(di);
    }
  }, [searchParams, allDates.length]);

  useEffect(() => {
    if (galleryIdx !== null) document.documentElement.style.overflow = 'hidden';
    else document.documentElement.style.overflow = '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [galleryIdx]);

  useEffect(() => {
    if (galleryIdx === null || lbIdx !== null) return;
    const handler = (e) => { if (e.key === 'Escape') { e.preventDefault(); closeGallery(); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [galleryIdx, lbIdx]);

  const closeGallery = useCallback(() => {
    if (searchParams.get('d') !== null) { history.back(); return; }
    setGalleryIdx(null);
  }, [searchParams]);

  const openLb = useCallback((j) => setLbIdx(j), []);
  const closeLb = useCallback(() => setLbIdx(null), []);
  const stepLb = useCallback((dir) => {
    setLbIdx(prev => {
      if (prev === null) return null;
      const n = prev + dir;
      if (n < 0 || n >= curMedia.length) return prev;
      return n;
    });
  }, [curMedia.length]);

  const handleAuth = (u) => {
    setUser(u);
    setShowAuth(false);
    try { localStorage.setItem('petsa.user', u); } catch {}
  };

  const handleFabClick = () => {
    if (!user) { setShowAuth(true); return; }
    setShowForm(true);
  };

  const handleSaved = () => { setShowForm(false); location.reload(); };

  const statParts = [allDates.length + ' PETSA', totalPhotos + ' LITRATO'];
  if (totalVideos) statParts.push(totalVideos + ' VIDEO');

  const tItems = useMemo(() => tickerItems(), []);

  return (
    <LibraryLayout theme="dark">
      <div className="petsa-page">
        <div className="petsa-ticker"><Ticker items={tItems} /></div>

        {galleryIdx === null && (
          <main className="wrap">
            <BackLink />
            <header className="hero">
              <p className="eyebrow">PETSA · LIBRO 03</p>
              <h1 className="lib-h1">Mga Date <em>Natin</em></h1>
              <p className="lede">Bawat araw na magkasama tayo, may litrato. Pinili ko lahat para sa&apos;yo.</p>
              <p className="stat">{statParts.join(' · ')}</p>
            </header>
            <div className="grid">
              {allDates.map((d, i) => (
                <DateCard key={d.date + i} d={d} index={i} onClick={() => setGalleryIdx(i)} />
              ))}
            </div>
            <footer>
              <p className="final">Hindi pa tapos ang listahan na &apos;to, asawa ko.</p>
              <p className="sign">— Chico ♡</p>
              <p className="fine">PETSA · LIBRARY NI CHICO</p>
            </footer>
          </main>
        )}

        {galleryIdx !== null && (
          <GalleryPanel dateEntry={curDate} media={curMedia} onClose={closeGallery} onOpenLb={openLb} />
        )}

        <Lightbox media={curMedia} dateEntry={curDate} index={lbIdx} onClose={closeLb} onStep={stepLb} />

        <button className="fab" type="button" aria-label="Mag-add ng entry" onClick={handleFabClick}>+</button>

        {showAuth && <AuthOverlay onAuth={handleAuth} />}
        {showForm && <EntryForm user={user} onClose={() => setShowForm(false)} onSaved={handleSaved} />}
      </div>
    </LibraryLayout>
  );
}
