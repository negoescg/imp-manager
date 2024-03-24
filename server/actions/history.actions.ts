'use server';
import { db } from '@/lib/db';
import { prodHistoryView } from '@/lib/schema';
import { and, gte, lte } from 'drizzle-orm';

export const getProdHistory = async (startDate, endDate) => {
  const items = await db
    .select()
    .from(prodHistoryView)
    .where(and(gte(prodHistoryView.completed_date, startDate), lte(prodHistoryView.completed_date, endDate)));
  console.log(items?.length, startDate, endDate);
  return items;
};
