#!/usr/bin/env -S node --enable-source-maps
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

const MenuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum([
    'Savory Empanadas',
    'Dessert Empanadas',
    'Combos',
    'Sandwiches',
    'Sides'
  ]),
  prices: z
    .object({ doordash: z.number().optional(), grubhub: z.number().optional() })
    .refine((p) => typeof p.doordash === 'number' || typeof p.grubhub === 'number', {
      message: 'Item must have at least one numeric price'
    }),
  orderLinks: z.object({
    doordash: z.string().url().optional(),
    grubhub: z.string().url().optional()
  }),
  tags: z.array(z.enum(['New', 'Most-Loved', 'Vegan', 'Spicy'])).optional(),
  image: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const HeroImageSchema = z.object({ src: z.string().min(1), alt: z.string().min(1), attribution: z.string().optional() });

function fail(msg: string): never {
  console.error(`\nAudit failed: ${msg}\n`);
  process.exit(1);
}

try {
  const menuPath = join(process.cwd(), 'data', 'menu.json');
  const heroPath = join(process.cwd(), 'data', 'hero.json');
  const menuRaw = readFileSync(menuPath, 'utf8');
  const heroRaw = readFileSync(heroPath, 'utf8');
  const menu = JSON.parse(menuRaw);
  const heroes = JSON.parse(heroRaw);

  const menuErrors: string[] = [];
  const ids = new Set<string>();
  for (const [i, item] of menu.entries()) {
    const r = MenuItemSchema.safeParse(item);
    if (!r.success) {
      menuErrors.push(`menu.json item #${i + 1} (${item?.id ?? 'no-id'}): ${r.error.message}`);
    }
    if (item?.id) {
      if (ids.has(item.id)) menuErrors.push(`Duplicate id: ${item.id}`);
      ids.add(item.id);
    }
    if (!item?.orderLinks?.doordash || !item?.orderLinks?.grubhub) {
      menuErrors.push(`Missing platform link(s) for id: ${item?.id}`);
    }
    if (!item?.image) {
      menuErrors.push(`Missing image for id: ${item?.id}`);
    }
  }

  const heroErrors: string[] = [];
  for (const [i, slide] of heroes.entries()) {
    const r = HeroImageSchema.safeParse(slide);
    if (!r.success) heroErrors.push(`hero.json slide #${i + 1}: ${r.error.message}`);
  }

  const errors = [...menuErrors, ...heroErrors];
  if (errors.length) {
    console.error('\nData audit errors:');
    for (const e of errors) console.error(' - ' + e);
    fail('See errors above.');
  }

  console.log('Data audit passed.');
} catch (err: any) {
  fail(err?.message ?? String(err));
}

