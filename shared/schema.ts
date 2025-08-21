import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const wishes = pgTable("wishes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: text("size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});

export const sharedLinks = pgTable("shared_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shareToken: varchar("share_token").notNull().unique(),
  name: text("name").notNull(),
  customMessage: text("custom_message"),
  generatedMessage: text("generated_message").notNull(),
  photoIds: text("photo_ids").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertWishSchema = createInsertSchema(wishes).pick({
  name: true,
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  filename: true,
  originalName: true,
  mimeType: true,
  size: true,
});

export const insertSharedLinkSchema = createInsertSchema(sharedLinks).pick({
  name: true,
  customMessage: true,
  photoIds: true,
}).extend({
  customMessage: z.string().optional(),
});

export type InsertWish = z.infer<typeof insertWishSchema>;
export type Wish = typeof wishes.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertSharedLink = z.infer<typeof insertSharedLinkSchema>;
export type SharedLink = typeof sharedLinks.$inferSelect;
