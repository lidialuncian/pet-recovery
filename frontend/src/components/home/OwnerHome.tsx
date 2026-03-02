import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PetsRounded from "@mui/icons-material/PetsRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import AiAssistant from "../assistant/AiAssistant";

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

const cardContentStyle = {
  p: 3,
  position: "relative" as const,
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const actionButtonStyle = {
  borderRadius: 2,
  textTransform: "none" as const,
  fontWeight: 600,
  bgcolor: "#0d9488",
  "&:hover": { bgcolor: "#0f766e" },
};

export default function OwnerHome() {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <Box sx={{ maxWidth: 1200, width: "100%" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 3,
          mb: 5,
        }}
      >
        <Card sx={cardStyle}>
          <CardContent sx={cardContentStyle}>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(13, 148, 136, 0.08)",
                  borderRadius: 2,
                }}
              >
                <PetsRounded sx={{ fontSize: 40, color: "#0d9488" }} />
              </Box>
              <Typography variant="h6" fontWeight={600} color="grey.900" gutterBottom>
                My Pets
              </Typography>
              <Typography variant="body2" color="grey.600">
                View and manage the pets you have added.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
              <Button
                component={RouterLink}
                to="/home/owner/pets"
                variant="contained"
                size="medium"
                startIcon={<PetsRounded />}
                sx={actionButtonStyle}
              >
                View Pets
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={cardStyle}>
          <CardContent sx={cardContentStyle}>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(13, 148, 136, 0.08)",
                  borderRadius: 2,
                }}
              >
                <AssignmentRounded sx={{ fontSize: 40, color: "#0d9488" }} />
              </Box>
              <Typography variant="h6" fontWeight={600} color="grey.900" gutterBottom>
                Care Plans
              </Typography>
              <Typography variant="body2" color="grey.600">
                Track recovery plans and updates.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
              <Button
                component={RouterLink}
                to="/home/owner/plans"
                variant="contained"
                size="medium"
                startIcon={<AssignmentRounded />}
                sx={actionButtonStyle}
              >
                View Plans
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={cardStyle}>
          <CardContent sx={cardContentStyle}>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(13, 148, 136, 0.08)",
                  borderRadius: 2,
                }}
              >
                <SmartToyOutlined sx={{ fontSize: 40, color: "#0d9488" }} />
              </Box>
              <Typography variant="h6" fontWeight={600} color="grey.900" gutterBottom>
                Recovery Assistant
              </Typography>
              <Typography variant="body2" color="grey.600">
                Ask questions about your care plan and pet recovery. Context-aware support; concerns may be escalated to your vet.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
              <Button
                variant="contained"
                size="medium"
                startIcon={<SmartToyOutlined />}
                onClick={() => setAssistantOpen(true)}
                sx={actionButtonStyle}
              >
                Open Assistant
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <AiAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />

      <Box sx={{ textAlign: "left" }}>
        <Typography variant="h6" fontWeight={600} color="grey.900" sx={{ mb: 0.5 }} align="left">
          Recent Updates
        </Typography>
        <Typography variant="body2" color="grey.600" align="left">
          Recent activity and updates related to your pets and care plans will be shown here.
        </Typography>
      </Box>
    </Box>
  );
}
