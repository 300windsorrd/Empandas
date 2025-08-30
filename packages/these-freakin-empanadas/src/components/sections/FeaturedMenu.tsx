import * as React from 'react';
import type { MenuItem } from '../../types';
import { Card } from '../ui/Card';
import { MenuItemImage } from '../ui/MenuItemImage';

function fmtUSD(n: number | undefined) {
  if (typeof n !== 'number') return undefined;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

// Per-menu-item DoorDash/Grubhub buttons removed per request.

export function FeaturedMenu({ items }: { items: MenuItem[] }) {
  const active = items.filter((i) => i.isActive !== false);
  const byCategory = active.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <section id="menu" className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 text-2xl font-semibold">Featured Menu</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(byCategory).map(([category, list]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-xl font-medium">{category}</h3>
            {list.map((item) => (
              <Card key={item.id}>
                <div className="relative">
                  <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 overflow-hidden rounded-md border border-white/20">
                    {item.image ? (
                      <MenuItemImage
                        src={item.image}
                        alt={item.name}
                        variant="fluid"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-white/[0.06]" />
                    )}
                    {/* Price top-left */}
                    <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
                      {(() => {
                        const prices = [item.prices?.doordash, item.prices?.grubhub].filter(
                          (n): n is number => typeof n === 'number'
                        );
                        const unified = prices.length ? Math.min(...prices) : undefined;
                        return fmtUSD(unified) ?? '';
                      })()}
                    </div>
                    {/* Name bottom-right */}
                    <div className="absolute bottom-2 right-2 max-w-[80%] truncate rounded bg-black/60 px-2 py-1 text-sm font-semibold text-white shadow">
                      {item.name}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
