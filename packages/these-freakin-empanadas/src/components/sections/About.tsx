import * as React from 'react';
import { generateGoogleMapsUrl } from '../../utilities';

type Props = { address: string; phone: string; hours: string };

export function About({ address, phone, hours }: Props) {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-2 text-2xl font-semibold">About</h2>
      <p className="mb-4 max-w-2xl text-white/80">
        From food-truck favorite to Wood-Ridge’s brick-and-mortar empanada hub.
      </p>
      <div className="space-y-1 text-sm">
        <div>
          <strong>Address:</strong> <a className="underline" href={generateGoogleMapsUrl(address)}>{address}</a>
        </div>
        <div>
          <strong>Phone:</strong> <a className="underline" href={`tel:${phone}`}>{phone}</a>
        </div>
        <div>
          <strong>Hours:</strong> {hours}
        </div>
        <div className="text-xs text-white/70">Service: takeout, delivery, pop-ups</div>
      </div>
    </section>
  );
}

