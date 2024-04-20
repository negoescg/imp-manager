import { checkAuth } from '@/lib/auth/utils';

export default async function Home() {
  await checkAuth();

  return <div className="p-5">Instruction maybe depending on user role ?</div>;
}
