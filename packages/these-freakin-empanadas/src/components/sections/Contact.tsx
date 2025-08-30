import * as React from 'react';
import { formatPhoneNumber, generateGoogleMapsUrl } from '../../utilities';

type Props = { address: string; phone: string };

export function Contact({ address, phone }: Props) {
  const pretty = formatPhoneNumber(phone);
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-2 text-2xl font-semibold">Contact</h2>
      <div className="space-y-1 text-sm">
        <div>
          <a className="underline" href={`tel:${phone}`}>Call {pretty}</a>
        </div>
        <div>
          <a className="underline" href={generateGoogleMapsUrl(address)} target="_blank" rel="noreferrer">Get Directions</a>
        </div>
      </div>
    </section>
  );
}

