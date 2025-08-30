import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

export const authConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        totp: { label: '2FA Code', type: 'text', optional: true as any }
      },
      async authorize(creds) {
        const email = creds?.email?.toString() || '';
        const password = creds?.password?.toString() || '';
        const totp = creds?.totp?.toString();

        // Try DB user first
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        let passwordOk = false;

        if (user) {
          // Lockout check
          if (user.lockoutUntil && user.lockoutUntil > new Date()) return null;
          passwordOk = bcrypt.compareSync(password, user.passwordHash);
          if (!passwordOk) {
            const failed = (user.failedLoginCount ?? 0) + 1;
            const lock = failed >= 5 ? { lockoutUntil: new Date(Date.now() + 15 * 60 * 1000), failedLoginCount: 0 } : { failedLoginCount: failed };
            await prisma.user.update({ where: { id: user.id }, data: lock });
            return null;
          }

          // If 2FA enabled, require totp code
          if (user.totpEnabled) {
            if (!totp) return null;
            const { authenticator } = await import('otplib');
            const ok = authenticator.verify({ token: totp, secret: user.totpSecret || '' });
            if (!ok) return null;
          }

          // Success → reset counters
          await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockoutUntil: null } });
          return { id: user.id, name: 'Admin', email: user.email, role: 'admin' as const };
        }

        // Fallback to env admin
        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return null;
        const ok = ADMIN_PASSWORD.startsWith('$2') ? bcrypt.compareSync(password, ADMIN_PASSWORD) : password === ADMIN_PASSWORD;
        if (!ok) return null;
        return { id: 'admin', name: 'Admin', email, role: 'admin' as const };
      }
    })
  ],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 4 },
  pages: { signIn: '/login' }
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
