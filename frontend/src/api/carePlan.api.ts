import axiosClient from "./axiosClient";
import type { CarePlan, CreateCarePlan, UpdateCarePlan } from "../types/carePlan.types";

export async function getMyCarePlans(): Promise<CarePlan[]> {
  const res = await axiosClient.get<CarePlan[]>("/care-plans/my");
  return res.data;
}

export async function getCarePlansForClinic(clinicId: string): Promise<CarePlan[]> {
  const res = await axiosClient.get<CarePlan[]>(`/care-plans?clinic_id=${encodeURIComponent(clinicId)}`);
  return res.data;
}

export async function getCarePlan(id: string): Promise<CarePlan> {
  const res = await axiosClient.get<CarePlan>(`/care-plans/${id}`);
  return res.data;
}

export async function createCarePlan(data: CreateCarePlan): Promise<CarePlan> {
  const res = await axiosClient.post<CarePlan>("/care-plans", data);
  return res.data;
}

export async function updateCarePlan(id: string, data: UpdateCarePlan): Promise<CarePlan> {
  const res = await axiosClient.put<CarePlan>(`/care-plans/${id}`, data);
  return res.data;
}
