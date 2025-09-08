"use server";
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/src/lib/db';
import { rateLimit } from '../rateLimit';
import { auth } from '@/src/lib/auth';

const MenuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.enum(['Savory Empanadas', 'Dessert Empanadas', 'Combos', 'Sandwiches', 'Sides']),
  prices: z.object({ doordash: z.number().optional(), grubhub: z.number().optional() }),
  orderLinks: z.object({ doordash: z.string().url().optional(), grubhub: z.string().url().optional() }),
  tags: z.array(z.enum(['New', 'Most-Loved', 'Vegan', 'Spicy'])).optional(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
});

export async function upsertMenuDraft(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  if (!rateLimit('upsertMenuDraft:' + session.user.email, 50, 60_000)) throw new Error('Rate limit');
  const data = MenuItemSchema.parse(input);
  await prisma.menuItemDraft.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      name: data.name,
      description: data.description || null,
      category: data.category,
      pricesJson: JSON.stringify(data.prices || {}),
      orderLinksJson: JSON.stringify(data.orderLinks || {}),
      tagsJson: JSON.stringify(data.tags || []),
      image: data.image || null,
      isActive: data.isActive ?? true,
      lastChecked: data.lastChecked ? new Date(data.lastChecked) : null
    } as any,
    update: {
      name: data.name,
      description: data.description || null,
      category: data.category,
      pricesJson: JSON.stringify(data.prices || {}),
      orderLinksJson: JSON.stringify(data.orderLinks || {}),
      tagsJson: JSON.stringify(data.tags || []),
      image: data.image || null,
      isActive: data.isActive ?? true,
      lastChecked: data.lastChecked ? new Date(data.lastChecked) : null
    } as any
  });
  return { ok: true } as const;
}

export async function exportMenuCSV() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  const list = await prisma.menuItemDraft.findMany();
  const cols = ['id','name','description','category','prices.doordash','prices.grubhub','orderLinks.doordash','orderLinks.grubhub','tags','image','isActive','lastChecked'];
  const rows = [cols.join(',')];
  for (const i of list) {
    const row = [
      i.id,
      escapeCSV(i.name),
      escapeCSV(i.description || ''),
      i.category,
      String((JSON.parse(i.pricesJson || '{}') as any)?.doordash ?? ''),
      String((JSON.parse(i.pricesJson || '{}') as any)?.grubhub ?? ''),
      String((JSON.parse(i.orderLinksJson || '{}') as any)?.doordash ?? ''),
      String((JSON.parse(i.orderLinksJson || '{}') as any)?.grubhub ?? ''),
      ((JSON.parse(i.tagsJson || '[]') as string[]).join('|')),
      i.image || '',
      i.isActive ? 'true' : 'false',
      i.lastChecked ? new Date(i.lastChecked).toISOString().slice(0,10) : ''
    ];
    rows.push(row.map(sanitizeCSV).join(','));
  }
  return rows.join('\n');
}

function escapeCSV(s: string) { return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g,'""') + '"' : s; }
function sanitizeCSV(s: string) { return escapeCSV(String(s ?? '')); }

export async function importMenuCSV(csv: string, dryRun = true) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  if (!rateLimit('importMenuCSV:' + session.user.email, 5, 60_000)) throw new Error('Rate limit');
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const [header, ...rows] = lines;
  const cols = header.split(',').map((s) => s.trim());
  const items = rows.map((line) => {
    const cells = parseCSVLine(line);
    const rec: any = {};
    cols.forEach((c, idx) => (rec[c] = cells[idx] ?? ''));
    const tags = String(rec['tags'] || '').split('|').filter(Boolean);
    const data = {
      id: rec['id'],
      name: rec['name'],
      description: rec['description'] || undefined,
      category: rec['category'],
      prices: {
        doordash: rec['prices.doordash'] ? Number(rec['prices.doordash']) : undefined,
        grubhub: rec['prices.grubhub'] ? Number(rec['prices.grubhub']) : undefined
      },
      orderLinks: { doordash: rec['orderLinks.doordash'] || undefined, grubhub: rec['orderLinks.grubhub'] || undefined },
      tags: tags,
      image: rec['image'] || undefined,
      isActive: String(rec['isActive']).toLowerCase() === 'true',
      lastChecked: rec['lastChecked'] || undefined
    };
    return MenuItemSchema.parse(data);
  });

  const diffs: Array<{ id: string; before: any; after: any }> = [];
  for (const item of items) {
    const before = await prisma.menuItemDraft.findUnique({ where: { id: item.id } });
    const after = item;
    diffs.push({ id: item.id, before, after });
    if (!dryRun) {
      await prisma.menuItemDraft.upsert({
        where: { id: item.id },
        create: {
          id: after.id,
          name: after.name,
          description: after.description || null,
          category: after.category,
          pricesJson: JSON.stringify(after.prices || {}),
          orderLinksJson: JSON.stringify(after.orderLinks || {}),
          tagsJson: JSON.stringify(after.tags || []),
          image: after.image || null,
          isActive: after.isActive ?? true,
          lastChecked: after.lastChecked ? new Date(after.lastChecked) : null
        } as any,
        update: {
          name: after.name,
          description: after.description || null,
          category: after.category,
          pricesJson: JSON.stringify(after.prices || {}),
          orderLinksJson: JSON.stringify(after.orderLinks || {}),
          tagsJson: JSON.stringify(after.tags || []),
          image: after.image || null,
          isActive: after.isActive ?? true,
          lastChecked: after.lastChecked ? new Date(after.lastChecked) : null
        } as any
      });
    }
  }
  return { count: items.length, diffs };
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let curr = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { curr += '"'; i++; continue; }
      if (ch === '"') { inQ = false; continue; }
      curr += ch;
    } else {
      if (ch === '"') { inQ = true; continue; }
      if (ch === ',') { out.push(curr); curr = ''; continue; }
      curr += ch;
    }
  }
  out.push(curr);
  return out;
}

export async function publishDrafts() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  if (!rateLimit('publishDrafts:' + session.user.email, 2, 60_000)) throw new Error('Rate limit');

  const drafts = await prisma.menuItemDraft.findMany();
  const changes: any[] = [];
  for (const d of drafts) {
    const before = await prisma.menuItem.findUnique({ where: { id: d.id } });
    await prisma.menuItem.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        description: d.description,
        category: d.category,
        pricesJson: d.pricesJson,
        orderLinksJson: d.orderLinksJson,
        tagsJson: d.tagsJson,
        image: d.image,
        isActive: d.isActive,
        lastChecked: d.lastChecked
      },
      create: {
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        pricesJson: d.pricesJson,
        orderLinksJson: d.orderLinksJson,
        tagsJson: d.tagsJson,
        image: d.image,
        isActive: d.isActive,
        lastChecked: d.lastChecked
      }
    } as any);
    changes.push({ entity: 'MenuItem', entityId: d.id, before, after: d });
  }
  for (const c of changes) {
    await prisma.changeLog.create({
      data: { entity: c.entity, entityId: c.entityId, action: 'publish', beforeJson: JSON.stringify(c.before || null), afterJson: JSON.stringify(c.after || null), userId: session.user.email! }
    });
  }
  revalidateTag('menu');
  return { ok: true, count: changes.length } as const;
}
