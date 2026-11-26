import { mkdir, readFile, writeFile } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const title = '1:11 · ANG PABORITO KONG BALIKAN, IKAW';
const description = 'LABING-ISANG ALAALA AT ISANG LIHAM. PARA SA CHICAAA KO, MULA SA CHICOOO MO.';
const page = html
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
  .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
  .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
  .replace(/(<meta property="og:image" content=")[^"]*/, '$1https://chica.keicodes.dev/assets/img/cover.jpg');
const directory = new URL('../dist/one-minute-eleven-memories/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('index.html', directory), page);
console.log('Built 1:11 invitation with its own WhatsApp link preview.');
