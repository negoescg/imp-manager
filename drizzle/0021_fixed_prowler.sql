ALTER TABLE "inventory_items" ALTER COLUMN "quantity" SET DATA TYPE numeric(10, 3);--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "quantity" SET DATA TYPE numeric(10, 3);--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "expected_date" SET DEFAULT '2024-04-28 14:44:39.713';