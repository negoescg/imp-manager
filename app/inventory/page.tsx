'use server';
import InventoryGrid from '@/components/InventoryGrid';
import { getInventoryItems } from '@/server/actions/inventory.actions';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import React from 'react';

const Inventory = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryItems,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InventoryGrid />
    </HydrationBoundary>
  );
};

export default Inventory;
