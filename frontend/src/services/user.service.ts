import * as userApi from "../api/user.api";
import type { CreateUser, LoginCredentials, LoginResponse, RegisterClinicPayload, ValidateInviteResult, InvitationResult } from "../types/user.types";

export async function createUser(user: CreateUser) {
    return await userApi.createUser(user);
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    return await userApi.login(credentials);
}

export async function registerClinic(payload: RegisterClinicPayload): Promise<LoginResponse> {
    return await userApi.registerClinic(payload);
}

export async function validateInviteCode(code: string): Promise<ValidateInviteResult> {
    return await userApi.validateInviteCode(code);
}

export async function createInvitation(email: string, role: "vet" | "owner"): Promise<InvitationResult> {
    return await userApi.createInvitation(email, role);
}