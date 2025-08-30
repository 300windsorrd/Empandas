import { prisma } from '@/src/lib/db';
import AdminClient from './ui/AdminClient';

export default async function AdminPage() {
  const [menu, drafts, heroes, settings, changes] = await Promise.all([
    prisma.menuItem.findMany({ orderBy: { name: 'asc' } }),
    prisma.menuItemDraft.findMany({ orderBy: { name: 'asc' } }),
    prisma.heroSlide.findMany({ orderBy: { position: 'asc' } }),
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.changeLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  ]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Admin</h1>
      <AdminClient menu={menu} drafts={drafts} heroes={heroes} settings={settings} changes={changes} />
    </main>
  );
}
