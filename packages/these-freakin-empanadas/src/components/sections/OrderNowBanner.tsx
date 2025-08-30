import * as React from 'react';
import { Button } from '../ui/Button';

type Props = { doordashUrl: string; grubhubUrl: string; phone: string };

export function OrderNowBanner({ doordashUrl, grubhubUrl, phone }: Props) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-lg font-medium">Order Now</div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={doordashUrl} target="_blank" rel="noreferrer">
            <Button>Order on DoorDash</Button>
          </a>
          <a href={grubhubUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary">Order on Grubhub</Button>
          </a>
          <a href={`tel:${phone}`}>
            <Button variant="outline">Call {phone}</Button>
          </a>
        </div>
      </div>
    </section>
  );
}

