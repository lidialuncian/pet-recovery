import axiosClient from "./axiosClient";
import type {
  CarePlanTask,
  CarePlanTaskEntry,
  CreateCarePlanTask,
  CreateCarePlanTaskEntry,
  UpdateCarePlanTask,
} from "../types/carePlanTask.types";

export async function getPlanTasks(planId: string): Promise<CarePlanTask[]> {
  const res = await axiosClient.get<CarePlanTask[]>(`/care-plans/${planId}/tasks`);
  return res.data;
}

export async function addPlanTask(planId: string, data: CreateCarePlanTask): Promise<CarePlanTask> {
  const res = await axiosClient.post<CarePlanTask>(`/care-plans/${planId}/tasks`, data);
  return res.data;
}

export async function updatePlanTask(
  planId: string,
  taskId: string,
  data: UpdateCarePlanTask
): Promise<CarePlanTask> {
  const res = await axiosClient.put<CarePlanTask>(
    `/care-plans/${planId}/tasks/${taskId}`,
    data
  );
  return res.data;
}

export async function getTaskEntries(planId: string, taskId: string): Promise<CarePlanTaskEntry[]> {
  const res = await axiosClient.get<CarePlanTaskEntry[]>(
    `/care-plans/${planId}/tasks/${taskId}/entries`
  );
  return res.data;
}

export async function submitTaskEntry(
  planId: string,
  taskId: string,
  data: CreateCarePlanTaskEntry
): Promise<CarePlanTaskEntry> {
  const res = await axiosClient.post<CarePlanTaskEntry>(
    `/care-plans/${planId}/tasks/${taskId}/entries`,
    data
  );
  return res.data;
}
