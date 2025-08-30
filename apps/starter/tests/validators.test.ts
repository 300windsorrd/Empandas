import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MenuItemSchema, HeroImageSchema } from '../src/lib/validators';

describe('seed data invariants', () => {
  const root = join(process.cwd(), 'public', 'data');
  const menu = JSON.parse(readFileSync(join(root, 'menu.json'), 'utf8'));
  const heroes = JSON.parse(readFileSync(join(root, 'hero.json'), 'utf8'));

  it('menu items are valid and have prices', () => {
    for (const item of menu) {
      const r = MenuItemSchema.safeParse(item);
      expect(r.success).toBe(true);
      expect(typeof item.prices?.doordash === 'number' || typeof item.prices?.grubhub === 'number').toBe(true);
      expect(item.orderLinks?.doordash).toBeTruthy();
      expect(item.orderLinks?.grubhub).toBeTruthy();
      expect(item.image).toBeTruthy();
    }
  });

  it('hero slides are valid', () => {
    for (const h of heroes) expect(HeroImageSchema.safeParse(h).success).toBe(true);
  });
});

