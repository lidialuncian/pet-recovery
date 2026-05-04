export type InvitationRole = "vet" | "owner";
export type InvitationStatus = "pending" | "used" | "expired";

export interface InvitationDto {
  id: string;
  clinic_id: string;
  email: string;
  role: InvitationRole;
  code: string;
  status: InvitationStatus;
  created_by_user_id: string;
  created_at: string;
  expires_at: string;
}

export interface CreateInvitationDto {
  email: string;
  role: InvitationRole;
}

export interface ValidateInvitationResult {
  email: string;
  role: InvitationRole;
  clinic_id: string;
  clinic_name: string;
}
