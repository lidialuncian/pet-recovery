import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Avatar from "@mui/material/Avatar";
import PowerSettingsNewRounded from "@mui/icons-material/PowerSettingsNewRounded";

export type SidebarEntry = {
  to: string;
  icon: React.ReactNode;
  label: string;
};

export type SidebarPrimaryButton = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

type AppSidebarProps = {
  displayName: string;
  entries: SidebarEntry[];
  activePath: string;
  primaryButton?: SidebarPrimaryButton;
  onLogout: () => void;
};

const SIDEBAR_WIDTH = 260;

function NavLink({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      component={RouterLink}
      to={to}
      underline="none"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.25,
        px: 2,
        borderRadius: 2,
        color: active ? "#0d9488" : "grey.700",
        bgcolor: active ? "rgba(13, 148, 136, 0.12)" : "transparent",
        fontWeight: active ? 600 : 500,
        "&:hover": { bgcolor: "rgba(13, 148, 136, 0.08)", color: "#0d9488" },
      }}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function AppSidebar({ displayName, entries, activePath, primaryButton, onLogout }: AppSidebarProps) {
  return (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        minHeight: 0,
        alignSelf: "stretch",
        background: "linear-gradient(180deg, #b8d8ec 0%, #a8cce4 50%, #98c0dc 100%)",
        py: 2,
        px: 2,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 12px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: "1.5rem", mb: 1 }}>
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} color="grey.900">
          Welcome, {displayName}!
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
        {entries.map((entry) => (
          <NavLink
            key={entry.to}
            to={entry.to}
            icon={entry.icon}
            label={entry.label}
            active={activePath === entry.to}
          />
        ))}

        {primaryButton && (
          <Button
            component={RouterLink}
            to={primaryButton.to}
            startIcon={primaryButton.icon}
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              py: 1.25,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#0d9488",
              "&:hover": { bgcolor: "#0f766e" },
            }}
          >
            {primaryButton.label}
          </Button>
        )}
      </Box>

      <Link
        component="button"
        type="button"
        onClick={onLogout}
        underline="none"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 1.25,
          px: 2,
          borderRadius: 2,
          color: "grey.700",
          fontWeight: 500,
          bg: "none",
          border: "none",
          cursor: "pointer",
          font: "inherit",
          width: "100%",
          justifyContent: "flex-start",
          "&:hover": { bgcolor: "rgba(0,0,0,0.06)", color: "grey.900" },
        }}
      >
        <PowerSettingsNewRounded sx={{ fontSize: 22 }} />
        Log Out
      </Link>
    </Box>
  );
}

export { SIDEBAR_WIDTH };
