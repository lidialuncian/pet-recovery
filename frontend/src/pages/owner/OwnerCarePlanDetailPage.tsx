import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import { getCarePlan } from "../../api/carePlan.api";
import { getPlanTasks, submitTaskEntry, getTaskEntries } from "../../api/carePlanTask.api";
import { getPetsForOwner } from "../../api/pet.api";
import type { CarePlan } from "../../types/carePlan.types";
import type { CarePlanTask, CarePlanTaskEntry } from "../../types/carePlanTask.types";
import AiAssistant from "../../components/assistant/AiAssistant";

const statusLabels: Record<string, string> = {
  draft: "Draft",
  in_clinic: "In clinic",
  at_home: "At home",
  follow_up: "Follow-up",
  closed: "Closed",
};

/** Format "16:00" -> "4:00 PM" */
function formatScheduleTime(time: string | null | undefined): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (h === 12) return `12:${String(m).padStart(2, "0")} PM`;
  if (h === 0) return `12:${String(m).padStart(2, "0")} AM`;
  return h > 12 ? `${h - 12}:${String(m).padStart(2, "0")} PM` : `${h}:${String(m).padStart(2, "0")} AM`;
}

export default function OwnerCarePlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<CarePlan | null>(null);
  const [petName, setPetName] = useState<string>("");
  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [taskValues, setTaskValues] = useState<Record<string, unknown>>({});
  const [taskEntries, setTaskEntries] = useState<Record<string, CarePlanTaskEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const fetchPlanAndTasks = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    setError(null);
    try {
      const [planData, tasksData] = await Promise.all([
        getCarePlan(planId),
        getPlanTasks(planId),
      ]);
      setPlan(planData);
      setTasks(tasksData);
      setTaskValues({});
      const entries: Record<string, CarePlanTaskEntry[]> = {};
      await Promise.all(
        tasksData.map(async (task) => {
          const list = await getTaskEntries(planId, task.id);
          entries[task.id] = list;
        })
      );
      setTaskEntries(entries);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed to load care plan");
      setPlan(null);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchPlanAndTasks();
  }, [fetchPlanAndTasks]);

  useEffect(() => {
    if (!plan?.pet_id) return;
    getPetsForOwner().then((pets) => {
      const pet = pets.find((p) => p.id === plan.pet_id);
      setPetName(pet?.name ?? "Pet");
    }).catch(() => setPetName("Pet"));
  }, [plan?.pet_id]);

  const handleSubmitEntry = async (task: CarePlanTask) => {
    if (!planId || !plan) return;
    const value = taskValues[task.id];
    let valueJson: unknown = value;
    if (task.task_type === "boolean" || task.task_type === "medication") valueJson = !!value;
    else if (task.task_type === "number" || task.task_type === "scale" || task.task_type === "vital" || task.task_type === "measurement") valueJson = typeof value === "number" ? value : Number(value) ?? value;
    else if (task.task_type === "text" || task.task_type === "symptom_check") valueJson = value ?? "";
    setSubmitting(task.id);
    try {
      await submitTaskEntry(planId, task.id, { value_json: valueJson });
      setTaskEntries((prev) => ({
        ...prev,
        [task.id]: [
          { id: "", task_id: task.id, care_plan_id: planId, entered_by_user_id: "", entered_by_role: "owner", value_json: valueJson, note: null, created_at: new Date().toISOString() },
          ...(prev[task.id] ?? []),
        ],
      }));
      setTaskValues((prev) => ({ ...prev, [task.id]: undefined }));
    } catch (err: unknown) {
      console.error("Submit entry failed", err);
    } finally {
      setSubmitting(null);
    }
  };

  if (!planId) {
    return (
      <Box>
        <Typography color="error">Missing plan.</Typography>
        <Button onClick={() => navigate("/home/owner/plans")} sx={{ mt: 1 }}>Back to Care Plans</Button>
      </Box>
    );
  }

  if (loading) {
    return <Typography variant="body2" color="text.secondary">Loading…</Typography>;
  }

  if (error || !plan) {
    return (
      <Box>
        <Typography color="error">{error ?? "Care plan not found."}</Typography>
        <Button onClick={() => navigate("/home/owner/plans")} sx={{ mt: 1 }}>Back to Care Plans</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, width: "100%" }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/home/owner/plans")}
        sx={{ mb: 2, textTransform: "none" }}
      >
        Back to Care Plans
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AssignmentRounded sx={{ color: "#0d9488", fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {plan.title ?? `Care plan for ${petName}`}
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
        </Box>
        <Button
          variant="contained"
          startIcon={<SmartToyOutlined />}
          onClick={() => setAssistantOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" } }}
        >
          Ask about this plan
        </Button>
      </Box>

      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
        Tasks
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Complete the tasks below as recommended by your vet. You can submit updates daily or as needed.
      </Typography>

      {tasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No tasks have been added to this plan yet.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {tasks.map((task) => {
            const schema = (task.value_schema ?? {}) as Record<string, unknown>;
            const isNumberInput = task.task_type === "number" || task.task_type === "scale" || task.task_type === "vital" || task.task_type === "measurement";
            const needsNumber = isNumberInput && (taskValues[task.id] === undefined || taskValues[task.id] === "");
            return (
              <Card key={task.id} sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                <CardContent sx={{ "& > * + *": { mt: 1.5 } }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {task.label}
                    {task.is_required && " *"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {task.task_type} · {task.frequency}
                    {task.schedule_time && ` · ${formatScheduleTime(task.schedule_time)}`}
                    {task.due_window_minutes != null && task.due_window_minutes > 0 && ` · Within ±${task.due_window_minutes} min`}
                  </Typography>
                  {task.description && (
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {task.description}
                    </Typography>
                  )}
                  {task.task_type === "medication" && (schema.instructions != null || schema.name != null || schema.dose != null || schema.unit != null || schema.route != null) && (
                    <Box sx={{ bgcolor: "grey.50", borderRadius: 1, p: 1.5, border: "1px solid", borderColor: "grey.200" }}>
                      {schema.instructions != null && String(schema.instructions).trim() !== "" && (
                        <Typography variant="body2" sx={{ mb: 1, whiteSpace: "pre-wrap" }}>
                          {String(schema.instructions)}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" component="div">
                        {schema.name != null && <span>Name: {String(schema.name)}</span>}
                        {schema.dose != null && <span> · Dose: {String(schema.dose)}</span>}
                        {schema.unit != null && <span> · Unit: {String(schema.unit)}</span>}
                        {schema.route != null && <span> · Route: {String(schema.route)}</span>}
                      </Typography>
                    </Box>
                  )}
                  {(task.task_type === "vital" || task.task_type === "measurement") && (schema.unit != null || schema.value_type != null) && (
                    <Typography variant="body2" color="text.secondary">
                      {schema.value_type === "number" ? "Enter value" : "Enter notes"}
                      {schema.unit != null ? ` (${String(schema.unit)})` : ""}
                    </Typography>
                  )}
                  {task.task_type === "symptom_check" && Array.isArray(schema.fields) && schema.fields.length > 0 && (
                    <Box component="ul" sx={{ m: 0, pl: 2.5, "& li": { mb: 0.5 } }}>
                      {(schema.fields as string[]).map((f: string, i: number) => (
                        <li key={i}>
                          <Typography variant="body2" color="text.secondary">{f}</Typography>
                        </li>
                      ))}
                    </Box>
                  )}

                  {task.task_type === "boolean" && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!taskValues[task.id]}
                          onChange={(e) => setTaskValues((prev) => ({ ...prev, [task.id]: e.target.checked }))}
                        />
                      }
                      label="Completed"
                    />
                  )}
                  {task.task_type === "medication" && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!taskValues[task.id]}
                          onChange={(e) => setTaskValues((prev) => ({ ...prev, [task.id]: e.target.checked }))}
                        />
                      }
                      label="I did this"
                    />
                  )}
                  {(task.task_type === "number" || task.task_type === "scale" || task.task_type === "vital" || task.task_type === "measurement") && (
                    <TextField
                      type="number"
                      size="small"
                      placeholder={task.task_type === "scale" ? "0-10" : schema.unit ? `Value (${String(schema.unit)})` : "Value"}
                      value={taskValues[task.id] ?? ""}
                      onChange={(e) => setTaskValues((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      slotProps={{ input: { sx: { borderRadius: 2 }, inputProps: { min: task.task_type === "scale" ? 0 : undefined, max: task.task_type === "scale" ? 10 : undefined } } }}
                      sx={{ display: "block", maxWidth: 160 }}
                    />
                  )}
                  {task.task_type === "text" && (
                    <TextField
                      size="small"
                      multiline
                      placeholder="Notes"
                      value={taskValues[task.id] ?? ""}
                      onChange={(e) => setTaskValues((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      slotProps={{ input: { sx: { borderRadius: 2 } } }}
                      fullWidth
                      minRows={2}
                    />
                  )}
                  {task.task_type === "symptom_check" && (
                    <TextField
                      size="small"
                      multiline
                      placeholder="Your observations (e.g. appetite normal, energy level normal)"
                      value={taskValues[task.id] ?? ""}
                      onChange={(e) => setTaskValues((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      slotProps={{ input: { sx: { borderRadius: 2 } } }}
                      fullWidth
                      minRows={2}
                    />
                  )}
                  {task.task_type === "photo" && (
                    <Typography variant="body2" color="text.secondary">
                      Photo upload (optional for MVP — use text note)
                    </Typography>
                  )}

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSubmitEntry(task)}
                    disabled={submitting === task.id || needsNumber}
                    sx={{ borderRadius: 2, textTransform: "none", bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" } }}
                  >
                    {submitting === task.id ? "Saving…" : "Submit"}
                  </Button>
                  {taskEntries[task.id]?.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Last submitted: {new Date(taskEntries[task.id][0].created_at).toLocaleString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <AiAssistant
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        planContext={{ planId: plan.id, status: plan.status }}
      />
    </Box>
  );
}
