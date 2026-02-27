import { CreateUserDto, LoginDto, LoginResponseDto, UserDto } from "../types/user.dto";
import { supabase } from "../lib/supabase";
import { hashPassword, comparePassword } from "../lib/hash";
import { generateToken } from "../lib/jwt";

export class UserService {

    async createUser(dto?: CreateUserDto): Promise<UserDto> {
        const hashedPassword = await hashPassword(dto?.password || "");
        const user = {
            ...dto,
            password: hashedPassword
        }
        const {data, error} = await supabase
            .from("users")
            .insert(user || {})
            .select()
            .single()
        
        if (error){
            console.error("Supabase error:", error);
            throw new Error(`Failed to save conversation: ${error.message}`)
        }
        
        if (!data) {
            throw new Error("Failed to save conversation: No data returned")
        }
        
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