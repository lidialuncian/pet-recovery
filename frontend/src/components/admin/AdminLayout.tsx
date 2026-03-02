import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import HomeRounded from "@mui/icons-material/HomeRounded";
import type { User } from "../../types/user.types";
import AppLayout from "../layout/AppLayout";
import type { SidebarEntry } from "../layout/AppSidebar";

const PAGE_TITLES: Record<string, string> = {
  "/home/admin": "Home",
};

const ADMIN_SIDEBAR_ENTRIES: SidebarEntry[] = [
  { to: "/home/admin", icon: <HomeRounded sx={{ fontSize: 22 }} />, label: "Home" },
];

function AdminLayout() {
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
      if (parsed.role !== "admin") {
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
      homePath="/home/admin"
      pageTitle={pageTitle}
      sidebarEntries={ADMIN_SIDEBAR_ENTRIES}
      activePath={path}
      onLogout={handleLogout}
    >
      <Outlet context={{ user }} />
    </AppLayout>
  );
}

export default AdminLayout;
