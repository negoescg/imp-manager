ALTER TABLE "production_history" ADD COLUMN "product_list_item_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_history" ADD CONSTRAINT "production_history_product_list_item_id_production_list_items_id_fk" FOREIGN KEY ("product_list_item_id") REFERENCES "production_list_items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
