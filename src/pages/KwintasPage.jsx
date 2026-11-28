import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../media.js';
import { NECKLACE_ORDER } from './kwintasOrder.js';
import '../library/styles.css';
import './KwintasPage.css';

const ORDER_BY_NAME = Object.fromEntries(NECKLACE_ORDER.map((item) => [item.name, item]));

function resolveKwintasMedia(path) {
  const resolved = mediaUrl(path);
  if (import.meta.env.DEV && resolved === path && resolved.startsWith('/')) {
    return `/public${resolved}`;
  }
  return resolved;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const HERO_PORTRAIT = {
  id: 'portrait',
  surface: 'dark',
  src: '/assets/kwintas/necklace-portrait.jpg',
  alt: 'BISWAL NA LARAWAN NG DALAWANG KULAY-GINTONG MONOGRAM NA KWINTAS SA IBABAW NG LINEN — ANG OVAL NA JERSEY AT ANG HEXAGON NA KEITH NA MAGKATABI.',
  kicker: 'BISWAL NA LARAWAN · DALAWANG KWINTAS',
  title: 'OVAL AT HEXAGON SA LINEN',
  caption:
    'BISWAL NA PAGLALARAWAN NG DALAWANG KULAY-GINTONG KWINTAS NA MAGKATABI — ANG OVAL NA JERSEY (SUOT NI CHICO) AT ANG HEXAGON NA KEITH (SUOT NI CHICA). NASA IBABA ANG MGA APRUBADONG GUHIT NOONG AGOSTO 28 AT ANG MGA AKTWAL NA KUHA NOONG SETYEMBRE 11.',
};

const DESIGN_MOCKUPS = [
  {
    id: 'jersey-design',
    surface: 'light',
    src: '/assets/kwintas/jersey-design.png',
    alt: 'APRUBADONG GUHIT NOONG AGOSTO 28, 2026 NG OVAL NA MONOGRAM NA KWINTAS NA JERSEY — ITIM NA LINYA SA MALIWANAG NA PAPEL, SUOT NI CHICO.',
    kicker: 'AGOSTO 28, 2026 · APRUBADONG GUHIT',
    name: 'JERSEY',
    wearer: 'OVAL · SUOT NI CHICO (KEITH)',
    title: 'JERSEY — ANG OVAL NA GUHIT',
    caption:
      'ANG AKTWAL NA APRUBADONG GUHIT NG OVAL NA MONOGRAM NA JERSEY NOONG AGOSTO 28 — MALAMBOT AT DUMADALOY ANG MGA KURBA SA LOOB, ANG KWINTAS NA LAGING SUOT NI CHICO MALAPIT SA PUSO.',
    description:
      'ISANG MATAYOG AT MALINIS NA OVAL NA MAY MALAMBOT AT DUMADALOY NA KURBA SA LOOB. KULAY-GINTONG PALAMUTI NA DALA KO ARAW-ARAW — MALAPIT SA PUSO, KAHIT SA PINAKA-ORDINARYONG ARAW.',
    symbolLabel: 'PERSONAL NA SIMBOLISMO',
    symbolCopy:
      'SA MUNTING TALA NG PINAGAWANG PARES, INILALARAWAN ANG JERSEY BILANG TAHANANG ISLA, TATAG, AT MALALIM NA UGAT — TULAD NG KAPANATAGANG NARARAMDAMAN KO TUWING KASAMA KITA.',
  },
  {
    id: 'keith-design',
    surface: 'light',
    src: '/assets/kwintas/keith-design.png',
    alt: 'APRUBADONG GUHIT NOONG AGOSTO 28, 2026 NG HEXAGON NA MONOGRAM NA KWINTAS NA KEITH — ITIM NA LINYA SA MALIWANAG NA PAPEL, SUOT NI CHICA.',
    kicker: 'AGOSTO 28, 2026 · APRUBADONG GUHIT',
    name: 'KEITH',
    wearer: 'HEXAGON · SUOT NI CHICA (JERSEY)',
    title: 'KEITH — ANG HEXAGON NA GUHIT',
    caption:
      'ANG AKTWAL NA APRUBADONG GUHIT NG HEXAGON NA MONOGRAM NA KEITH NOONG AGOSTO 28 — ANIM NA SULOK AT BANAYAD NA KURBA NA KUSANG NAGKAKATUGMA SA OVAL, ANG KWINTAS NA SUOT NI CHICA.',
    description:
      'ISANG BALANSENG HEXAGON NA MAY BANAYAD NA KURBA NG LETRA SA LOOB. MAGKAIBA MAN ANG BALANGKAS SA OVAL, KUSANG NAGKAKATUGMA KAPAG PINAGTABI — PARANG TAYONG DALAWA.',
    symbolLabel: 'PERSONAL NA SIMBOLISMO',
    symbolCopy:
      'SA TALA RIN NG PINAGAWANG PARES, INIUGNAY ANG KEITH SA KAGUBATAN, TAHIMIK NA LAKAS, AT PATULOY NA PAGLAGO — ISANG PAALALA NA LAGI AKONG KAKAMPI AT SANDALAN MO.',
  },
];

const ACTUAL_PHOTOS = [
  {
    id: 'together',
    surface: 'dark',
    layout: 'wide',
    src: '/assets/kwintas/necklaces-together.jpg',
    alt: 'AKTWAL NA LITRATO NOONG SETYEMBRE 11, 2026 NG DALAWANG MONOGRAM NA KWINTAS SA KANILANG ITIM NA VELVET BOX KATABI ANG KAHONG MAY TATAK NA MONOGRAM — OVAL NA JERSEY SA KALIWA AT HEXAGON NA KEITH SA KANAN.',
    kicker: 'SETYEMBRE 11, 2026 · AKTWAL NA KUHA',
    tag: 'MAGKASAMA SA KAHON',
    title: 'SA ITIM NA KAHON NG MONOGRAM',
    caption:
      'ANG AKTWAL NA KUHA BAGO NATIN ISUOT ANG DALAWANG KWINTAS NOONG LATE MONTHSARY CELEBRATION NATIN — PAREHONG NAKAHIMLAY SA ITIM NA VELVET BOX KATABI ANG KAHONG MAY TATAK NA MONOGRAM. SA KALIWA ANG OVAL NA JERSEY, SA KANAN ANG HEXAGON NA KEITH.',
    subnote: 'LATE MONTHSARY AT PALITAN NG REGALO · SETYEMBRE 11, 2026',
  },
  {
    id: 'keith-hexagon',
    surface: 'dark',
    layout: 'portrait',
    src: '/assets/kwintas/keith-hexagon.jpg',
    alt: 'AKTWAL NA LITRATO NOONG SETYEMBRE 11, 2026 NG HEXAGONAL NA MONOGRAM NA KWINTAS NA KEITH SA LOOB NG ITIM NA KAHONG MAY CARD NA MONOGRAM — PARA KAY CHICA.',
    kicker: 'SETYEMBRE 11, 2026 · PARA KAY CHICA',
    tag: 'SUOT NI CHICA / JERSEY',
    title: 'KEITH — ANG HEXAGON PARA SA’YO',
    caption:
      'MONOGRAM NG PANGALAN KO, NAKABALOT SA ANIM NA SULOK NA HEXAGON — NAKALAAN PARA SA’YO, CHICAAAA KOOOO. PARA KAHIT SA MGA TAHIMIK O ABALANG ARAW, ALAM MONG MAY LAKAS AT PAGMAMAHAL NA LAGING NAKALAPIT SA PUSO MO.',
    subnote: 'KEITH · HEXAGON · SUOT NI CHICA',
  },
  {
    id: 'jersey-oval',
    surface: 'dark',
    layout: 'portrait',
    src: '/assets/kwintas/jersey-oval.jpg',
    alt: 'AKTWAL NA LITRATO NOONG SETYEMBRE 11, 2026 NG OVAL NA MONOGRAM NA KWINTAS NA JERSEY SA LOOB NG ITIM NA KAHONG MAY CARD NA MONOGRAM — SUOT NI CHICO.',
    kicker: 'SETYEMBRE 11, 2026 · PARA KAY CHICO',
    tag: 'SUOT NI CHICO / KEITH',
    title: 'JERSEY — ANG OVAL PARA SA AKIN',
    caption:
      'MONOGRAM NG PANGALAN MO, NAKABALOT SA MALINIS NA OVAL — ANG KWINTAS NA LAGING SUOT NG CHICOOO MO. PAALALA NA KAHIT SAAN AKO MAGPUNTA, DALA KO ANG PANGALAN NG TAHANANG PINILI KO.',
    subnote: 'JERSEY · OVAL · SUOT NI CHICO',
  },
];

const ALL_LIGHTBOX_ITEMS = [HERO_PORTRAIT, ...DESIGN_MOCKUPS, ...ACTUAL_PHOTOS];

const STORY_CHAPTERS = [
  {
    id: 'aug-27',
    num: '01',
    date: 'AGOSTO 27, 2026',
    tabTitle: 'ANG PLANONG PARES',
    meta: 'PERFECT PRESENTS · PASADYANG PARES',
    heading: 'DALAWANG HUGIS NA PINILI PARA SA ISA’T ISA.',
    reflectionLabel: 'DIWA · PERSONAL NA TALA',
    reflection:
      'JERSEY SA OVAL, KEITH SA HEXAGON, PAREHONG KULAY-GINTO — ISANG TAHIMIK NA HILING NA LAGING MAY DALA TAYONG PANGALAN NG ISA’T ISA.',
    paragraphs: [
      'NOONG AGOSTO 27, PINAGAWA KO ANG PASADYANG PARES NG MONOGRAM NA KWINTAS SA PERFECT PRESENTS — HINDI PARA LANG MAY MAGKAPAREHONG GAMIT TAYO, KUNDI PARA LAGING MAY DALA TAYONG PANGALAN NG ISA’T ISA MALAPIT SA PUSO.',
      'PINILI ANG OVAL NA BALANGKAS PARA SA JERSEY AT ANG HEXAGONAL NA BALANGKAS PARA SA KEITH, PAREHONG KULAY-GINTO. KASAMA SA PERSONAL NA SIMBOLISMO NG PARES ANG LARAWAN NG TAHANANG ISLA, TATAG, AT MALALIM NA UGAT PARA SA JERSEY — AT KAGUBATAN, TAHIMIK NA LAKAS, AT PAGLAGO PARA SA KEITH.',
    ],
  },
  {
    id: 'aug-28',
    num: '02',
    date: 'AGOSTO 28, 2026',
    tabTitle: 'APRUBADONG KURBA',
    meta: 'DISENYO · HARMONYA NG PARES',
    heading: 'MAGKAIBA ANG BALANGKAS, PERO IISA ANG BAGAY.',
    reflectionLabel: 'DIWA · PERSONAL NA PAGNINILAY',
    reflection:
      'SA MGA APRUBADONG GUHIT NOONG AGOSTO 28, MALAMBOT AT DUMADALOY ANG MGA KURBA — MAGKAIBA ANG HUGIS PERO HALATANG PARA SA ISA’T ISA.',
    paragraphs: [
      'KINABUKASAN DIN, AGOSTO 28, DUMATING AT INAPRUBAHAN ANG DALAWANG GUHIT NG PENDANT NA MAKIKITA RIN SA ITAAS. ANG UNANG TUMATAK AY KUNG GAANO KAGANDA AT KADULAS ANG DALOY NG MGA KURBA NG LETRA SA LOOB NG BAWAT BALANGKAS.',
      'HINDI KAILANGANG MAGING MAGKAMUKHANG-MAGKAMUKHA ANG OVAL AT HEXAGON PARA MAKITA MONG PARA SA ISA’T ISA SILA. TULAD NATIN — MAGKAIBA MAN ANG HILIG O UGALI SA ILANG BAGAY, KUSANG NAGKAKASUNDO AT NAGKAKABUO BILANG ISANG PARES.',
    ],
  },
  {
    id: 'sept-5-6',
    num: '03',
    date: 'SETYEMBRE 5–6, 2026',
    tabTitle: 'PAGHIHINTAY AT DUMATING NA',
    meta: 'SETYEMBRE 6 · 1:48 PM · DUMATING ANG PARES',
    heading: 'MULA KONTING KABA HANGGANG SA SIGAW NG TUWA.',
    quote: '“DUMATING NAAAA YUNG MONOGRAMMM”',
    quoteBy: 'CHICO · SETYEMBRE 6, 2026 · 1:48 PM',
    paragraphs: [
      'NOONG SETYEMBRE 5, MAY KONTING PAGHIHINTAY PA SA SHIPPING UPDATE — PAMPANATAG ANG SAGOT NG SUPPORT NA INAASAHANG MAG-UUPDATE ANG TRACKING SA LOOB NG 24–48 ORAS AT NAKATAKDA NANG MA-PICKUP KINABUKASAN. TAHIMIK LANG AKONG NAG-AABANG, EXCITED NANG MAKITA KUNG ANO ANG ITSURA NG PARES NATIN SA PERSONAL.',
      'AT KINABUKASAN, SETYEMBRE 6 BANDANG 1:48 PM, SA WAKAS DUMATING NA! HINDI KO NA NAITAGO ANG KILIG AT TUWA — NAPASIGAW NA LANG AKO SA CHAT NA “DUMATING NAAAA YUNG MONOGRAMMM!” HAWAK KO NA ANG MUNTING REGALONG MATAGAL KONG HININTAY NA MAIBIGAY SA’YO.',
    ],
  },
  {
    id: 'sept-11',
    num: '04',
    date: 'SETYEMBRE 11, 2026',
    tabTitle: 'LATE MONTHSARY AT MGA REGALO',
    meta: 'SETYEMBRE 11 · PALITAN NG PUSO',
    heading: 'MONOGRAM KO PARA SA’YO, MONOGRAM MO PARA SA AKIN.',
    quote: '“MONOGRAM NG PANGALAN KO PARA SAYO, AT MONOGRAM MO PARA SAKIN.”',
    quoteBy: 'SETYEMBRE 11, 2026 · LATE MONTHSARY CELEBRATION',
    paragraphs: [
      'NOONG SETYEMBRE 11, SA LATE MONTHSARY CELEBRATION NATIN, BINUKSAN NATIN ANG DALAWANG ITIM NA KAHON NA MAY TATAK NA MONOGRAM — AT DOON KO NAIBIGAY ANG HEXAGON NA KEITH PARA SA’YO AT NAISUOT KO ANG OVAL NA JERSEY PARA SA AKIN.',
      'SA PAREHONG ARAW DIN NA ’YON, MAY MGA REGALO KA RIN PARA SA AKIN — ANG MGA CROCHET FLOWERS AT SI CHICABARA. PUNONG-PUNO ANG ARAW NA ’YON NG MGA BAGAY NA MAY EFFORT, MAY LAMBING, AT MAY ALAALANG HANGGANG NGAYON AY TINATAGO KO.',
    ],
  },
  {
    id: 'nov-4',
    num: '05',
    date: 'NOBYEMBRE 4 & ARAW-ARAW',
    tabTitle: 'LAGI MO PA SUOT',
    meta: 'MGA ORDINARYONG ARAW · 11:11',
    heading: 'HINDI LANG PARA SA ISANG ARAW — KUNDI ARAW-ARAW.',
    quote: '“LAGI MO PA SUOT YING NECKLACE”',
    quoteBy: 'CHICA · NOBYEMBRE 4, 2026',
    paragraphs: [
      'ILANG LINGGO AT BUWAN ANG LUMIPAS, NAPANSIN MO NOONG NOBYEMBRE 4 NA SUOT KO PA RIN PALAGI ANG KWINTAS: “LAGI MO PA SUOT YING NECKLACE.” ANG SIMPLENG LINYA LANG, PERO ANG LAKI NG NGITI KO NANG MABASA KO ’YON.',
      'DAHIL HINDI NAMAN ITO REGALONG PANG-PICTURE LANG O PANG-ESPESYAL NA OKASYON. MAS MAGANDA SIYA DAHIL KASAMA NA SIYA SA MGA ORDINARYONG ARAW — SA BIYAHE, SA TRABAHO, SA PAHINGA, AT SA BAWAT 11:11 NA IKAW PA RIN ANG HILING KO.',
    ],
  },
];

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12H5M11 6L5 12L11 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PairedFramesEmblem({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="18"
        height="28"
        rx="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="8"
        y="8"
        width="10"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.1"
      />
      <polygon
        points="40,3 52,10 52,26 40,33 28,26 28,10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <polygon
        points="40,7.5 48,12 48,24 40,28.5 32,24 32,12"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function KwintasPage({ necklaceStage = null }) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [keptIds, setKeptIds] = useState([]);
  const [letterOpen, setLetterOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const shellRef = useRef(null);
  const tabRefs = useRef([]);
  const heroLetterOpenerRef = useRef(null);
  const lastOpenerRef = useRef(null);
  const letterHeadingRef = useRef(null);
  const letterSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);
  const stageSectionRef = useRef(null);
  const lightboxDialogRef = useRef(null);
  const lightboxCloseRef = useRef(null);
  const lastPhotoTriggerRef = useRef(null);

  const activeChapter = STORY_CHAPTERS[activeChapterIndex];
  const isChapterKept = keptIds.includes(activeChapter.id);
  const allChaptersKept = keptIds.length === STORY_CHAPTERS.length;
  const isLightboxOpen = lightboxIndex !== null;
  const activeLightboxItem = isLightboxOpen ? ALL_LIGHTBOX_ITEMS[lightboxIndex] : null;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '11:11 · ANG KWINTAS NATIN — PARA SA CHICAAAA KO';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    if (!letterOpen) return;
    letterHeadingRef.current?.focus({ preventScroll: true });
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    letterSectionRef.current?.scrollIntoView?.({
      block: 'start',
      behavior: reduced ? 'instant' : 'smooth',
    });
  }, [letterOpen]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const shellEl = shellRef.current;
    const prevInert = shellEl ? Boolean(shellEl.inert) : false;
    const prevHadInertAttr = shellEl ? shellEl.hasAttribute('inert') : false;
    const prevAriaHidden = shellEl ? shellEl.getAttribute('aria-hidden') : null;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    if (shellEl) {
      shellEl.inert = true;
      shellEl.setAttribute('inert', '');
      shellEl.setAttribute('aria-hidden', 'true');
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    lightboxCloseRef.current?.focus({ preventScroll: true });

    function onWindowKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setLightboxIndex(null);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setLightboxIndex((current) =>
          current === null ? null : (current + 1) % ALL_LIGHTBOX_ITEMS.length
        );
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setLightboxIndex((current) =>
          current === null
            ? null
            : (current - 1 + ALL_LIGHTBOX_ITEMS.length) % ALL_LIGHTBOX_ITEMS.length
        );
      } else if (event.key === 'Tab') {
        const dialogEl = lightboxDialogRef.current;
        if (!dialogEl) return;
        const focusables = Array.from(dialogEl.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
          (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
        );
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (event.shiftKey) {
          if (active === first || !dialogEl.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last || !dialogEl.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', onWindowKeyDown);

    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);

      if (shellEl) {
        shellEl.inert = prevInert;
        if (!prevInert && !prevHadInertAttr) {
          shellEl.removeAttribute('inert');
        }
        if (prevAriaHidden === null) {
          shellEl.removeAttribute('aria-hidden');
        } else {
          shellEl.setAttribute('aria-hidden', prevAriaHidden);
        }
      }

      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;

      const triggerEl = lastPhotoTriggerRef.current;
      if (triggerEl && triggerEl.isConnected) {
        triggerEl.focus({ preventScroll: true });
      }
    };
  }, [isLightboxOpen]);

  function toggleLetter(openerElement = null) {
    if (letterOpen) {
      setLetterOpen(false);
      (lastOpenerRef.current || heroLetterOpenerRef.current)?.focus({ preventScroll: true });
    } else {
      lastOpenerRef.current = openerElement || heroLetterOpenerRef.current;
      setLetterOpen(true);
    }
  }

  function handleLetterKeyDown(event) {
    if (isLightboxOpen) return;
    if (event.key === 'Escape' && letterOpen) {
      event.preventDefault();
      setLetterOpen(false);
      (lastOpenerRef.current || heroLetterOpenerRef.current)?.focus({ preventScroll: true });
    }
  }

  function scrollToSection(ref) {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    ref.current?.scrollIntoView?.({
      block: 'start',
      behavior: reduced ? 'instant' : 'smooth',
    });
  }

  function toggleKeepChapter(id) {
    setKeptIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function handleTabKeyDown(event, index) {
    let nextIndex = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (index + 1) % STORY_CHAPTERS.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + STORY_CHAPTERS.length) % STORY_CHAPTERS.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = STORY_CHAPTERS.length - 1;
    }
    if (nextIndex !== null) {
      event.preventDefault();
      setActiveChapterIndex(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  }

  function openLightbox(index, triggerEl) {
    lastPhotoTriggerRef.current = triggerEl || null;
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  return (
    <div className="kw-page" lang="tl">
      <div ref={shellRef} className="kw-shell">
        <header className="kw-nav">
          <Link to="/#sulat-3" className="kw-back-link">
            <span className="kw-back-arrow" aria-hidden="true">
              <BackArrowIcon />
            </span>
            <span className="kw-back-text">
              <strong>BALIK SA SULAT</strong>
              <span>LIBRARY NI CHICO</span>
            </span>
          </Link>

          <span className="kw-nav-center">SULAT · ANG KWINTAS NATIN</span>

          <span className="kw-nav-time" aria-label="11:11">
            11:11 <PairedFramesEmblem />
          </span>
        </header>

        <main>
          {/* SECTION 1: TOP INTERACTIVE 3D MODEL SHOWCASE (FIRST ON DESKTOP & MOBILE) */}
          <section
            ref={stageSectionRef}
            id="kw-3d-stage"
            className="kw-stage-section kw-stage-top"
            aria-labelledby="kw-hero-title"
          >
            <div className="kw-stage-header kw-stage-top-header">
              <div>
                <p className="kw-eyebrow">
                  <span className="kw-eyebrow-rule" aria-hidden="true" />
                  11:11 · SULAT · MULA SA CHICOOO MO
                </p>
                <h1 id="kw-hero-title" className="kw-title">
                  ANG KWINTAS NATIN
                </h1>
                <p className="kw-subtitle">DALAWANG HUGIS, ISANG PUSO.</p>
              </div>
              <p className="kw-stage-hint">
                3D NA SILIP · HILAIN PARA PAIKUTIN · KURUTIN PARA ILAPIT
              </p>
            </div>

            <div className="kw-vitrine">
              <div className="kw-vitrine-frame" aria-hidden="true" />
              <div className="kw-vitrine-top">
                <span>11:11 · DALAWANG KWINTAS</span>
                <strong>JERSEY (OVAL) &amp; KEITH (HEXAGON)</strong>
              </div>

              <div className="kw-stage-slot">
                {necklaceStage || (
                  <div className="kw-stage-placeholder" role="status">
                    <PairedFramesEmblem />
                    <p>WALA PANG NAKALATAG NA 3D NA SILIP SA SANDALING ITO.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 2: 11:11 EDITORIAL INTRO + LINEN VISUALIZATION (SECOND VISUAL) */}
          <section className="kw-hero" aria-labelledby="kw-linen-title">
            <div className="kw-hero-copy">
              <p className="kw-section-kicker">BISWAL NA LARAWAN · OVAL AT HEXAGON</p>
              <h2 id="kw-linen-title" className="kw-section-title">
                DALAWANG PANGALAN <em>SA LINEN.</em>
              </h2>

              <p className="kw-lede">
                ISANG OVAL NA MAY PANGALAN MO PARA SA AKIN, AT ISANG HEXAGON NA MAY PANGALAN KO PARA
                SA’YO. MAGKAIBA MAN ANG BALANGKAS, IISANG PARES NA PINILI PARA LAGING MANATILING
                MALAPIT SA PUSO — SA MGA ESPESYAL NA PETSA AT SA BAWAT ORDINARYONG ARAW.
              </p>

              <p className="kw-hero-quote">
                “MONOGRAM NG PANGALAN KO PARA SAYO, AT MONOGRAM MO PARA SAKIN.” — SETYEMBRE 11,
                2026.
              </p>

              <div className="kw-hero-actions">
                <button
                  ref={heroLetterOpenerRef}
                  type="button"
                  className="kw-primary-btn"
                  aria-expanded={letterOpen}
                  aria-controls="kw-letter"
                  onClick={(event) => toggleLetter(event.currentTarget)}
                >
                  <PairedFramesEmblem />
                  {letterOpen ? 'ITUPI MUNA ANG SULAT' : 'BUKSAN ANG SULAT SA 11:11'}
                </button>

                <button
                  type="button"
                  className="kw-ghost-btn"
                  onClick={() => scrollToSection(gallerySectionRef)}
                >
                  MGA LITRATO (SET 11)
                </button>

                <button
                  type="button"
                  className="kw-ghost-btn"
                  onClick={() => scrollToSection(stageSectionRef)}
                >
                  TINGNAN SA 3D
                </button>
              </div>

              <div className="kw-hero-ledger" aria-label="MAHAHALAGANG PETSA · ANG KWINTAS NATIN">
                <div className="kw-hero-stat">
                  <span>AGO 27–28</span>
                  <strong>PINAGAWA AT INAPRUBAHAN</strong>
                </div>
                <div className="kw-hero-stat">
                  <span>SET 6 & 11</span>
                  <strong>DUMATING AT BINIGAY SA MONTHSARY</strong>
                </div>
                <div className="kw-hero-stat">
                  <span>11:11</span>
                  <strong>ARAW-ARAW NA SUOT MALAPIT SA PUSO</strong>
                </div>
              </div>
            </div>

            <figure className="kw-hero-plate">
              <div className="kw-hero-plate-head">
                <span>11:11 · PARES NA KWINTAS</span>
                <span className="kw-plate-badge">BISWAL NA LARAWAN</span>
              </div>

              <button
                type="button"
                className="kw-hero-img-btn"
                onClick={(event) => openLightbox(0, event.currentTarget)}
                aria-label="PALAKIHIN ANG BISWAL NA LARAWAN NG DALAWANG KWINTAS"
              >
                <img
                  src={resolveKwintasMedia(HERO_PORTRAIT.src)}
                  alt={HERO_PORTRAIT.alt}
                  loading="eager"
                  decoding="async"
                />
                <span className="kw-photo-zoom-pill" aria-hidden="true">
                  TINGNAN NANG MALAPITAN
                </span>
              </button>

              <figcaption>
                <strong>OVAL (JERSEY) · HEXAGON (KEITH) · KULAY-GINTO</strong>
                <span>DALAWANG PANGALAN, MAGKATABI.</span>
              </figcaption>
            </figure>
          </section>

          {/* SECTION 3: AUG 28 APPROVED DESIGN STUDY & FULL NAME MEANINGS */}
          <section className="kw-pair-section" aria-labelledby="kw-pair-title">
            <div className="kw-pair-head">
              <div>
                <p className="kw-section-kicker">
                  AGOSTO 28, 2026 · APRUBADONG DISENYO AT BUONG KAHULUGAN NG MGA PANGALAN
                </p>
                <h2 id="kw-pair-title" className="kw-section-title">
                  ANG DALOY NG <em>MGA KURBA.</em>
                </h2>
                <p className="kw-section-intro">
                  KINABUKASAN MATAPOS IPAGAWA NOONG AGOSTO 27, ITO ANG DALAWANG AKTWAL NA GUHIT NA
                  INAPRUBAHAN — KASAMA ANG BUONG KAHULUGAN NG MGA PANGALAN AT PERSONAL NA
                  SIMBOLISMONG PINILI PARA SA PARES NATIN.
                </p>
              </div>
              <p className="kw-pair-note">
                PINDUTIN ANG BAWAT GUHIT PARA TINGNAN NANG MALAPITAN.
              </p>
            </div>

            <div className="kw-pair-grid">
              {DESIGN_MOCKUPS.map((item, index) => {
                const order = ORDER_BY_NAME[item.name];
                return (
                  <article key={item.id} className="kw-pendant-card">
                    <button
                      type="button"
                      className="kw-design-trigger"
                      onClick={(event) => openLightbox(index + 1, event.currentTarget)}
                      aria-label={`PALAKIHIN ANG APRUBADONG GUHIT: ${item.title}`}
                    >
                      <img
                        src={resolveKwintasMedia(item.src)}
                        alt={item.alt}
                        decoding="async"
                      />
                      <span className="kw-design-zoom-pill" aria-hidden="true">
                        TINGNAN NANG MALAPITAN
                      </span>
                    </button>

                    <div className="kw-pendant-top">
                      <div className="kw-pendant-meta">
                        <span>{item.kicker}</span>
                        <h3>{order ? order.name : item.name}</h3>
                      </div>
                      <span className="kw-pendant-wearer">{item.wearer}</span>
                    </div>

                    <p className="kw-pendant-desc">{item.description}</p>

                    <div className="kw-pendant-symbol">
                      <span>BUONG KAHULUGAN NG PANGALAN · PERSONAL NA SIMBOLISMO NG PARES</span>
                      {order && (
                        <blockquote className="kw-order-meaning">
                          <p>{order.meaning}</p>
                        </blockquote>
                      )}
                      <p className="kw-symbol-note">{item.symbolCopy}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* SECTION 4: SEPT 11 ACTUAL PHOTOS (PERMANENT GALLERY, INDEPENDENT OF 3D MODEL) */}
          <section
            ref={gallerySectionRef}
            id="kw-gallery"
            className="kw-gallery-section"
            aria-labelledby="kw-gallery-title"
          >
            <div className="kw-gallery-head">
              <div>
                <p className="kw-section-kicker">AKTWAL NA MGA KUHA · SETYEMBRE 11, 2026</p>
                <h2 id="kw-gallery-title" className="kw-section-title">
                  SETYEMBRE 11, 2026. <em>SA ITIM NA KAHON.</em>
                </h2>
                <p className="kw-section-intro">
                  ITO ANG MGA AKTWAL NA LITRATO NG DALAWANG KWINTAS NOONG LATE MONTHSARY CELEBRATION
                  NATIN — BAGO NATIN ISUOT ANG PANGALAN NG ISA’T ISA, SA ARAW RING BINIGAY MO SA
                  AKIN ANG MGA CROCHET FLOWERS AT SI CHICABARA.
                </p>
              </div>

              <div className="kw-gallery-legend">
                <span>TATLONG AKTWAL NA KUHA NOONG SETYEMBRE 11</span>
                <span>PINDUTIN ANG BAWAT LITRATO PARA TINGNAN NANG MALAPITAN</span>
              </div>
            </div>

            <div className="kw-gallery-grid">
              {ACTUAL_PHOTOS.map((photo, index) => (
                <figure
                  key={photo.id}
                  className={`kw-photo-card kw-photo-card-${photo.layout}`}
                >
                  <button
                    type="button"
                    className="kw-photo-trigger"
                    onClick={(event) =>
                      openLightbox(1 + DESIGN_MOCKUPS.length + index, event.currentTarget)
                    }
                    aria-label={`PALAKIHIN ANG AKTWAL NA LITRATO: ${photo.title}`}
                  >
                    <img
                      src={resolveKwintasMedia(photo.src)}
                      alt={photo.alt}
                      decoding="async"
                    />
                    <span className="kw-photo-zoom-pill" aria-hidden="true">
                      PALAKIHIN
                    </span>
                  </button>

                  <figcaption className="kw-photo-body">
                    <div className="kw-photo-meta">
                      <span>{photo.kicker}</span>
                      <span>{photo.tag}</span>
                    </div>
                    <h3 className="kw-photo-title">{photo.title}</h3>
                    <p className="kw-photo-caption">{photo.caption}</p>
                    <p className="kw-photo-subnote">{photo.subnote}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* SECTION 5: INTERACTIVE STORY TIMELINE LEDGER */}
          <section className="kw-timeline-section" aria-labelledby="kw-timeline-title">
            <div className="kw-timeline-head">
              <div>
                <p className="kw-section-kicker">MULA AGOSTO 27 HANGGANG ARAW-ARAW</p>
                <h2 id="kw-timeline-title" className="kw-section-title">
                  LIMANG YUGTO · <em>ANG KWINTAS NATIN.</em>
                </h2>
              </div>

              <p className="kw-timeline-status" role="status" aria-live="polite">
                {allChaptersKept
                  ? 'LAHAT NG 5 ALAALA AY NAKAINGAT NA SA PUSO.'
                  : `${keptIds.length} SA ${STORY_CHAPTERS.length} ALAALANG ININGATAN`}
              </p>
            </div>

            <div className="kw-ledger">
              <div
                className="kw-tablist"
                role="tablist"
                aria-label="MGA KABANATA · ANG KWINTAS NATIN"
              >
                {STORY_CHAPTERS.map((chapter, index) => {
                  const selected = index === activeChapterIndex;
                  const kept = keptIds.includes(chapter.id);
                  return (
                    <button
                      key={chapter.id}
                      ref={(el) => {
                        tabRefs.current[index] = el;
                      }}
                      id={`kw-tab-${chapter.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`kw-panel-${chapter.id}`}
                      tabIndex={selected ? 0 : -1}
                      className="kw-tab"
                      onClick={() => setActiveChapterIndex(index)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                    >
                      <span className="kw-tab-num">{chapter.num}</span>
                      <span>
                        <span className="kw-tab-date">{chapter.date}</span>
                        <span className="kw-tab-title">{chapter.tabTitle}</span>
                      </span>
                      <span className="kw-tab-mark" aria-hidden="true">
                        {kept ? '◆' : '◇'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <article
                key={activeChapter.id}
                id={`kw-panel-${activeChapter.id}`}
                role="tabpanel"
                aria-labelledby={`kw-tab-${activeChapter.id}`}
                className="kw-panel"
              >
                <div className="kw-panel-meta">
                  <span>KABANATA {activeChapter.num}</span>
                  <span>{activeChapter.meta}</span>
                </div>

                <h3 className="kw-panel-title">{activeChapter.heading}</h3>

                {activeChapter.quote ? (
                  <blockquote className="kw-panel-quote">
                    <p>{activeChapter.quote}</p>
                    <footer>— {activeChapter.quoteBy}</footer>
                  </blockquote>
                ) : (
                  <div className="kw-panel-reflection">
                    <span className="kw-panel-reflection-label">
                      {activeChapter.reflectionLabel}
                    </span>
                    <p>{activeChapter.reflection}</p>
                  </div>
                )}

                <div className="kw-panel-body">
                  {activeChapter.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <div className="kw-panel-actions">
                  <button
                    type="button"
                    className="kw-keep-btn"
                    aria-pressed={isChapterKept}
                    onClick={() => toggleKeepChapter(activeChapter.id)}
                  >
                    {isChapterKept ? '◆ ININGATAN SA PUSO' : '◇ INGATAN ANG ALAALANG ’TO'}
                  </button>

                  <button
                    type="button"
                    className="kw-next-btn"
                    onClick={() => {
                      const nextIndex = (activeChapterIndex + 1) % STORY_CHAPTERS.length;
                      setActiveChapterIndex(nextIndex);
                      tabRefs.current[nextIndex]?.focus();
                    }}
                  >
                    SUSUNOD NA KABANATA →
                  </button>
                </div>
              </article>
            </div>

            {allChaptersKept && (
              <p className="kw-timeline-complete" role="status">
                MULA AGOSTO 27 HANGGANG SA MGA ORDINARYONG ARAW — LAHAT NG ALAALA NG KWINTAS
                NATIN, NAKAINGAT NA MALAPIT SA PUSO. ♡
              </p>
            )}
          </section>

          {/* SECTION 6: LETTER INVITATION & TENDER 11:11 LETTER */}
          <div className="kw-letter-invite">
            <p className="kw-section-kicker">SULAT MULA SA CHICOOO MO · 11:11</p>
            <p>
              MAY MAHINAHONG SULAT AKONG TINABI DITO PARA SA’YO, ASAWAAAA KOOOO — TUNGKOL SA
              DALAWANG MONOGRAM, SA PAGHIHINTAY NOONG SETYEMBRE, AT KUNG BAKIT ARAW-ARAW KO PA RING
              SUOT ANG PANGALAN MO.
            </p>
            <button
              type="button"
              className="kw-primary-btn"
              aria-expanded={letterOpen}
              aria-controls="kw-letter"
              onClick={(event) => toggleLetter(event.currentTarget)}
            >
              <PairedFramesEmblem />
              {letterOpen ? 'ITUPI MUNA ANG SULAT' : 'BASAHIN ANG SULAT NI CHICOOO'}
            </button>
          </div>

          <section
            ref={letterSectionRef}
            id="kw-letter"
            className="kw-letter-section"
            aria-labelledby="kw-letter-heading"
            hidden={!letterOpen}
            onKeyDown={handleLetterKeyDown}
          >
            {letterOpen && (
              <article className="kw-letter-card">
                <div className="kw-letter-top">
                  <span>11:11 · SULAT MULA SA CHICOOO MO</span>
                  <span>ANG KWINTAS NATIN · SULAT</span>
                </div>

                <h2 id="kw-letter-heading" ref={letterHeadingRef} tabIndex={-1}>
                  CHICAAAA KOOOO, ASAWAAAA KOOOO,
                </h2>

                <div className="kw-letter-body">
                  <p>
                    11:11 POOOO, ASAWAAAA KOOOO. GUSTO KO LANG PONG ITAGO DITO SA LIBRARY NATIN ANG
                    BUONG KWENTO NG DALAWANG KWINTAS NA PINAGAWA KO PARA SA ATING DALAWA — HINDI
                    LANG YUNG ISANG LINYA SA KWENTO NATIN, KUNDI YUNG LAHAT NG KILIG, PAGHIHINTAY,
                    AT LAMBING SA LIKOD NITO.
                  </p>

                  <p>
                    NAAALALA KO PA NOONG AGOSTO 27 NUNG PINAGAWA KO YUNG PARES NATIN SA PERFECT
                    PRESENTS. SIMPLE LANG YUNG NASA ISIP KO NOON: GUSTO KONG MAY DALA KANG PANGALAN
                    KO MALAPIT SA PUSO MO, AT GUSTO KONG DALA KO RIN YUNG PANGALAN MO MALAPIT SA
                    PUSO KO. OVAL PARA SA JERSEY, HEXAGON PARA SA KEITH — PAREHONG KULAY-GINTO,
                    MAGKAIBA ANG HUGIS PERO HALATANG PARA SA ISA’T ISA.
                  </p>

                  <p>
                    NUNG KINABUKASAN, AGOSTO 28, NUNG NAKITA KO NA YUNG DISENYO AT INAPRUBAHAN KO
                    SIYA, ANG SAYA KO TALAGA. ANG GANDA NG DALOY NG MGA KURBA NG LETRA SA LOOB NG
                    OVAL AT HEXAGON — MALINIS, MALAMBOT, AT NAGKAKATUGMA. DOON KO MAS NAISIP NA
                    PARANG TAYO PALA ’YON: HINDI KAILANGANG MAGKAPAREHONG-MAGKAPAREHO PARA MAGING
                    PERPEKTONG PARES.
                  </p>

                  <p>
                    TAPOS NAALALA MO BA YUNG PAGHIHINTAY NOONG SETYEMBRE 5? NAG-AABANG PA TAYO NOON
                    NG SHIPPING UPDATE, AT PAMPANATAG YUNG SABI NG SUPPORT NA MAG-UUPDATE DIN ANG
                    TRACKING SA LOOB NG 24–48 ORAS AT INAASAHANG MA-PICKUP KINABUKASAN. SULIT LAHAT
                    NG PAG-AABANG NUNG DUMATING SIYA KINABUKASAN, SETYEMBRE 6, BANDANG 1:48 PM.
                    HINDI KO TALAGA NAPIGILAN YUNG SARILI KO — “DUMATING NAAAA YUNG MONOGRAMMM!”
                    EXCITED NA EXCITED AKONG MAIBIGAY NA SA’YO.
                  </p>

                  <p>
                    KAYA NUNG LATE MONTHSARY CELEBRATION NATIN NOONG SETYEMBRE 11, ANG SARAP SA
                    PAKIRAMDAM NUNG BINUKSAN NATIN YUNG DALAWANG ITIM NA KAHON NG MONOGRAM. SABAY
                    PA ’YON SA MGA BIGAY MO SA AKIN — YUNG MGA CROCHET FLOWERS AT SI CHICABARA.
                    PARA SA AKIN, ISA ’YON SA PINAKAMATATAMIS NA PALITAN NG REGALO NATIN, KASI
                    RAMDAM NA RAMDAM YUNG PUSO SA BAWAT DETALYE.
                  </p>

                  <p>
                    AT ALAM MO BA KUNG KAILAN AKO LALO NAPANGITI? NOONG NOBYEMBRE 4, NUNG SINABI MO
                    SA AKIN NA, “LAGI MO PA SUOT YING NECKLACE.” OO, ASAWAAAA KOOOO — LAGI KO
                    TALAGA SIYANG SUOT. KASI SA TUWING NAHAHAWAKAN KO YUNG OVAL NA MAY PANGALAN MO,
                    PAALALA SIYA NG TAHANANG ISLA, TATAG, AT MALALIM NA UGAT NA NAKITA KO SA’YO. AT
                    SANA SA TUWING SUOT MO YUNG HEXAGON NA MAY PANGALAN KO, MARAMDAMAN MO RIN ANG
                    TAHIMIK NA LAKAS AT PAGMAMAHAL NA LAGING NAKASUPORTA SA’YO.
                  </p>

                  <p>
                    SA BAWAT 11:11, AT SA LAHAT NG ORDINARYONG ARAW SA PAGITAN, IKAW PA RIN ANG
                    HILING KO, ANG TAHANAN KO, AT ANG PINIPILI KO.
                  </p>
                </div>

                <p className="kw-letter-closing">
                  PANGALAN MO MALAPIT SA PUSO KO, PANGALAN KO MALAPIT SA PUSO MO — SA BAWAT
                  ORDINARYONG ARAW AT SA BAWAT 11:11.
                  <span>MAHAL NA MAHAL KITAAAA, CHICAAAA KOOOO. — YOUR CHICOOO ♡</span>
                </p>

                <div className="kw-letter-footer">
                  <span className="kw-letter-sign">
                    11:11 · ANG KWINTAS NATIN · WITH LOVE, CHICOOO
                  </span>
                  <button
                    type="button"
                    className="kw-letter-fold"
                    onClick={() => toggleLetter()}
                  >
                    ITUPI MUNA ANG SULAT
                  </button>
                </div>
              </article>
            )}
          </section>

          {/* FINAL POETIC CLOSING LINE */}
          <section className="kw-closing-band" aria-label="PANGWAKAS NA PAALALA">
            <p className="kw-closing-line">
              DALAWANG MAGKAIBANG HUGIS, ISANG PANGAKONG TAHIMIK: PANGALAN NG ISA’T ISA MALAPIT SA
              PUSO, HANGGANG SA PINAKA-ORDINARYONG ARAW.
            </p>
            <p className="kw-closing-sub">11:11 · JERSEY &amp; KEITH · ARAW-ARAW NA PIPILIIN</p>
          </section>
        </main>

        <footer className="kw-footer">
          <Link to="/#sulat-3" className="kw-footer-back">
            ← BALIK SA SULAT
          </Link>
          <span className="kw-footer-center">11:11 · ANG KWINTAS NATIN · SULAT</span>
          <span className="kw-footer-sign">WITH LOVE, YOUR CHICOOO ♡</span>
        </footer>
      </div>

      {/* LIGHTBOX FOR CLOSE-UP INSPECTION OF ALL SIX IMAGES */}
      {activeLightboxItem && (
        <div
          className="kw-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kw-lightbox-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
        >
          <div ref={lightboxDialogRef} className="kw-lightbox-dialog">
            <div className="kw-lightbox-bar">
              <span>{activeLightboxItem.kicker}</span>
              <button
                ref={lightboxCloseRef}
                type="button"
                className="kw-lightbox-close"
                onClick={closeLightbox}
              >
                ISARA (ESC)
              </button>
            </div>

            <figure className="kw-lightbox-media">
              <img
                src={resolveKwintasMedia(activeLightboxItem.src)}
                alt={activeLightboxItem.alt}
                className={
                  activeLightboxItem.surface === 'light' ? 'kw-lightbox-img-light' : undefined
                }
              />
              <figcaption>
                <h3 id="kw-lightbox-title">{activeLightboxItem.title}</h3>
                <p>{activeLightboxItem.caption}</p>
              </figcaption>
            </figure>

            <div className="kw-lightbox-nav">
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + ALL_LIGHTBOX_ITEMS.length) % ALL_LIGHTBOX_ITEMS.length
                  )
                }
              >
                ← NAUNANG LARAWAN
              </button>
              <span aria-live="polite">
                {lightboxIndex + 1} / {ALL_LIGHTBOX_ITEMS.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((lightboxIndex + 1) % ALL_LIGHTBOX_ITEMS.length)
                }
              >
                SUSUNOD NA LARAWAN →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
