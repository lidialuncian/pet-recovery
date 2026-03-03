import { Request, Response, NextFunction } from "express";

/** Use after authenticateToken. Ensures req.user.role === "vet". */
export const requireVet = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "vet") {
    return res.status(403).json({ error: "Vet access required" });
  }
  next();
};
