import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LIB, LIB_BY_ID } from './libraryData.js';

const root = process.cwd();
const read = file => readFileSync(resolve(root, file), 'utf8');

describe('REGALO book index', () => {
  const regalo = LIB_BY_ID.regalo;

  it('lists AIRCON once, at /aircon, followed by 10:10 Matamis', () => {
    const hrefs = regalo.pages.map(page => page.href);
    expect(hrefs.filter(href => href === '/aircon')).toHaveLength(1);
    expect(hrefs).not.toContain('/333');
    expect(hrefs.indexOf('/matamis')).toBe(hrefs.indexOf('/aircon') + 1);
    expect(regalo.pages.at(-1).href).toBe('/matamis');
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
    const proxied = new Set(JSON.parse(read('vercel.json')).rewrites.map(rewrite => rewrite.source));
    for (const page of regalo.pages) {
      expect(routes.has(page.href) || proxied.has(page.href), `${page.href} has no route`).toBe(true);
      expect(existsSync(resolve(root, 'public', page.img.replace(/^\//, ''))), `${page.img} is missing`).toBe(true);
    }
  });

  it('has the page count the spine and footers read from', () => {
    expect(regalo.pages).toHaveLength(6);
    expect(regalo.pages.map(page => page.title)).toEqual([
      'Love Voucher Book',
      "Chicaaaa's Little Garden",
      'Beautiful Moments',
      'Para Kay Chicaaa',
      'AIRCON',
      '10:10 · Matamis',
    ]);
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
    expect(vercel.redirects.some(r => r.source === '/333' && r.destination === '/aircon')).toBe(true);

    const previews = read('scripts/build-one-eleven.mjs');
    expect(previews).toContain("path: 'aircon'");
    expect(previews).not.toContain("path: '333'");
  });
});
