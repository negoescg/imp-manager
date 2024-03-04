'use server';
import ProductionListGrid from '@/components/ProductionListGrid';
import { getProductionLists } from '@/server/actions/production.actions';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import React from 'react';

const Product = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['production'],
    queryFn: getProductionLists,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductionListGrid />
    </HydrationBoundary>
  );
};

export default Product;
