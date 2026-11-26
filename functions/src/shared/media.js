import catalog from '../media-catalog.json' with { type: 'json' };

export { catalog };
export function mediaPath(input) {
  if (typeof input !== 'string') return '';
  let path = input;
  if (/^https?:\/\//i.test(path)) {
    let url; try { url = new URL(path); } catch { return ''; }
    if (url.hostname !== 'chica.keicodes.dev' && !/^chica-keicodes-dev(?:-(?:dates|vouchers|second|song|original))?\.(?:web\.app|firebaseapp\.com)$/.test(url.hostname)) return '';
    path = url.pathname;
  }
  path = path.split(/[?#]/)[0];
  try { path = decodeURIComponent(path); } catch { return ''; }
  if (!path.startsWith('/')) path = '/' + path;
  return Object.hasOwn(catalog.paths, path) ? path : '';
}
export function mediaObject(input) {
  const path=mediaPath(input);
  if(path) return catalog.objects[catalog.paths[path]];
  if(typeof input==='string' && input.startsWith(`https://firebasestorage.googleapis.com/v0/b/${catalog.bucket}/o/`)) {
    try {
      const url=new URL(input), object=decodeURIComponent(url.pathname.split('/o/')[1]);
      return Object.values(catalog.objects).find(item=>item.object===object && item.token===url.searchParams.get('token'));
    } catch { return undefined; }
  }
  return undefined;
}
export function mediaUrl(input) {
  const item = mediaObject(input);
  return item ? `https://firebasestorage.googleapis.com/v0/b/${catalog.bucket}/o/${encodeURIComponent(item.object)}?alt=media&token=${encodeURIComponent(item.token)}` : input;
}
