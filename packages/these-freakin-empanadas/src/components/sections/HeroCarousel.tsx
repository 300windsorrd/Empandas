"use client";
import * as React from 'react';
import type { HeroImage } from '../../types';

type Props = { images: HeroImage[] };

export function HeroCarousel({ images }: Props) {
  const [index, setIndex] = React.useState(0);
  const id = React.useId();
  React.useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  if (!images.length) return null;
  const curr = images[index];
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg md:aspect-[16/9]">
      <img src={curr.src} alt={curr.alt} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((_, i) => (
          <button
            key={`${id}-${i}`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
      {curr.attribution && (
        <div className="absolute right-2 top-2 text-xs text-white/70">{curr.attribution}</div>
      )}
    </div>
  );
}
