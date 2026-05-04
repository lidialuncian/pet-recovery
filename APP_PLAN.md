# VetCare Recovery — Full App, Business & Marketing Plan

> A SaaS platform connecting veterinary clinics, vet doctors, and animal owners around a structured, trackable treatment and recovery journey.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [User Roles](#2-user-roles)
3. [Core Feature Modules](#3-core-feature-modules)
4. [Current State of the Codebase](#4-current-state-of-the-codebase)
5. [Development Roadmap](#5-development-roadmap)
6. [Demo Flow (MVP Pitch)](#6-demo-flow-mvp-pitch)
7. [Tech Stack](#7-tech-stack)
8. [Database Model Overview](#8-database-model-overview)
9. [Business Plan](#9-business-plan)
10. [Marketing Plan](#10-marketing-plan)

---

## 1. Product Vision

Veterinary clinics face a recurring challenge: once a sick animal is discharged, the recovery process happens at home — largely invisible to the vet. Owners forget instructions, skip medications, or fail to notice warning signs. There is no structured communication channel between the clinic and the owner during recovery.

**VetCare Recovery** solves this by giving clinics a digital tool to:
- Define structured care plans (with tasks, medications, vitals to measure)
- Assign plans to specific patients
- Allow owners to track and report daily progress from their phone
- Give vets real-time visibility into how the recovery is going
- Provide an AI-powered assistant that educates owners without replacing the vet

The result is fewer missed medications, faster detection of complications, and happier, more loyal clients.

---

## 2. User Roles

| Role | Who they are | What they do |
|---|---|---|
| **Clinic Admin** | The clinic's manager or front desk | Enrolls vets and patients, manages clinic settings, creates care plan templates |
| **Vet Doctor** | The treating veterinarian | Creates and manages care plans for patients, monitors recovery progress in real time |
| **Animal Owner** | The pet's owner | Follows the care plan, checks off daily tasks, logs symptoms, communicates with the assistant |

---

## 3. Core Feature Modules

### 3.1 Clinic & User Management (Admin)

- Register clinic and manage clinic profile (name, contact, logo)
- Invite and enroll vet accounts (by email, assign vet role)
- Enroll animal owners and link their pets to the clinic
- View all enrolled users and patients
- Deactivate or archive accounts

### 3.2 Care Plan Templates (Admin)

- Create reusable templates scoped to the clinic
- Each template has: title, description, and a list of task steps
- Each task step includes:
  - Task type: `boolean`, `number`, `scale`, `text`, `medication`, `vital`, `measurement`, `symptom_check`
  - Label, frequency (`daily`, `weekly`, `once`, `as_needed`), schedule time
  - Instructions / description
  - Value schema (e.g. for medication: name, dose, unit, route)
- Templates are reused by vets to quickly create care plans

### 3.3 Care Plans (Vet)

- Vet selects a patient and creates a care plan (from a template or from scratch)
- Sets: title, description, start date, discharge date
- Plan status lifecycle: `draft → in_clinic → at_home → follow_up → closed`
- Can add, edit, or deactivate individual tasks at any time
- Leaves notes/comments visible to the owner
- Gets notified when the owner reports critical symptoms or misses tasks

### 3.4 Task Completion & Symptom Logging (Owner)

- Owner sees their pet's active care plan on the home screen
- Daily task checklist: mark each task as done, skipped, or with a recorded value
  - e.g. "Give antibiotic" → check done
  - e.g. "Measure temperature" → enter `38.5°C`
  - e.g. "Pain level" → select 1–5 on a scale
- Log free-text symptom notes with an optional severity indicator
- View history of past completions and logs
- Receive reminders for scheduled tasks

### 3.5 Progress Dashboard (Vet)

- Real-time overview of each patient's care plan compliance
- Metrics: tasks completed vs. missed per day
- Timeline of symptom logs and owner notes
- Alert system: vet is flagged when:
  - Owner misses tasks 2+ consecutive days
  - AI assistant detects a critical symptom report (`CRITICAL` / `URGENT` alert levels)
- Vet can leave comments/responses on the plan visible to the owner

### 3.6 AI Assistant

- Chat-based assistant embedded in the app (available to both owner and vet)
- **Strictly does NOT diagnose** — always redirects clinical decisions to the vet
- Context-aware: knows the current pet's species, breed, weight, care plan, and tasks
- Helps owners understand:
  - What a task means ("what does 'administer subcutaneously' mean?")
  - How to measure temperature or check a wound
  - What a medication does
- Helps vets with:
  - Drug information and reference dosing
  - General treatment protocol information
- Escalation logic: if the owner reports alarming symptoms, the assistant creates an `alert` record visible to the vet
- Currently implemented using OpenAI; **can be migrated to Claude (Anthropic) API** for better context handling and safety guardrails

---

## 4. Current State of the Codebase

### Tech Stack in Use

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT via Supabase |
| AI Assistant | OpenAI API (gpt-4o-mini) |

### What Is Already Built

#### Backend (`/backend/src/`)

| File/Module | What it does |
|---|---|
| `server.ts` | Express app with routes for users, pets, clinics, vets, care plans, tasks |
| `routes/user.route.ts` | Login, signup, profile |
| `routes/pet.route.ts` | CRUD for pets |
| `routes/clinic.route.ts` | Clinic info |
| `routes/vet.route.ts` | Vet-specific endpoints |
| `routes/carePlan.route.ts` | Care plan CRUD |
| `routes/carePlanTask.route.ts` | Task CRUD + task entries (completions) |
| `services/assistant.service.ts` | Full AI assistant: context building, OpenAI call, alert creation from `[ALERT]` blocks |
| `middleware/auth.middleware.ts` | JWT verification |
| `middleware/requireAdmin.middleware.ts` | Admin-only route guard |
| `middleware/requireVet.middleware.ts` | Vet-only route guard |

#### Frontend (`/frontend/src/`)

| Page / Component | What it does |
|---|---|
| `LoginPage`, `SignupPage` | Auth flows |
| `HomePage` | Role-based redirect after login |
| `OwnerLayout` + `OwnerHome` | Owner dashboard shell |
| `OwnerPetsPage` | List and manage owner's pets |
| `OwnerPlansPage` | List of active care plans for owner |
| `OwnerCarePlanDetailPage` | Detail view of a care plan (tasks visible) |
| `OwnerAddPetPage` | Add a new pet |
| `VetLayout` + `VetHome` | Vet dashboard shell |
| `VetPatientsPage` | List of vet's patients |
| `VetCarePlansPage` | List of care plans assigned to vet |
| `VetCarePlanDetailPage` | Full detail view of a care plan |
| `AdminLayout` + `AdminHome` | Admin dashboard shell |
| `AiAssistant.tsx` | Chat UI for the AI assistant |
| `ProfilePage` | User profile |
| `ProtectedRoute.tsx` | Auth guard for routes |

### What Is Missing for the Demo

| Priority | Feature | Where to add |
|---|---|---|
| **HIGH** | **Care plan templates** — admin creates, vets use them | New admin pages + backend route/service |
| **HIGH** | **Task completion by owner** — check off/enter values for daily tasks | `OwnerCarePlanDetailPage` + backend entries endpoint |
| **HIGH** | **Symptom logging by owner** — free text + severity | New component in owner plan detail + backend |
| **HIGH** | **Admin panel: enroll vets** — invite/create vet accounts | Admin pages (currently only home exists) |
| **HIGH** | **Admin panel: enroll patients/owners** | Admin pages |
| **MEDIUM** | **Vet progress view** — completion stats + symptom timeline | `VetCarePlanDetailPage` enhancements |
| **MEDIUM** | **Vet comments/notes** visible to owner on the plan | Both plan detail pages |
| **MEDIUM** | **Alert badges** — vet sees unread alerts from AI escalation | Vet layout + nav |
| **LOW** | **Template selector in vet create-plan flow** | Create plan dialog |
| **LOW** | **Push / email notifications** for task reminders | Backend scheduled job |

---

## 5. Development Roadmap

### Phase 1 — Complete the Demo (2–3 weeks)

Goal: end-to-end working demo covering all 3 roles.

#### Step 1 — Admin: Enroll Vets & Owners
- `GET /admin/vets` — list enrolled vets
- `POST /admin/vets` — invite/create a vet account
- `GET /admin/owners` — list enrolled owners
- `POST /admin/owners` — create an owner account and link to clinic
- Frontend: Admin pages for vet management and patient management

#### Step 2 — Admin: Care Plan Templates
- Backend:
  - `GET /templates` — list clinic templates
  - `POST /templates` — create template with tasks
  - `PUT /templates/:id` — update
  - `DELETE /templates/:id` — delete
  - `GET /templates/:id/tasks` — list template tasks
- Frontend:
  - Admin template list page
  - Create/edit template form with dynamic task builder

#### Step 3 — Owner: Task Completion
- `POST /care-plan-tasks/:taskId/entries` already scaffolded in types
- Frontend: in `OwnerCarePlanDetailPage`, render task list with input controls per task type:
  - checkbox for `boolean`
  - number input for `vital` / `measurement`
  - 1–5 slider for `scale`
  - text input for `text` / `symptom_check`

#### Step 4 — Owner: Symptom Logging
- Add a "Log Symptom" button in the owner plan detail view
- Form: symptom description (text) + severity (low / medium / high)
- Backend: `POST /care-plans/:planId/symptoms`
- Store in a `symptom_logs` table or reuse `messages` table with a `symptom` channel

#### Step 5 — Vet: Progress Dashboard
- In `VetCarePlanDetailPage`, add two sections:
  - **Compliance chart**: tasks completed vs. missed per day (last 7 days)
  - **Symptom log timeline**: chronological list of owner-submitted logs
- Backend: `GET /care-plans/:planId/progress` — aggregate task entries + symptom logs

#### Step 6 — Alerts & Vet Comments
- Show alert count badge in vet sidebar navigation
- `GET /vet/alerts` — fetch unread alerts
- `PATCH /vet/alerts/:id` — mark as read
- Add comment field in vet plan detail; store as a `messages` record with `channel: "vet_note"`

### Phase 2 — Polish & Production Readiness (4–6 weeks)

- Email notifications (task reminders to owner, alert emails to vet)
- Mobile-responsive UI / PWA for owners using from phone
- Migrate AI assistant from OpenAI to Claude (Anthropic) API for better guardrails
- Dashboard analytics for admin (active plans count, compliance rates)
- PDF export of a care plan summary (for paper records)
- Audit log for plan changes

### Phase 3 — Growth Features (Post-launch)

- Multi-clinic support (one vet working at multiple clinics)
- Appointment scheduling integration
- In-app messaging between owner and vet (beyond the AI assistant)
- Telemedicine consultation booking
- Owner satisfaction surveys at plan closure
- API for integration with clinic management software (e.g. ezyVet, VetBadger)

---

## 6. Demo Flow (MVP Pitch)

This 5-step walkthrough covers all three roles and demonstrates the full value loop:

**Step 1 — Admin creates a template**
> Admin logs in → goes to Templates → creates "Post-surgery recovery" with 4 tasks:
> "Give antibiotic", "Measure temperature", "Check incision site", "Rest — no jumping"

**Step 2 — Vet creates a care plan**
> Vet logs in → goes to Patients → selects "Max (Labrador, owner: Ana)" → creates a care plan from the "Post-surgery recovery" template → sets start date → sets status to `at_home`

**Step 3 — Owner checks daily tasks**
> Owner (Ana) logs in → sees Max's active plan → checks off "Give antibiotic" → enters temperature `38.7°C` → logs a symptom: "wound looks slightly swollen, severity: medium"

**Step 4 — Vet sees progress**
> Vet logs in → opens Max's care plan → sees compliance: 3/4 tasks done today → reads the symptom log → leaves a comment: "Monitor for 24h, if swelling increases call the clinic"

**Step 5 — Owner uses the AI assistant**
> Owner opens the assistant in Max's plan → asks "Is 38.7°C normal for a dog after surgery?" → assistant responds with context-aware information and reminds her to contact the vet if temperature rises above 39.5°C

---

## 7. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Fast dev experience, type safety, component ecosystem |
| Backend | Node.js + Express + TypeScript | Lightweight, easy to extend, familiar JS ecosystem |
| Database | Supabase (PostgreSQL) | Managed Postgres + auth + realtime subscriptions out of the box |
| Auth | Custom JWT (via Supabase) | Full control over roles and permissions |
| AI Assistant | OpenAI API → planned migration to Claude | Context-aware chat, safety guardrails, no diagnosis |
| Hosting (planned) | Vercel (frontend) + Railway or Render (backend) | Low cost, easy deploy for demo |

---

## 8. Database Model Overview

```
clinics
  id, name, contact_email, phone, address

users
  id, email, first_name, last_name, role (admin | vet | owner), clinic_id

pets
  id, owner_user_id, clinic_id, name, species, breed, date_of_birth, weight_baseline

care_plans
  id, pet_id, clinic_id, assigned_vet_user_id
  status (draft | in_clinic | at_home | follow_up | closed)
  title, description, start_date, discharge_at, closed_at

care_plan_tasks
  id, care_plan_id, task_type, label, frequency, schedule_time
  description, value_schema (JSONB), is_required, sort_order, status

care_plan_task_entries        ← owner's daily completions
  id, task_id, care_plan_id, entered_by_user_id, entered_by_role
  value_json (JSONB), note, created_at

symptom_logs                  ← owner's symptom reports
  id, care_plan_id, reported_by_user_id, description, severity, created_at

messages                      ← AI assistant chat + vet notes
  id, care_plan_id, sender_user_id, sender_role, text, channel, created_at

alerts                        ← escalations triggered by AI or missed tasks
  id, care_plan_id, message_id, severity, trigger_type, status, summary, created_at

templates                     ← admin-created reusable plan templates
  id, clinic_id, title, description, created_by_user_id, created_at

template_tasks                ← tasks belonging to a template
  id, template_id, task_type, label, frequency, schedule_time
  description, value_schema (JSONB), is_required, sort_order
```

---

## 9. Business Plan

### 9.1 Problem & Opportunity

- ~80% of post-operative and chronic treatment failures in veterinary medicine are related to owner non-compliance at home (missed medications, ignored instructions)
- Vets have no visibility into what happens after discharge
- Owners feel anxious and unsupported, leading to unnecessary emergency calls or visits
- The global veterinary software market is valued at ~$1.5B and growing at 8–10% annually

### 9.2 Value Proposition

| For clinics | Reduce phone call volume from worried owners; increase client satisfaction and loyalty |
| For vets | Real-time visibility into recovery without physical visits; earlier detection of complications |
| For owners | Clear daily instructions; confidence that they are doing the right thing; direct AI-assisted support |

### 9.3 Business Model

**Primary revenue: Monthly SaaS subscription per clinic**

| Plan | Target | Price (estimate) | Includes |
|---|---|---|---|
| **Starter** | Solo vet / small clinic | €49/month | 1 vet, up to 20 active plans |
| **Professional** | 2–5 vet clinic | €129/month | Up to 5 vets, unlimited active plans, templates |
| **Clinic+** | Multi-doctor / specialty clinic | €249/month | Unlimited vets, priority support, analytics dashboard, PDF export |
| **Enterprise** | Veterinary hospital chains | Custom pricing | Multi-clinic, API integration, white-label option |

**Secondary revenue streams:**
- Per-SMS / per-email notification overage billing
- One-time onboarding / setup fee for Enterprise
- Future: commission on telemedicine consultations booked through the platform

### 9.4 Target Market

**Primary:** Veterinary clinics in Romania and the EU with 1–10 doctors

**Segments:**
- General practice veterinary clinics (highest volume)
- Specialized surgery and oncology clinics (highest care plan complexity)
- Animal rehabilitation centers (longest recovery plans)
- Emergency and 24h clinics (high post-discharge follow-up need)

**Market size (Romania estimate):**
- ~5,000 registered veterinary practices in Romania
- Even 2% adoption at Starter tier = 100 clinics × €49 = ~€5,000 MRR from Romania alone
- EU expansion multiplies this by 10–20x

### 9.5 Competitive Landscape

| Competitor | What they do | Gap we fill |
|---|---|---|
| ezyVet / VetBadger | Full clinic management (appointments, billing) | No owner-facing recovery tracking |
| PetDesk / Vet2Pet | Appointment reminders, basic messaging | No structured care plan or task tracking |
| WhatsApp / paper | What most clinics use today | Unstructured, no tracking, no AI support |
| **VetCare Recovery** | Structured care plans + owner tracking + AI assistant | **This exact gap — nobody owns it yet** |

### 9.6 Go-to-Market Strategy

**Phase 1 — Validate (months 1–3)**
- Identify 3–5 pilot clinics willing to test the app for free
- Run the demo (Section 6) with clinic owners and vets
- Collect structured feedback on the most valuable and most confusing features
- Goal: 2 paying clinics by end of month 3

**Phase 2 — Launch (months 4–6)**
- Launch paid subscriptions for early adopters at 50% discount for 12 months
- Create case studies from pilot clinics (compliance improvement, call volume reduction)
- Submit to veterinary trade publications and conferences (e.g. RAVMB, local vet associations)
- Goal: 10 paying clinics

**Phase 3 — Scale (months 7–18)**
- Hire a sales/account manager focused on vet clinics
- Partner with veterinary schools (students recommend it to future employers)
- Expand to neighboring markets (Moldova, Hungary, Bulgaria)
- Goal: 50–100 paying clinics, €5k–€12k MRR

### 9.7 Financial Projections (Simplified)

| Timeline | Clinics | Avg Revenue/Clinic/Month | MRR | ARR |
|---|---|---|---|---|
| Month 6 | 10 | €80 | €800 | €9,600 |
| Month 12 | 30 | €100 | €3,000 | €36,000 |
| Month 18 | 80 | €120 | €9,600 | €115,200 |
| Month 24 | 150 | €130 | €19,500 | €234,000 |

**Key costs:**
- Hosting: ~€50–100/month (Supabase + Vercel + Railway)
- AI API (OpenAI / Claude): ~€0.01–0.05 per conversation, negligible at early scale
- Development: founder-led at this stage
- Marketing: €200–500/month (LinkedIn ads, vet association partnerships)

### 9.8 Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Clinics won't pay for a new tool | Offer free pilot; show measurable ROI (call reduction) |
| Owners won't use the app | Mobile-first UX; push notifications; very simple onboarding |
| Liability concerns (AI advice) | Strict "no diagnosis" policy hardcoded in AI prompt; legal disclaimer |
| Data privacy (GDPR) | Supabase EU region; data processing agreement; no data sold |
| Competition from large players | Speed to market; niche focus; better UX than bloated PMS tools |

---

## 10. Marketing Plan

### 10.1 Brand Positioning

**Tagline:** *"The bridge between clinic and home"*

**Brand voice:** Professional but warm. We speak to vets as peers and to owners as caring companions. Not clinical and cold — reassuring and practical.

**Core messages:**
- For vets: "See your patient's recovery, not just their discharge"
- For owners: "Never feel alone in caring for your pet"
- For clinics: "Fewer worried calls. More confident clients. Better outcomes."

### 10.2 Target Audience Profiles

**Persona 1 — Dr. Elena, vet surgeon (35)**
- Performs 3–5 surgeries per week; patients go home after 1–2 days
- Worries about post-op complications that owners miss
- Gets 5–10 "is this normal?" phone calls per week
- Wants: peace of mind, less time on the phone, proof that owners follow instructions

**Persona 2 — Andrei, pet owner (32)**
- Dog had orthopedic surgery; discharged with a 3-page paper handout
- Anxious about doing something wrong; doesn't want to bother the vet for "small" things
- Wants: clear daily guidance, someone to ask questions to, confirmation he's doing it right

**Persona 3 — Clinic Owner / Manager (45)**
- Runs a 4-vet clinic; focused on reputation and client retention
- Clients leave negative reviews when they feel unsupported after discharge
- Wants: a differentiator from other clinics, improved client satisfaction, efficient vet time

### 10.3 Marketing Channels

#### Direct Sales (most effective for B2B SaaS in niche markets)
- Personal outreach to clinic owners via LinkedIn and email
- Attend 1–2 regional veterinary conferences per year (demo booth or speaking slot)
- Partner with veterinary product distributors who already have clinic relationships

#### Content Marketing
- Blog: "How to improve post-op compliance in veterinary practice" — SEO-targeted articles
- YouTube / Instagram Reels: short clips showing the owner view of the app (emotional, relatable)
- LinkedIn articles targeting vets: case studies, compliance data, "state of veterinary aftercare"

#### Community & Referral
- Partner with veterinary schools — offer free accounts to students on clinical rotations
- Referral program: a clinic that refers another clinic gets 1 month free
- Facebook/Reddit groups for pet owners — organic presence, answer questions helpfully

#### Paid Advertising (Phase 2+)
- LinkedIn ads targeting veterinarians and clinic managers in Romania / EU
- Google Search ads for "veterinary software Romania", "animal care plan app"
- Facebook/Instagram ads targeting pet owners with a recent vet visit (interest targeting)

### 10.4 Demo & Sales Strategy

**The demo is the strongest sales tool.** Structure every demo as:

1. **The problem** (2 min): "After discharge, what happens? You lose visibility. The owner is on their own."
2. **The solution** (10 min): Walk through the 5-step demo flow (Section 6)
3. **The outcome** (3 min): "Your clients feel supported. You get notified before problems escalate. Fewer calls, better outcomes."
4. **Pricing + pilot offer** (5 min): Start free for 30 days, no setup fee

**Leave-behind materials:**
- 1-page PDF flyer (problem / solution / pricing / QR code to demo)
- Short video walkthrough (2–3 min screen recording)
- Access to a live demo environment with sample data

### 10.5 Key Metrics to Track

| Metric | Target (Month 6) |
|---|---|
| Demo calls booked | 20+ |
| Pilot clinics activated | 5 |
| Conversion rate (pilot → paid) | > 50% |
| Owner DAU on active plans | > 60% (owners use it daily) |
| Vet satisfaction score (NPS) | > 40 |
| Churn rate | < 5% monthly |

### 10.6 Launch Checklist

- [ ] Landing page live (problem, solution, screenshots, pricing, "Book a demo" CTA)
- [ ] Demo environment ready with realistic sample data
- [ ] 1-page pitch PDF created
- [ ] LinkedIn company page created
- [ ] Legal: Terms of Service + Privacy Policy (GDPR compliant)
- [ ] 3 pilot clinic partners confirmed
- [ ] Feedback collection form set up (post-demo and post-pilot)
- [ ] Email sequence: welcome → onboarding day 1 → onboarding day 3 → check-in week 2

---

*Document version: 1.0 — April 2026*
*Project: VetCare Recovery — Dissertation Demo & Business Pitch*
