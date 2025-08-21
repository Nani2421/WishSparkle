import { type Wish, type InsertWish, type Photo, type InsertPhoto } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createWish(wish: { name: string; message: string }): Promise<Wish>;
  getAllWishes(): Promise<Wish[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  getAllPhotos(): Promise<Photo[]>;
  deletePhoto(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private wishes: Map<string, Wish>;
  private photos: Map<string, Photo>;

  constructor() {
    this.wishes = new Map();
    this.photos = new Map();
  }

  async createWish(insertWish: { name: string; message: string }): Promise<Wish> {
    const id = randomUUID();
    const wish: Wish = { 
      ...insertWish, 
      id,
      createdAt: new Date()
    };
    this.wishes.set(id, wish);
    return wish;
  }

  async getAllWishes(): Promise<Wish[]> {
    return Array.from(this.wishes.values()).sort(
      (a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = randomUUID();
    const photo: Photo = {
      ...insertPhoto,
      id,
      uploadedAt: new Date()
    };
    this.photos.set(id, photo);
    return photo;
  }

  async getAllPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values()).sort(
      (a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime()
    );
  }

  async deletePhoto(id: string): Promise<boolean> {
    return this.photos.delete(id);
  }
}

export const storage = new MemStorage();
