import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireVet } from "../middleware/requireVet.middleware";
import { ClinicService } from "../services/clinic.service";

const vetRouter = Router();
const clinicService = new ClinicService();
const vetOnly = [authenticateToken, requireVet];

vetRouter.get("/clinics", ...vetOnly, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const clinics = await clinicService.getClinicsForVet(userId);
    res.status(200).json(clinics);
  } catch (error: unknown) {
    console.error("Error fetching vet clinics:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch clinics";
    res.status(500).json({ error: "Failed to fetch clinics", message });
  }
});

export default vetRouter;
