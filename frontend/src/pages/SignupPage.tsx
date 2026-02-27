import { useCallback, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Header from "../components/Header";
import UserForm from "../components/UserForm";
import { createUser, login } from "../services/user.service";
import type { CreateUser, SignupRole } from "../types/user.types";

const ROLES: { id: SignupRole; label: string; image: string }[] = [
  { id: "vet", label: "I am a Veterinarian", image: "/role_veterinarian.svg" },
  { id: "owner", label: "I am a Pet Owner", image: "/role_owner.svg" },
  { id: "admin", label: "I am a Clinic Admin", image: "/role_clinic_admin.svg" },
];

function SignupPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (roleId: SignupRole) => {
    setSelectedRole(roleId);
    setModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    if (!isSubmitting) setModalOpen(false);
  }, [isSubmitting]);

  const handleUserSubmit = useCallback(async (user: CreateUser) => {
    setIsSubmitting(true);
    try {
      await createUser(user);
      const { token, user: loggedInUser } = await login({ email: user.email, password: user.password });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setModalOpen(false);
      navigate(`/home/${loggedInUser.role}`, { replace: true });
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate]);

  const handleLoginClick = useCallback(() => {
    setModalOpen(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        background: "linear-gradient(180deg, #e8f4fc 0%, #d4e9f7 35%, #c5e0f2 70%, #b8d8ec 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 2, sm: 3 },
      }}
    >
      <Header />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography variant="h3" fontWeight={700} color="grey.900" sx={{ mt: 10, mb: 10, textAlign: "center" }}>
          Sign Up
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
            gap: 3,
            mb: 3,
            width: "100%",
            maxWidth: 1200,
          }}
        >
          {ROLES.map((role) => (
            <Card
              key={role.id}
              component={Button}
              onClick={() => handleRoleSelect(role.id)}
              variant="outlined"
              sx={{
                width: 300,
                minHeight: 400,
                p: 0,
                textAlign: "center",
                textTransform: "none",
                borderWidth: 2,
                borderColor: "transparent",
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                  borderColor: "primary.main",
                },
              }}
            >
              <CardContent sx={{ width: "100%", "&:last-child": { pb: 2 } }}>
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "1",
                    maxHeight: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                    overflow: "hidden",
                  }}
                >
                  <Box component="img" src={role.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600} color="grey.900" sx={{ mb: 1 }}>
                  {role.label}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <KeyboardArrowDown sx={{ color: "grey.400" }} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Typography variant="body2" color="grey.700" fontSize={16} sx={{ mt: 10, textAlign: "center" }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" color="primary.main" fontWeight={500} underline="always">
            Log In
          </Link>
        </Typography>
      </Box>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 440,
            width: "100%",
            m: 2,
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <UserForm
            onSubmit={handleUserSubmit}
            initialRole={selectedRole ?? undefined}
            isSubmitting={isSubmitting}
            onLoginClick={handleLoginClick}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default SignupPage;
