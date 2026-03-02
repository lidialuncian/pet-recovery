/** Clinic record from DB */
export interface ClinicDto {
  id: string;
  name: string;
  contact_email: string | null;
  phone: string | null;
}

/** user_clinic_roles: links user to clinic with role */
export interface UserClinicRoleDto {
  id: string;
  user_id: string;
  clinic_id: string;
  role_in_clinic: "vet" | "admin";
  status: string;
}

/** clinic_pets: pet registered at a clinic */
export interface ClinicPetDto {
  id: string;
  clinic_id: string;
  pet_id: string;
  patient_number: string | null;
}

export interface AddVetToClinicDto {
  user_id: string;
}

export interface AddPetToClinicDto {
  pet_id: string;
  patient_number?: string | null;
}
