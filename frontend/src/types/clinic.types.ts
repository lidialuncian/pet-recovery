export type Clinic = {
  id: string;
  name: string;
  contact_email: string | null;
  phone: string | null;
};

export type ClinicPet = {
  id: string;
  clinic_id: string;
  pet_id: string;
  patient_number: string | null;
};
