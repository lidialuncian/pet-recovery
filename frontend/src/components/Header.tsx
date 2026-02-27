import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, sm: 3 },
        py: 1.5,
        mb: 3,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        borderRadius: 2,
      }}
    >
      <Link
        component={RouterLink}
        to="/"
        underline="none"
        sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "grey.900" }}
      >
        <Box component="img" src="/pet_recovery_logo.png" alt="Pet Recovery" sx={{ height: 44 }} />
        <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: "-0.02em" }}>
          Pet Recovery
        </Typography>
      </Link>
      <Link
        component={RouterLink}
        to="/login"
        underline="hover"
        sx={{
          color: "grey.700",
          fontWeight: 600,
          fontSize: "0.9375rem",
          "&:hover": { color: "primary.main" },
        }}
      >
        Log In
      </Link>
    </Box>
  );
}
