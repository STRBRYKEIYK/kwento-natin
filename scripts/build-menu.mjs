// Puts the library menu (menu/) at the root of dist/, next to the letter that Vite builds into dist/third/.
import { cpSync, mkdirSync } from 'node:fs';

mkdirSync('dist/menu', { recursive: true });
cpSync('menu/index.html', 'dist/index.html');
cpSync('menu/img', 'dist/menu/img', { recursive: true });
console.log('menu copied to dist/');
