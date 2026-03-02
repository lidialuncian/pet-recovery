import { type FormEvent } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";

export type PetFormValues = {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  sex: "male" | "female" | "unknown";
  weight: string;
};

export type PetFormPhotoProps = {
  src: string | null;
  alt: string;
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  hint: string;
};

type PetFormProps = {
  formId: string;
  values: PetFormValues;
  onFieldChange: <K extends keyof PetFormValues>(field: K, value: PetFormValues[K]) => void;
  onSubmit: (e: FormEvent) => void;
  error: string | null;
  photo: PetFormPhotoProps;
};

export default function PetForm({ formId, values, onFieldChange, onSubmit, error, photo }: PetFormProps) {
  const { src, alt, onFileSelect, uploading = false, hint } = photo;

  return (
    <Box
      component="form"
      id={formId}
      onSubmit={onSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <Box
          component="label"
          sx={{
            position: "relative",
            width: { xs: "100%", sm: 140 },
            height: 140,
            border: "2px dashed",
            borderColor: "grey.300",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.50",
            cursor: uploading ? "wait" : "pointer",
            overflow: "hidden",
            "&:hover": uploading ? {} : { borderColor: "primary.main", bgcolor: "grey.100" },
          }}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.type)) {
                onFileSelect(file);
              }
              e.target.value = "";
            }}
            disabled={uploading}
            style={{ display: "none" }}
          />
          {src ? (
            <>
              <Box
                component="img"
                src={src}
                alt={alt}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  left: 4,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ bgcolor: "rgba(255,255,255,0.9)", px: 1, borderRadius: 1 }}>
                  {uploading ? "Uploading…" : hint}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <CloudUploadOutlined sx={{ fontSize: 48, color: "grey.400", mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                {uploading ? "Uploading…" : hint}
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Pet's Name"
            value={values.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            placeholder="Pet's Name"
            required
            slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
          <TextField
            fullWidth
            label="Species"
            value={values.species}
            onChange={(e) => onFieldChange("species", e.target.value)}
            placeholder="Species"
            required
            slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
          <TextField
            fullWidth
            label="Breed"
            value={values.breed}
            onChange={(e) => onFieldChange("breed", e.target.value)}
            placeholder="Search a breed"
            slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
        </Box>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Date of Birth"
          value={values.dateOfBirth ? dayjs(values.dateOfBirth) : null}
          maxDate={dayjs()}
          onChange={(d) => onFieldChange("dateOfBirth", d ? d.format("YYYY-MM-DD") : "")}
          slotProps={{
            field: { clearable: true },
            textField: {
              fullWidth: true,
              slotProps: { input: { sx: { borderRadius: 2 } } },
            },
          }}
        />
      </LocalizationProvider>

      <FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Sex
        </Typography>
        <RadioGroup
          row
          value={values.sex}
          onChange={(e) => onFieldChange("sex", (e.target.value as "male" | "female" | "unknown") || "unknown")}
        >
          <FormControlLabel value="male" control={<Radio size="small" />} label="Male" />
          <FormControlLabel value="female" control={<Radio size="small" />} label="Female" />
        </RadioGroup>
      </FormControl>

      <TextField
        fullWidth
        label="Weight (kg) (optional)"
        type="number"
        inputProps={{ min: 0, step: 0.1 }}
        value={values.weight}
        onChange={(e) => onFieldChange("weight", e.target.value)}
        placeholder="0"
        slotProps={{ input: { sx: { borderRadius: 2 } } }}
      />

      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
}
