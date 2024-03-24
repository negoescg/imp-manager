'use server';
import ProdHistory from '@/components/ProdHistory';
import { getProdHistory } from '@/server/actions/history.actions';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import React from 'react';

const ProductionHistory = async () => {
  const lastMonthStart = startOfMonth(new Date());
  const lastMonthEnd = endOfMonth(new Date());
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['prodHistory', lastMonthStart, lastMonthEnd],
    queryFn: () => getProdHistory(lastMonthStart, lastMonthEnd),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProdHistory />
    </HydrationBoundary>
  );
};

export default ProductionHistory;
