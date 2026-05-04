import { useState } from "react";
import type { FormEvent } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { RegisterClinicPayload } from "../types/user.types";

type Props = {
    onSubmit: (payload: RegisterClinicPayload) => void;
    isSubmitting?: boolean;
    onLoginClick?: () => void;
};

function ClinicRegistrationForm({ onSubmit, isSubmitting, onLoginClick }: Props) {
    const [form, setForm] = useState<RegisterClinicPayload>({
        clinic_name: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.clinic_name.trim() || !form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.password.trim()) {
            alert("Please fill in all fields");
            return;
        }
        if (form.password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        onSubmit(form);
    };

    const field = (key: keyof RegisterClinicPayload) => ({
        value: form[key],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
    });

    return (
        <Card sx={{ width: "100%", maxWidth: 440, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" fontWeight={700} color="grey.900" sx={{ mb: 0.5 }}>
                    Register Your Clinic
                </Typography>
                <Typography variant="body2" color="grey.600" sx={{ mb: 3 }}>
                    Create your clinic account. You will be the clinic admin.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Clinic Name"
                        {...field("clinic_name")}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BusinessOutlined sx={{ color: "primary.main", fontSize: 22 }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 },
                            },
                        }}
                    />

                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            {...field("first_name")}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline sx={{ color: "primary.main", fontSize: 22 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 },
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            {...field("last_name")}
                            slotProps={{ input: { sx: { borderRadius: 2 } } }}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        {...field("email")}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlined sx={{ color: "primary.main", fontSize: 22 }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 },
                            },
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        {...field("password")}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlined sx={{ color: "primary.main", fontSize: 22 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 },
                            },
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlined sx={{ color: "primary.main", fontSize: 22 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirm((p) => !p)} edge="end" size="small">
                                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 },
                            },
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
                        {isSubmitting ? "Creating clinic…" : "Create Clinic Account"}
                    </Button>

                    {onLoginClick && (
                        <Typography variant="body2" color="grey.600" sx={{ textAlign: "center", mt: 1 }}>
                            Already have an account?{" "}
                            <Box
                                component="button"
                                type="button"
                                onClick={onLoginClick}
                                sx={{ color: "primary.main", fontWeight: 600, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", font: "inherit", p: 0 }}
                            >
                                Log In
                            </Box>
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

export default ClinicRegistrationForm;
