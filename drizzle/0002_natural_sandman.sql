ALTER TABLE "inventory_transactions" RENAME COLUMN "date" TO "date_of_transaction";--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "quantity" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "date_of_transaction" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "production_history" ALTER COLUMN "date_produced" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "item_sku" varchar(255);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "date_created" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "quantity" bigint;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "total_amount" numeric(10, 2);