import { useCallback, useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import { login } from "../api/user.api";
import type { LoginCredentials, User } from "../types/user.types";
import LoginForm from "../components/LoginForm";

function LoginPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        if (storedUser && storedToken) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                navigate(`/home/${parsed.role}`, { replace: true });
            } catch (e) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
        }
    }, [navigate]);

    const handleLogin = useCallback(async (credentials: LoginCredentials) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await login(credentials);
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            setUser(result.user);
            navigate(`/home/${result.user.role}`, { replace: true });
        } catch (error: any) {
            console.error("Error logging in:", error);
            setError(error.response?.data?.message || error.message || "Failed to login. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [navigate]);

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                overflow: "auto",
                backgroundImage: "url(/pet_recovery_register_background.svg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: { xs: 3, sm: 4 },
                px: 2,
            }}
        >
            <Box
                component={RouterLink}
                to="/"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "grey.900",
                    textDecoration: "none",
                    mb: 2,
                }}
            >
                <Box component="img" src="/pet_recovery_logo.png" alt="Pet Recovery" sx={{ height: 180, mb: 6, mt: 6 }} />
                {/* <Box component="span" sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                    Pet Recovery
                </Box> */}
            </Box>

            <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} error={error} />
        </Box>
    );
}

export default LoginPage;
