import ProductCompositionGrid from '@/components/ProductCompositionGrid';
import { getProductComposition } from '@/server/actions/product.actions';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

const Page = async ({ params }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['productComposition', params.id],
    queryFn: () => getProductComposition(params.id),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductCompositionGrid itemId={params.id} />
    </HydrationBoundary>
  );
};

export default Page;
