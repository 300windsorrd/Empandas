"use client";
import { publishDrafts } from '@/src/server/actions/admin';
import { useState } from 'react';

export default function PublishTab() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function onPublish() {
    setBusy(true);
    try {
      const res = await publishDrafts();
      setMsg(`Published ${res.count} changes.`);
    } catch (e: any) {
      setMsg(e.message || 'Publish failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <div className="text-sm">Review drafts and publish to make changes live. A change log entry records who/what/when.</div>
      <button className="tfe-focus-ring rounded bg-[color:var(--color-brandRed)] px-3 py-1 text-sm" disabled={busy} onClick={onPublish}>Publish Drafts</button>
      {msg && <div className="text-xs text-white/70">{msg}</div>}
    </div>
  );
}

