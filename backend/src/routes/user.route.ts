import { Router, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDto, LoginDto } from "../types/user.dto";
import { authenticateToken } from "../middleware/auth.middleware";

const userRouter = Router();
const userService = new UserService();

userRouter.post("/", async (req: Request, res: Response) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        console.error("Error creating user:", error);
        res.status(500).json({ 
            error: "Failed to create user", 
            message: error.message 
        });
    }
});

userRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const user = await userService.login(req.body);
        res.status(200).json(user);
    } catch (error: any) {
        console.error("Error logging in:", error);
        res.status(401).json({ 
            error: "Login failed", 
            message: error.message 
        });
    }
});

// Protected route example - requires authentication
userRouter.get("/profile", authenticateToken, async (req: Request, res: Response) => {
    try {
        // req.user is available here after authenticateToken middleware
        // It contains: { userId, email, role }
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        
        const user = await userService.getUser(userId);
        res.status(200).json(user);
    } catch (error: any) {
        console.error("Error getting user profile:", error);
        res.status(500).json({ 
            error: "Failed to get user profile", 
            message: error.message 
        });
    }
});

export default userRouter;