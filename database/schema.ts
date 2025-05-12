import {char, pgTable, uuid, varchar, boolean, timestamp, text} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

export const profileTable = pgTable("profile", {
  profileId: uuid().primaryKey(),
  profileAbout: varchar({ length: 255 }),
  profileActivationToken: char({length:32}),
  profileEmail: varchar({ length: 255 }).notNull().unique(),
  profileImageUrl: varchar({ length: 255 }),
  profileUsername: varchar({ length: 127 }).notNull().unique(),
  profilePasswordHash: varchar({ length: 255 }).notNull(),
  profileVerified: boolean().notNull().default(false),
  profileTokenExpiry: timestamp({ mode: 'date' }),
});

export const chirpTable = pgTable("chirp", {
  chirpId: uuid().primaryKey(),
  chirpProfileId: uuid().notNull().references(() => profileTable.profileId),
  chirpContent: text().notNull(),
  chirpDate: timestamp({ mode: 'date' }).notNull().defaultNow(),
});

export const profileRelations = relations(profileTable, ({ many }) => ({
  chirps: many(chirpTable),
}));

export const chirpRelations = relations(chirpTable, ({ one }) => ({
  profile: one(profileTable, {
    fields: [chirpTable.chirpProfileId],
    references: [profileTable.profileId],
  }),
}));
