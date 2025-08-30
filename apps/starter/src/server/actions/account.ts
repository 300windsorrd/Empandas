"use server";
import { auth } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function changePassword(current: string, nextPass: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error('User not found');
  if (!bcrypt.compareSync(current, user.passwordHash)) throw new Error('Current password invalid');
  const hash = bcrypt.hashSync(nextPass, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
  revalidatePath('/admin');
  return { ok: true } as const;
}

export async function setup2FA() {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Unauthorized');
  const { authenticator } = await import('otplib');
  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { email: session.user.email }, data: { totpSecret: secret } });
  const issuer = 'These Freakin Empanadas Admin';
  const uri = authenticator.keyuri(session.user.email, issuer, secret);
  const QRCode = (await import('qrcode')).default;
  const qr = await QRCode.toDataURL(uri);
  return { secret, uri, qr } as const;
}

export async function enable2FA(code: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.totpSecret) throw new Error('No pending secret');
  const { authenticator } = await import('otplib');
  const ok = authenticator.verify({ token: code, secret: user.totpSecret });
  if (!ok) throw new Error('Invalid code');
  await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } });
  return { ok: true } as const;
}

export async function disable2FA() {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Unauthorized');
  await prisma.user.update({ where: { email: session.user.email }, data: { totpEnabled: false, totpSecret: null } });
  return { ok: true } as const;
}

