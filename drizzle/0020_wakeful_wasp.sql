ALTER TABLE "inventory_transactions" ALTER COLUMN "expected_date" SET DEFAULT '2024-04-27 12:01:17.612';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user';