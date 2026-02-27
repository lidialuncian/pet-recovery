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
import PersonOutline from "@mui/icons-material/PersonOutline";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { CreateUser } from "../types/user.types";

type UserFormProps = {
    onSubmit: (user: CreateUser) => void;
    isSubmitting?: boolean;
    initialRole?: CreateUser["role"];
    onLoginClick?: () => void;
};

function UserForm({ onSubmit, initialRole, isSubmitting, onLoginClick }: UserFormProps) {
    const [user, setUser] = useState<CreateUser>({
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        role: initialRole ?? "owner",
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user.email.trim() || !user.first_name.trim() || !user.last_name.trim() || !user.password.trim() || !user.role) {
            alert("Please fill in all fields");
            return;
        }
        if (user.password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        onSubmit(user);
        setUser({ email: "", first_name: "", last_name: "", password: "", role: initialRole ?? "owner" });
        setConfirmPassword("");
    };

    return (
        <Card
            sx={{
                width: "100%",
                maxWidth: 440,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                overflow: "hidden",
            }}
        >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" fontWeight={700} color="grey.900" sx={{ mb: 0.5 }}>
                    Create Your Account
                </Typography>
                <Typography variant="body2" color="grey.600" sx={{ mb: 3 }}>
                    Manage your pet&apos;s recovery journey with ease.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        fullWidth
                        label="First Name"
                        type="text"
                        value={user.first_name}
                        onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonOutline sx={{ color: "primary.main", fontSize: 22 }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Last Name"
                        type="text"
                        value={user.last_name}
                        onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonOutline sx={{ color: "primary.main", fontSize: 22 }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
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
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
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
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutlined sx={{ color: "primary.main", fontSize: 22 }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle confirm password visibility"
                                        onClick={() => setShowConfirmPassword((p) => !p)}
                                        edge="end"
                                        size="small"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                        Sign Up
                    </Button>

                    <Typography variant="body2" color="grey.600" sx={{ textAlign: "center", mt: 2 }}>
                        Already have an account?{" "}
                        {onLoginClick ? (
                            <Link component="button" onClick={onLoginClick} color="primary.main" fontWeight={600} underline="always" sx={{ bg: "none", border: "none", cursor: "pointer", font: "inherit", p: 0 }}>
                                Log In
                            </Link>
                        ) : (
                            <Link component={RouterLink} to="/login" color="primary.main" fontWeight={600} underline="always">
                                Log In
                            </Link>
                        )}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default UserForm;
