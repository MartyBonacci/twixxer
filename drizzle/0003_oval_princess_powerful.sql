ALTER TABLE "guestBook" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "guestBook" CASCADE;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_profileUsername_unique" UNIQUE("profileUsername");