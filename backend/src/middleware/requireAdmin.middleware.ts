import { Request, Response, NextFunction } from "express";

/** Use after authenticateToken. Ensures req.user.role === "admin". */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
