import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { mediaUrl } from '../functions/src/shared/media.js';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const invitations = [
  {
    path: 'biyahe',
    title: '11:11 PM · BIYAHE NATIN — PARA SA ASAWAAAA KO',
    description: 'TWO HELMETS, ONE ADV 160 RS, COUNTLESS ROADS TO EXPLORE. BAWAT KILOMETRO, MAGKASAMA. ISANG BIYAHENG PINAPANGARAP NINA CHICO AT CHICA.',
    image: 'https://chica.keicodes.dev/menu/img/biyahe.svg',
  },
  {
    path: 'lego-house',
    title: '3:33 · A LEGO HOUSE — PARA SA CHICAAAA KO',
    description: 'ONE LITTLE PIECE AT A TIME. MAY TAHANAN TAYONG BINUBUO, MAY MGA PANGARAP TAYONG TUTUPARIN, AT MAY PAGMAMAHAL TAYONG PATULOY NA AALAGAAN.',
    image: 'https://chica.keicodes.dev/menu/img/lego-house.svg',
  },
  {
    path: 'pangako',
    title: '2:22 · PANGAKO — PARA SA CHICAAA KO',
    description: 'MGA PANGAKO NATIN. BALANSE, PAGKAKAISA, TIYAGA, AT TIWALA SA TAMANG PANAHON NI LORD. IKAW AT AKO, MAGKASAMA.',
    image: 'https://chica.keicodes.dev/menu/img/pangako.svg',
  },
  {
    path: 'tabi',
    title: '1:11 · TABI MUNA TAYO — PARA SA CHICAAA KO',
    description: 'ISANG TAHIMIK NA SANDALI AT ISANG MALUMANAY NA LIHAM MULA SA CHICOOO MO. PARA SA CHICAAA KO.',
    image: 'https://chica.keicodes.dev/menu/img/tabi.svg',
  },
  {
    path: 'hapon',
    title: '12:12 · HAPON NATIN — PARA SA CHICAAA KO',
    description: 'ISANG PICNIC PARA SA DALAWA, ISANG BULAKLAK, AT LIHAM NI CHICO SA GITNA NG ARAW. TABI MUNA TAYO, ASAWA KO.',
    image: 'https://chica.keicodes.dev/menu/img/hapon.svg',
  },
  {
    path: 'one-minute-eleven-memories',
    title: '1:11 · ANG PABORITO KONG BALIKAN, IKAW',
    description: 'LABING-ISANG PAGKIKITA. MULA AGOSTO 6 HANGGANG NOBYEMBRE 17. PARA SA CHICAAA KO.',
    image: 'https://chica.keicodes.dev/assets/photos/photo_3@08-08-2026_14-13-20.jpg',
  },
  {
    path: 'aircon',
    title: 'AIRCON · TAYO MUNA',
    description: 'ISANG MUNTING SECRET NATIN. PARA SA CHICAAA KO, WITH LOVE, YOUR CHICOOO.',
    image: 'https://chica.keicodes.dev/menu/img/aircon.jpg',
  },
  {
    path: 'matamis',
    title: '10:10 · MATAMIS',
    description: 'ISANG RESIPI PARA SA PINAKAMATAMIS NA 10:10. PARA SA CHICAAA KO, WITH LOVE, YOUR CHICOOO.',
    image: 'https://chica.keicodes.dev/menu/img/matamis.jpg',
  },
  {
    path: 'hiling',
    title: '11:11 · HILING — SA LAHAT NG HILING, IKAW.',
    description: 'BUKSAN ANG BINTANA. ITUPI ANG ISANG HILING AT PALIPARIN SA GABI. PARA SA MGA BUKAS NINA CHICO AT CHICA.',
    image: 'https://chica.keicodes.dev/menu/img/hiling.png',
  },
  {
    path: 'yakap',
    title: '12:12 · YAKAP — PARA SA CHICAAA KO',
    description: 'ISANG CAPYBARA, ISANG PUSO, MGA TULIPS, AT YAKAP NG CHICO MO. MAY SULAT NA PARA SA’YO LANG.',
    image: 'https://chica.keicodes.dev/menu/img/yakap.png',
  },
];

for (const { path, title, description, image } of invitations) {
  const page = html
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
  .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
  .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
  .replace(/(<meta property="og:image" content=")[^"]*/, `$1${mediaUrl(image).replaceAll('&','&amp;')}`);
  const directory = new URL(`../dist/${path}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), page);
  console.log(`Built ${path} invitation with its own WhatsApp link preview.`);
}
