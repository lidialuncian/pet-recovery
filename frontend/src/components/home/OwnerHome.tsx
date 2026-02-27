import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { User } from "../../types/user.types";

type OwnerHomeProps = {
  user: User;
};

export default function OwnerHome({ user }: OwnerHomeProps) {
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Welcome, {displayName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your pets and their recovery journey. View appointments, medical history, and care plans.
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Quick actions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your pets, appointments, and care plans will appear here.
        </Typography>
      </Box>
    </Box>
  );
}
