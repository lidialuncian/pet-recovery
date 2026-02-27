export interface CreateUserDto {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: "owner" | "vet" | "admin";
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface UserDto {
    id: string;
    email: string;
    created_at: string;
    first_name: string;
    last_name: string;
    role: "owner" | "vet" | "admin";
}

export interface LoginResponseDto {
    user: UserDto;
    token: string;
}
