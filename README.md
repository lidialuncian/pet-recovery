Project Overview — Pet Recovery

Pet Recovery is a web platform that helps veterinary clinics and pet owners coordinate post-treatment and post-surgery recovery.

It is focused on structured follow-up care, not a full EHR or clinic management system.


**Target Users**
*Pet Owners*
- View their pets
- Follow active care plans
- Complete daily structured updates (e.g., appetite %, medication confirmation, wound photo)
- Message the clinic
- Use the AI recovery assistant

*Veterinarians*
- Create and manage care plans
- Define structured monitoring tasks
- Review owner-submitted updates
- Receive and triage alerts
- Message owners

*Clinic Admin (light MVP scope)*
- Manage clinic users
- Manage care plan templates


**Main Features (MVP)**
*Care Plans (Recovery Episodes)*
- Created by vets
- Linked to a specific pet and clinic
- Have status (draft, in_clinic, at_home, follow_up, closed)

*Structured Monitoring Tasks*
- Appetite %
- Medication confirmation
- Symptom tracking
- Photo uploads
- Logged over time

*Medication Tracking*
- Prescribed meds
- Scheduled doses
- Marked taken/missed

*Chat + AI Assistant*
- Context-aware support (care plan based)
- Red-flag detection
- Alert escalation to vet

*Triage-First Vet Dashboard*
- Critical alerts
- Urgent alerts
- Cases needing review


**MVP Guardrails**
*Not a full EHR/PMS*
- Pet Recovery is built to support recovery follow-up and communication, not to replace the clinic’s full medical record or practice software.

*Structured data > free text*
- The platform favors quick check-ins (simple fields and checklists) so progress is easy to track and easy for vets to review—while still allowing optional notes when needed.

*Recovery-focused, not general clinic operations*
- Everything is organized around active care plans (before/after discharge), so both owners and vets see what matters most during recovery rather than general clinic workflows.


**Future improvements / paths**
- Clinic-tailored configuration (templates, task sets, alert rules, branding, workflow variations per clinic)
- Expansion into a full EHR/PMS experience (clinical charting + documentation, scheduling, billing/payments, inventory/pharmacy, integrations, audit/compliance)


**App flow by user role**
*Pet Owner*
1. Sign up / log in
2. Join clinic (invite link/code OR clinic links them)
3. Dashboard
    See pets
    See Active Care Plans (only if a vet created one)
    See “today’s tasks” if there’s an active plan
4. My Pets
    View pet profiles (most pets will have no active plan)
5. Active Care Plan (when exists)
    Read vet instructions, restrictions, meds schedule
    Complete structured daily updates (tasks)
    Upload requested photos/videos
6. Chat / Assistant
    Ask questions
    If red-flag phrases appear → system escalates to vet (alert)
7. Reports / History
    View timeline of logs, meds confirmations, attachments, messages
8. Case closure
    When vet closes the plan → owner can still view it (read-only archive)


*Veterinarian*
1. Sign up / log in
2. Join clinic (admin invite/approval)
3. Dashboard (triage-first)
    Critical alerts
    Urgent alerts
    Cases needing review
4. Patients
    Search pets (patient list)
    View pet profile + owner links + clinic patient number
5. Create Care Plan (vet-only)
    Select pet + template
    Define status: draft / in_clinic / at_home
    Add: plan instructions, restrictions, meds, monitoring tasks
6. In-clinic phase (optional MVP)
    Add minimal notes related to recovery/discharge
7. Discharge
    Mark care plan as at_home
    Owner receives notification and tasks become active
8. Review progress
    View structured entries, meds adherence, photos, chat, alerts
    Adjust tasks/plan/meds as needed
9. Close
    Mark plan closed (archive)
    

*Clinic Admin (MVP-thin)*
1. Sign up / log in
2. Clinic settings
    Basic clinic profile
3. Staff management
    Invite vets/staff
    Assign clinic roles
4. Templates
    Create/edit care plan templates (tasks + guidance)


**Database tables (MVP) + relationships**
