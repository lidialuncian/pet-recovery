import crypto from "crypto";
import { supabase } from "../lib/supabase";
import type { CreateInvitationDto, InvitationDto, ValidateInvitationResult } from "../types/invitation.dto";

const INVITE_EXPIRY_DAYS = 7;

export class InvitationService {
  /** Admin creates an invitation for a vet or owner. Returns the generated invite code. */
  async createInvitation(
    dto: CreateInvitationDto,
    clinicId: string,
    createdByUserId: string
  ): Promise<InvitationDto> {
    // Check for an existing pending invite for the same email+clinic
    const { data: existing } = await supabase
      .from("invitations")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("email", dto.email.toLowerCase().trim())
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      throw new Error("A pending invitation already exists for this email at your clinic");
    }

    const code = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const { data, error } = await supabase
      .from("invitations")
      .insert({
        clinic_id: clinicId,
        email: dto.email.toLowerCase().trim(),
        role: dto.role,
        code,
        status: "pending",
        created_by_user_id: createdByUserId,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create invitation: ${error.message}`);
    return data as InvitationDto;
  }

  /** List all invitations for a clinic (admin use). */
  async listInvitations(clinicId: string): Promise<InvitationDto[]> {
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list invitations: ${error.message}`);
    return (data ?? []) as InvitationDto[];
  }

  /** Validate a code. Returns invite info if valid, throws if invalid/expired/used. */
  async validateCode(code: string): Promise<ValidateInvitationResult> {
    const { data: invite, error } = await supabase
      .from("invitations")
      .select("*, clinics(name)")
      .eq("code", code)
      .maybeSingle();

    if (error || !invite) throw new Error("Invalid invitation code");
    if (invite.status === "used") throw new Error("This invitation has already been used");
    if (invite.status === "expired") throw new Error("This invitation has expired");
    if (new Date(invite.expires_at) < new Date()) {
      // Mark as expired in DB lazily
      await supabase.from("invitations").update({ status: "expired" }).eq("id", invite.id);
      throw new Error("This invitation has expired");
    }

    const clinicName = (invite.clinics as { name: string } | null)?.name ?? "the clinic";

    return {
      email: invite.email,
      role: invite.role,
      clinic_id: invite.clinic_id,
      clinic_name: clinicName,
    };
  }

  /** Mark an invitation as used. Called after the user account is successfully created. */
  async markUsed(code: string): Promise<void> {
    const { error } = await supabase
      .from("invitations")
      .update({ status: "used" })
      .eq("code", code);

    if (error) console.error("Failed to mark invitation as used:", error.message);
  }
}
