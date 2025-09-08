"use server";
import { revalidateTag } from 'next/cache';
import { MenuItemSchema } from '../../lib/validators';

export async function upsertMenuItem(input: unknown) {
  const parsed = MenuItemSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);
  // TODO: persist via Prisma
  revalidateTag('menu');
  return { ok: true } as const;
}
