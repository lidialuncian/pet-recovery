import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { supabase } from "../lib/supabase";
import { CarePlanService } from "./carePlan.service";

const carePlanService = new CarePlanService();

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[Assistant] OPENAI_API_KEY is not set. Add it to your .env to enable AI replies.");
    return null;
  }
  return new OpenAI({ apiKey });
}

const ALERT_REGEX = /\[ALERT\]([\s\S]*?)\[\/ALERT\]/;

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sender_role: string;
  created_at: string;
};

export type ChatResult = {
  assistantText: string;
  alertCreated?: { severity: string; summary: string };
};

function loadAssistantPrompt(): string {
  const filePath = path.join(__dirname, "..", "prompts", "assistant.md");
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (e) {
    console.error("Failed to load assistant.md:", e);
    return "You are a Pet Recovery Assistant. You support pet owners during a care plan. You do NOT provide diagnoses. Encourage contacting the vet when needed. If the owner reports alarming symptoms, tell them to contact the clinic and create an alert.";
  }
}

function formatTaskForContext(task: { label: string; frequency: string; schedule_time: string | null; description: string | null; value_schema: Record<string, unknown> | null }): string {
  const parts = [`• ${task.label} (${task.frequency}${task.schedule_time ? ` at ${task.schedule_time}` : ""})`];
  if (task.description?.trim()) parts.push(`  Description: ${task.description.trim()}`);
  const schema = task.value_schema && typeof task.value_schema === "object" ? task.value_schema : {};
  const schemaKeys = Object.keys(schema).filter((k) => schema[k] != null && schema[k] !== "");
  if (schemaKeys.length > 0) {
    const schemaStr = schemaKeys.map((k) => `${k}: ${String(schema[k])}`).join(", ");
    parts.push(`  Task data (use for calculations when relevant): ${schemaStr}`);
  }
  return parts.join("\n");
}

function buildPlanContextBlock(params: {
  carePlanId: string;
  petName: string;
  petSpecies: string;
  petAge: string;
  petWeight: string;
  clinicName: string;
  clinicContact: string;
  vetName: string;
  planTitle: string;
  startDate: string;
  status: string;
  tasksDetail: string;
  recentSummary?: string;
}): string {
  return `
## Plan-Specific Context (Injected at runtime)
- CARE_PLAN_ID (use this exact value in any [ALERT] block): ${params.carePlanId}
- Pet: ${params.petName}, species=${params.petSpecies}, age=${params.petAge}, weight=${params.petWeight}
- Clinic: ${params.clinicName}, clinic contact=${params.clinicContact}
- Assigned vet: ${params.vetName}
- Care plan: ${params.planTitle}
- Start date: ${params.startDate}
- Status: ${params.status}
- Tasks (with descriptions and task data for calculations; you may use pet weight and task data like dose per kg to compute amounts, but always advise the owner to confirm with their vet):
${params.tasksDetail}
${params.recentSummary ? `- Recent entries: ${params.recentSummary}` : ""}
`;
}

function parseAlertBlock(content: string): { cleanText: string; alert: { care_plan_id: string; severity: string; summary: string; evidence: string; recommended_action: string } | null } {
  const match = content.match(ALERT_REGEX);
  if (!match) return { cleanText: content.trim(), alert: null };
  const block = match[1];
  const cleanText = content.replace(ALERT_REGEX, "").trim();
  const care_plan_id = block.match(/care_plan_id:\s*(.+)/)?.[1]?.trim() ?? "";
  const severity = (block.match(/severity:\s*(CRITICAL|URGENT|MONITOR)/i)?.[1] ?? "MONITOR").toUpperCase();
  const summary = block.match(/summary:\s*(.+?)(?=\n|$)/s)?.[1]?.trim() ?? "Owner message triggered escalation";
  const evidence = block.match(/evidence:\s*(.+?)(?=\n|$)/s)?.[1]?.trim() ?? "";
  const recommended_action = block.match(/recommended_action:\s*(.+?)(?=\n|$)/s)?.[1]?.trim() ?? "Contact clinic now";
  if (!care_plan_id) return { cleanText, alert: null };
  return {
    cleanText,
    alert: { care_plan_id, severity, summary, evidence, recommended_action },
  };
}

export async function getPlanContextForAssistant(planId: string, ownerUserId: string): Promise<{
  systemPrompt: string;
  planContextText: string;
} | null> {
  const plan = await carePlanService.getPlanById(planId, ownerUserId, "owner");
  if (!plan) return null;

  const [petRes, clinicRes, vetRes, tasks] = await Promise.all([
    supabase.from("pets").select("name, species, date_of_birth, weight_baseline").eq("id", plan.pet_id).single(),
    supabase.from("clinics").select("name, contact_email, phone").eq("id", plan.clinic_id).single(),
    supabase.from("users").select("first_name, last_name, email").eq("id", plan.assigned_vet_user_id).single(),
    carePlanService.getTasksForPlan(planId),
  ]);

  const pet = petRes.data as { name: string; species: string; date_of_birth: string | null; weight_baseline: number | null } | null;
  const clinic = clinicRes.data as { name: string; contact_email: string | null; phone: string | null } | null;
  const vet = vetRes.data as { first_name: string | null; last_name: string | null; email: string } | null;

  const petName = pet?.name ?? "Pet";
  const petSpecies = pet?.species ?? "cat";
  const petAge = pet?.date_of_birth ? `${pet.date_of_birth}` : "unknown";
  const petWeight = pet?.weight_baseline != null ? `${pet.weight_baseline} kg` : "unknown";
  const clinicName = clinic?.name ?? "Clinic";
  const clinicContact = [clinic?.contact_email, clinic?.phone].filter(Boolean).join(", ") || "See clinic";
  const vetName = vet ? [vet.first_name, vet.last_name].filter(Boolean).join(" ") || vet.email : "Vet";
  const tasksDetail =
    tasks.length > 0
      ? tasks.map((t) => formatTaskForContext({
          label: t.label,
          frequency: t.frequency,
          schedule_time: t.schedule_time,
          description: t.description,
          value_schema: t.value_schema,
        })).join("\n")
      : "No tasks configured.";

  const planContextText = buildPlanContextBlock({
    carePlanId: planId,
    petName,
    petSpecies,
    petAge,
    petWeight,
    clinicName,
    clinicContact,
    vetName,
    planTitle: (plan as { title?: string | null }).title ?? "Care plan",
    startDate: plan.start_date ?? "—",
    status: plan.status,
    tasksDetail,
  });

  const promptBase = loadAssistantPrompt();
  const systemPrompt = promptBase + "\n" + planContextText;
  return { systemPrompt, planContextText };
}

export async function getAssistantMessages(planId: string, ownerUserId: string): Promise<AssistantMessage[]> {
  const plan = await carePlanService.getPlanById(planId, ownerUserId, "owner");
  if (!plan) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("id, text, sender_role, created_at")
    .eq("care_plan_id", planId)
    .eq("channel", "assistant")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching assistant messages:", error);
    return [];
  }

  return (data ?? []).map((row: { id: string; text: string; sender_role: string; created_at: string }) => ({
    id: row.id,
    role: row.sender_role === "bot" ? "assistant" : "user",
    text: row.text,
    sender_role: row.sender_role,
    created_at: row.created_at,
  })) as AssistantMessage[];
}

export async function chat(planId: string, ownerUserId: string, userText: string): Promise<ChatResult | null> {
  const plan = await carePlanService.getPlanById(planId, ownerUserId, "owner");
  if (!plan) return null;

  const ctx = await getPlanContextForAssistant(planId, ownerUserId);
  if (!ctx) return null;

  const existingRows = await getAssistantMessages(planId, ownerUserId);
  const openaiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: ctx.systemPrompt },
    ...existingRows.map((m) => ({ role: m.role as "user" | "assistant", content: m.text })),
    { role: "user", content: userText },
  ];

  const { data: userMsg, error: insertUserErr } = await supabase
    .from("messages")
    .insert({
      care_plan_id: planId,
      sender_user_id: ownerUserId,
      sender_role: "owner",
      text: userText,
      channel: "assistant",
    })
    .select("id")
    .single();

  if (insertUserErr) {
    console.error("Error saving user message:", insertUserErr);
    return null;
  }

  let assistantText = "I'm sorry, I couldn't process that. Please try again or contact your clinic.";
  let alertCreated: { severity: string; summary: string } | undefined;

  const openai = getOpenAI();
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: openaiMessages,
        max_tokens: 1024,
      });
      const rawContent = completion.choices[0]?.message?.content ?? "";
      const { cleanText, alert } = parseAlertBlock(rawContent);
      assistantText = cleanText || assistantText;

      if (alert) {
        const { error: alertErr } = await supabase.from("alerts").insert({
          care_plan_id: planId,
          message_id: userMsg?.id ?? null,
          severity: alert.severity.toLowerCase(),
          trigger_type: "assistant",
          status: "new",
          summary: alert.summary,
        });
        if (alertErr) console.error("Error creating alert:", alertErr);
        else alertCreated = { severity: alert.severity, summary: alert.summary };
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("OpenAI error:", err.message, err);
      const code = (e as { code?: string; status?: number })?.code ?? (e as { error?: { code?: string } })?.error?.code;
      const status = (e as { status?: number })?.status;
      if (code === "insufficient_quota" || status === 429) {
        assistantText =
          "The assistant is temporarily unavailable (API quota reached). Please try again later or contact your clinic directly with your questions.";
      } else {
        assistantText =
          "The assistant is temporarily unavailable. Please try again in a moment or contact your clinic if you need help right away.";
      }
    }
  }

  await supabase.from("messages").insert({
    care_plan_id: planId,
    sender_user_id: null,
    sender_role: "bot",
    text: assistantText,
    channel: "assistant",
  });

  return { assistantText, alertCreated };
}
