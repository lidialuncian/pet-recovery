import { supabase } from "../lib/supabase";
import type { ClinicDto, UserClinicRoleDto, ClinicPetDto } from "../types/clinic.dto";
import type { UserDto } from "../types/user.dto";
import type { PetDto } from "../types/pet.dto";

export class ClinicService {
  /** Clinics where the given user has vet role in user_clinic_roles */
  async getClinicsForVet(vetUserId: string): Promise<ClinicDto[]> {
    const { data: roles, error: rolesError } = await supabase
      .from("user_clinic_roles")
      .select("clinic_id")
      .eq("user_id", vetUserId)
      .eq("role_in_clinic", "vet")
      .eq("status", "active");

    if (rolesError || !roles?.length) return [];
    const clinicIds = roles.map((r) => r.clinic_id);

    const { data: clinics, error } = await supabase
      .from("clinics")
      .select("*")
      .in("id", clinicIds)
      .order("name");

    if (error) {
      console.error("Supabase error fetching clinics for vet:", error);
      throw new Error(error.message);
    }
    return (clinics ?? []) as ClinicDto[];
  }

  /** Clinics where the given user has admin role in user_clinic_roles */
  async getClinicsForAdmin(adminUserId: string): Promise<ClinicDto[]> {
    const { data: roles, error: rolesError } = await supabase
      .from("user_clinic_roles")
      .select("clinic_id")
      .eq("user_id", adminUserId)
      .eq("role_in_clinic", "admin")
      .eq("status", "active");

    if (rolesError || !roles?.length) return [];
    const clinicIds = roles.map((r) => r.clinic_id);

    const { data: clinics, error } = await supabase
      .from("clinics")
      .select("*")
      .in("id", clinicIds)
      .order("name");

    if (error) {
      console.error("Supabase error fetching clinics:", error);
      throw new Error(error.message);
    }
    return (clinics ?? []) as ClinicDto[];
  }

  /** Check if user is vet at the given clinic */
  async isVetAtClinic(userId: string, clinicId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("user_clinic_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("clinic_id", clinicId)
      .eq("role_in_clinic", "vet")
      .eq("status", "active")
      .maybeSingle();
    if (error) return false;
    return !!data;
  }

  /** Check if user is admin of the given clinic */
  private async isAdminOfClinic(userId: string, clinicId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("user_clinic_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("clinic_id", clinicId)
      .eq("role_in_clinic", "admin")
      .eq("status", "active")
      .maybeSingle();
    if (error) return false;
    return !!data;
  }

  /** List users with role=vet (for admin to add to clinic) */
  async getVetUsers(): Promise<UserDto[]> {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, created_at")
      .eq("role", "vet")
      .order("last_name");

    if (error) {
      console.error("Supabase error fetching vet users:", error);
      throw new Error(error.message);
    }
    return (data ?? []) as UserDto[];
  }

  /** Add a vet user to a clinic (create user_clinic_roles row). Caller must be admin of clinic. */
  async addVetToClinic(clinicId: string, vetUserId: string, adminUserId: string): Promise<UserClinicRoleDto> {
    const isAdmin = await this.isAdminOfClinic(adminUserId, clinicId);
    if (!isAdmin) throw new Error("Clinic not found or access denied");

    const { data: existing } = await supabase
      .from("user_clinic_roles")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("user_id", vetUserId)
      .maybeSingle();
    if (existing) throw new Error("This vet is already linked to the clinic");

    const { data, error } = await supabase
      .from("user_clinic_roles")
      .insert({
        user_id: vetUserId,
        clinic_id: clinicId,
        role_in_clinic: "vet",
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding vet to clinic:", error);
      throw new Error(error.message);
    }
    return data as UserClinicRoleDto;
  }

  /** List pets registered at a clinic (clinic_pets). Caller must be admin or vet of clinic. */
  async getPetsInClinic(clinicId: string, adminUserId: string): Promise<ClinicPetDto[]> {
    const isAdmin = await this.isAdminOfClinic(adminUserId, clinicId);
    const isVet = await this.isVetAtClinic(adminUserId, clinicId);
    if (!isAdmin && !isVet) throw new Error("Clinic not found or access denied");

    const { data, error } = await supabase
      .from("clinic_pets")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("patient_number");

    if (error) {
      console.error("Supabase error fetching clinic pets:", error);
      throw new Error(error.message);
    }
    return (data ?? []) as ClinicPetDto[];
  }

  /** List clinic pets with pet details (name, species, etc.) for vet/admin UI */
  async getPetsInClinicWithDetails(clinicId: string, userId: string): Promise<(ClinicPetDto & { pet: PetDto })[]> {
    const rows = await this.getPetsInClinic(clinicId, userId);
    if (!rows.length) return [];
    const petIds = rows.map((r) => r.pet_id);
    const { data: pets, error } = await supabase.from("pets").select("*").in("id", petIds);
    if (error || !pets?.length) return rows.map((r) => ({ ...r, pet: {} as PetDto }));
    const petMap = new Map((pets as PetDto[]).map((p) => [p.id, p]));
    return rows.map((r) => ({ ...r, pet: petMap.get(r.pet_id) ?? ({} as PetDto) }));
  }

  /** Add a pet to a clinic. Caller must be admin of clinic. */
  async addPetToClinic(
    clinicId: string,
    petId: string,
    adminUserId: string,
    patientNumber?: string | null
  ): Promise<ClinicPetDto> {
    const isAdmin = await this.isAdminOfClinic(adminUserId, clinicId);
    if (!isAdmin) throw new Error("Clinic not found or access denied");

    const { data: existing } = await supabase
      .from("clinic_pets")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("pet_id", petId)
      .maybeSingle();
    if (existing) throw new Error("This pet is already registered at the clinic");

    const { data, error } = await supabase
      .from("clinic_pets")
      .insert({
        clinic_id: clinicId,
        pet_id: petId,
        patient_number: patientNumber ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding pet to clinic:", error);
      throw new Error(error.message);
    }
    return data as ClinicPetDto;
  }

  /** List all pets (for admin dropdown when adding pet to clinic) */
  async getAllPets(): Promise<PetDto[]> {
    const { data, error } = await supabase.from("pets").select("*").order("name");
    if (error) {
      console.error("Supabase error fetching all pets:", error);
      throw new Error(error.message);
    }
    return (data ?? []) as PetDto[];
  }
}
