import UserGrid from '@/components/UserGrid';
import { getUsers } from '@/server/actions/user.actions';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

export default async function page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserGrid />
    </HydrationBoundary>
  );
}
