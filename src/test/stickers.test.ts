import { describe, it, expect } from 'vitest';
import { STICKER_LIBRARY, STICKER_CATEGORIES, getStickerById } from '../stickers';

describe('Sticker Library', () => {
  it('has stickers', () => {
    expect(STICKER_LIBRARY.length).toBeGreaterThan(100);
  });

  it('all stickers have required fields', () => {
    for (const s of STICKER_LIBRARY) {
      expect(s.id).toBeTruthy();
      expect(s.emoji).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.category).toBeTruthy();
    }
  });

  it('all sticker ids are unique', () => {
    const ids = STICKER_LIBRARY.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has multiple categories', () => {
    expect(STICKER_CATEGORIES.length).toBeGreaterThan(5);
  });

  it('every sticker category is in STICKER_CATEGORIES', () => {
    for (const s of STICKER_LIBRARY) {
      expect(STICKER_CATEGORIES).toContain(s.category);
    }
  });

  it('getStickerById returns correct sticker', () => {
    const star = getStickerById('s-star');
    expect(star).toBeDefined();
    expect(star!.emoji).toBe('⭐');
    expect(star!.name).toBe('Gold Star');
  });

  it('getStickerById returns undefined for unknown id', () => {
    expect(getStickerById('nonexistent')).toBeUndefined();
  });

  it('every category has at least 5 stickers', () => {
    for (const cat of STICKER_CATEGORIES) {
      const count = STICKER_LIBRARY.filter((s) => s.category === cat).length;
      expect(count, `Category "${cat}" has only ${count} stickers`).toBeGreaterThanOrEqual(5);
    }
  });
});
