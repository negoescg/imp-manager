CREATE TABLE IF NOT EXISTS "production_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"production_list_id" integer NOT NULL,
	"required" integer NOT NULL,
	"completed" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "production_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"list_date" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_list_items" ADD CONSTRAINT "production_list_items_sku_final_products_sku_fk" FOREIGN KEY ("sku") REFERENCES "final_products"("sku") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_list_items" ADD CONSTRAINT "production_list_items_production_list_id_production_lists_id_fk" FOREIGN KEY ("production_list_id") REFERENCES "production_lists"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
