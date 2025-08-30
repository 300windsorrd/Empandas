"use client";
import { useMemo, useState } from 'react';
import { upsertMenuDraft, exportMenuCSV, importMenuCSV } from '@/src/server/actions/admin';

type Item = any;

export default function MenuTab({ initialMenu, initialDrafts }: { initialMenu: Item[]; initialDrafts: Item[] }) {
  const merged = useMemo(() => {
    const map = new Map(initialMenu.map((m: any) => [m.id, m]));
    for (const d of initialDrafts) map.set(d.id, { ...map.get(d.id), ...d });
    return Array.from(map.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [initialMenu, initialDrafts]);

  const [rows, setRows] = useState(merged);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onChange(id: string, patch: Partial<Item>) {
    setRows((rs) => rs.map((r: any) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function onSave(id: string) {
    setBusy(true);
    try {
      const item = rows.find((r: any) => r.id === id);
      await upsertMenuDraft({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        category: item.category,
        prices: { doordash: numOrUndef(item.prices?.doordash), grubhub: numOrUndef(item.prices?.grubhub) },
        orderLinks: { doordash: item.orderLinks?.doordash || undefined, grubhub: item.orderLinks?.grubhub || undefined },
        tags: item.tags || [],
        image: item.image || undefined,
        isActive: item.isActive !== false,
        lastChecked: item.lastChecked || undefined
      });
      setMessage('Saved draft.');
    } catch (e: any) {
      setMessage(e.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function onExport() {
    const csv = await exportMenuCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-draft.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(files: FileList | null) {
    if (!files || files.length === 0) return;
    const text = await files[0].text();
    const dry = await importMenuCSV(text, true);
    setMessage(`Dry-run: ${dry.count} items, ${dry.diffs.length} diffs.`);
    if (confirm('Apply import?')) {
      await importMenuCSV(text, false);
      setMessage('Import applied to drafts.');
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button className="tfe-focus-ring rounded bg-[color:var(--color-brandRed)] px-3 py-1 text-sm" onClick={onExport} disabled={busy}>
          Export CSV
        </button>
        <label className="text-sm">
          <span className="mr-2">Import CSV</span>
          <input type="file" accept=".csv" onChange={(e) => onImport(e.target.files)} />
        </label>
        {message && <span className="text-xs text-white/70">{message}</span>}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {rows.map((r: any) => (
          <div key={r.id} className="rounded border border-white/10 p-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-6">
              <input className="tfe-focus-ring rounded border border-white/20 bg-transparent p-2 md:col-span-2" value={r.name} onChange={(e) => onChange(r.id, { name: e.target.value })} />
              <select className="tfe-focus-ring rounded border border-white/20 bg-transparent p-2" value={r.category} onChange={(e) => onChange(r.id, { category: e.target.value })}>
                {['Savory Empanadas','Dessert Empanadas','Combos','Sandwiches','Sides'].map((c) => (
                  <option key={c} value={c} className="bg-black">{c}</option>
                ))}
              </select>
              <input className="tfe-focus-ring rounded border border-white/20 bg-transparent p-2" placeholder="DD price" value={r.prices?.doordash ?? ''} onChange={(e) => onChange(r.id, { prices: { ...r.prices, doordash: e.target.value } })} />
              <input className="tfe-focus-ring rounded border border-white/20 bg-transparent p-2" placeholder="GH price" value={r.prices?.grubhub ?? ''} onChange={(e) => onChange(r.id, { prices: { ...r.prices, grubhub: e.target.value } })} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={r.isActive !== false} onChange={(e) => onChange(r.id, { isActive: e.target.checked })} /> Active</label>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              <input className="tfe-focus-ring rounded border border-white/20 bg-transparent p-2" placeholder="DoorDash URL" value={r.orderLinks?.doordash ?? ''} onChange={(e) => onChange(r.id, { orderLinks: { ...r.orderLinks, doordash: e.target.value } })} />
              <input className="tfe-focus-ring rounded border border-white/20 bg-transparent p-2" placeholder="Grubhub URL" value={r.orderLinks?.grubhub ?? ''} onChange={(e) => onChange(r.id, { orderLinks: { ...r.orderLinks, grubhub: e.target.value } })} />
              <input className="tfe-focus-ring rounded border border-white/20 bg-transparent p-2" placeholder="Image path" value={r.image ?? ''} onChange={(e) => onChange(r.id, { image: e.target.value })} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <input className="tfe-focus-ring w-full rounded border border-white/20 bg-transparent p-2" placeholder="Description" value={r.description ?? ''} onChange={(e) => onChange(r.id, { description: e.target.value })} />
              <button className="tfe-focus-ring ml-2 rounded border border-white/20 px-3 py-1 text-sm" onClick={() => onSave(r.id)} disabled={busy}>Save Draft</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function numOrUndef(v: any) { const n = Number(v); return Number.isFinite(n) ? n : undefined; }

