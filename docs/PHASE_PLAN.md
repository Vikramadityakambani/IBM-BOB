# ContentPilot AI — Phased Implementation Roadmap & Checklists

**Project:** ContentPilot AI (PS 02 — Build with IBM Hackathon)  
**Methodology:** Incremental, test-driven, phase-by-phase delivery  
**Execution Environment:** Google Antigravity + IBM Bob  

---

## Roadmap Overview

```
Phase 0 [CURRENT] -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7 -> Phase 8
 Audit & Baseline     Design      API & DB   AI Studio   Library &   Governance  Campaigns   Polish &    IBM Bob &
 & Architecture       System     Auth Setup  Generation  Brand Voice  Workflow   & Calendar  Tests       Submission
```

---

## Phase Checklist

### [x] Phase 0 — Requirements, Repository Audit & Setup
- [x] Inspect existing workspace (Found initial `.docx` plans).
- [x] Initialize Git version control (`git init`).
- [x] Create root `.gitignore` and `.env.example`.
- [x] Write baseline PRD (`docs/PRODUCT_REQUIREMENTS.md`).
- [x] Write baseline Architecture Spec (`docs/ARCHITECTURE.md`).
- [x] Create project tracking checklist (`docs/PHASE_PLAN.md`).
- [x] Initialize `IBM_BOB_IMPLEMENTATION.md` for SDLC contribution logging.
- [x] Verify local runtimes: Node.js (v24), npm (v11), Python (v3.12).
*Exit Criteria Met:* Clean repository structure initialized, scope and stack fully agreed.

---

### [x] Phase 1 — SaaS Design System & Application Shell
- [x] Initialize frontend project (`frontend/` with React 18, TypeScript, Tailwind CSS, Vite).
- [x] Configure design tokens: Enterprise neutral slate surfaces, primary indigo accents, status colors (Draft: Slate, In Review: Amber, Approved: Emerald, Scheduled: Blue, Rejected: Rose).
- [x] Build reusable UI atomic library: `Button`, `Input`, `Select`, `Modal/Dialog`, `Badge`, `Toast`, `Table`, `Card`, `Skeleton`.
- [x] Build responsive SaaS layout shell:
  - Collapsible Sidebar with navigation items (AI Studio, Content Library, Review Queue, Campaigns, Calendar, Brand Voice, Settings).
  - Header with Workspace Switcher, Role Badge (`Creator` / `Reviewer` / `Admin`), and User Profile Menu.
  - Active page container with breadcrumbs and view state indicators.
- [x] Implement client-side routing, feature views, and responsive mobile breakpoints.
*Checkpoint A1 Exit Criteria Met:* Polished, responsive application shell runs locally at `localhost:5173` with coherent styling, tested via browser subagent.

---

### [x] Phase 2 — Backend Foundation, Database & Authentication
- [x] Initialize Python FastAPI backend (`backend/` with modular structure: `app/api`, `app/core`, `app/models`, `app/schemas`, `app/services`).
- [x] Configure SQLAlchemy ORM models with SQLite zero-dependency local dev and PostgreSQL support.
- [x] Implement JWT authentication with bcrypt password hashing (`/api/auth/login`, `/api/auth/me`, `/api/auth/demo-switch`).
- [x] Seed default multi-tenant demo users (`creator@demo.com`, `reviewer@demo.com`, `admin@demo.com`), workspace, brand voice, and content items.
- [x] Enforce server-side role-based authorization (`require_role`) and Separation of Duties.
- [x] Expose health check (`/api/health`) and OpenAPI Swagger documentation (`/docs`).
- [x] Create automated pytest suite (8/8 tests passing for health, auth, role governance, and AI orchestration).
*Checkpoint A2 Exit Criteria Met:* Backend runs at `localhost:8000`, passes all health and governance tests, seeds demo users, and validates JWT sessions.

---

### [x] Phase 3 — AI Studio & Content Generation
- [x] Build AI Studio form: Topic/Brief, Target Audience, Objective, Tone, Platform, Language (English, Hindi, Marathi), Format.
- [x] Implement server-side AI Orchestration service with provider adapter (Mock adapter + extensible OpenAI/Gemini/watsonx).
- [x] Build generation & refinement endpoints (`POST /api/ai/generate`, `POST /api/ai/refine`, `POST /api/ai/repurpose`, `POST /api/ai/quality-check`).
- [x] Implement inline editing controls with quick actions: Regenerate, Rewrite, Shorten, Expand, Change Tone, Repurpose.
- [x] Implement Advisory Content Quality Checker (readability, CTA check, length constraint feedback, brand compliance).
- [x] Handle AI provider timeouts, rate-limits, and user-friendly error banners.
*Checkpoint B Exit Criteria Met:* Creator can generate content in AI Studio, edit it, repurpose it, and review quality suggestions; verified via automated test suite and live browser tour.

---

### [x] Phase 4 — Content Library, Brand Voice & Search
- [x] Implement Content CRUD persistence (`POST /api/content`, `GET /api/content`, `PATCH /api/content/{id}`, `DELETE /api/content/{id}`).
- [x] Implement Brand Voice settings UI & backend storage (Tone, Audience, Preferred Terms, Prohibited Phrases).
- [x] Auto-inject Brand Voice guidelines into backend LLM generation prompts.
- [x] Build Content Library UI: Grid/Table views, live search, multi-filter by status, platform, date, and campaign.
- [x] Add content duplication (`POST /api/content/{id}/duplicate`) and version tracking (`v1` -> `v2` on edits).
*Checkpoint C1 Exit Criteria Met:* Content items persist reliably across page refreshes, can be filtered, searched, duplicated, edited with version bumping, and verified via 14 automated pytest tests and browser tour.

---

### [x] Phase 5 — Review, Approval & Audit Workflow
- [x] Implement strict state machine transitions in backend (`/submit-review`, `/approve`, `/request-changes`, `/reject`, `/schedule`).
- [x] Enforce role permissions (Creators cannot self-approve; Reviewers/Admins required).
- [x] Implement Review Queue UI with count badges and priority views.
- [x] Implement revision notes modal and contextual comments (`/api/content/{id}/comments`).
- [x] Build visual Activity Timeline showing timestamped transition history and reviewer notes.
- [x] Append-only audit event logging for all state changes (`/api/content/{id}/audit-trail`, `/api/content/audit/events`).
*Checkpoint C2 Exit Criteria Met:* Complete end-to-end governance lifecycle tested with Creator and Reviewer roles; verified via 15/15 passing automated pytest tests and recorded browser tour.

---

### [ ] Phase 6 — Campaigns, Calendar & Collaboration
- [ ] Build Campaign Management UI and backend API (`/api/campaigns`).
- [ ] Associate content items with active campaigns.
- [ ] Build interactive Calendar & Schedule Planner view (`/api/calendar`).
- [ ] Add timezone-aware planned publishing date inputs.
- [ ] Display status badges directly inside the calendar matrix.
*Checkpoint D Exit Criteria:* Campaign grouping and calendar scheduling visualizer operational.

---

### [ ] Phase 7 — Testing, Security, Polish & Deployment
- [ ] Backend unit and integration tests (pytest for auth, permissions, content CRUD, workflow transitions).
- [ ] Frontend unit tests and build validation (`npm run build`).
- [ ] Security audit: verify zero exposed API keys in client, verify workspace isolation.
- [ ] Prepare `docker-compose.yml` for unified one-command local startup.
- [ ] Document seed data walkthrough and demo script for judges.
*Checkpoint E1 Exit Criteria:* All tests pass, build completes cleanly, demo walkthrough verified.

---

### [ ] Phase 8 — IBM Bob Evidence & Final Submission
- [ ] Maintain comprehensive, authentic evidence entries in `IBM_BOB_IMPLEMENTATION.md`.
- [ ] Document exact SDLC tasks: Requirements analysis, code generation, code review, debugging, test generation.
- [ ] Verify alignment with official hackathon submission rubric.
- [ ] Deliver final submission package with complete documentation.
*Checkpoint E2 Exit Criteria:* Submission package complete with genuine IBM Bob SDLC log.
