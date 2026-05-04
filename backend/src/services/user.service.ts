import { CreateUserDto, LoginDto, LoginResponseDto, UserDto } from "../types/user.dto";
import { supabase } from "../lib/supabase";
import { hashPassword, comparePassword } from "../lib/hash";
import { generateToken } from "../lib/jwt";
import { InvitationService } from "./invitation.service";

const invitationService = new InvitationService();

export class UserService {

    async createUser(dto?: CreateUserDto & { invite_code?: string }): Promise<UserDto> {
        const inviteCode = dto?.invite_code;

        // If an invite code is provided, validate it and derive role + clinic
        if (inviteCode) {
            const invite = await invitationService.validateCode(inviteCode);

            if (dto?.email?.toLowerCase().trim() !== invite.email) {
                throw new Error("The email address does not match the invitation");
            }

            const hashedPassword = await hashPassword(dto?.password || "");
            const { data, error } = await supabase
                .from("users")
                .insert({
                    email: invite.email,
                    password: hashedPassword,
                    first_name: dto?.first_name ?? "",
                    last_name: dto?.last_name ?? "",
                    role: invite.role,
                })
                .select()
                .single();

            if (error) throw new Error(`Failed to create user: ${error.message}`);
            if (!data) throw new Error("Failed to create user: no data returned");

            const user = data as UserDto;

            // Link vet to clinic via user_clinic_roles
            if (invite.role === "vet") {
                await supabase.from("user_clinic_roles").insert({
                    user_id: user.id,
                    clinic_id: invite.clinic_id,
                    role_in_clinic: "vet",
                    status: "active",
                });
            }

            await invitationService.markUsed(inviteCode);
            return user;
        }

        // Standard path (no invite — only allowed for non-vet/owner self-registrations)
        const hashedPassword = await hashPassword(dto?.password || "");
        const user = {
            ...dto,
            password: hashedPassword,
        };
        const { data, error } = await supabase
            .from("users")
            .insert(user || {})
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            throw new Error(`Failed to create user: ${error.message}`);
        }
        if (!data) throw new Error("Failed to create user: no data returned");

        return data;
    }

    async login(dto: LoginDto): Promise<LoginResponseDto> {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", dto.email)
            .single();

        if (error || !data) {
            throw new Error("Invalid email or password");
        }

        const isPasswordValid = await comparePassword(dto.password, data.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        // Return user without password (UserDto doesn't include password)
        const { password, ...userWithoutPassword } = data;
        const user = userWithoutPassword as UserDto;

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        console.log("Generated JWT token:", token);

        return {
            user,
            token,
        };
    }

    async getUser(id: string): Promise<UserDto> {
        const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
        if (error) throw error;
        return data;
    }

}