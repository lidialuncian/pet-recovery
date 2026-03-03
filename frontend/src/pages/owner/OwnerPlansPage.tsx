import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import { getMyCarePlans } from "../../api/carePlan.api";
import { getPetsForOwner } from "../../api/pet.api";
import type { CarePlan } from "../../types/carePlan.types";
import type { Pet } from "../../types/pet.types";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const statusLabels: Record<string, string> = {
  draft: "Draft",
  in_clinic: "In clinic",
  at_home: "At home",
  follow_up: "Follow-up",
  closed: "Closed",
};

export default function OwnerPlansPage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [filterPetId, setFilterPetId] = useState<string>("");
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getMyCarePlans();
      setPlans(list);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed to load care plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    getPetsForOwner()
      .then(setPets)
      .catch(() => setPets([]));
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, width: "100%" }}>
      <Typography variant="h5" fontWeight={600} color="grey.900" gutterBottom>
        Care Plans
      </Typography>

      {error && <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {loading ? (
        <Typography variant="body2" color="text.secondary">Loading…</Typography>
      ) : plans.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You don&apos;t have any active care plans. When your vet creates a recovery plan for your pet, it will appear here.
        </Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a pet to filter, then click a plan to open it and view tasks or ask the assistant.
          </Typography>
          <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
            <InputLabel id="owner-plan-pet-label">Pet</InputLabel>
            <Select
              labelId="owner-plan-pet-label"
              value={filterPetId}
              label="Pet"
              onChange={(e) => setFilterPetId(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">All pets</MenuItem>
              {pets.map((pet) => (
                <MenuItem key={pet.id} value={pet.id}>
                  {pet.name} {pet.species ? `(${pet.species})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {(() => {
            const filteredPlans = filterPetId ? plans.filter((p) => p.pet_id === filterPetId) : plans;
            if (filteredPlans.length === 0 && (filterPetId || plans.length > 0)) {
              return (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No care plans for this pet.
                </Typography>
              );
            }
            return (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filteredPlans.map((plan) => {
                  const petName = pets.find((p) => p.id === plan.pet_id)?.name ?? "Pet";
                  return (
                    <Card
                      key={plan.id}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "grey.200",
                        cursor: "pointer",
                        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                      }}
                      onClick={() => navigate(`/home/owner/plans/${plan.id}`)}
                    >
                      <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <AssignmentRounded sx={{ color: "#0d9488" }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {plan.title ?? `Plan for ${petName}`}
                          </Typography>
                          {plan.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                              {plan.description}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            Status: {statusLabels[plan.status] ?? plan.status} · Started: {plan.start_date ?? "—"}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            );
          })()}
        </>
      )}
    </Box>
  );
}
