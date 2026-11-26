import { readFile, writeFile } from 'node:fs/promises';
const path=new URL('../firebase.json',import.meta.url);
const config=JSON.parse(await readFile(path,'utf8'));
const prefixes=['/assets/**','/menu/img/**','/date/five/img/**','/date/assets/**','/vouchers/img/**','/second/assets/**','/ilychicaaa/media/**','/ilychicaaa-original/media/**'];
for(const site of config.hosting) {
  const rules=prefixes.map(source=>({source,function:{functionId:'chicaApi',region:'asia-southeast1'}}));
  site.rewrites=[...rules,...site.rewrites.filter(rule=>!prefixes.includes(rule.source))];
}
await writeFile(path,JSON.stringify(config,null,2)+'\n');
console.log('Configured legacy media redirects on six Firebase Hosting sites.');
