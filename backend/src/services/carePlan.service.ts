import { supabase } from "../lib/supabase";
import type { CarePlanDto, CreateCarePlanDto, UpdateCarePlanDto } from "../types/carePlan.dto";
import type {
  CarePlanTaskDto,
  CarePlanTaskEntryDto,
  CreateCarePlanTaskDto,
  CreateCarePlanTaskEntryDto,
  UpdateCarePlanTaskDto,
} from "../types/carePlanTask.dto";

export class CarePlanService {
  /** Vet must be in clinic (user_clinic_roles). Pet must be in clinic (clinic_pets). */
  async createPlan(vetUserId: string, dto: CreateCarePlanDto): Promise<CarePlanDto> {
    const { data: vetRole } = await supabase
      .from("user_clinic_roles")
      .select("id")
      .eq("user_id", vetUserId)
      .eq("clinic_id", dto.clinic_id)
      .eq("role_in_clinic", "vet")
      .eq("status", "active")
      .maybeSingle();
    if (!vetRole) throw new Error("Clinic not found or access denied");

    const { data: petAtClinic } = await supabase
      .from("clinic_pets")
      .select("id")
      .eq("clinic_id", dto.clinic_id)
      .eq("pet_id", dto.pet_id)
      .maybeSingle();
    if (!petAtClinic) throw new Error("Pet is not registered at this clinic");

    const { data, error } = await supabase
      .from("care_plans")
      .insert({
        pet_id: dto.pet_id,
        clinic_id: dto.clinic_id,
        assigned_vet_user_id: vetUserId,
        status: dto.status ?? "draft",
        start_date: dto.start_date ?? null,
        title: dto.title ?? null,
        description: dto.description ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating care plan:", error);
      throw new Error(error.message);
    }
    return data as CarePlanDto;
  }

  /** Plans for a clinic; caller must be vet in that clinic */
  async getPlansForClinic(clinicId: string, vetUserId: string): Promise<CarePlanDto[]> {
    const { data: vetRole } = await supabase
      .from("user_clinic_roles")
      .select("id")
      .eq("user_id", vetUserId)
      .eq("clinic_id", clinicId)
      .eq("role_in_clinic", "vet")
      .eq("status", "active")
      .maybeSingle();
    if (!vetRole) throw new Error("Clinic not found or access denied");

    const { data, error } = await supabase
      .from("care_plans")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Supabase error fetching care plans:", error);
      throw new Error(error.message);
    }
    return (data ?? []) as CarePlanDto[];
  }

  /** Single plan; vet must be in plan's clinic, or owner must own the pet */
  async getPlanById(
    planId: string,
    userId: string,
    role: "vet" | "owner"
  ): Promise<CarePlanDto | null> {
    const { data: plan, error: planError } = await supabase
      .from("care_plans")
      .select("*")
      .eq("id", planId)
      .single();
    if (planError || !plan) return null;
    const p = plan as CarePlanDto;

    if (role === "vet") {
      const { data: vetRole } = await supabase
        .from("user_clinic_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("clinic_id", p.clinic_id)
        .eq("role_in_clinic", "vet")
        .eq("status", "active")
        .maybeSingle();
      if (!vetRole) return null;
    } else {
      const { data: ownership } = await supabase
        .from("pet_owners")
        .select("id")
        .eq("pet_id", p.pet_id)
        .eq("owner_user_id", userId)
        .maybeSingle();
      if (!ownership) return null;
    }
    return p;
  }

  async getTasksForPlan(planId: string): Promise<CarePlanTaskDto[]> {
    const { data, error } = await supabase
      .from("care_plan_tasks")
      .select("*")
      .eq("care_plan_id", planId)
      .order("sort_order");
    if (error) {
      console.error("Supabase error fetching tasks:", error);
      throw new Error(error.message);
    }
    return (data ?? []) as CarePlanTaskDto[];
  }

  /** Add task to plan; vet must be assigned or in same clinic */
  async addTask(
    planId: string,
    dto: CreateCarePlanTaskDto,
    vetUserId: string
  ): Promise<CarePlanTaskDto> {
    const plan = await this.getPlanById(planId, vetUserId, "vet");
    if (!plan) throw new Error("Care plan not found or access denied");

    const { count } = await supabase
      .from("care_plan_tasks")
      .select("id", { count: "exact", head: true })
      .eq("care_plan_id", planId);
    const sortOrder = (count ?? 0) + 1;

    const { data, error } = await supabase
      .from("care_plan_tasks")
      .insert({
        care_plan_id: planId,
        task_type: dto.task_type,
        label: dto.label,
        is_required: dto.is_required ?? false,
        frequency: dto.frequency,
        sort_order: dto.sort_order ?? sortOrder,
        description: dto.description ?? null,
        schedule_time: dto.schedule_time ?? null,
        due_window_minutes: dto.due_window_minutes ?? null,
        value_schema: dto.value_schema ?? {},
        status: dto.status ?? "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding task:", error);
      throw new Error(error.message);
    }
    return data as CarePlanTaskDto;
  }

  /** Update task; vet must have access to the plan */
  async updateTask(
    planId: string,
    taskId: string,
    dto: UpdateCarePlanTaskDto,
    vetUserId: string
  ): Promise<CarePlanTaskDto> {
    const plan = await this.getPlanById(planId, vetUserId, "vet");
    if (!plan) throw new Error("Care plan not found or access denied");

    const updates: Record<string, unknown> = {};
    if (dto.task_type !== undefined) updates.task_type = dto.task_type;
    if (dto.label !== undefined) updates.label = dto.label;
    if (dto.is_required !== undefined) updates.is_required = dto.is_required;
    if (dto.frequency !== undefined) updates.frequency = dto.frequency;
    if (dto.sort_order !== undefined) updates.sort_order = dto.sort_order;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.schedule_time !== undefined) updates.schedule_time = dto.schedule_time;
    if (dto.due_window_minutes !== undefined) updates.due_window_minutes = dto.due_window_minutes;
    if (dto.value_schema !== undefined) updates.value_schema = dto.value_schema;
    if (dto.status !== undefined) updates.status = dto.status;

    if (Object.keys(updates).length === 0) {
      const { data: existing } = await supabase
        .from("care_plan_tasks")
        .select("*")
        .eq("id", taskId)
        .eq("care_plan_id", planId)
        .single();
      if (!existing) throw new Error("Task not found");
      return existing as CarePlanTaskDto;
    }

    const { data, error } = await supabase
      .from("care_plan_tasks")
      .update(updates)
      .eq("id", taskId)
      .eq("care_plan_id", planId)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating task:", error);
      throw new Error(error.message);
    }
    return data as CarePlanTaskDto;
  }

  /** Owner submits a task entry (e.g. daily check-in) */
  async submitTaskEntry(
    planId: string,
    taskId: string,
    ownerUserId: string,
    dto: CreateCarePlanTaskEntryDto
  ): Promise<CarePlanTaskEntryDto> {
    const plan = await this.getPlanById(planId, ownerUserId, "owner");
    if (!plan) throw new Error("Care plan not found or access denied");

    const { data: task } = await supabase
      .from("care_plan_tasks")
      .select("id")
      .eq("id", taskId)
      .eq("care_plan_id", planId)
      .maybeSingle();
    if (!task) throw new Error("Task not found");

    const { data, error } = await supabase
      .from("care_plan_task_entries")
      .insert({
        task_id: taskId,
        care_plan_id: planId,
        entered_by_user_id: ownerUserId,
        entered_by_role: "owner",
        value_json: dto.value_json,
        note: dto.note ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error submitting task entry:", error);
      throw new Error(error.message);
    }
    return data as CarePlanTaskEntryDto;
  }

  /** Entries for a task (e.g. to show history for a daily task) */
  async getEntriesForTask(taskId: string): Promise<CarePlanTaskEntryDto[]> {
    const { data, error } = await supabase
      .from("care_plan_task_entries")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase error fetching task entries:", error);
      throw new Error(error.message);
    }
    return (data ?? []) as CarePlanTaskEntryDto[];
  }

  /** Plans for owner's pets (pet_owners) */
  async getPlansForOwner(ownerUserId: string): Promise<CarePlanDto[]> {
    const { data: owned } = await supabase
      .from("pet_owners")
      .select("pet_id")
      .eq("owner_user_id", ownerUserId);
    if (!owned?.length) return [];
    const petIds = owned.map((r) => r.pet_id);

    const { data, error } = await supabase
      .from("care_plans")
      .select("*")
      .in("pet_id", petIds)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Supabase error fetching owner plans:", error);
      throw new Error(error.message);
    }
    return (data ?? []) as CarePlanDto[];
  }

  async updatePlan(planId: string, vetUserId: string, dto: UpdateCarePlanDto): Promise<CarePlanDto> {
    const plan = await this.getPlanById(planId, vetUserId, "vet");
    if (!plan) throw new Error("Care plan not found or access denied");

    const updates: Record<string, unknown> = {};
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.start_date !== undefined) updates.start_date = dto.start_date;
    if (dto.discharge_at !== undefined) updates.discharge_at = dto.discharge_at;
    if (dto.closed_at !== undefined) updates.closed_at = dto.closed_at;
    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.description !== undefined) updates.description = dto.description;

    const { data, error } = await supabase
      .from("care_plans")
      .update(updates)
      .eq("id", planId)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating care plan:", error);
      throw new Error(error.message);
    }
    return data as CarePlanDto;
  }
}
