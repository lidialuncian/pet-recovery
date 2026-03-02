import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";

type HeaderProps = {
  /** Logo link target (default: "/") */
  logoTo?: string;
  /** When set, shows app header: center title + notifications + avatar */
  pageTitle?: string;
  /** User display name for avatar initial (required when pageTitle is set) */
  displayName?: string;
  /** Margin bottom (e.g. signup page uses mb: 3, app layout uses 0) */
  mb?: number;
  /** Prevent header from shrinking in flex layout */
  flexShrink?: number;
};

export default function Header({ logoTo = "/", pageTitle, displayName, mb = 3, flexShrink }: HeaderProps) {
  const isAppHeader = pageTitle != null && displayName != null;

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        ...(flexShrink !== undefined && { flexShrink }),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, sm: 3 },
        py: 1.5,
        mb,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        borderRadius: 2,
        ...(isAppHeader && { zIndex: 10 }),
      }}
    >
      <Link
        component={RouterLink}
        to={logoTo}
        underline="none"
        sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "grey.900" }}
      >
        <Box component="img" src="/pet_recovery_logo.png" alt="Pet Recovery" sx={{ height: 44 }} />
        <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: "-0.02em" }}>
          Pet Recovery
        </Typography>
      </Link>

      {isAppHeader ? (
        <>
          <Typography
            variant="h6"
            fontWeight={600}
            color="grey.800"
            sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
          >
            {pageTitle}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton aria-label="Notifications" size="medium" sx={{ color: "grey.700" }}>
              <NotificationsOutlined />
            </IconButton>
            <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main", fontSize: "1rem" }}>
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </>
      ) : (
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
      )}
    </Box>
  );
}
