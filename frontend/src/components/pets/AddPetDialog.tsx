import { useState, type FormEvent } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Close from "@mui/icons-material/Close";
import type { CreatePet, Pet } from "../../types/pet.types";
import { uploadPetPhoto } from "../../api/pet.api";
import PetForm, { type PetFormValues } from "./PetForm";

const initialValues: PetFormValues = {
  name: "",
  species: "",
  breed: "",
  dateOfBirth: "",
  sex: "unknown",
  weight: "",
};

type AddPetDialogProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onSubmit: (pet: CreatePet) => Promise<Pet | void>;
};

export default function AddPetDialog({ open, onClose, onSaved, onSubmit }: AddPetDialogProps) {
  const [values, setValues] = useState<PetFormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const resetForm = () => {
    setValues(initialValues);
    setError(null);
    setPendingPhoto(null);
    setPhotoPreview(null);
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  const handleFieldChange = <K extends keyof PetFormValues>(field: K, value: PetFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      const created = await onSubmit({
        name: trimmedName,
        species: values.species,
        breed: values.breed.trim() || undefined,
        date_of_birth: values.dateOfBirth || undefined,
        sex: values.sex === "unknown" ? undefined : values.sex,
        weight_baseline: values.weight ? parseFloat(values.weight) : undefined,
      });
      if (pendingPhoto && created?.id) {
        await uploadPetPhoto(created.id, pendingPhoto);
      }
      resetForm();
      onClose();
      onSaved();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to add pet.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSelect = (file: File) => {
    setPendingPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Add a Pet
        </Typography>
        <IconButton aria-label="Close" onClick={handleClose} size="small" disabled={saving}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Fill in the details below to add your pet.
        </Typography>

        <PetForm
          formId="add-pet-form"
          values={values}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          error={error}
          photo={{
            src: photoPreview,
            alt: "Preview",
            onFileSelect: handlePhotoSelect,
            hint: "+ Add Photo (optional)",
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
        <Button onClick={handleClose} disabled={saving} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-pet-form"
          variant="contained"
          disabled={saving}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#0d9488",
            "&:hover": { bgcolor: "#0f766e" },
          }}
        >
          {saving ? "Saving…" : "Add Pet"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
