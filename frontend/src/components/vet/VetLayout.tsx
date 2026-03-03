import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import HomeRounded from "@mui/icons-material/HomeRounded";
import PetsRounded from "@mui/icons-material/PetsRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import type { User } from "../../types/user.types";
import AppLayout from "../layout/AppLayout";
import type { SidebarEntry } from "../layout/AppSidebar";

const PAGE_TITLES: Record<string, string> = {
  "/home/vet": "Home",
  "/home/vet/patients": "Patients",
  "/home/vet/plans": "Care Plans",
};

const VET_SIDEBAR_ENTRIES: SidebarEntry[] = [
  { to: "/home/vet", icon: <HomeRounded sx={{ fontSize: 22 }} />, label: "Home" },
  { to: "/home/vet/patients", icon: <PetsRounded sx={{ fontSize: 22 }} />, label: "Patients" },
  { to: "/home/vet/plans", icon: <AssignmentRounded sx={{ fontSize: 22 }} />, label: "Care Plans" },
];

function VetLayout() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
      if (parsed.role !== "vet") {
        navigate(`/home/${parsed.role}`, { replace: true });
      }
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  const displayName = user.first_name || user.email?.split("@")[0] || "User";
  const path = location.pathname;
  const pageTitle = PAGE_TITLES[path] ?? (path.startsWith("/home/vet/plans/") && path !== "/home/vet/plans" ? "Plan tasks" : "Home");

  return (
    <AppLayout
      displayName={displayName}
      homePath="/home/vet"
      pageTitle={pageTitle}
      sidebarEntries={VET_SIDEBAR_ENTRIES}
      activePath={path}
      onLogout={handleLogout}
    >
      <Outlet context={{ user }} />
    </AppLayout>
  );
}

export default VetLayout;
