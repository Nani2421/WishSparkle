import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWishSchema, insertPhotoSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = randomUUID();
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  const fs = await import('fs');
  const uploadsDir = 'uploads';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Generate wish endpoint
  app.post("/api/wishes", async (req, res) => {
    try {
      const { name } = insertWishSchema.parse(req.body);
      
      const wishTemplates = [
        "May your days be filled with joy and your heart with endless happiness, {name}! ✨",
        "Wishing you magical moments and beautiful memories to cherish forever, dear {name}! 🌟",
        "May all your dreams sparkle and shine like the brightest stars, {name}! 🌙",
        "Sending you warm wishes for laughter, love, and countless celebrations, {name}! 🎉",
        "May your journey be painted with colors of joy and wonder, sweet {name}! 🎨",
        "Here's to a life filled with beautiful surprises and endless adventures, {name}! 🎪",
        "May your spirit dance with happiness and your heart sing with joy, {name}! 🎵",
        "Wishing you a kaleidoscope of wonderful moments and cherished memories, {name}! 🌈"
      ];
      
      const randomTemplate = wishTemplates[Math.floor(Math.random() * wishTemplates.length)];
      const message = randomTemplate.replace('{name}', name);
      
      const wish = await storage.createWish({ name, message });
      res.json(wish);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Get all wishes
  app.get("/api/wishes", async (req, res) => {
    try {
      const wishes = await storage.getAllWishes();
      res.json(wishes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishes" });
    }
  });

  // Upload photos endpoint
  app.post("/api/photos", upload.array('photos', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedPhotos = [];
      
      for (const file of req.files) {
        const photoData = {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size.toString()
        };

        const photo = await storage.createPhoto(photoData);
        uploadedPhotos.push({
          ...photo,
          url: `/uploads/${file.filename}`
        });
      }

      res.json(uploadedPhotos);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload photos" });
    }
  });

  // Get all photos
  app.get("/api/photos", async (req, res) => {
    try {
      const photos = await storage.getAllPhotos();
      const photosWithUrls = photos.map(photo => ({
        ...photo,
        url: `/uploads/${photo.filename}`
      }));
      res.json(photosWithUrls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Delete photo endpoint
  app.delete("/api/photos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePhoto(id);
      
      if (deleted) {
        res.json({ message: "Photo deleted successfully" });
      } else {
        res.status(404).json({ message: "Photo not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
