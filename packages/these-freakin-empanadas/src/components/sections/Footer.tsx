import * as React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-6">
      <div className="mx-auto max-w-6xl px-4 text-xs text-white/70">
        © {new Date().getFullYear()} These Freakin’ Empanadas & More
      </div>
    </footer>
  );
}

