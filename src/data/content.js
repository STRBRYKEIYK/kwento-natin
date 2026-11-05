import story from './story.json';

export const { chapters, photos, directory, intro, letter, dreams } = story;
export const photoById = Object.fromEntries(photos.map(photo => [photo.id, photo]));
export const tracks = [
  { key: 'palagi', title: 'Palagi', chapter: 'Simula' },
  { key: 'rollercoaster', title: 'Rollercoaster', chapter: 'Agosto · Oktubre 29' },
  { key: 'aura', title: 'Aura', chapter: 'Setyembre' },
  { key: 'paru-paro', title: 'Paru-Paro', chapter: 'Oktubre' },
  { key: 'bloom', title: 'Bloom', chapter: 'Oktubre 20' },
  { key: 'tangerine-boulevard', title: 'Tangerine Boulevard', chapter: 'Ang sulat' },
  { key: 'tenerife-sea', title: 'Tenerife Sea', chapter: 'Para sa ’yo' },
  { key: 'love-someone', title: 'Love Someone', chapter: 'Para sa ’yo' },
  { key: 'a-beautiful-mess', title: 'A Beautiful Mess', chapter: 'Para sa ’yo' },
  { key: 'long-drive', title: 'Long Drive', chapter: 'Para sa ’yo' },
  { key: 'forevermore', title: 'Forevermore', chapter: 'Sa susunod' },
];
export const sections = [
  { id: 'sec-intro', label: 'Simula', track: 'palagi' },
  { id: 'sec-08', label: 'Agosto', track: 'rollercoaster' },
  { id: 'sec-09', label: 'Setyembre', track: 'aura' },
  { id: 'sec-10', label: 'Oktubre', track: 'paru-paro' },
  { id: 'sec-10-20', label: 'Okt. 20', track: 'bloom' },
  { id: 'sec-10-29', label: 'Okt. 29', track: 'rollercoaster' },
  { id: 'sec-11-05', label: 'Nob. 5', track: 'tenerife-sea' },
  { id: 'sec-letter', label: 'Sulat', track: 'tangerine-boulevard' },
  { id: 'sec-11', label: 'Bukas', track: 'forevermore' },
  { id: 'sec-finale', label: 'Sa bawat 6', track: 'forevermore' },
];
export const assetUrl = relative => `${import.meta.env.BASE_URL}${relative}`;
export const formatTime = seconds => {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
};
