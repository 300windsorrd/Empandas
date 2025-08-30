import * as React from 'react';
import type { MenuItem } from '../../types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

function fmtUSD(n: number | undefined) {
  if (typeof n !== 'number') return undefined;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function PlatformButtons({ item }: { item: MenuItem }) {
  const dd = item.orderLinks?.doordash;
  const gh = item.orderLinks?.grubhub;
  return (
    <div className="flex gap-2">
      {dd ? (
        <a href={dd} target="_blank" rel="noreferrer">
          <Button>Order on DoorDash</Button>
        </a>
      ) : (
        <Tooltip content="Temporarily unavailable">
          <span>
            <Button disabled>Order on DoorDash</Button>
          </span>
        </Tooltip>
      )}
      {gh ? (
        <a href={gh} target="_blank" rel="noreferrer">
          <Button variant="secondary">Order on Grubhub</Button>
        </a>
      ) : (
        <Tooltip content="Temporarily unavailable">
          <span>
            <Button variant="secondary" disabled>
              Order on Grubhub
            </Button>
          </span>
        </Tooltip>
      )}
    </div>
  );
}

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
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-medium">{item.name}</div>
                      {item.description && <div className="text-sm text-white/80">{item.description}</div>}
                    </div>
                    <div className="shrink-0 text-right text-sm text-white/90">
                      <div>
                        DoorDash {fmtUSD(item.prices?.doordash) ?? '—'} · Grubhub {fmtUSD(item.prices?.grubhub) ?? '—'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <PlatformButtons item={item} />
                </CardContent>
                <CardFooter>
                  Prices set by platform • Last checked: {item.lastChecked ?? '—'}
                </CardFooter>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

