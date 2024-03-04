CREATE TABLE IF NOT EXISTS "categories" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"category_name" varchar(255),
	CONSTRAINT "categories_category_name_unique" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "final_products" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(255),
	"category_id" integer,
	"production_cost" numeric(10, 2),
	"retail_price" numeric(10, 2),
	CONSTRAINT "final_products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_items" (
	"item_id" serial PRIMARY KEY NOT NULL,
	"item_name" varchar(255),
	"item_type_id" integer,
	"unit_of_measure_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
	"transaction_id" serial PRIMARY KEY NOT NULL,
	"item_id" integer,
	"transaction_type_id" integer,
	"date" timestamp,
	"quantity" integer,
	"price_per_unit" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item_types" (
	"type_id" serial PRIMARY KEY NOT NULL,
	"type_name" varchar(255),
	CONSTRAINT "item_types_type_name_unique" UNIQUE("type_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_composition" (
	"composition_id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"item_id" integer,
	"quantity_required" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "production_history" (
	"production_id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"date_produced" timestamp,
	"quantity_produced" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaction_types" (
	"transaction_type_id" serial PRIMARY KEY NOT NULL,
	"transaction_type_name" varchar(255),
	CONSTRAINT "transaction_types_transaction_type_name_unique" UNIQUE("transaction_type_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "units_of_measure" (
	"unit_id" serial PRIMARY KEY NOT NULL,
	"unit_name" varchar(255),
	CONSTRAINT "units_of_measure_unit_name_unique" UNIQUE("unit_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(100),
	"password" varchar(255),
	"role" varchar(50) DEFAULT 'user',
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "final_products" ADD CONSTRAINT "final_products_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_item_type_id_item_types_type_id_fk" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_unit_of_measure_id_units_of_measure_unit_id_fk" FOREIGN KEY ("unit_of_measure_id") REFERENCES "units_of_measure"("unit_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_item_id_inventory_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_transaction_type_id_transaction_types_transaction_type_id_fk" FOREIGN KEY ("transaction_type_id") REFERENCES "transaction_types"("transaction_type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_composition" ADD CONSTRAINT "product_composition_product_id_final_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "final_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_composition" ADD CONSTRAINT "product_composition_item_id_inventory_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_history" ADD CONSTRAINT "production_history_product_id_final_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "final_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
