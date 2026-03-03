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

/** Type-specific data stored in value_schema */
export type MedicationSchema = {
  instructions?: string;
  name?: string;
  dose?: string;
  unit?: string;
  route?: string;
};
export type VitalSchema = { value_type?: "number" | "text"; unit?: string };
export type MeasurementSchema = { value_type?: "number" | "text"; unit?: string };
export type SymptomCheckSchema = { fields?: string[] };
export type CarePlanTaskFrequency = "daily" | "weekly" | "once" | "as_needed";
export type CarePlanTaskStatus = "active" | "inactive";

export type CarePlanTask = {
  id: string;
  care_plan_id: string;
  task_type: CarePlanTaskType;
  label: string;
  is_required: boolean;
  frequency: CarePlanTaskFrequency;
  sort_order: number;
  description?: string | null;
  schedule_time?: string | null;
  due_window_minutes?: number | null;
  value_schema?: Record<string, unknown> | null;
  status?: CarePlanTaskStatus;
};

export type CreateCarePlanTask = {
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
};

export type UpdateCarePlanTask = Partial<
  Pick<
    CarePlanTask,
    | "task_type"
    | "label"
    | "is_required"
    | "frequency"
    | "sort_order"
    | "description"
    | "schedule_time"
    | "due_window_minutes"
    | "value_schema"
    | "status"
  >
>;

export type CarePlanTaskEntry = {
  id: string;
  task_id: string;
  care_plan_id: string;
  entered_by_user_id: string;
  entered_by_role: string;
  value_json: unknown;
  note: string | null;
  created_at: string;
};

export type CreateCarePlanTaskEntry = {
  value_json: unknown;
  note?: string | null;
};
