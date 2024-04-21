'use server';
import { db } from '@/lib/db';
import { categories, finalProducts, productComposition } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getCategoryTemplate } from './category.actions';
import { updateProductCost } from './cost.actions';

export const getProductComposition = async (id: number) => {
  const items = await db.select().from(productComposition).where(eq(productComposition.product_id, id));
  return items;
};

export const getFinalProducts = async () => {
  const items = await db.select().from(finalProducts);
  return items;
};

export const getCategories = async () => {
  const items = await db.select().from(categories);
  return items;
};

export const deleteProduct = async (itemId: number) => {
  try {
    await db.delete(productComposition).where(eq(productComposition.product_id, itemId));
    await db.delete(finalProducts).where(eq(finalProducts.product_id, itemId));
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw new Error('Failed to delete product.');
  }
};

export const addProduct = async (newItem) => {
  try {
    const addedItem = await db
      .insert(finalProducts)
      .values(newItem)
      .returning({ insertedId: finalProducts.product_id });
    newItem.product_id = addedItem[0].insertedId;

    const templates = await getCategoryTemplate(newItem.category_id);

    for (const element of templates) {
      await db.insert(productComposition).values({
        product_id: addedItem[0].insertedId,
        item_id: element.item_id,
        quantity_required: element.quantity_required,
      });
    }

    const cost = await updateProductCost(addedItem[0].insertedId);
    newItem.production_cost = cost.newCost.toFixed(2);
    newItem.production_cost_difference = cost.diff.toFixed(2);
    return newItem;
  } catch (error) {
    console.error('Failed to add product:', error);
    throw new Error('Failed to add product.');
  }
};
export const updateProduct = async (itemId: number, updatedItem) => {
  try {
    await db.update(finalProducts).set(updatedItem).where(eq(finalProducts.product_id, itemId));
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Failed to update product.');
  }
};

export const deleteProductComposition = async (itemId: number, productId) => {
  try {
    await db.delete(productComposition).where(eq(productComposition.composition_id, itemId));
    await updateProductCost(productId);
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw new Error('Failed to delete product.');
  }
};

export const addProductComposition = async (newItem, productId) => {
  try {
    newItem.product_id = productId;
    const addedItem = await db
      .insert(productComposition)
      .values(newItem)
      .returning({ insertedId: productComposition.composition_id });
    newItem.composition_id = addedItem[0].insertedId;

    await updateProductCost(productId);

    return newItem;
  } catch (error) {
    console.error('Failed to add product:', error);
    throw new Error('Failed to add product.');
  }
};
export const updateProductComposition = async (itemId: number, updatedItem, productId) => {
  try {
    await db.update(productComposition).set(updatedItem).where(eq(productComposition.composition_id, itemId));

    await updateProductCost(productId);
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Failed to update product.');
  }
};

export const uploadProductList = async (items: string) => {
  try {
    const fileDataArray = JSON.parse(items);
    const listItems = [] as any[];
    fileDataArray.forEach((element) => {
      listItems.push({
        sku: element.SKU,
        required: element.RequiredByBackOrder,
        original_required: element.RequiredByBackOrder,
        completed: 0,
        name: element.Name,
      });
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Failed to update product.');
  }
};
