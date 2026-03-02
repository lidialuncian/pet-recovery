import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Close from "@mui/icons-material/Close";
import SendRounded from "@mui/icons-material/SendRounded";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";

const DISCLAIMER =
  "This assistant answers questions about your care plan and pet recovery. It does not provide diagnoses or medication recommendations—always consult your veterinarian for medical advice. Concerns may be escalated to your vet when needed.";

const WELCOME_MESSAGE =
  "Hi! I can help with questions about your pet's care plan and recovery. I don't provide diagnoses or medication advice—please contact your vet for that. What would you like to know?";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type AiAssistantProps = {
  open: boolean;
  onClose: () => void;
};

export default function AiAssistant({ open, onClose }: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, messages]);

  const handleSend = () => {
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

    // Placeholder response until backend is connected. No diagnostics or medication advice.
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content:
        "I'm here to help with care plan and recovery questions. For anything that sounds urgent or medical, our system may share it with your vet so they can follow up. Is there something specific about your pet's care plan or daily tasks you'd like to know more about?",
      timestamp: new Date(),
    };
    setTimeout(() => setMessages((prev) => [...prev, assistantMessage]), 600);
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
              disabled={!input.trim()}
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
