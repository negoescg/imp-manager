'use server';

import { db } from '@/lib/db';
import { inventoryItems, inventoryTransactions } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { updateAllProductCosts } from './cost.actions';

export const getInventoryItems = async () => {
  const items = await db.query.inventoryItems.findMany();

  // const items = await db.query.inventoryItems.findMany({
  //   with: {
  //     itemType: true,
  //     unitOfMeasure: true,
  //   },
  // });

  // const transformedItems = items.map((item) => ({
  //   item_id: item.item_id,
  //   item_name: item.item_name ?? null,
  //   item_description: item.item_description ?? null,
  //   item_sku: item.item_sku ?? null,
  //   date_created: item.date_created ?? null,
  //   item_type_id: item.item_type_id ?? null,
  //   unit_of_measure_id: item.unit_of_measure_id ?? null,
  //   quantity: item.quantity ?? null,
  //   itemType: item.itemType ? item.itemType.type_name : null,
  //   unitOfMeasure: item.unitOfMeasure ? item.unitOfMeasure.unit_name : null,
  // }));
  return items;
};

export const getItemTypes = async () => {
  const items = await db.query.itemTypes.findMany();

  return items;
};

export const getUnitOfMeasure = async () => {
  const items = await db.query.unitsOfMeasure.findMany();

  return items;
};

export const getTransactionTypes = async () => {
  const items = await db.query.transactionTypes.findMany();
  return items;
};

export const deleteInventoryItem = async (itemId: number) => {
  try {
    await db.delete(inventoryTransactions).where(eq(inventoryTransactions.item_id, itemId));
    await db.delete(inventoryItems).where(eq(inventoryItems.item_id, itemId));
  } catch (error) {
    console.error('Failed to delete inventory item:', error);
    throw new Error('Failed to delete inventory item.');
  }
};

export const addInventoryItem = async (newItem) => {
  try {
    const addedItem = await db.insert(inventoryItems).values(newItem).returning({ insertedId: inventoryItems.item_id });
    newItem.item_id = addedItem[0].insertedId;
    return newItem;
  } catch (error) {
    console.error('Failed to add inventory item:', error);
    throw new Error('Failed to add inventory item.');
  }
};
export const updateInventoryItem = async (itemId: number, updatedItem) => {
  try {
    await db.update(inventoryItems).set(updatedItem).where(eq(inventoryItems.item_id, itemId));
  } catch (error) {
    console.error('Failed to update inventory item:', error);
    throw new Error('Failed to update inventory item.');
  }
};

export const getInventoryItemTransactions = async (id: number) => {
  const items = await db.select().from(inventoryTransactions).where(eq(inventoryTransactions.item_id, id));
  return items;
};

export const deleteInventoryItemTransaction = async (itemId: number, inventoryItemId: number) => {
  try {
    const inventoryItemTransaction = await db.query.inventoryTransactions.findFirst({
      where: eq(inventoryTransactions.transaction_id, itemId),
    });
    const inventoryItem = await db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.item_id, inventoryItemId),
    });
    if (inventoryItemTransaction && inventoryItemTransaction.status !== 'Pending') {
      if (inventoryItemTransaction && inventoryItemTransaction.transaction_type_id === 1 && inventoryItem) {
        inventoryItem.quantity = (
          parseFloat(inventoryItem.quantity ?? '0') - parseFloat(inventoryItemTransaction.quantity ?? '0')
        ).toString();
        await db.update(inventoryItems).set(inventoryItem).where(eq(inventoryItems.item_id, inventoryItem.item_id));
      } else if (inventoryItemTransaction && inventoryItemTransaction.transaction_type_id === 2 && inventoryItem) {
        inventoryItem.quantity = (
          parseFloat(inventoryItem.quantity ?? '0') + parseFloat(inventoryItemTransaction.quantity ?? '0')
        ).toString();
        await db.update(inventoryItems).set(inventoryItem).where(eq(inventoryItems.item_id, inventoryItem.item_id));
      }
    }
    await db.delete(inventoryTransactions).where(eq(inventoryTransactions.transaction_id, itemId));

    if (inventoryItemTransaction && inventoryItemTransaction.status !== 'Pending')
      await updateAllProductCosts(inventoryItemId as number);
  } catch (error) {
    console.error('Failed to delete inventory item:', error);
    throw new Error('Failed to delete inventory item.');
  }
};

export const addInventoryItemTransaction = async (newItem, id: number) => {
  try {
    newItem.item_id = id;
    const addedItem = await db
      .insert(inventoryTransactions)
      .values(newItem)
      .returning({ insertedId: inventoryTransactions.transaction_id });
    newItem.transaction_id = addedItem[0].insertedId;

    if (newItem && newItem.status !== 'Pending') {
      const inventoryItem = await db.query.inventoryItems.findFirst({
        where: eq(inventoryItems.item_id, newItem.item_id),
      });

      if (newItem.transaction_type_id === 1 && inventoryItem) {
        inventoryItem.quantity = (inventoryItem.quantity ?? 0) + newItem.quantity;
        await db.update(inventoryItems).set(inventoryItem).where(eq(inventoryItems.item_id, inventoryItem.item_id));
      } else if (newItem.transaction_type_id === 2 && inventoryItem) {
        inventoryItem.quantity = (
          parseFloat(inventoryItem.quantity ?? '0') - parseFloat(newItem.quantity ?? '0')
        ).toString();
        await db.update(inventoryItems).set(inventoryItem).where(eq(inventoryItems.item_id, inventoryItem.item_id));
      }
      await updateAllProductCosts(id as number);
    }
    return newItem;
  } catch (error) {
    console.error('Failed to add inventory item:', error);
    throw new Error('Failed to add inventory item.');
  }
};

export const confirmInventoryTransaction = async (id: number) => {
  try {
    const transactionItem = await db.query.inventoryTransactions.findFirst({
      where: eq(inventoryTransactions.transaction_id, id),
    });
    const inventoryItem = await db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.item_id, transactionItem?.item_id as number),
    });
    if (transactionItem) {
      transactionItem.status = 'Confirmed';
      await db.update(inventoryTransactions).set(transactionItem).where(eq(inventoryTransactions.transaction_id, id));
      await updateAllProductCosts(transactionItem.item_id as number);
    }
    if (transactionItem && transactionItem.transaction_type_id === 1 && inventoryItem) {
      inventoryItem.quantity = (
        parseFloat(inventoryItem.quantity ?? '0') + parseFloat(transactionItem.quantity ?? '0')
      ).toString();
      await db.update(inventoryItems).set(inventoryItem).where(eq(inventoryItems.item_id, inventoryItem.item_id));
    } else if (transactionItem && transactionItem.transaction_type_id === 2 && inventoryItem) {
      inventoryItem.quantity = (
        parseFloat(inventoryItem.quantity ?? '0') - parseFloat(transactionItem.quantity ?? '0')
      ).toString();
      await db.update(inventoryItems).set(inventoryItem).where(eq(inventoryItems.item_id, inventoryItem.item_id));
    }
  } catch (error) {
    console.error('Failed to add confirm transaction:', error);
    throw new Error('Failed to add inventory item.');
  }
};

export const updateInventoryItemTransaction = async (itemId: number, updatedItem, inventoryItemId) => {
  try {
    const inventoryItemTransaction = await db.query.inventoryTransactions.findFirst({
      where: eq(inventoryTransactions.transaction_id, itemId),
    });
    if (inventoryItemTransaction && inventoryItemTransaction.status !== 'Pending') {
      const inventoryItem = await db.query.inventoryItems.findFirst({
        where: eq(inventoryItems.item_id, inventoryItemId),
      });
      if (
        inventoryItemTransaction &&
        updatedItem.transaction_type_id &&
        inventoryItemTransaction.transaction_type_id != updatedItem.transaction_type_id
      ) {
        if (
          inventoryItemTransaction.transaction_type_id === 1 &&
          updatedItem.transaction_type_id === 2 &&
          inventoryItem
        ) {
          inventoryItem.quantity = (
            parseFloat(inventoryItem.quantity ?? '0') - parseFloat(inventoryItemTransaction.quantity ?? '0')
          ).toString();

          inventoryItem.quantity = (
            parseFloat(inventoryItem.quantity ?? '0') -
            parseFloat(updatedItem.quantity ?? inventoryItemTransaction.quantity ?? '0')
          ).toString();
        } else if (
          inventoryItemTransaction.transaction_type_id === 2 &&
          updatedItem.transaction_type_id === 1 &&
          inventoryItem
        ) {
          inventoryItem.quantity = (
            parseFloat(inventoryItem.quantity ?? '0') + parseFloat(inventoryItemTransaction.quantity ?? '0')
          ).toString();

          inventoryItem.quantity = (
            parseFloat(inventoryItem.quantity ?? '0') +
            parseFloat(updatedItem.quantity ?? inventoryItemTransaction.quantity ?? '0')
          ).toString();
        }
      } else if (
        inventoryItemTransaction &&
        updatedItem.quantity &&
        inventoryItemTransaction.quantity !== updatedItem.quantity &&
        inventoryItem
      ) {
        if (updatedItem.transaction_type_id === 1) {
          inventoryItem.quantity = (
            parseFloat(inventoryItem.quantity ?? '0') - parseFloat(inventoryItemTransaction.quantity ?? '0')
          ).toString();
          inventoryItem.quantity = (
            parseFloat(inventoryItem.quantity ?? '0') + parseFloat(updatedItem.quantity ?? '0')
          ).toString();
        } else if (updatedItem.transaction_type_id === 2) {
          inventoryItem.quantity = (
            parseFloat(inventoryItem.quantity ?? '0') + parseFloat(inventoryItemTransaction.quantity ?? '0')
          ).toString();
          inventoryItem.quantity = (
            parseFloat(inventoryItem.quantity ?? '0') - parseFloat(updatedItem.quantity ?? '0')
          ).toString();
        }
      }
      if (inventoryItem) {
        await db.update(inventoryItems).set(inventoryItem).where(eq(inventoryItems.item_id, inventoryItem.item_id));
      }
    }
    await db.update(inventoryTransactions).set(updatedItem).where(eq(inventoryTransactions.transaction_id, itemId));
    if (inventoryItemTransaction && inventoryItemTransaction.status !== 'Pending' && updatedItem?.quantity)
      await updateAllProductCosts(inventoryItemId as number);
  } catch (error) {
    console.error('Failed to update inventory item:', error);
    throw new Error('Failed to update inventory item.');
  }
};

export const uploadInventoryList = async (items: string) => {
  try {
    const fileDataArray = JSON.parse(items);
    for (const element of fileDataArray) {
      const inventoryItem = await db.query.inventoryItems.findFirst({
        where: eq(inventoryItems.item_name, element.NAME ? element.NAME : ''),
      });
      if (inventoryItem) {
        const addedTransaction = await db
          .insert(inventoryTransactions)
          .values({
            status: 'Pending',
            transaction_type_id: 1,
            item_id: inventoryItem.item_id,
            quantity: element.QUANTITY,
            date_of_transaction: new Date(),
            price_per_unit: element.PRICE ? element.PRICE : element[' PRICE'],
            total_amount: null,
            expected_date: new Date(),
          })
          .returning({ insertedId: inventoryTransactions.transaction_id });
        if (element.PRICE || element[' PRICE']) {
          await confirmInventoryTransaction(addedTransaction[0].insertedId);
        }
      } else {
        const addedItem = await db
          .insert(inventoryItems)
          .values({
            item_name: element.NAME,
            item_description: null,
            item_sku: null,
            date_created: new Date(),
            item_type_id: element.TYPE,
            unit_of_measure_id: element.UNIT,
            quantity: '0',
          })
          .returning({ insertedId: inventoryItems.item_id });
        const addedTransaction = await db
          .insert(inventoryTransactions)
          .values({
            status: 'Pending',
            transaction_type_id: 1,
            item_id: addedItem[0].insertedId,
            quantity: element.QUANTITY,
            date_of_transaction: new Date(),
            price_per_unit: element.PRICE ? element.PRICE : element[' PRICE'],
            total_amount: null,
            expected_date: new Date(),
          })
          .returning({ insertedId: inventoryTransactions.transaction_id });
        if (element.QUANTITY && element.QUANTITY !== 0 && (element.PRICE || element[' PRICE'])) {
          await confirmInventoryTransaction(addedTransaction[0].insertedId);
        }
      }
    }
  } catch (error) {
    console.error('Failed to upload inventory list:', error);
    throw new Error('Failed to upload inventory list.');
  }
};
