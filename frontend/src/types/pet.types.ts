export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  date_of_birth: string | null;
  weight_baseline: number | null;
  profile_photo_path?: string | null;
  profile_photo_url?: string | null;
  created_at?: string;
};

export type CreatePet = {
  name: string;
  species: string;
  breed?: string;
  sex?: "male" | "female" | "unknown";
  date_of_birth?: string;
  weight_baseline?: number;
};

export type UpdatePet = Partial<CreatePet>;
