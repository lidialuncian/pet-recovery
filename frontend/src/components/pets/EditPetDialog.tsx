import { useState, useEffect, type FormEvent } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Close from "@mui/icons-material/Close";
import type { Pet, UpdatePet } from "../../types/pet.types";
import { uploadPetPhoto } from "../../api/pet.api";
import PetForm, { type PetFormValues } from "./PetForm";

type EditPetDialogProps = {
  open: boolean;
  pet: Pet | null;
  onClose: () => void;
  onSaved: () => void;
  onUpdate: (id: string, data: UpdatePet) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function petToFormValues(pet: Pet): PetFormValues {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? "",
    dateOfBirth: pet.date_of_birth ?? "",
    sex: (pet.sex as "male" | "female" | "unknown") || "unknown",
    weight: pet.weight_baseline != null ? String(pet.weight_baseline) : "",
  };
}

export default function EditPetDialog({ open, pet, onClose, onSaved, onUpdate, onDelete }: EditPetDialogProps) {
  const [values, setValues] = useState<PetFormValues>({
    name: "",
    species: "",
    breed: "",
    dateOfBirth: "",
    sex: "unknown",
    weight: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayPet, setDisplayPet] = useState<Pet | null>(null);

  useEffect(() => {
    if (open && pet) {
      setDisplayPet(pet);
      setValues(petToFormValues(pet));
      setError(null);
    }
  }, [open, pet]);

  const handleClose = () => {
    if (!saving && !deleting) {
      setDeleteConfirmOpen(false);
      onClose();
    }
  };

  const handleDeleteClick = () => setDeleteConfirmOpen(true);

  const handleDeleteConfirm = async () => {
    if (!pet) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(pet.id);
      setDeleteConfirmOpen(false);
      onClose();
      onSaved();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to delete pet.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleFieldChange = <K extends keyof PetFormValues>(field: K, value: PetFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    setError(null);
    const trimmedName = values.name.trim();
    if (!trimmedName) {
      setError("Pet's name is required.");
      return;
    }
    if (!values.species) {
      setError("Please select a species.");
      return;
    }
    setSaving(true);
    try {
      await onUpdate(pet.id, {
        name: trimmedName,
        species: values.species,
        breed: values.breed.trim() || undefined,
        date_of_birth: values.dateOfBirth || undefined,
        sex: values.sex === "unknown" ? undefined : values.sex,
        weight_baseline: values.weight ? parseFloat(values.weight) : undefined,
      });
      onClose();
      onSaved();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to update pet.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSelect = async (file: File) => {
    if (!pet) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const updated = await uploadPetPhoto(pet.id, file);
      setDisplayPet(updated);
      onSaved();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to upload photo.";
      setError(message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!pet) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Edit Pet
        </Typography>
        <IconButton aria-label="Close" onClick={handleClose} size="small" disabled={saving || deleting}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Update your pet&apos;s details below.
        </Typography>

        <PetForm
          formId="edit-pet-form"
          values={values}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          error={error}
          photo={{
            src: displayPet?.profile_photo_url ?? null,
            alt: pet.name,
            onFileSelect: handlePhotoSelect,
            uploading: uploadingPhoto,
            hint: displayPet?.profile_photo_url ? "Click to change photo" : "+ Upload Photo",
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1, justifyContent: "space-between" }}>
        <Button
          onClick={handleDeleteClick}
          disabled={saving || deleting}
          color="error"
          sx={{ textTransform: "none", mr: "auto" }}
        >
          Delete
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={handleClose} disabled={saving || deleting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-pet-form"
            variant="contained"
            disabled={saving || deleting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#0d9488",
              "&:hover": { bgcolor: "#0f766e" },
            }}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </Box>
      </DialogActions>

      <Dialog open={deleteConfirmOpen} onClose={() => !deleting && setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete pet?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {pet.name}? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting} sx={{ textTransform: "none" }}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
