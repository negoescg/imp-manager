CREATE TABLE IF NOT EXISTS "category_template_composition" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"item_id" integer,
	"quantity_required" numeric(10, 2)
);
--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "expected_date" SET DEFAULT '2024-03-17 16:50:15.323';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_template_composition" ADD CONSTRAINT "category_template_composition_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_template_composition" ADD CONSTRAINT "category_template_composition_item_id_inventory_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
