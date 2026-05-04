import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/requireAdmin.middleware";
import { InvitationService } from "../services/invitation.service";
import { ClinicService } from "../services/clinic.service";
import type { CreateInvitationDto } from "../types/invitation.dto";

const invitationRouter = Router();
const invitationService = new InvitationService();
const clinicService = new ClinicService();

/** GET /invitations/validate/:code — public, used by signup form */
invitationRouter.get("/validate/:code", async (req: Request, res: Response) => {
  try {
    const result = await invitationService.validateCode(req.params.code as string);
    res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid invitation code";
    res.status(400).json({ error: message });
  }
});

/** GET /invitations — admin: list invitations for their clinic */
invitationRouter.get("/", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const clinics = await clinicService.getClinicsForAdmin(userId);
    if (!clinics.length) return res.status(403).json({ error: "No clinic found for this admin" });

    const invitations = await invitationService.listInvitations(clinics[0].id);
    res.status(200).json(invitations);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch invitations";
    res.status(500).json({ error: message });
  }
});

/** POST /invitations — admin: create an invitation */
invitationRouter.post("/", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const clinics = await clinicService.getClinicsForAdmin(userId);
    if (!clinics.length) return res.status(403).json({ error: "No clinic found for this admin" });

    const dto = req.body as CreateInvitationDto;
    if (!dto.email || !dto.role) {
      return res.status(400).json({ error: "email and role are required" });
    }
    if (!["vet", "owner"].includes(dto.role)) {
      return res.status(400).json({ error: "role must be 'vet' or 'owner'" });
    }

    const invitation = await invitationService.createInvitation(dto, clinics[0].id, userId);
    res.status(201).json(invitation);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create invitation";
    const status = message.includes("already exists") ? 409 : 500;
    res.status(status).json({ error: message });
  }
});

export default invitationRouter;
