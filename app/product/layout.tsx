import { checkAuthAdmin } from '@/lib/auth/utils';

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  await checkAuthAdmin();
  return <div className="p-5">{children}</div>;
}
