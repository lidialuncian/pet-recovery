import axiosClient from "./axiosClient";

export type AssistantMessageDto = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sender_role: string;
  created_at: string;
};

export type ChatResponse = {
  assistantText: string;
  alertCreated?: { severity: string; summary: string };
};

export async function getAssistantMessages(planId: string): Promise<AssistantMessageDto[]> {
  const res = await axiosClient.get<AssistantMessageDto[]>(`/care-plans/${planId}/assistant/messages`);
  return res.data;
}

export async function sendAssistantMessage(planId: string, text: string): Promise<ChatResponse> {
  const res = await axiosClient.post<ChatResponse>(`/care-plans/${planId}/assistant/chat`, { text });
  return res.data;
}
