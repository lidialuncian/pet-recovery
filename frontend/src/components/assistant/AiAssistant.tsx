import { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Close from "@mui/icons-material/Close";
import SendRounded from "@mui/icons-material/SendRounded";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import { getAssistantMessages, sendAssistantMessage } from "../../api/assistant.api";

const DISCLAIMER =
  "This assistant answers questions about your care plan and pet recovery. It does not provide diagnoses or medication recommendations—always consult your veterinarian for medical advice. Concerns may be escalated to your vet when needed.";

const WELCOME_MESSAGE =
  "Hi! I can help with questions about your pet's care plan and recovery. I don't provide diagnoses or medication advice—please contact your vet for that. What would you like to know?";

const WELCOME_WITH_PLAN =
  "Hi! You're viewing your care plan. I can help with questions about your assigned tasks, recovery steps, or treatment. I don't provide diagnoses or medication advice—please contact your vet for that. What would you like to know?";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type PlanContext = {
  planId: string;
  status: string;
};

type AiAssistantProps = {
  open: boolean;
  onClose: () => void;
  /** When owner is viewing a care plan, pass context so the assistant can reference it */
  planContext?: PlanContext | null;
};

function dtoToMessage(dto: { id: string; role: "user" | "assistant"; text: string; created_at: string }): Message {
  return {
    id: dto.id,
    role: dto.role,
    content: dto.text,
    timestamp: new Date(dto.created_at),
  };
}

export default function AiAssistant({ open, onClose, planContext }: AiAssistantProps) {
  const welcome = planContext ? WELCOME_WITH_PLAN : WELCOME_MESSAGE;
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: "welcome", role: "assistant", content: welcome, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertNotice, setAlertNotice] = useState<{ severity: string; summary: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, messages]);

  const loadHistory = useCallback(async () => {
    if (!planContext?.planId) return;
    try {
      const list = await getAssistantMessages(planContext.planId);
      if (list.length > 0) {
        setMessages(list.map(dtoToMessage));
      } else {
        setMessages([{ id: "welcome", role: "assistant", content: WELCOME_WITH_PLAN, timestamp: new Date() }]);
      }
    } catch {
      setMessages([{ id: "welcome", role: "assistant", content: WELCOME_WITH_PLAN, timestamp: new Date() }]);
    }
  }, [planContext?.planId]);

  useEffect(() => {
    if (open && planContext?.planId) {
      loadHistory();
    } else if (open) {
      setMessages([{ id: "welcome", role: "assistant", content: WELCOME_MESSAGE, timestamp: new Date() }]);
    }
  }, [open, planContext?.planId, loadHistory]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAlertNotice(null);

    if (planContext?.planId) {
      setLoading(true);
      try {
        const result = await sendAssistantMessage(planContext.planId, text);
        const textContent = typeof result?.assistantText === "string" ? result.assistantText : "";
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: textContent || "The assistant didn't return a response. Please try again or contact your clinic.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (result?.alertCreated) setAlertNotice(result.alertCreated);
      } catch (err: unknown) {
        const ax = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
        console.error("[Recovery Assistant] Chat request failed:", ax.response?.status ?? ax.message ?? err);
        const status = ax.response?.status;
        const serverMessage = ax.response?.data?.error;
        let content = "Something went wrong. Please try again or contact your clinic.";
        if (status === 404) content = "Care plan not found or you don't have access. Please refresh the page.";
        else if (status === 429 || status === 503) content = "The assistant is busy. Please try again in a moment.";
        else if (typeof serverMessage === "string" && serverMessage) content = serverMessage;
        setMessages((prev) => [
          ...prev,
          { id: `assistant-${Date.now()}`, role: "assistant", content, timestamp: new Date() },
        ]);
      } finally {
        setLoading(false);
      }
    } else {
      const placeholder: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "I'm here to help with care plan and recovery questions. Open a care plan and use this chat to get answers in context of your pet's plan.",
        timestamp: new Date(),
      };
      setTimeout(() => setMessages((prev) => [...prev, placeholder]), 400);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "85vh",
          minHeight: 400,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          py: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SmartToyOutlined sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            Recovery Assistant
          </Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: "grey.50",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontStyle: "italic" }}>
          {DISCLAIMER}
        </Typography>
      </Box>

      {alertNotice && (
        <Alert severity="info" sx={{ mx: 2, mt: 1 }} onClose={() => setAlertNotice(null)}>
          An alert was sent to your vet. They may follow up with you.
        </Alert>
      )}

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            p: 2,
          }}
        >
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  maxWidth: "85%",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: msg.role === "assistant" ? "primary.main" : "grey.300",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {msg.role === "assistant" ? (
                    <SmartToyOutlined sx={{ color: "white", fontSize: 18 }} />
                  ) : (
                    <PersonOutline sx={{ color: "grey.600", fontSize: 18 }} />
                  )}
                </Box>
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    bgcolor: msg.role === "user" ? "primary.main" : "grey.100",
                    color: msg.role === "user" ? "white" : "text.primary",
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask about your care plan or recovery..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              slotProps={{
                input: {
                  sx: { borderRadius: 2 },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              sx={{
                borderRadius: 2,
                minWidth: 48,
                bgcolor: "#0d9488",
                "&:hover": { bgcolor: "#0f766e" },
              }}
            >
              <SendRounded />
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
