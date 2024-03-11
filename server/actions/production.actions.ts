'use server';
import { db } from '@/lib/db';
import {
  finalProducts,
  inventoryItems,
  inventoryTransactions,
  productComposition,
  productionListItems,
  productionListOrphans,
  productionLists,
} from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const getProductionListItems = async (id: number) => {
  const items = await db.select().from(productionListItems).where(eq(productionListItems.production_list_id, id));
  return items;
};

export const getProductionLists = async () => {
  const items = await db.select().from(productionLists);
  return items;
};

export const deleteProductionList = async (itemId: number) => {
  try {
    await db.delete(productionListItems).where(eq(productionListItems.production_list_id, itemId));
    await db.delete(productionLists).where(eq(productionLists.id, itemId));
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw new Error('Failed to delete product.');
  }
};

export const addProductionList = async (newItem) => {
  try {
    const addedItem = await db.insert(productionLists).values(newItem).returning({ insertedId: productionLists.id });
    newItem.id = addedItem[0].insertedId;
    return newItem;
  } catch (error) {
    console.error('Failed to add product:', error);
    throw new Error('Failed to add product.');
  }
};

export const updateProductionList = async (itemId: number, updatedItem) => {
  try {
    await db.update(productionLists).set(updatedItem).where(eq(productionLists.id, itemId));
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Failed to update product.');
  }
};

export const deleteProductionListItem = async (itemId: number) => {
  try {
    await db.delete(productionListItems).where(eq(productionListItems.id, itemId));
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw new Error('Failed to delete product.');
  }
};
type Transaction = typeof inventoryTransactions.$inferInsert;
export const completeProductionList = async (id: number) => {
  const list = await db.query.productionLists.findFirst({
    where: eq(productionLists.id, id),
  });
  const listItems = await db.select().from(productionListItems).where(eq(productionListItems.production_list_id, id));
  listItems.forEach(async (element) => {
    const product = await db.query.finalProducts.findFirst({
      where: eq(finalProducts.sku, element.sku),
    });
    if (product) {
      if (element.took_from_stock && element.took_from_stock > 0) {
        const inventory = await db.query.inventoryItems.findFirst({
          where: eq(inventoryItems.item_sku, product.sku as string),
        });
        if (inventory && element.took_from_stock && element.took_from_stock > 0) {
          const newTransaction = {
            item_id: inventory.item_id,
            date_of_transaction: new Date(),
            expected_date: new Date(),
            status: 'Confirmed',
            transaction_type_id: 2,
            quantity: element.took_from_stock,
          } as Transaction;

          await db.insert(inventoryTransactions).values(newTransaction);
          inventory.quantity = (inventory.quantity ?? 0) - (newTransaction.quantity ?? 0);
          await db.update(inventoryItems).set(inventory).where(eq(inventoryItems.item_id, inventory.item_id));
        }
      }
      if (element.completed && element.completed > 0) {
        const compositionItems = await db
          .select()
          .from(productComposition)
          .where(eq(productComposition.product_id, product.product_id));

        compositionItems.forEach(async (composition) => {
          const inventory = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.item_id, composition.item_id as number),
          });
          if (inventory && composition.item_id && element.completed && element.completed > 0) {
            const newTransaction = {
              item_id: inventory.item_id,
              date_of_transaction: new Date(),
              expected_date: new Date(),
              status: 'Confirmed',
              transaction_type_id: 2,
              quantity: element.completed * parseFloat(composition.quantity_required ?? '0'),
            } as Transaction;

            await db.insert(inventoryTransactions).values(newTransaction);
            inventory.quantity = (inventory.quantity ?? 0) - (newTransaction.quantity ?? 0);
            await db.update(inventoryItems).set(inventory).where(eq(inventoryItems.item_id, inventory.item_id));
          }
        });
      }
    } else {
      await db.insert(productionListOrphans).values(element);
    }
  });
  if (list) {
    list.status = 'Completed';
    await db.update(productionLists).set(list).where(eq(productionLists.id, id));
  }
  try {
  } catch (error) {
    console.error('Failed to complete production list:', error);
    throw new Error('Failed to complete production list.');
  }
};

export const addProductionListItem = async (newItem, listId) => {
  try {
    newItem.production_list_id = listId;
    newItem.original_required = newItem.required;
    const addedItem = await db
      .insert(productionListItems)
      .values(newItem)
      .returning({ insertedId: productionListItems.id });
    newItem.id = addedItem[0].insertedId;
    return newItem;
  } catch (error) {
    console.error('Failed to add product:', error);
    throw new Error('Failed to add product.');
  }
};

export const updateProductionListItem = async (itemId: number, updatedItem) => {
  try {
    await db.update(productionListItems).set(updatedItem).where(eq(productionListItems.id, itemId));
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Failed to update product.');
  }
};

export const uploadProductionList = async (name: string, date: Date, items: string) => {
  try {
    const fileDataArray = JSON.parse(items);
    const listId = await db
      .insert(productionLists)
      .values({ name: name, list_date: date })
      .returning({ insertedId: productionLists.id });
    const listItems = [] as any[];
    fileDataArray.forEach((element) => {
      listItems.push({
        sku: element.SKU,
        required: element.RequiredByBackOrder,
        original_required: element.RequiredByBackOrder,
        production_list_id: listId[0].insertedId,
        completed: 0,
        name: element.Name,
      });
    });
    await db.insert(productionListItems).values(listItems);
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Failed to update product.');
  }
};
