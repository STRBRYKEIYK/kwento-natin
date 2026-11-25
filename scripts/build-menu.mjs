// Puts the library menu (menu/) at the root of dist/, next to the letter that Vite builds into dist/third/.
import { cpSync, mkdirSync } from 'node:fs';

mkdirSync('dist/menu', { recursive: true });
cpSync('menu/index.html', 'dist/index.html');
cpSync('menu/img', 'dist/menu/img', { recursive: true });
cpSync('menu/oras', 'dist/oras', { recursive: true });
cpSync('menu/petsa', 'dist/menu/petsa', { recursive: true });
// Vite's outDir is dist/third, so public assets are copied there by default.
// Promote this standalone surprise to the root path expected by Vercel rewrites.
cpSync('public/1212-stars', 'dist/1212-stars', { recursive: true });
console.log('menu copied to dist/');
