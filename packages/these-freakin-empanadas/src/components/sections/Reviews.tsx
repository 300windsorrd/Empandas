import * as React from 'react';

type Review = { author: string; quote: string };

export function Reviews({ reviews }: { reviews: Review[] }) {
  if (!reviews?.length) return null;
  return (
    <section id="reviews" className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 text-2xl font-semibold">Reviews</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-sm italic">“{r.quote}”</div>
            <div className="mt-2 text-xs text-white/80">— {r.author}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

