import { supabase } from "../lib/supabase";
import type { CreatePetDto, PetDto, UpdatePetDto } from "../types/pet.dto";

export class PetService {
  private async isOwner(petId: string, ownerUserId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("pet_owners")
      .select("pet_id")
      .eq("pet_id", petId)
      .eq("owner_user_id", ownerUserId)
      .maybeSingle();
    if (error) return false;
    return !!data;
  }

  async getPetById(petId: string, ownerUserId: string): Promise<PetDto | null> {
    const owned = await this.isOwner(petId, ownerUserId);
    if (!owned) return null;
    const { data, error } = await supabase.from("pets").select("*").eq("id", petId).single();
    if (error || !data) return null;
    return data as PetDto;
  }

  async updatePet(petId: string, ownerUserId: string, dto: UpdatePetDto): Promise<PetDto> {
    const owned = await this.isOwner(petId, ownerUserId);
    if (!owned) throw new Error("Pet not found or access denied");
    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.species !== undefined) updates.species = dto.species;
    if (dto.breed !== undefined) updates.breed = dto.breed ?? null;
    if (dto.sex !== undefined) updates.sex = dto.sex ?? null;
    if (dto.date_of_birth !== undefined) updates.date_of_birth = dto.date_of_birth ?? null;
    if (dto.weight_baseline !== undefined) updates.weight_baseline = dto.weight_baseline ?? null;
    if (dto.profile_photo_path !== undefined) updates.profile_photo_path = dto.profile_photo_path ?? null;
    const { data, error } = await supabase
      .from("pets")
      .update(updates)
      .eq("id", petId)
      .select()
      .single();
    if (error || !data) {
      console.error("Supabase error updating pet:", error);
      throw new Error(error?.message ?? "Failed to update pet");
    }
    return data as PetDto;
  }

  async createPet(ownerUserId: string, dto: CreatePetDto): Promise<PetDto> {
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .insert({
        name: dto.name,
        species: dto.species,
        breed: dto.breed ?? null,
        sex: dto.sex ?? null,
        date_of_birth: dto.date_of_birth ?? null,
        weight_baseline: dto.weight_baseline ?? null,
        profile_photo_path: dto.profile_photo_path ?? null,
      })
      .select()
      .single();

    if (petError || !pet) {
      console.error("Supabase error creating pet:", petError);
      throw new Error(petError?.message ?? "Failed to create pet");
    }

    const { error: linkError } = await supabase.from("pet_owners").insert({
      pet_id: pet.id,
      owner_user_id: ownerUserId,
      is_primary: true,
    });

    if (linkError) {
      console.error("Supabase error linking pet to owner:", linkError);
      throw new Error(linkError.message);
    }

    return pet as PetDto;
  }

  async getPetsForOwner(ownerUserId: string): Promise<PetDto[]> {
    const { data: rows, error } = await supabase
      .from("pet_owners")
      .select("pet_id")
      .eq("owner_user_id", ownerUserId);

    if (error) {
      console.error("Supabase error fetching pet_owners:", error);
      throw new Error(error.message);
    }

    if (!rows?.length) return [];

    const petIds = rows.map((r) => r.pet_id);
    const { data: pets, error: petsError } = await supabase
      .from("pets")
      .select("*")
      .in("id", petIds)
      .order("id", { ascending: false });

    if (petsError) {
      console.error("Supabase error fetching pets:", petsError);
      throw new Error(petsError.message);
    }

    return (pets ?? []) as PetDto[];
  }

  async deletePet(petId: string, ownerUserId: string): Promise<void> {
    const owned = await this.isOwner(petId, ownerUserId);
    if (!owned) throw new Error("Pet not found or access denied");
    const { error: linkError } = await supabase.from("pet_owners").delete().eq("pet_id", petId).eq("owner_user_id", ownerUserId);
    if (linkError) {
      console.error("Supabase error deleting pet_owners:", linkError);
      throw new Error(linkError.message);
    }
    const { error: petError } = await supabase.from("pets").delete().eq("id", petId);
    if (petError) {
      console.error("Supabase error deleting pet:", petError);
      throw new Error(petError.message);
    }
  }

  /** Upload profile photo to bucket pet-photos at pets/<petId>/profile.<ext>, update pet.profile_photo_path */
  async uploadProfilePhoto(
    petId: string,
    ownerUserId: string,
    file: Express.Multer.File
  ): Promise<PetDto> {
    const owned = await this.isOwner(petId, ownerUserId);
    if (!owned) throw new Error("Pet not found or access denied");
    const ext = file.originalname?.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
    const storagePath = `pets/${petId}/profile.${safeExt}`;
    const { error: uploadError } = await supabase.storage
      .from("pet-photos")
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype || `image/${safeExt}`,
        upsert: true,
      });
    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      throw new Error(uploadError.message || "Failed to upload photo");
    }
    const updated = await this.updatePet(petId, ownerUserId, { profile_photo_path: storagePath });
    return updated;
  }
}
