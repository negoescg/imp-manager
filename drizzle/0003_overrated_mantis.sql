ALTER TABLE "inventory_items" ADD COLUMN "item_description" varchar(255);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_item_name_unique" UNIQUE("item_name");