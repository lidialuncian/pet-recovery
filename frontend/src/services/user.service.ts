import * as userApi from "../api/user.api";
import type { CreateUser, LoginCredentials, LoginResponse } from "../types/user.types";

export async function createUser(user: CreateUser) {
    const response = await userApi.createUser(user);
    return response;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    return await userApi.login(credentials);
}