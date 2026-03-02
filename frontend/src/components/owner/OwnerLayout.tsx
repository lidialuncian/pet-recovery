import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import HomeRounded from "@mui/icons-material/HomeRounded";
import PetsRounded from "@mui/icons-material/PetsRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import type { User } from "../../types/user.types";
import AppLayout from "../layout/AppLayout";
import type { SidebarEntry } from "../layout/AppSidebar";

const PAGE_TITLES: Record<string, string> = {
  "/home/owner": "Home",
  "/home/owner/pets": "My Pets",
  "/home/owner/plans": "Care Plans",
  "/home/owner/add-pet": "Add a Pet",
};

const OWNER_SIDEBAR_ENTRIES: SidebarEntry[] = [
  { to: "/home/owner", icon: <HomeRounded sx={{ fontSize: 22 }} />, label: "Home" },
  { to: "/home/owner/pets", icon: <PetsRounded sx={{ fontSize: 22 }} />, label: "My Pets" },
  { to: "/home/owner/plans", icon: <AssignmentRounded sx={{ fontSize: 22 }} />, label: "Care Plans" },
];

function OwnerLayout() {
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
      if (parsed.role !== "owner") {
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
  const pageTitle = PAGE_TITLES[path] ?? "Home";

  return (
    <AppLayout
      displayName={displayName}
      homePath="/home/owner"
      pageTitle={pageTitle}
      sidebarEntries={OWNER_SIDEBAR_ENTRIES}
      activePath={path}
      onLogout={handleLogout}
      mainBackgroundImage="/pet_recovery_owner_home_background.svg"
    >
      <Outlet context={{ user }} />
    </AppLayout>
  );
}

export default OwnerLayout;
