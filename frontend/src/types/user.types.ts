export type User = {
    id: string;
    email: string;
    created_at: string;
    first_name: string;
    last_name: string;
    role: SignupRole;
}

export type SignupRole = "owner" | "vet" | "admin";

export type CreateUser = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: SignupRole;
    invite_code?: string;
}

export type RegisterClinicPayload = {
    clinic_name: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export type ValidateInviteResult = {
    email: string;
    role: "vet" | "owner";
    clinic_id: string;
    clinic_name: string;
}

export type InvitationResult = {
    id: string;
    email: string;
    role: "vet" | "owner";
    code: string;
    expires_at: string;
}

export type LoginCredentials = {
    email: string;
    password: string;
}

export type LoginResponse = {
    user: User;
    token: string;
}