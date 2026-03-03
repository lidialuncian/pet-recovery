import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import PetsRounded from "@mui/icons-material/PetsRounded";
import { getVetClinics, getClinicPets } from "../../api/clinic.api";
import type { Clinic } from "../../types/clinic.types";
import type { ClinicPet } from "../../types/clinic.types";
import type { Pet } from "../../types/pet.types";

type ClinicPetWithDetails = ClinicPet & { pet: Pet };

export default function VetPatientsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");
  const [pets, setPets] = useState<ClinicPetWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClinics = useCallback(async () => {
    try {
      const list = await getVetClinics();
      setClinics(list);
      if (list.length && !selectedClinicId) setSelectedClinicId(list[0].id);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to load clinics.";
      setError(msg);
    }
  }, [selectedClinicId]);

  const fetchPets = useCallback(async () => {
    if (!selectedClinicId) {
      setPets([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getClinicPets(selectedClinicId, true);
      setPets((data as ClinicPetWithDetails[]) ?? []);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to load patients.";
      setError(msg);
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClinicId]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  return (
    <Box sx={{ maxWidth: 1200, width: "100%" }}>
      <Typography variant="h5" fontWeight={600} color="grey.900" gutterBottom>
        Patients
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Pets registered at your clinic. Select a clinic to view its patients.
      </Typography>

      <FormControl size="small" sx={{ minWidth: 260, mb: 3 }}>
        <InputLabel id="clinic-select-label">Clinic</InputLabel>
        <Select
          labelId="clinic-select-label"
          value={selectedClinicId}
          label="Clinic"
          onChange={(e) => setSelectedClinicId(e.target.value)}
          sx={{ borderRadius: 2 }}
        >
          {clinics.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Typography variant="body2" color="text.secondary">Loading…</Typography>
      ) : clinics.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You are not assigned to any clinic. Contact your admin to be linked to a clinic.
        </Typography>
      ) : pets.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No patients registered at this clinic yet.
        </Typography>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
          {pets.map((row) => {
            const pet = "pet" in row ? row.pet : null;
            const name = pet?.name ?? "Unknown";
            const species = pet?.species ?? "";
            const patientNumber = row.patient_number ?? "—";
            return (
              <Card key={row.id} sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <PetsRounded sx={{ color: "#0d9488", fontSize: 28 }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {species}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Patient # {patientNumber}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
