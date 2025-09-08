import { NextRequest, NextResponse } from 'next/server';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'No file' }, { status: 400 });
  const blob = file as unknown as File;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  const buf = Buffer.from(await blob.arrayBuffer());
  if (buf.length > 5 * 1024 * 1024) return NextResponse.json({ error: 'Too large' }, { status: 400 });

  const img = sharp(buf, { failOn: 'warning' });
  const meta = await img.metadata();
  if (!meta.width || !meta.height) return NextResponse.json({ error: 'Invalid image' }, { status: 400 });

  const webp = await img.webp({ quality: 85 }).toBuffer();
  const uploads = join(process.cwd(), 'public', 'uploads');
  mkdirSync(uploads, { recursive: true });
  const name = `${randomUUID()}.webp`;
  const full = join(uploads, name);
  await sharp(webp).toFile(full);
  return NextResponse.json({ path: `/uploads/${name}`, width: meta.width, height: meta.height });
}
