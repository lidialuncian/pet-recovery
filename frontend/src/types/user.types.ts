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
}

export type LoginCredentials = {
    email: string;
    password: string;
}

export type LoginResponse = {
    user: User;
    token: string;
}