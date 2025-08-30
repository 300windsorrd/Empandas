import { z } from 'zod';

export const MenuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['Savory Empanadas', 'Dessert Empanadas', 'Combos', 'Sandwiches', 'Sides']),
  prices: z.object({ doordash: z.number().optional(), grubhub: z.number().optional() }),
  orderLinks: z.object({ doordash: z.string().url().optional(), grubhub: z.string().url().optional() }),
  tags: z.array(z.enum(['New', 'Most-Loved', 'Vegan', 'Spicy'])).optional(),
  image: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const HeroImageSchema = z.object({ src: z.string().min(1), alt: z.string().min(1), attribution: z.string().optional() });

export const SettingsSchema = z.object({
  address: z.string().min(1),
  phone: z.string().min(1),
  hours: z.record(z.string(), z.object({ open: z.string(), close: z.string(), closed: z.boolean().optional() })),
  platformBaseUrls: z.object({ doordash: z.string().url(), grubhub: z.string().url() }),
  ctaToggles: z.object({ doordash: z.boolean(), grubhub: z.boolean() })
});

