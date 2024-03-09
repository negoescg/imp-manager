ALTER TABLE "inventory_transactions" ADD COLUMN "expected_date" timestamp DEFAULT '2024-03-16 13:00:44.692';--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "status" varchar(255) DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "production_lists" ADD COLUMN "status" varchar(255) DEFAULT 'In Progress';