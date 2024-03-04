'use server';
import ProductGrid from '@/components/ProductGrid';
import { getFinalProducts } from '@/server/actions/product.actions';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import React from 'react';

const Product = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['product'],
    queryFn: getFinalProducts,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductGrid />
    </HydrationBoundary>
  );
};

export default Product;
