ALTER TABLE "profile" ADD COLUMN "profileVerified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "profileTokenExpiry" timestamp;