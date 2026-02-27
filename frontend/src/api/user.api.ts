import axiosClient from "./axiosClient";
import type { CreateUser, LoginCredentials, LoginResponse, User } from "../types/user.types";

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