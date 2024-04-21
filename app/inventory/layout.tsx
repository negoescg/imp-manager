import { checkAuthAdmin } from '@/lib/auth/utils';

export default async function InventoryLayout({ children }: { children: React.ReactNode }) {
  await checkAuthAdmin();
  return <div className="p-5">{children}</div>;
}
