import ProductionListItemGrid from '@/components/ProductionListItemGrid';
import { getProductionListItems } from '@/server/actions/production.actions';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

const Page = async ({ params }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['listItem', params.id],
    queryFn: () => getProductionListItems(params.id),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductionListItemGrid itemId={params.id} />
    </HydrationBoundary>
  );
};

export default Page;
