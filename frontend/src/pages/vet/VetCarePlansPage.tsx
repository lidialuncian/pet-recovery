import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import EditRounded from "@mui/icons-material/EditRounded";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import { Link as RouterLink } from "react-router-dom";
import { getVetClinics, getClinicPets } from "../../api/clinic.api";
import { getCarePlansForClinic, createCarePlan, updateCarePlan } from "../../api/carePlan.api";
import type { Clinic } from "../../types/clinic.types";
import type { CarePlan } from "../../types/carePlan.types";
import type { Pet } from "../../types/pet.types";

const statusLabels: Record<string, string> = {
  draft: "Draft",
  in_clinic: "In clinic",
  at_home: "At home",
  follow_up: "Follow-up",
  closed: "Closed",
};

type ClinicPetRow = { id: string; clinic_id: string; pet_id: string; patient_number: string | null; pet: Pet };

export default function VetCarePlansPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");
  const [filterPetId, setFilterPetId] = useState<string>("");
  const [clinicPetsForFilter, setClinicPetsForFilter] = useState<ClinicPetRow[]>([]);
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createClinicId, setCreateClinicId] = useState("");
  const [createPetId, setCreatePetId] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createStartDate, setCreateStartDate] = useState<Dayjs | null>(null);
  const [createStatus, setCreateStatus] = useState<CarePlan["status"]>("draft");
  const [clinicPets, setClinicPets] = useState<ClinicPetRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [editPlanTitle, setEditPlanTitle] = useState("");
  const [editPlanDescription, setEditPlanDescription] = useState("");
  const [editPlanStatus, setEditPlanStatus] = useState<CarePlan["status"]>("draft");
  const [editPlanStartDate, setEditPlanStartDate] = useState<Dayjs | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [closingPlanId, setClosingPlanId] = useState<string | null>(null);

  const fetchClinics = useCallback(async () => {
    try {
      const list = await getVetClinics();
      setClinics(list);
      if (list.length && !selectedClinicId) setSelectedClinicId(list[0].id);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed to load clinics");
    }
  }, [selectedClinicId]);

  const fetchPlans = useCallback(async () => {
    if (!selectedClinicId) {
      setPlans([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getCarePlansForClinic(selectedClinicId);
      setPlans(list);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed to load care plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClinicId]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (!selectedClinicId) {
      setClinicPetsForFilter([]);
      setFilterPetId("");
      return;
    }
    getClinicPets(selectedClinicId, true)
      .then((data) => {
        setClinicPetsForFilter((data as ClinicPetRow[]) ?? []);
        setFilterPetId("");
      })
      .catch(() => setClinicPetsForFilter([]));
  }, [selectedClinicId]);

  useEffect(() => {
    if (!createOpen) return;
    if (!createClinicId) {
      setClinicPets([]);
      setCreatePetId("");
      return;
    }
    getClinicPets(createClinicId, true).then((data) => {
      setClinicPets((data as ClinicPetRow[]) ?? []);
      setCreatePetId("");
    }).catch(() => setClinicPets([]));
  }, [createOpen, createClinicId]);

  const handleOpenCreate = () => {
    setCreateClinicId("");
    setCreatePetId("");
    setCreateTitle("");
    setCreateDescription("");
    setCreateStartDate(null);
    setCreateStatus("draft");
    setCreateError(null);
    setCreateOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!createClinicId || !createPetId) {
      setCreateError("Select a clinic and a pet.");
      return;
    }
    setSaving(true);
    setCreateError(null);
    try {
      await createCarePlan({
        clinic_id: createClinicId,
        pet_id: createPetId,
        status: createStatus,
        start_date: createStartDate ? createStartDate.format("YYYY-MM-DD") : null,
        title: createTitle.trim() || null,
        description: createDescription.trim() || null,
      });
      setCreateOpen(false);
      fetchPlans();
    } catch (err: unknown) {
      setCreateError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to create care plan");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditPlan = (plan: CarePlan) => {
    setEditPlanId(plan.id);
    setEditPlanTitle(plan.title ?? "");
    setEditPlanDescription(plan.description ?? "");
    setEditPlanStatus(plan.status);
    setEditPlanStartDate(plan.start_date ? dayjs(plan.start_date) : null);
    setEditError(null);
    setEditPlanOpen(true);
  };

  const handleSaveEditPlan = async () => {
    if (!editPlanId) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const updated = await updateCarePlan(editPlanId, {
        title: editPlanTitle.trim() || null,
        description: editPlanDescription.trim() || null,
        status: editPlanStatus,
        start_date: editPlanStartDate ? editPlanStartDate.format("YYYY-MM-DD") : null,
      });
      setPlans((prev) => prev.map((p) => (p.id === editPlanId ? updated : p)));
      setEditPlanOpen(false);
      setEditPlanId(null);
    } catch (err: unknown) {
      setEditError((err as Error)?.message ?? "Failed to update plan");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleClosePlan = async (plan: CarePlan) => {
    if (plan.status === "closed") return;
    setClosingPlanId(plan.id);
    try {
      const updated = await updateCarePlan(plan.id, {
        status: "closed",
        closed_at: new Date().toISOString(),
      });
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? updated : p)));
    } catch (err: unknown) {
      console.error("Failed to close plan", err);
    } finally {
      setClosingPlanId(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={600} color="grey.900">
          Care Plans
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={handleOpenCreate}
          disabled={clinics.length === 0}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" } }}
        >
          Create plan
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Recovery plans for your clinic. Select a clinic and optionally a pet to filter plans.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="plan-clinic-label">Clinic</InputLabel>
          <Select
            labelId="plan-clinic-label"
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
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="plan-pet-label">Pet</InputLabel>
          <Select
            labelId="plan-pet-label"
            value={filterPetId}
            label="Pet"
            onChange={(e) => setFilterPetId(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">All pets</MenuItem>
            {clinicPetsForFilter.map((row) => (
              <MenuItem key={row.id} value={row.pet_id}>
                {row.pet?.name ?? row.pet_id} {row.pet?.species ? `(${row.pet.species})` : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {loading ? (
        <Typography variant="body2" color="text.secondary">Loading…</Typography>
      ) : clinics.length === 0 ? (
        <Typography variant="body2" color="text.secondary">You are not assigned to any clinic.</Typography>
      ) : (() => {
        const filteredPlans = filterPetId ? plans.filter((p) => p.pet_id === filterPetId) : plans;
        const petNameById = Object.fromEntries(clinicPetsForFilter.map((row) => [row.pet_id, row.pet?.name ?? "Pet"]));
        return filteredPlans.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {filterPetId ? "No care plans for this pet." : "No care plans yet. Create one to get started."}
          </Typography>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2 }}>
            {filteredPlans.map((plan) => (
              <Card key={plan.id} sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AssignmentRounded sx={{ color: "#0d9488", fontSize: 24 }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {plan.title ?? `Plan for ${petNameById[plan.pet_id] ?? plan.pet_id.slice(0, 8) + "…"}`}
                    </Typography>
                  </Box>
                  {plan.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                      {plan.description}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {statusLabels[plan.status] ?? plan.status}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Started: {plan.start_date ?? "—"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                    {plan.status !== "closed" && (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditRounded />}
                          onClick={() => handleOpenEditPlan(plan)}
                          sx={{ borderRadius: 2, textTransform: "none", borderColor: "#0d9488", color: "#0d9488" }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleClosePlan(plan)}
                          disabled={closingPlanId === plan.id}
                          sx={{ borderRadius: 2, textTransform: "none" }}
                        >
                          {closingPlanId === plan.id ? "Closing…" : "Close plan"}
                        </Button>
                      </>
                    )}
                    <Button
                      component={RouterLink}
                      to={`/home/vet/plans/${plan.id}`}
                      variant="contained"
                      size="small"
                      sx={{ borderRadius: 2, textTransform: "none", bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" } }}
                    >
                      Add tasks
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        );
      })()}

      <Dialog open={createOpen} onClose={() => !saving && setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            New care plan
          </Typography>
          <IconButton aria-label="Close" onClick={() => setCreateOpen(false)} disabled={saving} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fill in the details below to create a new care plan.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Clinic</InputLabel>
            <Select
              value={createClinicId}
              label="Clinic"
              onChange={(e) => setCreateClinicId(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {clinics.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Pet</InputLabel>
            <Select
              value={createPetId}
              label="Pet"
              onChange={(e) => setCreatePetId(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {clinicPets.map((row) => (
                <MenuItem key={row.id} value={row.pet_id}>
                  {row.pet?.name ?? row.pet_id} {row.pet?.species ? `(${row.pet.species})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label="Title"
            placeholder="e.g. Post-surgery recovery"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
          <TextField
            fullWidth
            size="small"
            label="Description"
            placeholder="Optional notes about this care plan"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
            multiline
            minRows={2}
            slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start date"
              value={createStartDate}
              onChange={(d) => setCreateStartDate(d)}
              slotProps={{
                field: { clearable: true },
                textField: {
                  fullWidth: true,
                  size: "small",
                  slotProps: { input: { sx: { borderRadius: 2 } } },
                },
              }}
            />
          </LocalizationProvider>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={createStatus}
              label="Status"
              onChange={(e) => setCreateStatus(e.target.value as CarePlan["status"])}
              sx={{ borderRadius: 2 }}
            >
              {(["draft", "in_clinic", "at_home", "follow_up"] as const).map((s) => (
                <MenuItem key={s} value={s}>{statusLabels[s]}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {createError && <Typography variant="body2" color="error">{createError}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} disabled={saving} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSubmit}
            disabled={saving}
            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" } }}
          >
            {saving ? "Creating…" : "Create plan"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editPlanOpen} onClose={() => !savingEdit && setEditPlanOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Edit care plan
          </Typography>
          <IconButton aria-label="Close" onClick={() => setEditPlanOpen(false)} disabled={savingEdit} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Update the details below.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Title"
            value={editPlanTitle}
            onChange={(e) => setEditPlanTitle(e.target.value)}
            slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
          <TextField
            fullWidth
            size="small"
            label="Description"
            value={editPlanDescription}
            onChange={(e) => setEditPlanDescription(e.target.value)}
            multiline
            minRows={2}
            slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start date"
              value={editPlanStartDate}
              onChange={(d) => setEditPlanStartDate(d)}
              slotProps={{
                field: { clearable: true },
                textField: {
                  fullWidth: true,
                  size: "small",
                  slotProps: { input: { sx: { borderRadius: 2 } } },
                },
              }}
            />
          </LocalizationProvider>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={editPlanStatus}
              label="Status"
              onChange={(e) => setEditPlanStatus(e.target.value as CarePlan["status"])}
              sx={{ borderRadius: 2 }}
            >
              {(["draft", "in_clinic", "at_home", "follow_up", "closed"] as const).map((s) => (
                <MenuItem key={s} value={s}>{statusLabels[s]}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {editError && <Typography variant="body2" color="error">{editError}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button onClick={() => setEditPlanOpen(false)} disabled={savingEdit} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEditPlan}
            disabled={savingEdit}
            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" } }}
          >
            {savingEdit ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
