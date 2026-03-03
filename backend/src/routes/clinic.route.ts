import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/requireAdmin.middleware";
import { ClinicService } from "../services/clinic.service";
import type { AddVetToClinicDto, AddPetToClinicDto } from "../types/clinic.dto";

const clinicRouter = Router();
const clinicService = new ClinicService();

const adminOnly = [authenticateToken, requireAdmin];

clinicRouter.get("/", ...adminOnly, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const clinics = await clinicService.getClinicsForAdmin(userId);
    res.status(200).json(clinics);
  } catch (error: unknown) {
    console.error("Error fetching clinics:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch clinics";
    res.status(500).json({ error: "Failed to fetch clinics", message });
  }
});

clinicRouter.get("/vets-available", ...adminOnly, async (_req: Request, res: Response) => {
  try {
    const vets = await clinicService.getVetUsers();
    res.status(200).json(vets);
  } catch (error: unknown) {
    console.error("Error fetching vet users:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch vets";
    res.status(500).json({ error: "Failed to fetch vets", message });
  }
});

clinicRouter.get("/pets-available", ...adminOnly, async (_req: Request, res: Response) => {
  try {
    const pets = await clinicService.getAllPets();
    res.status(200).json(pets);
  } catch (error: unknown) {
    console.error("Error fetching pets:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch pets";
    res.status(500).json({ error: "Failed to fetch pets", message });
  }
});

clinicRouter.post("/:id/vets", ...adminOnly, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const clinicId = String(req.params.id);
    const { user_id } = req.body as AddVetToClinicDto;
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }
    await clinicService.addVetToClinic(clinicId, user_id, userId);
    res.status(201).json({ success: true });
  } catch (error: unknown) {
    console.error("Error adding vet to clinic:", error);
    const message = error instanceof Error ? error.message : "Failed to add vet to clinic";
    const status = message.includes("already linked") ? 409 : message.includes("access denied") ? 403 : 500;
    res.status(status).json({ error: "Failed to add vet to clinic", message });
  }
});

/** List pets in clinic with pet details. Allowed for admin or vet of that clinic. */
clinicRouter.get("/:id/pets", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const clinicId = String(req.params.id);
    const withDetails = req.query.details === "true" || req.query.details === "1";
    const data = withDetails
      ? await clinicService.getPetsInClinicWithDetails(clinicId, userId)
      : await clinicService.getPetsInClinic(clinicId, userId);
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error("Error fetching clinic pets:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch clinic pets";
    const status = message.includes("access denied") ? 403 : 500;
    res.status(status).json({ error: "Failed to fetch clinic pets", message });
  }
});

clinicRouter.post("/:id/pets", ...adminOnly, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const clinicId = String(req.params.id);
    const { pet_id, patient_number } = req.body as AddPetToClinicDto;
    if (!pet_id) {
      return res.status(400).json({ error: "pet_id is required" });
    }
    const result = await clinicService.addPetToClinic(clinicId, pet_id, userId, patient_number);
    res.status(201).json(result);
  } catch (error: unknown) {
    console.error("Error adding pet to clinic:", error);
    const message = error instanceof Error ? error.message : "Failed to add pet to clinic";
    const status = message.includes("already registered") ? 409 : message.includes("access denied") ? 403 : 500;
    res.status(status).json({ error: "Failed to add pet to clinic", message });
  }
});

export default clinicRouter;
