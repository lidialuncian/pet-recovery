import { useOutletContext } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PetsRounded from "@mui/icons-material/PetsRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import type { User } from "../../types/user.types";

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

type VetOutletContext = { user: User };

type VetHomeProps = { user?: User };

export default function VetHome(props?: VetHomeProps) {
  const context = useOutletContext<VetOutletContext | undefined>();
  const user = props?.user ?? context?.user;
  const displayName = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email : "";

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 1200, width: "100%" }}>
      <Typography variant="h5" fontWeight={600} color="grey.900" sx={{ mb: 1 }}>
        Welcome, Dr. {displayName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your clinic patients and care plans.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(2, 1fr)" },
          gap: 3,
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
                Patients
              </Typography>
              <Typography variant="body2" color="grey.600">
                View pets registered at your clinic.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
              <Button
                component={RouterLink}
                to="/home/vet/patients"
                variant="contained"
                size="medium"
                startIcon={<PetsRounded />}
                sx={actionButtonStyle}
              >
                View Patients
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
                Create and manage recovery care plans for patients.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
              <Button
                component={RouterLink}
                to="/home/vet/plans"
                variant="contained"
                size="medium"
                startIcon={<AssignmentRounded />}
                sx={actionButtonStyle}
              >
                View Care Plans
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
