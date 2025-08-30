"use client";
import { useState } from 'react';

export default function CarouselTab({ initialHeroes }: any) {
  const [slides, setSlides] = useState(initialHeroes);
  function move(idx: number, dir: -1 | 1) {
    const next = [...slides];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setSlides(next);
    // TODO: call server action to persist new positions
  }
  return (
    <div className="space-y-2">
      {slides.map((s: any, i: number) => (
        <div key={s.id} className="flex items-center gap-2 rounded border border-white/10 p-2">
          <div className="w-40 overflow-hidden rounded"><img src={s.src} alt="" /></div>
          <div className="flex-1 text-sm">{s.alt}</div>
          <div className="flex gap-1">
            <button className="tfe-focus-ring rounded border border-white/20 px-2 py-1" onClick={() => move(i, -1)}>
              ↑
            </button>
            <button className="tfe-focus-ring rounded border border-white/20 px-2 py-1" onClick={() => move(i, 1)}>
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
