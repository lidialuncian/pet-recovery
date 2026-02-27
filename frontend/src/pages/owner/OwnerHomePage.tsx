import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import type { User } from "../../types/user.types";
import OwnerHome from "../../components/home/OwnerHome";

function OwnerHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

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

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Pet Owner Home
        </Typography>
        <Button variant="outlined" onClick={handleLogout} size="small">
          Log out
        </Button>
      </Box>
      <OwnerHome user={user} />
    </Box>
  );
}

export default OwnerHomePage;
