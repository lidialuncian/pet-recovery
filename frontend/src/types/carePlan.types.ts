export type CarePlanStatus = "draft" | "in_clinic" | "at_home" | "follow_up" | "closed";

export type CarePlan = {
  id: string;
  pet_id: string;
  clinic_id: string;
  assigned_vet_user_id: string;
  status: CarePlanStatus;
  start_date: string | null;
  discharge_at: string | null;
  closed_at: string | null;
  title: string | null;
  description: string | null;
};

export type CreateCarePlan = {
  pet_id: string;
  clinic_id: string;
  status?: CarePlanStatus;
  start_date?: string | null;
  title?: string | null;
  description?: string | null;
};

export type UpdateCarePlan = Partial<Pick<CarePlan, "status" | "start_date" | "discharge_at" | "closed_at" | "title" | "description">>;
