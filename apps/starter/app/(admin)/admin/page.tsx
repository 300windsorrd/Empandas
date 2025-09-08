export const dynamic = 'force-static';
export const revalidate = 3600;

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-semibold">Admin Disabled</h1>
      <p className="text-white/80">This build has admin/auth and database disabled. The public site runs using static data only.</p>
    </main>
  );
}
