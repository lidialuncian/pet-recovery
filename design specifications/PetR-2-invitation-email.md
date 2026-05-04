# PetR-2 — Invitation Email Delivery

**Feature:** Automatic email delivery of invitation codes to vets and pet owners
**Status:** Planned
**Date:** April 2026
**Depends on:** PetR-1

---

## Overview

Currently (PetR-1), when an admin creates an invitation the code is shown inline in the Admin Home UI and the admin must manually copy and send it to the recipient. This feature automates that step: the moment an invitation is created, the backend sends an email to the invited address containing the code and a direct link to the signup page.

The admin UI card still shows the generated code (as a fallback and for confirmation), but the recipient no longer needs the admin to manually relay it.

---

## Updated Admin Flow

```
Admin is logged in → Admin Home → "Invite to clinic" card →
  select clinic + select role (vet / owner) + enter email →
  POST /invitations →
    invite record created (32-char hex code, 7-day expiry) →
      emailService.sendInvitation(email, clinicName, role, code) →
        email delivered to recipient with code + signup link →
      code also shown inline in Admin Home (with copy button)
```

---

## Email Content

### Subject
```
You've been invited to join [Clinic Name] on Pet Recovery
```

### Plain-text body
```
Hello,

[Clinic Name] has invited you to join Pet Recovery as a [Veterinarian / Pet Owner].

Use the invitation code below to create your account:

  [CODE]

Or go directly to:
  https://[app-domain]/signup?code=[CODE]

This invitation expires in 7 days.

If you were not expecting this invitation, you can ignore this email.

— Pet Recovery Team
```

### HTML body
A styled HTML version of the above, with:
- App logo / header
- Clinic name prominently displayed
- Code in a monospace box
- A "Create my account" CTA button linking to `/signup?code=[CODE]`
- Footer with expiry notice and ignore clause

---

## Email Provider

**Recommended: [Resend](https://resend.com)**

| Criterion | Resend |
|---|---|
| Free tier | 3,000 emails/month, 100/day |
| SDK | Official Node.js SDK (`resend` package) |
| Setup | API key only — no SMTP config |
| HTML support | Yes |
| Suitable for demo | Yes |

**Alternative: Nodemailer + Gmail SMTP**
Requires a Gmail account with an App Password. Works with no external service dependency, but has stricter sending limits and is harder to scale.

---

## Backend Implementation

### New Files

| File | Purpose |
|---|---|
| `backend/src/services/email.service.ts` | `sendInvitationEmail(to, clinicName, role, code)` — wraps Resend SDK, builds subject + HTML body, sends email |

### Modified Files

| File | Change |
|---|---|
| `backend/src/services/invitation.service.ts` | Call `emailService.sendInvitationEmail()` after the invitation row is inserted in `createInvitation()` |
| `backend/.env` | Add `RESEND_API_KEY` and `APP_BASE_URL` |

### Environment Variables

| Variable | Example | Purpose |
|---|---|---|
| `RESEND_API_KEY` | `re_abc123...` | Resend API key (from resend.com dashboard) |
| `APP_BASE_URL` | `http://localhost:5173` | Base URL for the signup deep-link in the email body |
| `EMAIL_FROM` | `noreply@vetcarerecovery.com` | Sender address (must be a verified domain in Resend) |

### Dependency to Install

```bash
cd backend
npm install resend
```

### email.service.ts — Interface

```typescript
export async function sendInvitationEmail(
  to: string,
  clinicName: string,
  role: "vet" | "owner",
  code: string
): Promise<void>
```

- Builds subject and HTML body.
- Calls `resend.emails.send(...)`.
- On failure: logs the error but **does not throw** — the invitation record is already saved and the admin can still share the code manually via the UI. This ensures email failure never blocks invitation creation.

### invitation.service.ts — Change

In `createInvitation()`, after the `INSERT` into `invitations`:

```typescript
// fire-and-forget — email failure does not roll back the invitation
sendInvitationEmail(dto.email, clinic.name, dto.role, code).catch((err) =>
  console.error("Failed to send invitation email:", err)
);
```

The clinic name is retrieved via a `SELECT name FROM clinics WHERE id = $1` join before inserting, so it is available at send time.

---

## Frontend Changes

None required for the core feature. The Admin Home card already shows the code inline as a fallback.

### Optional Enhancement — Invite Link Support

If `/signup?code=abc123` pre-fills the code field in `InvitedSignupForm`, the email CTA button becomes a one-click flow. This is tracked separately (see PetR-1 Future Work).

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Resend API key missing or invalid | Email silently fails, invitation still created, code shown in UI |
| Recipient email does not exist (bounce) | Resend handles async bounce — no change to invitation status |
| Duplicate pending invite blocked | `createInvitation()` throws before reaching email step — no email sent |
| Email send throws synchronously | Caught by `.catch()` — invitation creation response is unaffected |

---

## Business Rules

- Email is sent **once** at invite creation time. There is no automatic resend.
- The admin can still see and copy the code from the UI at any time after creation.
- Resend email failures are logged server-side but not surfaced to the admin (the code is always available in the UI as a fallback).

---

## Future Work

- [ ] HTML email template with branding (logo, colours, styled CTA button)
- [ ] Invite link support in `InvitedSignupForm`: read `?code=` from URL and pre-fill Step 1 automatically (see also PetR-1 Future Work)
- [ ] Admin-triggered resend: button in the invitation list to resend the email for a pending invite
- [ ] Email delivery status tracking: store `email_sent_at` on the invitation row and surface it in the admin UI
- [ ] Configurable sender name and reply-to address via environment variables
