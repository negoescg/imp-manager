'use server';
import { db } from '@/lib/db';
import { categories, productCategoryCompositionTemplate } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const deleteCategory = async (id: number) => {
  try {
    await db.delete(categories).where(eq(categories.category_id, id));
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw new Error('Failed to delete category.');
  }
};

export const addCategory = async (newItem) => {
  try {
    const addedItem = await db.insert(categories).values(newItem).returning({ insertedId: categories.category_id });
    newItem.category_id = addedItem[0].insertedId;
    return newItem;
  } catch (error) {
    console.error('Failed to add category:', error);
    throw new Error('Failed to add category.');
  }
};
export const updateCategory = async (id: number, updatedItem) => {
  try {
    await db.update(categories).set(updatedItem).where(eq(categories.category_id, id));
  } catch (error) {
    console.error('Failed to update category:', error);
    throw new Error('Failed to update category.');
  }
};

export const deleteTemplateComposition = async (itemId: number) => {
  try {
    await db.delete(productCategoryCompositionTemplate).where(eq(productCategoryCompositionTemplate.id, itemId));
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw new Error('Failed to delete product.');
  }
};

export const addTemplateComposition = async (newItem, categoryId) => {
  try {
    newItem.category_id = categoryId;
    const addedItem = await db
      .insert(productCategoryCompositionTemplate)
      .values(newItem)
      .returning({ insertedId: productCategoryCompositionTemplate.id });
    newItem.id = addedItem[0].insertedId;
    return newItem;
  } catch (error) {
    console.error('Failed to add product:', error);
    throw new Error('Failed to add product.');
  }
};
export const updateTemplateComposition = async (itemId: number, updatedItem) => {
  try {
    await db
      .update(productCategoryCompositionTemplate)
      .set(updatedItem)
      .where(eq(productCategoryCompositionTemplate.id, itemId));
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Failed to update product.');
  }
};

export const getCategoryTemplate = async (id: number) => {
  const items = await db
    .select()
    .from(productCategoryCompositionTemplate)
    .where(eq(productCategoryCompositionTemplate.category_id, id));
  return items;
};
