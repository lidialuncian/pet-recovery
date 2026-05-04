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
import ClinicRegistrationForm from "../components/ClinicRegistrationForm";
import InvitedSignupForm from "../components/InvitedSignupForm";
import { registerClinic, createUser, login } from "../services/user.service";
import type { RegisterClinicPayload, CreateUser } from "../types/user.types";

type SignupMode = "admin" | "vet" | "owner";

const OPTIONS: { id: SignupMode; label: string; image: string }[] = [
  { id: "admin", label: "I am a Clinic Administrator", image: "/role_clinic_admin.svg" },
  { id: "vet", label: "I am a Veterinarian", image: "/role_veterinarian.svg" },
  { id: "owner", label: "I am a Pet Owner", image: "/role_owner.svg" },
];

function SignupPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<SignupMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    if (!isSubmitting) setMode(null);
  }, [isSubmitting]);

  const handleLoginClick = useCallback(() => {
    setMode(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const saveAndRedirect = useCallback(
    (token: string, user: { role: string }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(`/home/${user.role}`, { replace: true });
    },
    [navigate]
  );

  const handleClinicSubmit = useCallback(
    async (payload: RegisterClinicPayload) => {
      setIsSubmitting(true);
      try {
        const { token, user } = await registerClinic(payload);
        saveAndRedirect(token, user);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to register clinic";
        alert(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [saveAndRedirect]
  );

  const handleInvitedSubmit = useCallback(
    async (userData: CreateUser) => {
      setIsSubmitting(true);
      try {
        await createUser(userData);
        const { token, user } = await login({ email: userData.email, password: userData.password });
        saveAndRedirect(token, user);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create account";
        alert(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [saveAndRedirect]
  );

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
        sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
      >
        <Typography variant="h3" fontWeight={700} color="grey.900" sx={{ mt: 10, mb: 4, textAlign: "center" }}>
          Sign Up
        </Typography>
        <Typography variant="body1" color="grey.600" sx={{ mb: 8, textAlign: "center" }}>
          How would you like to join?
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
          {OPTIONS.map((opt) => (
            <Card
              key={opt.id}
              component={Button}
              onClick={() => setMode(opt.id)}
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
                "&:hover": { boxShadow: 4, borderColor: "primary.main" },
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
                  <Box component="img" src={opt.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600} color="grey.900" sx={{ mb: 1 }}>
                  {opt.label}
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
        open={mode !== null}
        onClose={handleClose}
        slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 440, width: "100%", m: 2 } } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {mode === "admin" && (
            <ClinicRegistrationForm
              onSubmit={handleClinicSubmit}
              isSubmitting={isSubmitting}
              onLoginClick={handleLoginClick}
            />
          )}
          {(mode === "vet" || mode === "owner") && (
            <InvitedSignupForm
              onSubmit={handleInvitedSubmit}
              isSubmitting={isSubmitting}
              onLoginClick={handleLoginClick}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default SignupPage;
