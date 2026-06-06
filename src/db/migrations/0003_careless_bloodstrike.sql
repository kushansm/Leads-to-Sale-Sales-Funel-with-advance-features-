CREATE TYPE "public"."opportunity_stage" AS ENUM('discovery', 'proposal', 'negotiation', 'won', 'lost');--> statement-breakpoint
CREATE TABLE "opportunity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"name" text NOT NULL,
	"estimated_value" integer DEFAULT 0 NOT NULL,
	"probability" integer DEFAULT 50 NOT NULL,
	"stage" "opportunity_stage" DEFAULT 'discovery' NOT NULL,
	"expected_close_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_lead_id_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;