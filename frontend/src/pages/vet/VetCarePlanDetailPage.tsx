import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AddRounded from "@mui/icons-material/AddRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import Close from "@mui/icons-material/Close";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import LocalHospitalOutlined from "@mui/icons-material/LocalHospitalOutlined";
import MonitorHeartOutlined from "@mui/icons-material/MonitorHeartOutlined";
import ScaleOutlined from "@mui/icons-material/ScaleOutlined";
import ChecklistRtlOutlined from "@mui/icons-material/ChecklistRtlOutlined";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { getCarePlan, updateCarePlan } from "../../api/carePlan.api";
import { getPlanTasks, addPlanTask, updatePlanTask } from "../../api/carePlanTask.api";
import type { CarePlan } from "../../types/carePlan.types";
import type {
  CarePlanTask,
  CreateCarePlanTask,
  MedicationSchema,
  VitalSchema,
  MeasurementSchema,
} from "../../types/carePlanTask.types";

const TASK_TYPE_OPTIONS: { value: CarePlanTask["task_type"]; label: string; icon: React.ReactNode }[] = [
  { value: "medication", label: "Medication", icon: <LocalHospitalOutlined fontSize="small" /> },
  { value: "vital", label: "Vital", icon: <MonitorHeartOutlined fontSize="small" /> },
  { value: "measurement", label: "Measurement", icon: <ScaleOutlined fontSize="small" /> },
  { value: "symptom_check", label: "Symptom check", icon: <ChecklistRtlOutlined fontSize="small" /> },
  { value: "boolean", label: "Yes/No", icon: null },
  { value: "number", label: "Number", icon: null },
  { value: "scale", label: "Scale", icon: null },
  { value: "text", label: "Text", icon: null },
  { value: "photo", label: "Photo", icon: null },
];

const statusLabels: Record<string, string> = {
  draft: "Draft",
  in_clinic: "In clinic",
  at_home: "At home",
  follow_up: "Follow-up",
  closed: "Closed",
};

function getTaskTypeDisplay(type: string): { label: string; icon: React.ReactNode } {
  const opt = TASK_TYPE_OPTIONS.find((o) => o.value === type);
  return {
    label: opt?.label ?? type,
    icon: opt?.icon ?? null,
  };
}

function getTaskSummary(task: CarePlanTask): string {
  const parts: string[] = [];
  if (task.schedule_time) parts.push(task.schedule_time);
  parts.push(task.frequency);
  const schema = task.value_schema as Record<string, unknown> | undefined;
  if (schema?.unit) parts.push(String(schema.unit));
  if (schema?.route) parts.push(String(schema.route));
  if (task.description) parts.push(task.description);
  return parts.join(" · ");
}

export default function VetCarePlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<CarePlan | null>(null);
  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newTaskType, setNewTaskType] = useState<CreateCarePlanTask["task_type"]>("medication");
  const [newTaskFreq, setNewTaskFreq] = useState<CreateCarePlanTask["frequency"]>("daily");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskScheduleTime, setNewTaskScheduleTime] = useState("");
  const [newTaskRequired, setNewTaskRequired] = useState(true);
  const [newTaskInstructions, setNewTaskInstructions] = useState("");
  const [newTaskMedName, setNewTaskMedName] = useState("");
  const [newTaskMedDose, setNewTaskMedDose] = useState("");
  const [newTaskMedUnit, setNewTaskMedUnit] = useState("");
  const [newTaskMedRoute, setNewTaskMedRoute] = useState("");
  const [newTaskValueType, setNewTaskValueType] = useState<"number" | "text">("number");
  const [newTaskUnit, setNewTaskUnit] = useState("");
  const [newTaskFields, setNewTaskFields] = useState<string[]>([""]);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editPlanTitle, setEditPlanTitle] = useState("");
  const [editPlanDescription, setEditPlanDescription] = useState("");
  const [editPlanStatus, setEditPlanStatus] = useState<CarePlan["status"]>("draft");
  const [editPlanStartDate, setEditPlanStartDate] = useState<Dayjs | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [editPlanError, setEditPlanError] = useState<string | null>(null);

  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editTask, setEditTask] = useState<CarePlanTask | null>(null);
  const [editTaskLabel, setEditTaskLabel] = useState("");
  const [editTaskType, setEditTaskType] = useState<CarePlanTask["task_type"]>("boolean");
  const [editTaskFreq, setEditTaskFreq] = useState<CarePlanTask["frequency"]>("daily");
  const [editTaskRequired, setEditTaskRequired] = useState(false);
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskScheduleTime, setEditTaskScheduleTime] = useState("");
  const [editTaskDueWindowMinutes, setEditTaskDueWindowMinutes] = useState<number | "">("");
  const [editTaskStatus, setEditTaskStatus] = useState<CarePlanTask["status"]>("active");
  const [savingTask, setSavingTask] = useState(false);
  const [editTaskError, setEditTaskError] = useState<string | null>(null);
  const [closingPlan, setClosingPlan] = useState(false);

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

  const buildValueSchema = (): Record<string, unknown> | null => {
    switch (newTaskType) {
      case "medication": {
        const s: MedicationSchema = {};
        if (newTaskInstructions.trim()) s.instructions = newTaskInstructions.trim();
        if (newTaskMedName.trim()) s.name = newTaskMedName.trim();
        if (newTaskMedDose.trim()) s.dose = newTaskMedDose.trim();
        if (newTaskMedUnit.trim()) s.unit = newTaskMedUnit.trim();
        if (newTaskMedRoute.trim()) s.route = newTaskMedRoute.trim();
        return Object.keys(s).length ? s : null;
      }
      case "vital": {
        const s: VitalSchema = { value_type: newTaskValueType };
        if (newTaskUnit.trim()) s.unit = newTaskUnit.trim();
        return s;
      }
      case "measurement": {
        const s: MeasurementSchema = { value_type: newTaskValueType };
        if (newTaskUnit.trim()) s.unit = newTaskUnit.trim();
        return s;
      }
      case "symptom_check": {
        const fields = newTaskFields.filter((f) => f.trim());
        return fields.length ? { fields } : null;
      }
      default:
        return null;
    }
  };

  const handleOpenCreateTask = () => {
    setNewTaskLabel("");
    setNewTaskType("medication");
    setNewTaskFreq("daily");
    setNewTaskDescription("");
    setNewTaskScheduleTime("");
    setNewTaskRequired(true);
    setNewTaskInstructions("");
    setNewTaskMedName("");
    setNewTaskMedDose("");
    setNewTaskMedUnit("");
    setNewTaskMedRoute("");
    setNewTaskValueType("number");
    setNewTaskUnit("");
    setNewTaskFields([""]);
    setAddError(null);
    setCreateTaskOpen(true);
  };

  const handleCreateTaskSubmit = async () => {
    if (!planId || !newTaskLabel.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      await addPlanTask(planId, {
        task_type: newTaskType,
        label: newTaskLabel.trim(),
        is_required: newTaskRequired,
        frequency: newTaskFreq,
        sort_order: tasks.length + 1,
        description: newTaskDescription.trim() || null,
        schedule_time: newTaskScheduleTime || null,
        status: "active",
        value_schema: buildValueSchema(),
      });
      setCreateTaskOpen(false);
      fetchPlanAndTasks();
    } catch (err: unknown) {
      setAddError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to create task");
    } finally {
      setAdding(false);
    }
  };

  const addSymptomField = () => setNewTaskFields((prev) => [...prev, ""]);
  const setSymptomFieldAt = (i: number, v: string) =>
    setNewTaskFields((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  const removeSymptomField = (i: number) =>
    setNewTaskFields((prev) => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : [""]);

  const handleOpenEditPlan = () => {
    if (!plan) return;
    setEditPlanTitle(plan.title ?? "");
    setEditPlanDescription(plan.description ?? "");
    setEditPlanStatus(plan.status);
    setEditPlanStartDate(plan.start_date ? dayjs(plan.start_date) : null);
    setEditPlanError(null);
    setEditPlanOpen(true);
  };

  const handleSaveEditPlan = async () => {
    if (!planId) return;
    setSavingPlan(true);
    setEditPlanError(null);
    try {
      const updated = await updateCarePlan(planId, {
        title: editPlanTitle.trim() || null,
        description: editPlanDescription.trim() || null,
        status: editPlanStatus,
        start_date: editPlanStartDate ? editPlanStartDate.format("YYYY-MM-DD") : null,
      });
      setPlan(updated);
      setEditPlanOpen(false);
    } catch (err: unknown) {
      setEditPlanError((err as Error)?.message ?? "Failed to update plan");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleOpenEditTask = (task: CarePlanTask) => {
    setEditTask(task);
    setEditTaskLabel(task.label);
    setEditTaskType(task.task_type);
    setEditTaskFreq(task.frequency);
    setEditTaskRequired(task.is_required);
    setEditTaskDescription(task.description ?? "");
    setEditTaskScheduleTime(task.schedule_time ?? "");
    setEditTaskDueWindowMinutes(task.due_window_minutes ?? "");
    setEditTaskStatus((task.status ?? "active") as CarePlanTask["status"]);
    setEditTaskError(null);
    setEditTaskOpen(true);
  };

  const handleSaveEditTask = async () => {
    if (!planId || !editTask) return;
    setSavingTask(true);
    setEditTaskError(null);
    try {
      await updatePlanTask(planId, editTask.id, {
        label: editTaskLabel.trim(),
        task_type: editTaskType,
        frequency: editTaskFreq,
        is_required: editTaskRequired,
        description: editTaskDescription.trim() || null,
        schedule_time: editTaskScheduleTime || null,
        due_window_minutes: editTaskDueWindowMinutes === "" ? null : Number(editTaskDueWindowMinutes),
        status: editTaskStatus,
      });
      setEditTaskOpen(false);
      setEditTask(null);
      fetchPlanAndTasks();
    } catch (err: unknown) {
      setEditTaskError((err as Error)?.message ?? "Failed to update task");
    } finally {
      setSavingTask(false);
    }
  };

  const handleClosePlan = async () => {
    if (!planId || !plan || plan.status === "closed") return;
    setClosingPlan(true);
    try {
      const updated = await updateCarePlan(planId, {
        status: "closed",
        closed_at: new Date().toISOString(),
      });
      setPlan(updated);
    } catch (err: unknown) {
      console.error("Failed to close plan", err);
    } finally {
      setClosingPlan(false);
    }
  };

  const isPlanClosed = plan?.status === "closed";

  if (!planId) {
    return (
      <Box>
        <Typography color="error">Missing plan ID.</Typography>
        <Button onClick={() => navigate("/home/vet/plans")} sx={{ mt: 1 }}>Back to Care Plans</Button>
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
        <Button onClick={() => navigate("/home/vet/plans")} sx={{ mt: 1 }}>Back to Care Plans</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, width: "100%" }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/home/vet/plans")}
        sx={{ mb: 2, textTransform: "none" }}
      >
        Back to Care Plans
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AssignmentRounded sx={{ color: "#0d9488", fontSize: 32 }} />
          <Typography variant="h6" fontWeight={600}>
            {plan.title ?? "Care plan"}
          </Typography>
        </Box>
        {!isPlanClosed && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditRounded />}
              onClick={handleOpenEditPlan}
              sx={{ borderRadius: 2, textTransform: "none", borderColor: "#0d9488", color: "#0d9488" }}
            >
              Edit plan
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={handleClosePlan}
              disabled={closingPlan}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              {closingPlan ? "Closing…" : "Close plan"}
            </Button>
          </Box>
        )}
      </Box>
      {plan.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, whiteSpace: "pre-wrap" }}>
          {plan.description}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Pet ID: {plan.pet_id} · Status: {statusLabels[plan.status] ?? plan.status} · Started: {plan.start_date ?? "—"}
      </Typography>

      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
        Recurrent tasks
      </Typography>
      {!isPlanClosed && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={handleOpenCreateTask}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" } }}
          >
            Create Task
          </Button>
        </Box>
      )}

      {tasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No tasks yet. Create one to get started.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {tasks.map((task) => {
            const typeDisplay = getTaskTypeDisplay(task.task_type);
            const summary = getTaskSummary(task);
            return (
              <Card key={task.id} sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                <CardContent
                  sx={{
                    py: 1.5,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "#0d9488",
                        flexShrink: 0,
                      }}
                    >
                      {typeDisplay.icon}
                      <Typography variant="caption" fontWeight={600} sx={{ textTransform: "uppercase", color: "text.secondary" }}>
                        {typeDisplay.label}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {task.label}
                      </Typography>
                      {summary && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                          {summary}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {!isPlanClosed && (
                    <IconButton
                      size="small"
                      aria-label="Edit task"
                      onClick={() => handleOpenEditTask(task)}
                      sx={{ color: "#0d9488", flexShrink: 0 }}
                    >
                      <EditRounded fontSize="small" />
                    </IconButton>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Dialog open={createTaskOpen} onClose={() => !adding && setCreateTaskOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Create Task
          </Typography>
          <IconButton aria-label="Close" onClick={() => setCreateTaskOpen(false)} disabled={adding} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a task for the owner to complete. Fill in the details below.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Title"
              placeholder="Enter task title"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={newTaskType}
                label="Type"
                onChange={(e) => setNewTaskType(e.target.value as CreateCarePlanTask["task_type"])}
                sx={{ borderRadius: 2 }}
              >
                {TASK_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {opt.icon}
                      {opt.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Notes (optional)"
              placeholder="Enter any additional notes (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              multiline
              minRows={2}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={newTaskFreq}
                  label="Frequency"
                  onChange={(e) => setNewTaskFreq(e.target.value as CreateCarePlanTask["frequency"])}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="once">Once</MenuItem>
                  <MenuItem value="as_needed">As needed</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Time"
                type="time"
                value={newTaskScheduleTime}
                onChange={(e) => setNewTaskScheduleTime(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: 2 } } }}
                sx={{ width: 140 }}
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox checked={newTaskRequired} onChange={(e) => setNewTaskRequired(e.target.checked)} size="small" />
              }
              label="Required"
            />
            {newTaskType === "medication" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0.5 }}>
                <Typography variant="subtitle2" color="text.secondary">Medication details</Typography>
                <TextField
                  size="small"
                  label="Instructions"
                  placeholder="e.g. Administer subcutaneous injection at 4:00 PM. Rotate sites."
                  value={newTaskInstructions}
                  onChange={(e) => setNewTaskInstructions(e.target.value)}
                  multiline
                  minRows={2}
                  slotProps={{ input: { sx: { borderRadius: 2 } } }}
                  fullWidth
                />
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <TextField size="small" label="Name" placeholder="e.g. GS-441524" value={newTaskMedName} onChange={(e) => setNewTaskMedName(e.target.value)} slotProps={{ input: { sx: { borderRadius: 2 } } }} sx={{ flex: 1, minWidth: 120 }} />
                  <TextField size="small" label="Dose" placeholder="e.g. Based on weight" value={newTaskMedDose} onChange={(e) => setNewTaskMedDose(e.target.value)} slotProps={{ input: { sx: { borderRadius: 2 } } }} sx={{ flex: 1, minWidth: 120 }} />
                  <TextField size="small" label="Unit" placeholder="e.g. mg/kg" value={newTaskMedUnit} onChange={(e) => setNewTaskMedUnit(e.target.value)} slotProps={{ input: { sx: { borderRadius: 2 } } }} sx={{ width: 100 }} />
                  <TextField size="small" label="Route" placeholder="e.g. Subcutaneous" value={newTaskMedRoute} onChange={(e) => setNewTaskMedRoute(e.target.value)} slotProps={{ input: { sx: { borderRadius: 2 } } }} sx={{ flex: 1, minWidth: 120 }} />
                </Box>
              </Box>
            )}
            {(newTaskType === "vital" || newTaskType === "measurement") && (
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Value type</InputLabel>
                  <Select
                    value={newTaskValueType}
                    label="Value type"
                    onChange={(e) => setNewTaskValueType(e.target.value as "number" | "text")}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="text">Text</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Unit"
                  placeholder="e.g. °C, kg"
                  value={newTaskUnit}
                  onChange={(e) => setNewTaskUnit(e.target.value)}
                  slotProps={{ input: { sx: { borderRadius: 2 } } }}
                  sx={{ width: 100 }}
                />
              </Box>
            )}
            {newTaskType === "symptom_check" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Observation fields (one per line)</Typography>
                {newTaskFields.map((field, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="e.g. Appetite (normal/reduced/none)"
                      value={field}
                      onChange={(e) => setSymptomFieldAt(i, e.target.value)}
                      slotProps={{ input: { sx: { borderRadius: 2 } } }}
                    />
                    <IconButton size="small" onClick={() => removeSymptomField(i)} aria-label="Remove field">
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button size="small" onClick={addSymptomField} sx={{ alignSelf: "flex-start", textTransform: "none" }}>
                  + Add field
                </Button>
              </Box>
            )}
            {addError && <Typography variant="body2" color="error">{addError}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button onClick={() => setCreateTaskOpen(false)} disabled={adding} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTaskSubmit}
            disabled={adding || !newTaskLabel.trim()}
            endIcon={<ArrowForward />}
            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" } }}
          >
            {adding ? "Creating…" : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editPlanOpen} onClose={() => !savingPlan && setEditPlanOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5 }}>
          <span>Edit care plan</span>
          <IconButton aria-label="Close" onClick={() => setEditPlanOpen(false)} disabled={savingPlan} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
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
          {editPlanError && <Typography variant="body2" color="error">{editPlanError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPlanOpen(false)} disabled={savingPlan}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEditPlan} disabled={savingPlan} sx={{ bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" } }}>
            {savingPlan ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editTaskOpen} onClose={() => !savingTask && setEditTaskOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Edit task
          </Typography>
          <IconButton aria-label="Close" onClick={() => setEditTaskOpen(false)} disabled={savingTask} size="small">
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
            label="Label"
            value={editTaskLabel}
            onChange={(e) => setEditTaskLabel(e.target.value)}
            slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
          <TextField
            fullWidth
            size="small"
            label="Description"
            placeholder="Optional"
            value={editTaskDescription}
            onChange={(e) => setEditTaskDescription(e.target.value)}
            multiline
            minRows={1}
            slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              size="small"
              label="Schedule time"
              type="time"
              value={editTaskScheduleTime}
              onChange={(e) => setEditTaskScheduleTime(e.target.value)}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
              sx={{ minWidth: 140 }}
            />
            <TextField
              size="small"
              label="Due window (min)"
              type="number"
              value={editTaskDueWindowMinutes}
              onChange={(e) => setEditTaskDueWindowMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              slotProps={{ input: { sx: { borderRadius: 2 }, inputProps: { min: 0 } } }}
              sx={{ minWidth: 120 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editTaskStatus}
                label="Status"
                onChange={(e) => setEditTaskStatus(e.target.value as CarePlanTask["status"])}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={editTaskType}
              label="Type"
              onChange={(e) => setEditTaskType(e.target.value as CarePlanTask["task_type"])}
              sx={{ borderRadius: 2 }}
            >
              {TASK_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {opt.icon}
                    {opt.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Frequency</InputLabel>
            <Select
              value={editTaskFreq}
              label="Frequency"
              onChange={(e) => setEditTaskFreq(e.target.value as CarePlanTask["frequency"])}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="once">Once</MenuItem>
              <MenuItem value="as_needed">As needed</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={editTaskRequired}
                onChange={(e) => setEditTaskRequired(e.target.checked)}
                size="small"
              />
            }
            label="Required"
          />
          {editTaskError && <Typography variant="body2" color="error">{editTaskError}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button onClick={() => setEditTaskOpen(false)} disabled={savingTask} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEditTask}
            disabled={savingTask || !editTaskLabel.trim()}
            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" } }}
          >
            {savingTask ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
