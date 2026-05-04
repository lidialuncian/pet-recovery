import axiosClient from "./axiosClient";
import type { CreateUser, LoginCredentials, LoginResponse, RegisterClinicPayload, ValidateInviteResult, InvitationResult, User } from "../types/user.types";

export async function createUser(user: CreateUser) {
    const response = await axiosClient.post("/users", user);
    return response.data;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axiosClient.post("/users/login", credentials);
    return response.data;
}

export async function getUserProfile(): Promise<User> {
    const response = await axiosClient.get("/users/profile");
    return response.data;
}

export async function registerClinic(payload: RegisterClinicPayload): Promise<LoginResponse> {
    const response = await axiosClient.post("/clinics/register", payload);
    return response.data;
}

export async function validateInviteCode(code: string): Promise<ValidateInviteResult> {
    const response = await axiosClient.get(`/invitations/validate/${encodeURIComponent(code)}`);
    return response.data;
}

export async function createInvitation(email: string, role: "vet" | "owner"): Promise<InvitationResult> {
    const response = await axiosClient.post("/invitations", { email, role });
    return response.data;
}