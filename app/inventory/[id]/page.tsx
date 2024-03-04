import InventoryTransactionGrid from '@/components/InventoryTransactionGrid';
import { getInventoryItemTransactions } from '@/server/actions/inventory.actions';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

const Page = async ({ params }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['inventoryTransaction', params.id],
    queryFn: () => getInventoryItemTransactions(params.id),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InventoryTransactionGrid itemId={params.id} />
    </HydrationBoundary>
  );
};

export default Page;
