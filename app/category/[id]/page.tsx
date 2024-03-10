'use server';
import CategoryProductTemplateCompositionGrid from '@/components/CategoryProductTemplateCompositionGrid';
import { getCategoryTemplate } from '@/server/actions/category.actions';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

const Page = async ({ params }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['categoryTemplate', params.id],
    queryFn: () => getCategoryTemplate(params.id),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryProductTemplateCompositionGrid itemId={params.id} />
    </HydrationBoundary>
  );
};

export default Page;
