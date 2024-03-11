CREATE TABLE IF NOT EXISTS "production_list_orphans" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"production_list_id" integer NOT NULL,
	"original_required" integer DEFAULT 0 NOT NULL,
	"required" integer NOT NULL,
	"completed" integer DEFAULT 0,
	"took_from_stock" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "expected_date" SET DEFAULT '2024-03-18 17:44:35.975';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_list_orphans" ADD CONSTRAINT "production_list_orphans_production_list_id_production_lists_id_fk" FOREIGN KEY ("production_list_id") REFERENCES "production_lists"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
