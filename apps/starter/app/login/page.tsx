"use client";
import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn('credentials', { email, password, totp, redirect: false, callbackUrl: '/admin' });
    if (res?.error) setError('Invalid credentials or 2FA code.');
    else if (res?.ok) window.location.href = '/admin';
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-4 text-2xl font-semibold">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          <span>Email</span>
          <input className="tfe-focus-ring mt-1 w-full rounded border border-white/20 bg-transparent p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span>Password</span>
          <input type="password" className="tfe-focus-ring mt-1 w-full rounded border border-white/20 bg-transparent p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span>2FA Code (if enabled)</span>
          <input className="tfe-focus-ring mt-1 w-full rounded border border-white/20 bg-transparent p-2" value={totp} onChange={(e) => setTotp(e.target.value)} />
        </label>
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button className="tfe-focus-ring rounded bg-[color:var(--color-brandRed)] px-4 py-2 text-sm">Sign In</button>
      </form>
      <div className="mt-4 text-xs text-white/70">
        <Link className="underline" href="/">Back to site</Link>
      </div>
    </main>
  );
}

