ALTER TABLE "final_products" RENAME COLUMN "retail_price" TO "price";--> statement-breakpoint
ALTER TABLE "final_products" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "final_products" ADD CONSTRAINT "final_products_name_unique" UNIQUE("name");