import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LIB, LIB_BY_ID } from './libraryData.js';
import { mediaObject } from '../media.js';

const root = process.cwd();
const read = file => readFileSync(resolve(root, file), 'utf8');

describe('REGALO book index', () => {
  const regalo = LIB_BY_ID.regalo;

  it('lists AIRCON once, at /aircon, followed by 10:10 Matamis', () => {
    const hrefs = regalo.pages.map(page => page.href);
    expect(hrefs.filter(href => href === '/aircon')).toHaveLength(1);
    expect(hrefs).not.toContain('/333');
    expect(hrefs.indexOf('/matamis')).toBe(hrefs.indexOf('/aircon') + 1);
    expect(hrefs.indexOf('/hiling')).toBe(hrefs.indexOf('/matamis') + 1);
    expect(hrefs.indexOf('/yakap')).toBe(hrefs.indexOf('/hiling') + 1);
    expect(regalo.pages.at(-1).href).toBe('/yakap');
  });

  it('has no repeated link, title or picture inside the book', () => {
    for (const key of ['href', 'title', 'img']) {
      const values = regalo.pages.map(page => page[key]);
      expect(new Set(values).size, `${key} repeats in REGALO`).toBe(values.length);
    }
  });

  it('keeps the pages in the order they were made', () => {
    const dates = regalo.pages.map(page => page.made);
    expect([...dates].sort()).toEqual(dates);
  });

  it('gives each REGALO page a picture that no other book page reuses', () => {
    const others = LIB.flatMap(book => (book.id === 'regalo' ? [] : book.pages)).map(page => page.img);
    for (const page of regalo.pages) expect(others, `${page.title} reuses a picture`).not.toContain(page.img);
  });

  it('points every page at a real route and a picture that exists', () => {
    const main = read('src/main.jsx');
    const routes = new Set([...main.matchAll(/<Route path="([^"]+)"/g)].map(match => match[1]));
    const linked = new Set(JSON.parse(read('firebase.sources.json')).sources.map(app => '/' + (app.mainMount || app.mount)));
    for (const page of regalo.pages) {
      expect(routes.has(page.href) || linked.has(page.href), `${page.href} has no route`).toBe(true);
      expect(mediaObject(page.img)?.verified || existsSync(resolve(root, 'public', page.img.replace(/^\//, ''))), `${page.img} is missing`).toBe(true);
    }
  });

  it('has the page count the spine and footers read from', () => {
    expect(regalo.pages).toHaveLength(8);
    expect(regalo.pages.map(page => page.title)).toEqual([
      'Love Voucher Book',
      "Chicaaaa's Little Garden",
      'Beautiful Moments',
      'Para Kay Chicaaa',
      'AIRCON',
      '10:10 · Matamis',
      '11:11 · Hiling',
      '12:12 · Yakap',
    ]);
  });
});

describe('ORAS-ORAS book index', () => {
  it('adds the 3:33 LEGO house after PANGAKO with its own route, cover, and preview', () => {
    expect(LIB.flatMap(book => book.pages).filter(page => page.href === '/lego-house')).toHaveLength(1);
    const pages = LIB_BY_ID.oras.pages;
    expect(pages[pages.findIndex(page => page.href === '/pangako') + 1]).toMatchObject({ title: '3:33 · A LEGO HOUSE', href: '/lego-house' });
    expect(read('src/main.jsx')).toContain('path="/lego-house"');
    expect(read('scripts/build-one-eleven.mjs')).toContain("path: 'lego-house'");
    expect(existsSync(resolve(root, 'public/menu/img/lego-house.svg'))).toBe(true);
  });
  it('adds 11:11 Biyahe Natin to ORAS-ORAS with its own route, cover, and preview', () => {
    expect(LIB.flatMap(book => book.pages).filter(page => page.href === '/biyahe')).toHaveLength(1);
    expect(LIB_BY_ID.oras.pages.at(-1)).toMatchObject({ title: '11:11 · Biyahe Natin', href: '/biyahe' });
    expect(read('src/main.jsx')).toContain('path="/biyahe"');
    expect(read('scripts/build-one-eleven.mjs')).toContain("path: 'biyahe'");
    expect(existsSync(resolve(root, 'public/menu/img/biyahe.svg'))).toBe(true);
  });
  it('lists 2:22 PANGAKO once in ORAS-ORAS with a real cover, route, and preview', () => {
    const entries = LIB.flatMap(book => book.pages).filter(page => page.href === '/pangako');
    expect(entries).toHaveLength(1);
    expect(LIB_BY_ID.oras.pages.find(page => page.href === '/pangako')).toMatchObject({ title: '2:22 · PANGAKO', href: '/pangako' });
    expect(read('src/main.jsx')).toContain('path="/pangako"');
    expect(read('scripts/build-one-eleven.mjs')).toContain("path: 'pangako'");
    expect(existsSync(resolve(root, 'public/menu/img/pangako.svg'))).toBe(true);
  });
  it('places the new afternoon 12:12 in ORAS-ORAS and keeps Yakap in REGALO', () => {
    expect(LIB_BY_ID.oras.pages.find(page => page.href === '/hapon')).toMatchObject({
      title: '12:12 · Hapon Natin', href: '/hapon',
    });
    expect(LIB_BY_ID.oras.pages.some(page => page.href === '/yakap')).toBe(false);
    expect(LIB.flatMap(book => book.pages).filter(page => page.href === '/hapon')).toHaveLength(1);
    expect(read('src/main.jsx')).toContain('path="/hapon"');
    expect(existsSync(resolve(root, 'public/menu/img/hapon.svg'))).toBe(true);
  });
});

describe('necklace letter in SULAT', () => {
  it('adds the 11:11 story once as the final SULAT page, preserving the older letters', () => {
    expect(LIB_BY_ID.sulat.pages.map(page => page.href)).toEqual(['/second', '/third', '/kwintas']);
    expect(LIB_BY_ID.sulat.pages.at(-1)).toMatchObject({ title: '11:11 · Ang Kwintas Natin', made: '2026-11-28' });
    expect(LIB.flatMap(book => book.pages).filter(page => page.href === '/kwintas')).toHaveLength(1);
    expect(LIB_BY_ID.oras.pages.some(page => page.href === '/kwintas')).toBe(false);
    expect(read('src/main.jsx')).toContain('path="/kwintas"');
    expect(read('scripts/build-one-eleven.mjs')).toContain("path: 'kwintas'");
    expect(existsSync(resolve(root, 'public/menu/img/kwintas.svg'))).toBe(true);
    for (const file of ['necklaces-together.jpg', 'keith-hexagon.jpg', 'jersey-oval.jpg', 'necklace-portrait.jpg', 'jersey-design.png', 'keith-design.png']) {
      expect(mediaObject('/assets/kwintas/' + file)?.verified).toBe(true);
    }
  });
});

describe('the old /333 link', () => {
  it('is only a redirect to /aircon, never a second page', () => {
    const main = read('src/main.jsx');
    expect(main).toMatch(/<Route path="\/333" element=\{<Navigate to="\/aircon" replace \/>\} \/>/);
    expect(main.match(/path="\/aircon"/g)).toHaveLength(1);

    const firebase = JSON.parse(read('firebase.json')).hosting.find(site => site.site === 'chica-keicodes-dev');
    expect(firebase.redirects.some(r => r.source.startsWith('/333') && r.destination === '/aircon')).toBe(true);

    const vercel = JSON.parse(read('vercel.json'));
    expect(vercel.git.deploymentEnabled).toBe(false);

    const previews = read('scripts/build-one-eleven.mjs');
    expect(previews).toContain("path: 'aircon'");
    expect(previews).not.toContain("path: '333'");
  });
});
