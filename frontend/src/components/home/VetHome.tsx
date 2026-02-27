import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { User } from "../../types/user.types";

type VetHomeProps = {
  user: User;
};

export default function VetHome({ user }: VetHomeProps) {
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Welcome, Dr. {displayName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Access your clinic dashboard. Manage patients, appointments, and medical records.
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Today&apos;s appointments, patient list, and medical records will appear here.
        </Typography>
      </Box>
    </Box>
  );
}
