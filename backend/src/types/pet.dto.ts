export type CreatePetDto = {
  name: string;
  species: string;
  breed?: string;
  sex?: "male" | "female" | "unknown";
  date_of_birth?: string;
  weight_baseline?: number;
  profile_photo_path?: string;
};

/** Same fields as CreatePetDto; all optional for partial update. */
export type UpdatePetDto = Partial<CreatePetDto>;

export type PetDto = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  date_of_birth: string | null;
  weight_baseline: number | null;
  profile_photo_path: string | null;
  created_at?: string;
};
