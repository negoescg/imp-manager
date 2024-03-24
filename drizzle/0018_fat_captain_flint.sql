ALTER TABLE "inventory_transactions" ALTER COLUMN "expected_date" SET DEFAULT '2024-03-31 12:20:52.305';--> statement-breakpoint
ALTER TABLE "production_lists" ADD COLUMN "completed_date" timestamp;