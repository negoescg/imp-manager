import { checkAuth } from '@/lib/auth/utils';

export default async function ProductionLayout({ children }: { children: React.ReactNode }) {
  await checkAuth();
  return <div className="p-5">{children}</div>;
}
