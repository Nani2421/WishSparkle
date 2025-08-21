import { type Wish, type InsertWish, type Photo, type InsertPhoto, type SharedLink, type InsertSharedLink } from "@shared/schema";
import { db } from "./db";
import { eq, inArray } from "drizzle-orm";
import { photos, wishes, sharedLinks } from "@shared/schema";

export interface IStorage {
  createWish(wish: { name: string; message: string }): Promise<Wish>;
  getAllWishes(): Promise<Wish[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  getAllPhotos(): Promise<Photo[]>;
  getPhotosBySession(sessionId: string): Promise<Photo[]>;
  getPhotosByIds(ids: string[]): Promise<Photo[]>;
  deletePhoto(id: string): Promise<boolean>;
  clearSessionPhotos(sessionId: string): Promise<boolean>;
  createSharedLink(link: InsertSharedLink & { shareToken: string; generatedMessage: string }): Promise<SharedLink>;
  getSharedLink(shareToken: string): Promise<SharedLink | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createWish(insertWish: { name: string; message: string }): Promise<Wish> {
    const [wish] = await db
      .insert(wishes)
      .values(insertWish)
      .returning();
    return wish;
  }

  async getAllWishes(): Promise<Wish[]> {
    return await db.select().from(wishes).orderBy(wishes.createdAt);
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const [photo] = await db
      .insert(photos)
      .values(insertPhoto)
      .returning();
    return photo;
  }

  async getAllPhotos(): Promise<Photo[]> {
    return await db.select().from(photos).orderBy(photos.uploadedAt);
  }

  async getPhotosBySession(sessionId: string): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.sessionId, sessionId)).orderBy(photos.uploadedAt);
  }

  async getPhotosByIds(ids: string[]): Promise<Photo[]> {
    if (ids.length === 0) return [];
    return await db.select().from(photos).where(inArray(photos.id, ids));
  }

  async deletePhoto(id: string): Promise<boolean> {
    const result = await db.delete(photos).where(eq(photos.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async clearSessionPhotos(sessionId: string): Promise<boolean> {
    const result = await db.delete(photos).where(eq(photos.sessionId, sessionId));
    return (result.rowCount ?? 0) >= 0; // Return true even if 0 photos were deleted
  }

  async createSharedLink(link: InsertSharedLink & { shareToken: string; generatedMessage: string }): Promise<SharedLink> {
    const [sharedLink] = await db
      .insert(sharedLinks)
      .values(link)
      .returning();
    return sharedLink;
  }

  async getSharedLink(shareToken: string): Promise<SharedLink | undefined> {
    const [sharedLink] = await db
      .select()
      .from(sharedLinks)
      .where(eq(sharedLinks.shareToken, shareToken));
    return sharedLink || undefined;
  }
}

export const storage = new DatabaseStorage();
