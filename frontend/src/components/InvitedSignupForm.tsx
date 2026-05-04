import { useState } from "react";
import type { FormEvent } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import PersonOutline from "@mui/icons-material/PersonOutline";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import VpnKeyOutlined from "@mui/icons-material/VpnKeyOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { ValidateInviteResult, CreateUser } from "../types/user.types";
import { validateInviteCode } from "../services/user.service";

type Props = {
    onSubmit: (user: CreateUser) => void;
    isSubmitting?: boolean;
    onLoginClick?: () => void;
};

function InvitedSignupForm({ onSubmit, isSubmitting, onLoginClick }: Props) {
    const [code, setCode] = useState("");
    const [validating, setValidating] = useState(false);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [invite, setInvite] = useState<ValidateInviteResult | null>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleValidateCode = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!code.trim()) return;
        setValidating(true);
        setCodeError(null);
        try {
            const result = await validateInviteCode(code.trim());
            setInvite(result);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Invalid invitation code";
            setCodeError(msg);
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!invite) return;
        if (!firstName.trim() || !lastName.trim() || !password.trim()) {
            alert("Please fill in all fields");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        onSubmit({
            email: invite.email,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            password,
            role: invite.role,
            invite_code: code.trim(),
        });
    };

    const roleLabel = invite?.role === "vet" ? "Veterinarian" : "Pet Owner";

    return (
        <Card sx={{ width: "100%", maxWidth: 440, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" fontWeight={700} color="grey.900" sx={{ mb: 0.5 }}>
                    Accept Your Invitation
                </Typography>
                <Typography variant="body2" color="grey.600" sx={{ mb: 3 }}>
                    Enter the invitation code you received from your clinic.
                </Typography>

                {/* Step 1 — invite code */}
                {!invite && (
                    <Box component="form" onSubmit={handleValidateCode} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Invitation Code"
                            value={code}
                            onChange={(e) => { setCode(e.target.value); setCodeError(null); }}
                            error={!!codeError}
                            helperText={codeError ?? undefined}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <VpnKeyOutlined sx={{ color: "primary.main", fontSize: 22 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2, fontFamily: "monospace", letterSpacing: 2 },
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={validating || !code.trim()}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: "none",
                                fontSize: "1rem",
                                fontWeight: 600,
                                background: "linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)",
                                boxShadow: "0 4px 14px rgba(14, 165, 233, 0.4)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #2dd4bf 0%, #0284c7 100%)",
                                },
                            }}
                        >
                            {validating ? "Validating…" : "Validate Code"}
                        </Button>
                    </Box>
                )}

                {/* Step 2 — fill in personal details */}
                {invite && (
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Alert
                            severity="success"
                            icon={false}
                            sx={{ borderRadius: 2, alignItems: "flex-start" }}
                        >
                            <Typography variant="body2" fontWeight={600}>{invite.clinic_name}</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">Invited as</Typography>
                                <Chip label={roleLabel} size="small" color="primary" />
                            </Box>
                        </Alert>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
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
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                slotProps={{ input: { sx: { borderRadius: 2 } } }}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Email"
                            value={invite.email}
                            disabled
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlined sx={{ color: "text.disabled", fontSize: 22 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 },
                                },
                            }}
                            helperText="This email was set by your clinic admin"
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                                },
                            }}
                        >
                            {isSubmitting ? "Creating account…" : "Create Account"}
                        </Button>

                        <Button
                            variant="text"
                            size="small"
                            onClick={() => { setInvite(null); setCode(""); }}
                            sx={{ textTransform: "none", color: "grey.500" }}
                        >
                            Use a different code
                        </Button>
                    </Box>
                )}

                {onLoginClick && (
                    <Typography variant="body2" color="grey.600" sx={{ textAlign: "center", mt: 2 }}>
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
            </CardContent>
        </Card>
    );
}

export default InvitedSignupForm;
