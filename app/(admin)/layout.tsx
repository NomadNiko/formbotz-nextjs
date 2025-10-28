import { requireAdmin } from '@/lib/auth/session';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
