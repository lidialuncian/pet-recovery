# PetR-1 — Registration Process

**Feature:** Clinic self-registration & invitation-based onboarding for vets and owners
**Status:** Implemented
**Date:** April 2026

---

## Overview

The registration flow has two distinct paths:

1. **Clinic registration** — a clinic manager creates a new clinic account. The registering user becomes the clinic's admin.
2. **Invited user signup** — a vet or pet owner receives an invitation code from the admin and uses it to create their account.

Admin accounts for production will eventually be created manually by the platform owner, then the admin configures their own profile. The self-registration path is used for demos and early adoption.

---

## User Flows

### Flow 1 — Clinic Registration

```
/signup → "Register my clinic" card →
  ClinicRegistrationForm (clinic name + first name + last name + email + password) →
    POST /clinics/register →
      clinic record created
      admin user created (role: "admin")
      user_clinic_roles entry created (role_in_clinic: "admin", status: "active")
      JWT token returned →
        auto-login → redirect to /home/admin
```

### Flow 2 — Invited User Signup

```
/signup → "I have an invitation" card →
  InvitedSignupForm Step 1: enter invite code →
    GET /invitations/validate/:code →
      shows: clinic name, assigned role (vet / owner) →
  InvitedSignupForm Step 2: fill first name, last name, password
    (email is pre-filled and read-only — set by admin) →
    POST /users (with invite_code in body) →
      invite code validated
      user created (role derived from invite)
      if role = vet: user_clinic_roles entry created
      invitation marked as "used" →
        auto-login → redirect to /home/vet or /home/owner
```

### Admin — Creating an Invitation

```
Admin is logged in → Admin Home page → "Invite to clinic" card →
  select clinic + select role (vet / owner) + enter email →
  POST /invitations (body: { email, role: "vet" | "owner" }) →
    invite record created with a unique 32-char hex code
    expires in 7 days →
      invitation code displayed inline with a copy button →
        admin copies and sends the code to the recipient manually
```

---

## Signup Page Design

The `/signup` page keeps the original **3 role cards** design (SVG illustrations + arrow-down indicator), but with updated logic behind each card:

| Card | Image | Opens | Description |
|---|---|---|---|
| **I am a Clinic Administrator** | `role_clinic_admin.svg` | `ClinicRegistrationForm` | Creates clinic + admin account in one step |
| **I am a Veterinarian** | `role_veterinarian.svg` | `InvitedSignupForm` | Requires an invitation code from the clinic admin |
| **I am a Pet Owner** | `role_owner.svg` | `InvitedSignupForm` | Requires an invitation code from the clinic admin |

Cards are ordered: Admin → Vet → Owner. Vets and owners are routed to the same `InvitedSignupForm`; the role is derived from the invitation code, not the card chosen. The card selection only controls which form dialog opens.

---

## Backend Implementation

### New Files

| File | Purpose |
|---|---|
| `backend/src/types/invitation.dto.ts` | TypeScript types: `InvitationDto`, `CreateInvitationDto`, `ValidateInvitationResult` |
| `backend/src/services/invitation.service.ts` | `createInvitation()`, `validateCode()`, `markUsed()`, `listInvitations()` |
| `backend/src/routes/invitation.route.ts` | `GET /invitations/validate/:code` (public), `GET /invitations` (admin), `POST /invitations` (admin) |

### Modified Files

| File | Change |
|---|---|
| `backend/src/services/clinic.service.ts` | Added `registerClinic(dto)` — creates clinic + admin user + role link atomically |
| `backend/src/routes/clinic.route.ts` | Added `POST /clinics/register` (public, no auth required) |
| `backend/src/services/user.service.ts` | Modified `createUser()` — if `invite_code` is present, validates it, derives role/clinic from invite, links vet to clinic via `user_clinic_roles`, marks invite as used |
| `backend/src/routes/index.ts` | Exported `invitationRouter` |
| `backend/src/server.ts` | Mounted `invitationRouter` at `/invitations` |

### API Endpoints Added

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/clinics/register` | Public | Create clinic + admin user |
| `GET` | `/invitations/validate/:code` | Public | Validate an invite code, return email/role/clinic |
| `GET` | `/invitations` | Admin | List all invitations for the admin's clinic |
| `POST` | `/invitations` | Admin | Create a new invitation (generates code) |

---

## Frontend Implementation

### New Files

| File | Purpose |
|---|---|
| `frontend/src/components/ClinicRegistrationForm.tsx` | Form for clinic name + admin personal info + password |
| `frontend/src/components/InvitedSignupForm.tsx` | 2-step form: enter code → validate → fill name + password |

### Modified Files

| File | Change |
|---|---|
| `frontend/src/types/user.types.ts` | Added `RegisterClinicPayload`, `ValidateInviteResult`, `InvitationResult`; added optional `invite_code` to `CreateUser` |
| `frontend/src/api/user.api.ts` | Added `registerClinic()`, `validateInviteCode()`, `createInvitation()` |
| `frontend/src/services/user.service.ts` | Added `registerClinic()`, `validateInviteCode()`, `createInvitation()` |
| `frontend/src/pages/SignupPage.tsx` | Reworked: 3 role cards (SVG images), Admin → `ClinicRegistrationForm`, Vet/Owner → `InvitedSignupForm` |
| `frontend/src/components/home/AdminHome.tsx` | Replaced "Add vet" (existing user dropdown) with "Invite to clinic" (email + role → shows generated code with copy button) |

---

## Database

### New Table Required

Run the following SQL in the Supabase SQL editor to create the `invitations` table:

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('vet', 'owner')),
  code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
```

### Existing Tables Used

| Table | Usage |
|---|---|
| `clinics` | New row created on clinic registration |
| `users` | New row created for both flows |
| `user_clinic_roles` | New row created for admin (on clinic register) and vet (on invite accept) |

---

## Business Rules

- Invite codes are **32 hex characters**, generated with `crypto.randomBytes(16)`.
- Codes expire after **7 days**.
- A pending invite for the same email + clinic cannot be duplicated — the admin must wait for the first to expire or be used.
- The email entered during invited signup **must match** the email on the invitation exactly (case-insensitive). If it doesn't, account creation is rejected.
- Owners accepted via invite are **not** linked via `user_clinic_roles` — their clinic link comes later through their pets (`clinic_pets` table).
- Vets accepted via invite **are** linked via `user_clinic_roles` immediately, so the admin can see them in the clinic.
- In production, admin accounts will be created manually by the platform owner. The clinic self-registration path may be gated behind an approval flow in a future iteration.

---

## Future Work

- [x] Email delivery of invite codes → see **PetR-2**
- [ ] Admin UI page to manage invitations (list, revoke) — creation is done from Admin Home
- [ ] Approval gate for clinic self-registration (status: pending → approved)
- [ ] Invite link support: `/signup?code=abc123` pre-fills the code field automatically
- [ ] Resend / regenerate invite (admin can cancel a pending invite and issue a new one)
