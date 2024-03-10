'use server';
import CategoryGrid from '@/components/CategoryGrid';
import { getCategories } from '@/server/actions/product.actions';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import React from 'react';

const Category = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['category'],
    queryFn: getCategories,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryGrid />
    </HydrationBoundary>
  );
};

export default Category;
