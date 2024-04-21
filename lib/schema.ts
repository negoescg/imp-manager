import { relations } from 'drizzle-orm';
import { serial, varchar, integer, decimal, pgTable, timestamp, bigint, pgView, text } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  name: text('name'),
  role: text('role').default('user'),
});

export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const authenticationSchema = z.object({
  email: z.string().email().min(5).max(31),
  password: z
    .string()
    .min(4, { message: 'must be at least 4 characters long' })
    .max(15, { message: 'cannot be more than 15 characters long' }),
});

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().min(4).optional(),
});

export type UsernameAndPassword = z.infer<typeof authenticationSchema>;

export const itemTypes = pgTable('item_types', {
  type_id: serial('type_id').primaryKey(),
  type_name: varchar('type_name', { length: 255 }).unique(),
});

export const unitsOfMeasure = pgTable('units_of_measure', {
  unit_id: serial('unit_id').primaryKey(),
  unit_name: varchar('unit_name', { length: 255 }).unique(),
});

export const categories = pgTable('categories', {
  category_id: serial('category_id').primaryKey(),
  category_name: varchar('category_name', { length: 255 }).unique(),
});

export const transactionTypes = pgTable('transaction_types', {
  transaction_type_id: serial('transaction_type_id').primaryKey(),
  transaction_type_name: varchar('transaction_type_name', { length: 255 }).unique(),
});

export const inventoryItems = pgTable('inventory_items', {
  item_id: serial('item_id').primaryKey(),
  item_name: varchar('item_name', { length: 255 }).unique(),
  item_description: varchar('item_description', { length: 255 }),
  item_sku: varchar('item_sku', { length: 255 }),
  date_created: timestamp('date_created').defaultNow(),
  item_type_id: integer('item_type_id').references(() => itemTypes.type_id),
  unit_of_measure_id: integer('unit_of_measure_id').references(() => unitsOfMeasure.unit_id),
  quantity: decimal('quantity', { precision: 10, scale: 3 }),
});

export const finalProducts = pgTable('final_products', {
  product_id: serial('product_id').primaryKey(),
  sku: varchar('sku', { length: 255 }).unique(),
  name: varchar('name', { length: 255 }).unique(),
  category_id: integer('category_id').references(() => categories.category_id),
  production_cost: decimal('production_cost', { precision: 10, scale: 2 }),
  price: decimal('price', { precision: 10, scale: 2 }),
  production_cost_difference: decimal('production_cost_difference', { precision: 10, scale: 2 }),
});

export const productComposition = pgTable('product_composition', {
  composition_id: serial('composition_id').primaryKey(),
  product_id: integer('product_id').references(() => finalProducts.product_id),
  item_id: integer('item_id').references(() => inventoryItems.item_id),
  quantity_required: decimal('quantity_required', { precision: 10, scale: 2 }),
});

export const productCategoryCompositionTemplate = pgTable('category_template_composition', {
  id: serial('id').primaryKey(),
  category_id: integer('category_id').references(() => categories.category_id),
  item_id: integer('item_id').references(() => inventoryItems.item_id),
  quantity_required: decimal('quantity_required', { precision: 10, scale: 2 }),
});

export const inventoryTransactions = pgTable('inventory_transactions', {
  transaction_id: serial('transaction_id').primaryKey(),
  item_id: integer('item_id').references(() => inventoryItems.item_id),
  transaction_type_id: integer('transaction_type_id').references(() => transactionTypes.transaction_type_id),
  date_of_transaction: timestamp('date_of_transaction').defaultNow(),
  quantity: decimal('quantity', { precision: 10, scale: 3 }),
  price_per_unit: decimal('price_per_unit', { precision: 10, scale: 2 }),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }),
  expected_date: timestamp('expected_date').default(new Date(new Date().setDate(new Date().getDate() + 7))),
  status: varchar('status', { length: 255 }).default('Pending'),
});

export const productionHistory = pgTable('production_history', {
  production_id: serial('production_id').primaryKey(),
  product_id: integer('product_id').references(() => finalProducts.product_id),
  product_list_item_id: integer('product_list_item_id').references(() => productionListItems.id),
  date_produced: timestamp('date_produced').defaultNow(),
  quantity_produced: integer('quantity_produced'),
});

export const productionLists = pgTable('production_lists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  list_date: timestamp('list_date').defaultNow(),
  status: varchar('status', { length: 255 }).default('In Progress'),
  completed_date: timestamp('completed_date'),
});

export const productionListItems = pgTable('production_list_items', {
  id: serial('id').primaryKey(),
  sku: varchar('sku', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  production_list_id: integer('production_list_id')
    .references(() => productionLists.id)
    .notNull(),
  original_required: integer('original_required').notNull().default(0),
  required: integer('required').notNull(),
  completed: integer('completed').default(0),
  took_from_stock: integer('took_from_stock').default(0),
});

export const productionListOrphans = pgTable('production_list_orphans', {
  id: serial('id').primaryKey(),
  sku: varchar('sku', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  production_list_id: integer('production_list_id')
    .references(() => productionLists.id)
    .notNull(),
  original_required: integer('original_required').notNull().default(0),
  required: integer('required').notNull(),
  completed: integer('completed').default(0),
  took_from_stock: integer('took_from_stock').default(0),
});

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  itemType: one(itemTypes, {
    fields: [inventoryItems.item_type_id],
    references: [itemTypes.type_id],
  }),
  unitOfMeasure: one(unitsOfMeasure, {
    fields: [inventoryItems.unit_of_measure_id],
    references: [unitsOfMeasure.unit_id],
  }),
  transactions: many(inventoryTransactions),
}));

export const finalProductsRelations = relations(finalProducts, ({ one, many }) => ({
  category: one(categories, {
    fields: [finalProducts.category_id],
    references: [categories.category_id],
  }),
  productCompositions: many(productComposition),
  productionHistory: many(productionHistory),
}));

export const productCompositionRelations = relations(productComposition, ({ one }) => ({
  inventoryItem: one(inventoryItems, {
    fields: [productComposition.item_id],
    references: [inventoryItems.item_id],
  }),
  finalProduct: one(finalProducts, {
    fields: [productComposition.product_id],
    references: [finalProducts.product_id],
  }),
}));

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  inventoryItem: one(inventoryItems, {
    fields: [inventoryTransactions.item_id],
    references: [inventoryItems.item_id],
  }),
  transactionType: one(transactionTypes, {
    fields: [inventoryTransactions.transaction_type_id],
    references: [transactionTypes.transaction_type_id],
  }),
}));

// export const prodHistoryView = pgView('prod_history_view').as((qb) =>
//   qb
//     .select({
//       id: productionListItems.id,
//       list_id: productionLists.id,
//       sku: productionListItems.sku,
//       required: productionListItems.required,
//       completed: productionListItems.completed,
//       stock: productionListItems.took_from_stock,
//       name: productionListItems.name,
//       list_date: productionLists.list_date,
//       completed_date: productionLists.completed_date,
//     })
//     .from(productionListItems)
//     .fullJoin(productionLists, eq(productionListItems.production_list_id, productionLists.id))
//     .where(eq(productionLists.status, 'Completed')),
// );

export const prodHistoryView = pgView('prod_history_view', {
  id: integer('id'),
  list_id: integer('list_id'),
  sku: text('sku'),
  required: integer('required'),
  completed: integer('completed'),
  took_from_stock: integer('took_from_stock'),
  name: text('name'),
  list_date: timestamp('list_date'),
  completed_date: timestamp('completed_date'),
  type: text('type'),
}).existing();
