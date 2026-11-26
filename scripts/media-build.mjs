import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog, mediaUrl } from '../functions/src/shared/media.js';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const migratedSource = path => Object.hasOwn(catalog.sources, relative(repository,path).replaceAll('\\','/'));
export const mediaPublicFilter = path => !migratedSource(path) && !/(?:^|[\\/])chat(?: \(\d+\))?\.txt$/i.test(path) && !basename(path).startsWith('.env') && basename(path)!=='.DS_Store';

export function rewriteMediaReferences(code, base = '/') {
  // Match a complete quoted URL, including spaces, without touching surrounding code.
  return code.replace(/(["'`])([^"'`\r\n]+)\1/g, (match,quote,value) => {
    if (!/\.(?:jpe?g|png|webp|gif|avif|heic|mp4|mov|webm|mp3|m4a|ogg|wav)(?:[?#].*)?$/i.test(value)) return match;
    const path = value.startsWith('/') || /^https?:/.test(value) ? value : new URL(value, 'https://chica.keicodes.dev'+base).pathname;
    const url = mediaUrl(path);
    return url !== path ? quote+url+quote : match;
  });
}

export function firebaseMediaPlugin() {
  let config;
  return {
    name:'firebase-media', enforce:'pre',
    configResolved(value) { config=value; },
    resolveId(source, importer) {
      if(!importer || !source.startsWith('.') || !/\.(?:jpe?g|png|webp|gif|avif)$/i.test(source)) return null;
      const path=relative(repository,resolve(dirname(importer.split('?')[0]),source)).replaceAll('\\','/');
      const sha=catalog.sources[path];
      if(!sha) return null;
      const item=catalog.objects[sha];
      const url=`https://firebasestorage.googleapis.com/v0/b/${catalog.bucket}/o/${encodeURIComponent(item.object)}?alt=media&token=${encodeURIComponent(item.token)}`;
      return '\0firebase-media:'+url;
    },
    load(id) { if(id.startsWith('\0firebase-media:')) return `export default ${JSON.stringify(id.slice(16))};`; },
    transform(code,id) {
      if(id.includes('node_modules') || /\.test\./.test(id) || !/\.(?:jsx?|tsx?|css|html)(?:\?|$)/.test(id)) return null;
      const next=rewriteMediaReferences(code);
      return next===code ? null : {code:next,map:null};
    },
    transformIndexHtml(html) { return rewriteMediaReferences(html); },
    async closeBundle() {
      if(config.command!=='build') return;
      const publicDir=resolve(config.root,'public'), out=resolve(config.root,config.build.outDir);
      await mkdir(out,{recursive:true});
      try { await cp(publicDir,out,{recursive:true,filter:mediaPublicFilter}); }
      catch(e) { if(e.code!=='ENOENT') throw e; }
      // The scheduler's anniversary page contains its own static image references.
      const html=resolve(out,'five/index.html');
      try { await writeFile(html,rewriteMediaReferences(await readFile(html,'utf8'),'/date/five/')); }
      catch(e) { if(e.code!=='ENOENT') throw e; }
    },
  };
}
