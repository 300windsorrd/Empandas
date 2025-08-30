import * as React from 'react';
import { Button } from '../ui/Button';

type Props = { doordashUrl: string; grubhubUrl: string; phone: string };

export function OrderNowBanner({ doordashUrl, grubhubUrl, phone }: Props) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <img src="/images/Logo.png" alt="These Freakin’ Empanadas & More logo" className="h-8 w-auto" />
          <div className="text-lg font-medium">Order Now</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={doordashUrl} target="_blank" rel="noreferrer">
            <Button>
              <img src="/images/DoorDash.png" alt="Order on DoorDash" className="h-6 w-auto scale-125" />
            </Button>
          </a>
          <a href={grubhubUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary">
              <img src="/images/Grubhub.png" alt="Order on Grubhub" className="h-6 w-auto" />
            </Button>
          </a>
          <a href={`tel:${phone}`}>
            <Button variant="outline">Call {phone}</Button>
          </a>
        </div>
      </div>
    </section>
  );
}
