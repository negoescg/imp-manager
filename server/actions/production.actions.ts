'use server';
import { db } from '@/lib/db';
import { productionListItems, productionLists } from '@/lib/schema';
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

export const addProductionListItem = async (newItem, listId) => {
  try {
    newItem.production_list_id = listId;
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
