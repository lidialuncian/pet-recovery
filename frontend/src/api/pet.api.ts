import axiosClient from "./axiosClient";
import type { Pet, CreatePet, UpdatePet } from "../types/pet.types";

export async function createPet(pet: CreatePet): Promise<Pet> {
  const response = await axiosClient.post<Pet>("/pets", pet);
  return response.data;
}

export async function getPetsForOwner(): Promise<Pet[]> {
  const response = await axiosClient.get<Pet[]>("/pets");
  return response.data;
}

export async function getPet(id: string): Promise<Pet> {
  const response = await axiosClient.get<Pet>(`/pets/${id}`);
  return response.data;
}

export async function updatePet(id: string, pet: UpdatePet): Promise<Pet> {
  const response = await axiosClient.put<Pet>(`/pets/${id}`, pet);
  return response.data;
}

export async function deletePet(id: string): Promise<void> {
  await axiosClient.delete(`/pets/${id}`);
}

export async function uploadPetPhoto(petId: string, file: File): Promise<Pet> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosClient.post<Pet>(`/pets/${petId}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
