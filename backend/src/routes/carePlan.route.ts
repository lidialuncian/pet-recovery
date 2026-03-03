import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireVet } from "../middleware/requireVet.middleware";
import { CarePlanService } from "../services/carePlan.service";
import * as assistantService from "../services/assistant.service";
import type { CreateCarePlanDto, UpdateCarePlanDto } from "../types/carePlan.dto";
import tasksRouter from "./carePlanTask.route";

const carePlanRouter = Router();
const carePlanService = new CarePlanService();
const vetOnly = [authenticateToken, requireVet];

// ---------- Vet routes ----------
carePlanRouter.get("/", ...vetOnly, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const clinicId = req.query.clinic_id as string;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (!clinicId) return res.status(400).json({ error: "clinic_id query is required" });
    const plans = await carePlanService.getPlansForClinic(clinicId, userId);
    res.status(200).json(plans);
  } catch (error: unknown) {
    console.error("Error fetching care plans:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch care plans";
    const status = message.includes("access denied") ? 403 : 500;
    res.status(status).json({ error: "Failed to fetch care plans", message });
  }
});

carePlanRouter.post("/", ...vetOnly, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const plan = await carePlanService.createPlan(userId, req.body as CreateCarePlanDto);
    res.status(201).json(plan);
  } catch (error: unknown) {
    console.error("Error creating care plan:", error);
    const message = error instanceof Error ? error.message : "Failed to create care plan";
    const status = message.includes("access denied") || message.includes("not registered") ? 403 : 500;
    res.status(status).json({ error: "Failed to create care plan", message });
  }
});

carePlanRouter.get("/my", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const plans = await carePlanService.getPlansForOwner(userId);
    res.status(200).json(plans);
  } catch (error: unknown) {
    console.error("Error fetching owner care plans:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch care plans";
    res.status(500).json({ error: "Failed to fetch care plans", message });
  }
});

carePlanRouter.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role as "vet" | "owner" | undefined;
    const planId = String(req.params.id);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (role !== "vet" && role !== "owner") return res.status(403).json({ error: "Access denied" });
    const plan = await carePlanService.getPlanById(planId, userId, role);
    if (!plan) return res.status(404).json({ error: "Care plan not found" });
    res.status(200).json(plan);
  } catch (error: unknown) {
    console.error("Error fetching care plan:", error);
    res.status(500).json({ error: "Failed to fetch care plan" });
  }
});

carePlanRouter.put("/:id", ...vetOnly, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const planId = String(req.params.id);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const plan = await carePlanService.updatePlan(planId, userId, req.body as UpdateCarePlanDto);
    res.status(200).json(plan);
  } catch (error: unknown) {
    console.error("Error updating care plan:", error);
    const message = error instanceof Error ? error.message : "Failed to update care plan";
    const status = message.includes("access denied") ? 403 : 500;
    res.status(status).json({ error: "Failed to update care plan", message });
  }
});

// ---------- Owner assistant (FIP info chat) ----------
carePlanRouter.get("/:id/assistant/messages", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role as string | undefined;
    const planId = String(req.params.id);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (role !== "owner") return res.status(403).json({ error: "Only the pet owner can view assistant messages" });
    const messages = await assistantService.getAssistantMessages(planId, userId);
    res.status(200).json(messages);
  } catch (error: unknown) {
    console.error("Error fetching assistant messages:", error);
    res.status(500).json({ error: "Failed to fetch assistant messages" });
  }
});

carePlanRouter.post("/:id/assistant/chat", authenticateToken, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role as string | undefined;
  const planId = String(req.params.id);
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!userId) return res.status(401).json({ error: "User not authenticated" });
  if (role !== "owner") return res.status(403).json({ error: "Only the pet owner can use the assistant" });
  if (!text) return res.status(400).json({ error: "Message text is required" });

  try {
    const result = await assistantService.chat(planId, userId, text);
    if (!result) return res.status(404).json({ error: "Care plan not found or access denied" });
    return res.status(200).json(result);
  } catch (error: unknown) {
    console.error("Error in assistant chat:", error);
    return res.status(200).json({
      assistantText:
        "The assistant is temporarily unavailable. Please try again in a moment or contact your clinic directly.",
    });
  }
});

carePlanRouter.use("/:id", tasksRouter);

export default carePlanRouter;