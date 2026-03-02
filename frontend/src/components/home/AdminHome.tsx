import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import PersonAddRounded from "@mui/icons-material/PersonAddRounded";
import PetsRounded from "@mui/icons-material/PetsRounded";
import {
  getClinics,
  getVetsAvailable,
  getPetsAvailable,
  addVetToClinic,
  addPetToClinic,
} from "../../api/clinic.api";
import type { Clinic } from "../../types/clinic.types";
import type { User } from "../../types/user.types";
import type { Pet } from "../../types/pet.types";

const cardStyle = {
  height: "100%",
  borderRadius: 3,
  border: "1px solid",
  borderColor: "grey.200",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  overflow: "hidden",
  position: "relative" as const,
  display: "flex",
  flexDirection: "column",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 20% 80%, rgba(13, 148, 136, 0.04) 0%, transparent 50%)",
    pointerEvents: "none",
  },
};

const actionButtonStyle = {
  borderRadius: 2,
  textTransform: "none" as const,
  fontWeight: 600,
  bgcolor: "#0d9488",
  "&:hover": { bgcolor: "#0f766e" },
};

type AdminOutletContext = { user: User };

export default function AdminHome() {
  const { user } = useOutletContext<AdminOutletContext>();
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [vets, setVets] = useState<User[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [loadingVets, setLoadingVets] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);

  const [selectedClinicVet, setSelectedClinicVet] = useState<string>("");
  const [selectedVet, setSelectedVet] = useState<string>("");
  const [vetError, setVetError] = useState<string | null>(null);
  const [vetSuccess, setVetSuccess] = useState(false);

  const [selectedClinicPet, setSelectedClinicPet] = useState<string>("");
  const [selectedPet, setSelectedPet] = useState<string>("");
  const [patientNumber, setPatientNumber] = useState("");
  const [petError, setPetError] = useState<string | null>(null);
  const [petSuccess, setPetSuccess] = useState(false);

  const [submittingVet, setSubmittingVet] = useState(false);
  const [submittingPet, setSubmittingPet] = useState(false);

  const fetchClinics = useCallback(async () => {
    setLoadingClinics(true);
    try {
      const list = await getClinics();
      setClinics(list);
      setSelectedClinicVet((prev) => prev || list[0]?.id || "");
      setSelectedClinicPet((prev) => prev || list[0]?.id || "");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to load clinics.";
      console.error(msg);
    } finally {
      setLoadingClinics(false);
    }
  }, []);

  const fetchVets = useCallback(async () => {
    setLoadingVets(true);
    try {
      const list = await getVetsAvailable();
      setVets(list);
    } catch (err: unknown) {
      console.error("Failed to load vets", err);
    } finally {
      setLoadingVets(false);
    }
  }, []);

  const fetchPets = useCallback(async () => {
    setLoadingPets(true);
    try {
      const list = await getPetsAvailable();
      setPets(list);
    } catch (err: unknown) {
      console.error("Failed to load pets", err);
    } finally {
      setLoadingPets(false);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const handleAddVet = async () => {
    if (!selectedClinicVet || !selectedVet) {
      setVetError("Please select a clinic and a vet.");
      return;
    }
    setVetError(null);
    setVetSuccess(false);
    setSubmittingVet(true);
    try {
      await addVetToClinic(selectedClinicVet, selectedVet);
      setVetSuccess(true);
      setSelectedVet("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to add vet to clinic.";
      setVetError(msg);
    } finally {
      setSubmittingVet(false);
    }
  };

  const handleAddPet = async () => {
    if (!selectedClinicPet || !selectedPet) {
      setPetError("Please select a clinic and a pet.");
      return;
    }
    setPetError(null);
    setPetSuccess(false);
    setSubmittingPet(true);
    try {
      await addPetToClinic(selectedClinicPet, selectedPet, patientNumber.trim() || null);
      setPetSuccess(true);
      setSelectedPet("");
      setPatientNumber("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to add pet to clinic.";
      setPetError(msg);
    } finally {
      setSubmittingPet(false);
    }
  };

  const onVetFocus = () => {
    if (vets.length === 0) fetchVets();
  };

  const onPetFocus = () => {
    if (pets.length === 0) fetchPets();
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1200 }}>
      <Typography variant="h5" fontWeight={600} color="grey.900" sx={{ mb: 1 }}>
        Welcome, {displayName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your clinic: add vets and register pets.
      </Typography>

      {loadingClinics && clinics.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Loading clinics…</Typography>
      ) : clinics.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You are not assigned to any clinic. Contact support to be linked to a clinic as admin.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Card sx={cardStyle}>
            <CardContent sx={{ p: 3, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "rgba(13, 148, 136, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PersonAddRounded sx={{ fontSize: 28, color: "#0d9488" }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="grey.900">
                  Add vet to clinic
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Link a veterinarian to one of your clinics so they can manage care plans.
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="clinic-vet-label">Clinic</InputLabel>
                <Select
                  labelId="clinic-vet-label"
                  value={selectedClinicVet}
                  label="Clinic"
                  onChange={(e) => setSelectedClinicVet(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {clinics.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="vet-label">Vet</InputLabel>
                <Select
                  labelId="vet-label"
                  value={selectedVet}
                  label="Vet"
                  onFocus={onVetFocus}
                  onChange={(e) => setSelectedVet(e.target.value)}
                  disabled={loadingVets}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Select a vet</MenuItem>
                  {vets.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {[v.first_name, v.last_name].filter(Boolean).join(" ") || v.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {vetError && <Typography variant="body2" color="error">{vetError}</Typography>}
              {vetSuccess && <Typography variant="body2" color="success.main">Vet added to clinic.</Typography>}
              <Button
                variant="contained"
                onClick={handleAddVet}
                disabled={submittingVet || !selectedClinicVet || !selectedVet}
                sx={actionButtonStyle}
              >
                {submittingVet ? "Adding…" : "Add vet"}
              </Button>
            </CardContent>
          </Card>

          <Card sx={cardStyle}>
            <CardContent sx={{ p: 3, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "rgba(13, 148, 136, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PetsRounded sx={{ fontSize: 28, color: "#0d9488" }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="grey.900">
                  Add pet to clinic
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Register a pet at your clinic so vets can create care plans for them.
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="clinic-pet-label">Clinic</InputLabel>
                <Select
                  labelId="clinic-pet-label"
                  value={selectedClinicPet}
                  label="Clinic"
                  onChange={(e) => setSelectedClinicPet(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {clinics.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="pet-label">Pet</InputLabel>
                <Select
                  labelId="pet-label"
                  value={selectedPet}
                  label="Pet"
                  onFocus={onPetFocus}
                  onChange={(e) => setSelectedPet(e.target.value)}
                  disabled={loadingPets}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Select a pet</MenuItem>
                  {pets.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} {p.species ? `(${p.species})` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                label="Patient number (optional)"
                value={patientNumber}
                onChange={(e) => setPatientNumber(e.target.value)}
                placeholder="e.g. PAT-001"
                slotProps={{ input: { sx: { borderRadius: 2 } } }}
              />
              {petError && <Typography variant="body2" color="error">{petError}</Typography>}
              {petSuccess && <Typography variant="body2" color="success.main">Pet added to clinic.</Typography>}
              <Button
                variant="contained"
                onClick={handleAddPet}
                disabled={submittingPet || !selectedClinicPet || !selectedPet}
                sx={actionButtonStyle}
              >
                {submittingPet ? "Adding…" : "Add pet"}
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
