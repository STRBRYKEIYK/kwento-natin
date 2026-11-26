import { mkdir, readFile, writeFile } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const invitations = [
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
    title: '11:11 · Hiling — Sa lahat ng hiling, ikaw.',
    description: 'Buksan ang bintana. Itupi ang isang hiling at paliparin sa gabi. Para sa mga bukas nina Chico at Chica.',
    image: 'https://chica.keicodes.dev/menu/img/hiling.png',
  },
];

for (const { path, title, description, image } of invitations) {
  const page = html
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
  .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
  .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
  .replace(/(<meta property="og:image" content=")[^"]*/, `$1${image}`);
  const directory = new URL(`../dist/${path}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), page);
  console.log(`Built ${path} invitation with its own WhatsApp link preview.`);
}
