import { db } from '@/lib/db';
import { finalProducts, inventoryItems, inventoryTransactions, productComposition } from '@/lib/schema';
import { and, asc, desc, eq } from 'drizzle-orm';

export const calculateProductionCost = async (productId: number): Promise<{ newCost: number; initialCost: number }> => {
  const requiredMaterials = await db
    .select()
    .from(productComposition)
    .where(eq(productComposition.product_id, productId));

  let totalCost = 0;
  let firstCost = 0;
  for (const { item_id, quantity_required } of requiredMaterials) {
    const inventoryItem = await db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.item_id, item_id as number),
    });

    const isUnitKg = inventoryItem && inventoryItem.unit_of_measure_id === 3;
    const latestTransaction = await db.query.inventoryTransactions.findFirst({
      orderBy: [desc(inventoryTransactions.date_of_transaction)],
      where: and(
        eq(inventoryTransactions.item_id, item_id as number),
        eq(inventoryTransactions.transaction_type_id, 1),
        eq(inventoryTransactions.status, 'Confirmed'),
      ),
    });
    const firstTransaction = await db.query.inventoryTransactions.findFirst({
      orderBy: [asc(inventoryTransactions.date_of_transaction)],
      where: and(
        eq(inventoryTransactions.item_id, item_id as number),
        eq(inventoryTransactions.transaction_type_id, 1),
        eq(inventoryTransactions.status, 'Confirmed'),
      ),
    });
    if (latestTransaction) {
      let pricePerUnitLatest = parseFloat(latestTransaction.price_per_unit ?? '0');
      if (isUnitKg) {
        pricePerUnitLatest = pricePerUnitLatest / 1000;
      }
      totalCost += pricePerUnitLatest * parseFloat(quantity_required ?? '0');
    }

    if (firstTransaction) {
      let pricePerUnitFirst = parseFloat(firstTransaction.price_per_unit ?? '0');
      if (isUnitKg) {
        pricePerUnitFirst = pricePerUnitFirst / 1000;
      }
      firstCost += pricePerUnitFirst * parseFloat(quantity_required ?? '0');
    }
  }

  return { newCost: totalCost, initialCost: firstCost };
};

export async function updateProductCost(productId: number): Promise<{ newCost: number; diff: number }> {
  const costData = await calculateProductionCost(productId);
  const costDiff = costData.newCost - costData.initialCost;

  // const product = await db.query.finalProducts.findFirst({ where: eq(finalProducts.product_id, productId) });

  // if (product) {
  //   if (product.production_cost) {
  //     costDiff = newCost - parseFloat(product.production_cost);
  //   }
  // }

  await db
    .update(finalProducts)
    .set({ production_cost: costData.newCost.toFixed(2), production_cost_difference: costDiff.toFixed(2) })
    .where(eq(finalProducts.product_id, productId));

  return { newCost: costData.newCost, diff: costDiff };
}

export async function updateAllProductCosts(itemId: number): Promise<void> {
  if (itemId) {
    const products = await db
      .selectDistinctOn([productComposition.product_id])
      .from(productComposition)
      .where(eq(productComposition.item_id, itemId));

    products.forEach(async (product) => {
      await updateProductCost(product.product_id as number);
    });
  }
}
