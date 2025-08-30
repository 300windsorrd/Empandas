"use client";
import { useState } from 'react';
import { changePassword } from '@/src/server/actions/account';

export default function PasswordPage() {
  const [current, setCurrent] = useState('');
  const [nextPass, setNextPass] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await changePassword(current, nextPass);
      setMsg('Password updated.');
      setCurrent('');
      setNextPass('');
    } catch (e: any) {
      setMsg(e.message || 'Failed');
    }
  }
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-3 text-2xl font-semibold">Change Password</h1>
      <form className="space-y-2" onSubmit={onSubmit}>
        <input className="tfe-focus-ring w-full rounded border border-white/20 bg-transparent p-2" placeholder="Current password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <input className="tfe-focus-ring w-full rounded border border-white/20 bg-transparent p-2" placeholder="New password" type="password" value={nextPass} onChange={(e) => setNextPass(e.target.value)} />
        <button className="tfe-focus-ring rounded bg-[color:var(--color-brandRed)] px-3 py-1 text-sm">Update</button>
        {msg && <div className="text-xs text-white/70">{msg}</div>}
      </form>
    </main>
  );
}

