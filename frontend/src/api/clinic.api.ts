import axiosClient from "./axiosClient";
import type { Clinic, ClinicPet } from "../types/clinic.types";
import type { User } from "../types/user.types";
import type { Pet } from "../types/pet.types";

export async function getClinics(): Promise<Clinic[]> {
  const res = await axiosClient.get<Clinic[]>("/clinics");
  return res.data;
}

export async function getVetsAvailable(): Promise<User[]> {
  const res = await axiosClient.get<User[]>("/clinics/vets-available");
  return res.data;
}

export async function getPetsAvailable(): Promise<Pet[]> {
  const res = await axiosClient.get<Pet[]>("/clinics/pets-available");
  return res.data;
}

export async function addVetToClinic(clinicId: string, userId: string): Promise<void> {
  await axiosClient.post(`/clinics/${clinicId}/vets`, { user_id: userId });
}

export async function getClinicPets(clinicId: string): Promise<ClinicPet[]> {
  const res = await axiosClient.get<ClinicPet[]>(`/clinics/${clinicId}/pets`);
  return res.data;
}

export async function addPetToClinic(
  clinicId: string,
  petId: string,
  patientNumber?: string | null
): Promise<ClinicPet> {
  const res = await axiosClient.post<ClinicPet>(`/clinics/${clinicId}/pets`, {
    pet_id: petId,
    patient_number: patientNumber ?? null,
  });
  return res.data;
}
