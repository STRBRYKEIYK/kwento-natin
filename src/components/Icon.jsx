const paths = {
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  left: <path d="m14 6-6 6 6 6" />,
  right: <path d="m10 6 6 6-6 6" />,
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  play: <path d="m8 5 11 7-11 7Z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  next: <><path d="m5 5 10 7-10 7Z" /><path d="M19 5v14" /></>,
  previous: <><path d="m19 5-10 7 10 7Z" /><path d="M5 5v14" /></>,
  list: <><path d="M3 6h12M3 12h12M3 18h8M20 5v12" /><circle cx="17.5" cy="17.5" r="2.5" /></>,
};

export function Icon({ name, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function Tulip() {
  return <svg className="tulip-mark" width="46" height="66" viewBox="0 0 70 110" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M35 100V48M35 82C19 80 10 68 9 57c15 2 25 12 26 25ZM35 91c2-19 13-29 26-31-2 16-13 28-26 31Z" />
    <path d="M35 49C15 47 12 30 16 16l11 9 8-17 8 17 11-9c4 14 1 31-19 33Z" fill="currentColor" fillOpacity=".08" />
    <path d="M27 25c-1 10 2 19 8 24 6-5 9-14 8-24" />
  </svg>;
}
