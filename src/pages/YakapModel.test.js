import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Yakap delivery model', () => {
  it('renders the capybara and tulips together in the default GLB scene', () => {
    const bytes = readFileSync(resolve(process.cwd(), 'public/models/yakap-delivery.glb'));
    expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
    expect(bytes.readUInt32LE(8)).toBe(bytes.length);
    const model = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
    const visibleNodes = new Set();
    function visit(index) {
      visibleNodes.add(index);
      for (const child of model.nodes[index].children || []) visit(child);
    }
    for (const root of model.scenes[model.scene || 0].nodes) visit(root);
    const visibleMeshes = new Set([...visibleNodes].map(index => model.nodes[index].mesh).filter(index => index !== undefined));
    expect(visibleMeshes).toEqual(new Set([0, 1]));
    expect(model.materials).toHaveLength(2);
    expect(model.images.length).toBeGreaterThanOrEqual(4);
  });
});
