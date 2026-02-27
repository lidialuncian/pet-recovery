import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types/user.types";

/**
 * Redirects to the role-specific home page. Used for /home route.
 */
function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const user: User = JSON.parse(stored);
      navigate(`/home/${user.role}`, { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null;
}

export default HomePage;
