import { describe,it,expect } from 'vitest';
import { DATES,getMedia,imgSrc,thumbSrc,videoSrc,videoThumbSrc } from './petsaData.js';
import { mediaUrl,mediaObject } from '../media.js';

describe('cloud album media',()=>{
  it('resolves every curated photo, video and thumbnail to verified Storage objects',()=>{
    for(const d of DATES) {
      for(const f of d.files) for(const url of [imgSrc(d,f),thumbSrc(d,f)]) expect(url).toMatch(/^https:\/\/firebasestorage.googleapis.com\//);
      for(const f of d.videos||[]) for(const url of [videoSrc(d,f),videoThumbSrc(d,f)]) expect(url).toMatch(/^https:\/\/firebasestorage.googleapis.com\//);
    }
  });
  it('preserves remote video types and supports new uploaded photo entries',()=>{
    const media=[{type:'video',url:'https://example.test/video.mp4',thumbnailUrl:'https://example.test/poster.jpg'}];
    expect(getMedia({media})).toEqual(media);
    expect(getMedia({isFirebase:true,firebaseUrls:['https://example.test/photo.jpg']})).toEqual([{type:'photo',url:'https://example.test/photo.jpg',thumbnailUrl:'https://example.test/photo.jpg'}]);
  });
  it('handles encoded filenames and passes through external and unknown URLs',()=>{
    const p='/assets/img/October 29/'+DATES.find(d=>d.date==='2026-10-29').files[0];
    expect(mediaUrl(encodeURI(p))).toBe(mediaUrl(p));
    expect(mediaObject(p)?.verified).toBe(true);
    for(const path of ['/menu/img/hiling.svg','https://example.test/x.jpg','/assets/%ZZ.jpg','/__proto__']) expect(mediaUrl(path)).toBe(path);
  });
});
