import { describe, it, expect } from 'vitest';
import { DEFAULT_CATEGORIES } from '../types';

describe('Types & Constants', () => {
  it('DEFAULT_CATEGORIES has entries', () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('every default category has name and icon', () => {
    for (const cat of DEFAULT_CATEGORIES) {
      expect(cat.name).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    }
  });

  it('default category names are unique', () => {
    const names = DEFAULT_CATEGORIES.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('includes expected categories', () => {
    const names = DEFAULT_CATEGORIES.map((c) => c.name);
    expect(names).toContain('Cleaning');
    expect(names).toContain('Homework');
    expect(names).toContain('Behavior');
    expect(names).toContain('Physical');
    expect(names).toContain('Play');
    expect(names).toContain('Other');
  });
});
