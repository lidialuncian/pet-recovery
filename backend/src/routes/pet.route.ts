import multer from "multer";
import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { PetService } from "../services/pet.service";
import { supabase } from "../lib/supabase";
import type { CreatePetDto, PetDto, UpdatePetDto } from "../types/pet.dto";

const PET_PHOTOS_BUCKET = "pet-photos";
const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1 hour

async function getPetProfilePhotoUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(PET_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);
  if (error) {
    console.error("Supabase signed URL error:", error);
    return null;
  }
  return data?.signedUrl ?? null;
}

async function withPhotoUrl(pet: PetDto): Promise<PetDto & { profile_photo_url: string | null }> {
  const url = await getPetProfilePhotoUrl(pet.profile_photo_path);
  return { ...pet, profile_photo_url: url };
}

const petRouter = Router();
const petService = new PetService();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    cb(null, allowed);
  },
});

petRouter.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const pet = await petService.createPet(userId, req.body as CreatePetDto);
    res.status(201).json(await withPhotoUrl(pet));
  } catch (error: unknown) {
    console.error("Error creating pet:", error);
    const message = error instanceof Error ? error.message : "Failed to create pet";
    res.status(500).json({ error: "Failed to create pet", message });
  }
});

petRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const pets = await petService.getPetsForOwner(userId);
    res.status(200).json(await Promise.all(pets.map(withPhotoUrl)));
  } catch (error: unknown) {
    console.error("Error fetching pets:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch pets";
    res.status(500).json({ error: "Failed to fetch pets", message });
  }
});

petRouter.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const pet = await petService.getPetById(String(req.params.id), userId);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    res.status(200).json(await withPhotoUrl(pet));
  } catch (error: unknown) {
    console.error("Error fetching pet:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch pet";
    res.status(500).json({ error: "Failed to fetch pet", message });
  }
});

petRouter.put("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const pet = await petService.updatePet(String(req.params.id), userId, req.body as UpdatePetDto);
    res.status(200).json(await withPhotoUrl(pet));
  } catch (error: unknown) {
    console.error("Error updating pet:", error);
    const message = error instanceof Error ? error.message : "Failed to update pet";
    const status = message.includes("not found") || message.includes("access denied") ? 404 : 500;
    res.status(status).json({ error: "Failed to update pet", message });
  }
});

petRouter.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    await petService.deletePet(String(req.params.id), userId);
    res.status(204).send();
  } catch (error: unknown) {
    console.error("Error deleting pet:", error);
    const message = error instanceof Error ? error.message : "Failed to delete pet";
    const status = message.includes("not found") || message.includes("access denied") ? 404 : 500;
    res.status(status).json({ error: "Failed to delete pet", message });
  }
});

petRouter.post(
  "/:id/photo",
  authenticateToken,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded", message: "Send a file in the 'file' field." });
      }
      const pet = await petService.uploadProfilePhoto(String(req.params.id), userId, req.file);
      res.status(200).json(await withPhotoUrl(pet));
    } catch (error: unknown) {
      console.error("Error uploading pet photo:", error);
      const message = error instanceof Error ? error.message : "Failed to upload photo";
      const status = message.includes("not found") || message.includes("access denied") ? 404 : 500;
      res.status(status).json({ error: "Failed to upload photo", message });
    }
  }
);

export default petRouter;
