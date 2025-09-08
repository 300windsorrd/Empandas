"use client";
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-4 text-2xl font-semibold">Admin Disabled</h1>
      <p className="text-white/80">Authentication is disabled in this build. The site runs without login or a database.</p>
      <div className="mt-4 text-xs text-white/70">
        <Link className="underline" href="/">Back to site</Link>
      </div>
    </main>
  );
}
