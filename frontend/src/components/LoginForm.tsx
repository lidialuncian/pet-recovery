import { useState } from "react";
import type { FormEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { LoginCredentials } from "../types/user.types";

type LoginFormProps = {
    onSubmit: (credentials: LoginCredentials) => void;
    isSubmitting?: boolean;
    error?: string | null;
};

function LoginForm({ onSubmit, isSubmitting = false, error }: LoginFormProps) {
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!credentials.email.trim() || !credentials.password.trim()) {
            alert("Please fill in all fields");
            return;
        }
        onSubmit(credentials);
    };

    return (
        <Card
            sx={{
                width: "100%",
                maxWidth: 440,
                maxHeight: 500,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                overflow: "hidden",
            }}
        >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h4" fontWeight={700} color="grey.900" sx={{ mb: 0.5 }}>
                    Log In
                </Typography>
                <Typography variant="body2" color="grey.600" sx={{ mb: 3 }}>
                    Welcome back!
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {error && (
                        <Typography variant="body2" color="error">
                            {error}
                        </Typography>
                    )}
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        disabled={isSubmitting}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailOutlined sx={{ color: "primary.main", fontSize: 22 }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        disabled={isSubmitting}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutlined sx={{ color: "primary.main", fontSize: 22 }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword((p) => !p)}
                                        edge="end"
                                        size="small"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                        sx={{
                            mt: 1,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: "none",
                            fontSize: "1rem",
                            fontWeight: 600,
                            background: "linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)",
                            boxShadow: "0 4px 14px rgba(14, 165, 233, 0.4)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #2dd4bf 0%, #0284c7 100%)",
                                boxShadow: "0 6px 20px rgba(14, 165, 233, 0.45)",
                            },
                        }}
                    >
                        {isSubmitting ? "Logging in..." : "Log In"}
                    </Button>

                    <Typography variant="body2" color="grey.600" sx={{ textAlign: "center", mt: 2 }}>
                        Don&apos;t have an account?{" "}
                        <Link component={RouterLink} to="/signup" color="primary.main" fontWeight={600} underline="always">
                            Sign Up
                        </Link>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default LoginForm;
