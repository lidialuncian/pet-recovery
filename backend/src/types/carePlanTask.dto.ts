export type CarePlanTaskType =
  | "boolean"
  | "number"
  | "scale"
  | "text"
  | "photo"
  | "medication"
  | "vital"
  | "measurement"
  | "symptom_check";
export type CarePlanTaskFrequency = "daily" | "weekly" | "once" | "as_needed";
export type CarePlanTaskStatus = "active" | "inactive";

export interface CarePlanTaskDto {
  id: string;
  care_plan_id: string;
  task_type: CarePlanTaskType;
  label: string;
  is_required: boolean;
  frequency: CarePlanTaskFrequency;
  sort_order: number;
  description: string | null;
  schedule_time: string | null;
  due_window_minutes: number | null;
  value_schema: Record<string, unknown> | null;
  status: CarePlanTaskStatus;
}

export interface CreateCarePlanTaskDto {
  task_type: CarePlanTaskType;
  label: string;
  is_required?: boolean;
  frequency: CarePlanTaskFrequency;
  sort_order?: number;
  description?: string | null;
  schedule_time?: string | null;
  due_window_minutes?: number | null;
  value_schema?: Record<string, unknown> | null;
  status?: CarePlanTaskStatus;
}

export interface UpdateCarePlanTaskDto {
  task_type?: CarePlanTaskType;
  label?: string;
  is_required?: boolean;
  frequency?: CarePlanTaskFrequency;
  sort_order?: number;
  description?: string | null;
  schedule_time?: string | null;
  due_window_minutes?: number | null;
  value_schema?: Record<string, unknown> | null;
  status?: CarePlanTaskStatus;
}

export interface CarePlanTaskEntryDto {
  id: string;
  task_id: string;
  care_plan_id: string;
  entered_by_user_id: string;
  entered_by_role: string;
  value_json: unknown;
  note: string | null;
  created_at: string;
}

export interface CreateCarePlanTaskEntryDto {
  value_json: unknown;
  note?: string | null;
}
