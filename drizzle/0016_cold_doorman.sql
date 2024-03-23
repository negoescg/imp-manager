ALTER TABLE "final_products" ALTER COLUMN "price" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "expected_date" SET DEFAULT '2024-03-30 12:25:33.472';--> statement-breakpoint
ALTER TABLE "final_products" ADD COLUMN "production_cost_difference" numeric(10, 2) DEFAULT '0';