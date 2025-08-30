"use client";
import { useState } from 'react';
import { setup2FA, enable2FA, disable2FA } from '@/src/server/actions/account';

export default function TwoFAPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  async function onSetup() {
    const r = await setup2FA();
    setQr(r.qr);
  }
  async function onEnable() {
    try {
      await enable2FA(code);
      setMsg('2FA enabled.');
    } catch (e: any) {
      setMsg(e.message || 'Failed');
    }
  }
  async function onDisable() {
    await disable2FA();
    setMsg('2FA disabled.');
  }
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-3 text-2xl font-semibold">Two-Factor Authentication</h1>
      <div className="space-y-2">
        <button className="tfe-focus-ring rounded border border-white/20 px-3 py-1 text-sm" onClick={onSetup}>Generate QR</button>
        {qr && <img src={qr} alt="2FA QR Code" className="rounded border border-white/10" />}
        <input className="tfe-focus-ring w-full rounded border border-white/20 bg-transparent p-2" placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
        <div className="flex gap-2">
          <button className="tfe-focus-ring rounded bg-[color:var(--color-brandRed)] px-3 py-1 text-sm" onClick={onEnable}>Enable 2FA</button>
          <button className="tfe-focus-ring rounded border border-white/20 px-3 py-1 text-sm" onClick={onDisable}>Disable 2FA</button>
        </div>
        {msg && <div className="text-xs text-white/70">{msg}</div>}
      </div>
    </main>
  );
}

