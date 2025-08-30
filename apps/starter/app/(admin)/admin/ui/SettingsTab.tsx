"use client";
import { useState } from 'react';

export default function SettingsTab({ initialSettings }: any) {
  const parsed = initialSettings
    ? {
        ...initialSettings,
        platformBaseUrls: JSON.parse(initialSettings.platformBaseUrlsJson || '{}'),
        hours: JSON.parse(initialSettings.hoursJson || '{}'),
        ctaToggles: JSON.parse(initialSettings.ctaTogglesJson || '{}')
      }
    : {};
  const [s, setS] = useState(parsed);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <label className="text-sm">Address<input className="tfe-focus-ring mt-1 w-full rounded border border-white/20 bg-transparent p-2" value={s.address || ''} onChange={(e) => setS({ ...s, address: e.target.value })} /></label>
        <label className="text-sm">Phone<input className="tfe-focus-ring mt-1 w-full rounded border border-white/20 bg-transparent p-2" value={s.phone || ''} onChange={(e) => setS({ ...s, phone: e.target.value })} /></label>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <label className="text-sm">DoorDash Base URL<input className="tfe-focus-ring mt-1 w-full rounded border border-white/20 bg-transparent p-2" value={s.platformBaseUrls?.doordash || ''} onChange={(e) => setS({ ...s, platformBaseUrls: { ...s.platformBaseUrls, doordash: e.target.value } })} /></label>
        <label className="text-sm">Grubhub Base URL<input className="tfe-focus-ring mt-1 w-full rounded border border-white/20 bg-transparent p-2" value={s.platformBaseUrls?.grubhub || ''} onChange={(e) => setS({ ...s, platformBaseUrls: { ...s.platformBaseUrls, grubhub: e.target.value } })} /></label>
      </div>
      <div className="text-xs text-white/70">Saving drafts and publishing is available in the Publishing tab.</div>
    </div>
  );
}
