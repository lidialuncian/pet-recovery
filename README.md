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
*Identity / clinic membership*

# users
    Stores account identity
    key fields: id, email, password_hash, first_name, last_name, role
        id uuid
        email text (unique, not null)
        password_hash text (or use Supabase Auth and don’t store this yourself)
        first_name text
        last_name text
        role text with CHECK
            values: owner, vet, admin

# clinics
    id, name, contact_email, phone
        id uuid
        name text
        contact_email text
        phone text (phone formatting varies; text is safest)

# user_clinic_roles
    Links users to clinics with a clinic-context role
    id, user_id (FK users), clinic_id (FK clinics), role_in_clinic, status
        id uuid
        user_id uuid FK → users.id
        clinic_id uuid FK → clinics.id
        role_in_clinic text with CHECK
            values: vet, admin
        status text with CHECK
            values: active, disabled

***Relationships***
users 1..N user_clinic_roles

clinics 1..N user_clinic_roles



*Pets, owners, clinic patient registry*

# pets
    Global pet record
    id, name, species, breed, sex, date_of_birth, weight_baseline
    optional convenience: primary_clinic_id (FK clinics)
        id uuid
        name text
        species text 
        breed text (optional)
        sex text with CHECK (male, female, unknown)
        date_of_birth date (date is fine; time not needed)
        weight_baseline numeric(6,2) (kg, allows e.g. 123.45)
        primary_clinic_id uuid FK → clinics.id (nullable)
        profile_photo_path text

# pet_owners
    Pet ownership/access mapping
    id, pet_id (FK pets), owner_user_id (FK users), is_primary
        id uuid
        pet_id uuid FK → pets.id
        owner_user_id uuid FK → users.id
        is_primary boolean

# clinic_pets
    Clinic-patient relationship
    id, clinic_id (FK clinics), pet_id (FK pets), patient_number
        id uuid
        clinic_id uuid FK → clinics.id
        pet_id uuid FK → pets.id
        patient_number text (often contains letters; text is safest)

***Relationships***
pets 1..N pet_owners

users (owners) 1..N pet_owners

clinics 1..N clinic_pets

pets 1..N clinic_pets

(Important: no direct relationship between pet_owners and clinic_pets; both connect through pets.)



*Care plans (recovery cases) and structured monitoring*

# care_plans
    Recovery episode created by vet
    id, pet_id (FK pets), clinic_id (FK clinics), assigned_vet_user_id (FK users), status, start_date, discharge_at, closed_at
        id uuid
        pet_id uuid FK → pets.id
        clinic_id uuid FK → clinics.id
        assigned_vet_user_id uuid FK → users.id
        status text with CHECK
            values: draft, in_clinic, at_home, follow_up, closed
        start_date date
        discharge_at timestamptz (nullable)
        closed_at timestamptz (nullable)
        description text
        title text

# care_plan_tasks
    What to track/do in that care plan
    id, care_plan_id (FK care_plans), task_type, label, is_required, frequency, sort_order
        id uuid
        care_plan_id uuid FK → care_plans.id
        task_type text with CHECK
            values like: boolean, number, scale, text, photo
        label text
        is_required boolean not null
        frequency text with CHECK (MVP)
            values: daily, weekly, once, as_needed
        sort_order int not null
        description text
        schedule_time time
        due_window_minutes int
        value_schema jsonb default '{}'::jsonb
        status text default 'active'

# care_plan_task_entries
    Actual submitted values over time
    id, task_id (FK care_plan_tasks), care_plan_id (FK care_plans), entered_by_user_id (FK users), entered_by_role, value_json, note, created_at
        id uuid
        task_id uuid FK → care_plan_tasks.id
        care_plan_id uuid FK → care_plans.id
        entered_by_user_id uuid FK → users.id
        entered_by_role text with CHECK (owner, vet, bot, staff)
        value_json jsonb not null
        note text
        created_at timestamptz not null default now()

***Relationships***
pets 1..N care_plans

clinics 1..N care_plans

users (vet) 1..N care_plans via assigned_vet_user_id

care_plans 1..N care_plan_tasks

care_plan_tasks 1..N care_plan_task_entries

users 1..N care_plan_task_entries (who entered it)


*Medications*

# medications
    Prescription/setup
    id, care_plan_id (FK care_plans), name, dose, unit, route, frequency, instructions, start_date, end_date
        id uuid
        care_plan_id uuid FK → care_plans.id
        name text
        dose numeric(10,2) (supports decimals)
        unit text (mg, ml, tablet, etc.)
        route text (oral, topical, etc.)
        frequency text (e.g. “BID”, “every 8 hours” — keep text for MVP)
        instructions text
        start_date date
        end_date date (nullable)

# medication_doses
    Dose events (taken/missed)
    id, medication_id (FK medications), scheduled_at, taken_at, status, entered_by_user_id (FK users), reason, created_at
        id uuid
        medication_id uuid FK → medications.id
        scheduled_at timestamp (nullable if you only log taken/missed without schedule)
        taken_at timestamp (nullable)
        status text with CHECK (taken, missed, skipped)
        entered_by_user_id uuid FK → users.id
        reason text
        created_at timestamptz not null default now()

***Relationships***
care_plans 1..N medications

medications 1..N medication_doses

users 1..N medication_doses (who confirmed it)



*Messaging + alerts + attachments*

# messages
    Owner/bot/vet conversation per care plan
    id, care_plan_id (FK care_plans), sender_user_id (FK users), sender_role, text, channel, created_at
        id uuid
        care_plan_id uuid FK → care_plans.id
        sender_user_id uuid FK → users.id (nullable for bot)
        sender_role text with CHECK (owner, vet, bot, staff)
        text text
        channel text with CHECK (in_app, assistant)
        created_at timestamptz not null default now()`

# alerts
    Red-flag escalation (often triggered by a message)
    id, care_plan_id (FK care_plans), message_id (FK messages), severity, trigger_type, status, summary, created_at
        id uuid
        care_plan_id uuid FK → care_plans.id
        message_id uuid FK → messages.id (nullable if alert comes from rule on entries, etc.)
        severity text with CHECK (monitor, urgent, critical)
        trigger_type text with CHECK (rules, assistant) (or keyword, model, etc.)
        status text with CHECK (new, acknowledged, resolved)
        summary text
        created_at timestamptz not null default now()`

# attachments
    Files linked to a care plan
    id, care_plan_id (FK care_plans), uploaded_by_user_id (FK users), type, file_url, metadata_json, created_at
        id uuid
        care_plan_id uuid FK → care_plans.id
        uploaded_by_user_id uuid FK → users.id
        type text with CHECK (photo, wound_photo, video, document, other)
        file_url text (store storage path/key, not public URL)
        metadata_json jsonb not null default '{}'::jsonb
        created_at timestamptz not null default now()`

***Relationships***
care_plans 1..N messages

messages 0..N alerts (some messages trigger alerts)

care_plans 1..N alerts

care_plans 1..N attachments

users 1..N messages / attachments (who created/uploaded)


**Supabase Storage (pet profile photos)**
- Backend uploads to bucket `pet-photos` at path `pets/<petId>/profile.<ext>`.
- **RLS error fix:** The backend must use the **service_role** key (Project Settings → API → `service_role` secret), not the anon key. Set `SUPABASE_KEY` in `.env` to the service_role key so Storage uploads are allowed (service role bypasses RLS).
- Create the bucket `pet-photos` in Supabase Dashboard → Storage.
- **Images (signed URLs):** The backend returns time-limited signed URLs for `profile_photo_url`, so the bucket can stay **private**. You do not need to set the bucket to Public.
- If you cannot use the service_role key, add a Storage policy in Supabase (Storage → pet-photos → Policies) that allows uploads and that allows the backend to create signed URLs (e.g. select/read for the object path).

