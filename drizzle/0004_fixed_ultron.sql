CREATE TABLE IF NOT EXISTS "chirp" (
	"chirpId" uuid PRIMARY KEY NOT NULL,
	"chirpProfileId" uuid NOT NULL,
	"chirpContent" text NOT NULL,
	"chirpDate" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guestBook" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "guestBook" CASCADE;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chirp" ADD CONSTRAINT "chirp_chirpProfileId_profile_profileId_fk" FOREIGN KEY ("chirpProfileId") REFERENCES "public"."profile"("profileId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_profileUsername_unique" UNIQUE("profileUsername");