import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireVet } from "../middleware/requireVet.middleware";
import { CarePlanService } from "../services/carePlan.service";
import type {
  CreateCarePlanTaskDto,
  CreateCarePlanTaskEntryDto,
  UpdateCarePlanTaskDto,
} from "../types/carePlanTask.dto";

const tasksRouter = Router({ mergeParams: true });
const carePlanService = new CarePlanService();
const vetOnly = [authenticateToken, requireVet];

tasksRouter.get("/tasks", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role as "vet" | "owner" | undefined;
    const planId = String(req.params.id);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const plan = await carePlanService.getPlanById(planId, userId, role === "vet" ? "vet" : "owner");
    if (!plan) return res.status(404).json({ error: "Care plan not found" });
    const tasks = await carePlanService.getTasksForPlan(planId);
    res.status(200).json(tasks);
  } catch (error: unknown) {
    console.error("Error fetching plan tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

tasksRouter.post("/tasks", ...vetOnly, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const planId = String(req.params.id);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const task = await carePlanService.addTask(planId, req.body as CreateCarePlanTaskDto, userId);
    res.status(201).json(task);
  } catch (error: unknown) {
    console.error("Error adding task:", error);
    const message = error instanceof Error ? error.message : "Failed to add task";
    const status = message.includes("access denied") ? 403 : 500;
    res.status(status).json({ error: "Failed to add task", message });
  }
});

tasksRouter.put("/tasks/:taskId", ...vetOnly, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const planId = String(req.params.id);
    const taskId = String(req.params.taskId);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const task = await carePlanService.updateTask(
      planId,
      taskId,
      req.body as UpdateCarePlanTaskDto,
      userId
    );
    res.status(200).json(task);
  } catch (error: unknown) {
    console.error("Error updating task:", error);
    const message = error instanceof Error ? error.message : "Failed to update task";
    const status = message.includes("access denied") || message.includes("not found") ? 403 : 500;
    res.status(status).json({ error: "Failed to update task", message });
  }
});

tasksRouter.get("/tasks/:taskId/entries", authenticateToken, async (req: Request, res: Response) => {
  try {
    const taskId = String(req.params.taskId);
    const entries = await carePlanService.getEntriesForTask(taskId);
    res.status(200).json(entries);
  } catch (error: unknown) {
    console.error("Error fetching task entries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

tasksRouter.post("/tasks/:taskId/entries", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const planId = String(req.params.id);
    const taskId = String(req.params.taskId);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const entry = await carePlanService.submitTaskEntry(
      planId,
      taskId,
      userId,
      req.body as CreateCarePlanTaskEntryDto
    );
    res.status(201).json(entry);
  } catch (error: unknown) {
    console.error("Error submitting task entry:", error);
    const message = error instanceof Error ? error.message : "Failed to submit entry";
    const status = message.includes("access denied") ? 403 : 500;
    res.status(status).json({ error: "Failed to submit entry", message });
  }
});

export default tasksRouter;
