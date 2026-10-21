import story from './story.json';

export const { chapters, photos, directory, intro, letter, dreams } = story;
export const photoById = Object.fromEntries(photos.map(photo => [photo.id, photo]));
export const tracks = [
  { key: 'palagi', title: 'Palagi', chapter: 'Simula' },
  { key: 'binibini', title: 'Binibini', chapter: 'Agosto' },
  { key: 'aura', title: 'Aura', chapter: 'Setyembre' },
  { key: 'paru-paro', title: 'Paru-Paro', chapter: 'Oktubre' },
  { key: 'tangerine-boulevard', title: 'Tangerine Boulevard', chapter: 'Ang sulat' },
  { key: 'forevermore', title: 'Forevermore', chapter: 'Sa susunod' },
];
export const sections = [
  { id: 'sec-intro', label: 'Simula', track: 'palagi' },
  { id: 'sec-08', label: 'Agosto', track: 'binibini' },
  { id: 'sec-09', label: 'Setyembre', track: 'aura' },
  { id: 'sec-10', label: 'Oktubre', track: 'paru-paro' },
  { id: 'sec-letter', label: 'Sulat', track: 'tangerine-boulevard' },
  { id: 'sec-11', label: 'Bukas', track: 'forevermore' },
  { id: 'sec-finale', label: 'Sa bawat 6', track: 'forevermore' },
];
export const assetUrl = relative => `${import.meta.env.BASE_URL}${relative}`;
export const formatTime = seconds => {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
};
