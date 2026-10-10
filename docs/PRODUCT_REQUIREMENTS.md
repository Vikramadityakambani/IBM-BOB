# ContentPilot AI — Product Requirements Document (PRD)

**Project Identifier:** PS 02 — Build with IBM Hackathon  
**Development Tooling:** Google Antigravity + IBM Bob  
**UX & Workflow Reference:** Agiloft-inspired Enterprise SaaS  
**Document Status:** Approved Baseline (Phase 0)

---

## 1. Executive Summary

**ContentPilot AI** is an enterprise-grade AI content creation, repurposing, and governance platform designed for distributed marketing and communications teams. While existing generative AI tools generate copy in silos, enterprise organizations struggle with:
1. **Brand Voice Drift:** Inconsistent tone, unauthorized vocabulary, and off-brand phrasing across channels.
2. **Lack of Governance:** No verifiable approval workflows, reviewer feedback loops, or audit trails before publishing.
3. **Fragmented Workflows:** Disconnected copy generation, platform adaptation, and campaign scheduling.

ContentPilot AI combines **server-orchestrated LLM generation** with **Agiloft-inspired enterprise governance**, providing role-based review queues, brand-safety guardrails, platform-specific repurposing (LinkedIn, Instagram, X, YouTube, Blog), and timezone-aware campaign scheduling.

---

## 2. Target Personas & Roles

| Role | Primary Objectives | Key Pain Points | Platform Permissions |
| :--- | :--- | :--- | :--- |
| **Creator** | Generate creative briefs, write multi-platform copy, repurpose assets, submit drafts for review. | Tedious multi-channel formatting, keeping track of brand voice guidelines, waiting on feedback. | Create drafts, edit own drafts, submit for review, comment. Cannot self-approve. |
| **Reviewer** | Review submitted content, ensure factual and brand compliance, approve or request revisions. | Managing review backlog, unorganized feedback across emails/Slack, risk of unauthorized publishing. | View review queue, approve drafts, request changes with notes, reject, comment. |
| **Workspace Admin** | Manage workspace members, configure brand voice rules, oversee campaigns and audit logs. | Lack of visibility into content production, compliance risks, team management. | All Creator and Reviewer capabilities + manage Brand Profiles, team members, workspace settings, view audit logs. |

---

## 3. Core Functional Requirements (MVP Scope)

### 3.1 AI Studio & Content Generation (P0)
- **Multi-parameter Generation:** Generate drafts based on Topic/Brief, Target Audience, Objective, Tone (Professional, Casual, Persuasive, Thought-Leadership, Bold), Target Platform, and Language (English, Hindi, Marathi).
- **Inline Editing & Regeneration:** Full rich-text or formatted text editing with quick actions: Regenerate, Rewrite, Shorten, Expand, Change Tone.
- **Platform Repurposing:** Take an approved or draft asset and repurpose it into tailored platform formats (e.g., Long-form Blog $\to$ LinkedIn Post $\to$ Instagram Caption $\to$ X Thread).
- **Advisory Quality Checker:** Real-time advisory feedback on readability, CTA presence, character limits per platform, and brand voice alignment.

### 3.2 Brand Voice Management (P1)
- Workspace-level Brand Profile containing:
  - Brand Tone & Persona guidelines.
  - Target audience definitions.
  - Preferred vocabulary / Approved keywords.
  - Prohibited phrases / Competitor terms / Disallowed claims.
  - Style guidance notes injected automatically into backend LLM prompts.

### 3.3 Enterprise Review & Approval Workflow (P0)
- **Strict State Machine:**
  - `Draft` $\to$ `In Review` (Creator submits).
  - `In Review` $\to$ `Approved` (Reviewer or Admin approves).
  - `In Review` $\to$ `Draft` (Reviewer requests changes with mandatory revision notes).
  - `In Review` $\to$ `Rejected` (Reviewer rejects with rationale).
  - `Approved` $\to$ `Scheduled` (Assign planned publication date and time).
- **Review Queue:** Centralized dashboard for Reviewers to batch-inspect pending submissions.
- **Contextual Comments:** Inline and thread-based comments between Creators and Reviewers.
- **Immutable Audit Trail:** Log every transition with Actor ID, Action, Timestamp, and Feedback notes.

### 3.4 Content Library & Asset Management (P0)
- Searchable, filterable repository of all workspace content items.
- Filter by status (`Draft`, `In Review`, `Approved`, `Scheduled`), platform, tone, and campaign.
- Version tracking and quick duplicate/archive capabilities.

### 3.5 Campaigns & Calendar Planner (P1)
- Group content items under defined marketing campaigns with start/end dates and objectives.
- Calendar & timeline view of scheduled content items with timezone-aware metadata.
- *Notice:* Clearly labeled as internal scheduling metadata; does not simulate external social network posting APIs unless authenticated integrations exist.

---

## 4. Non-Functional Requirements

1. **Security & Data Privacy:**
   - LLM API keys are stored solely on the server in environment variables; never exposed to the frontend.
   - All API endpoints strictly enforce workspace isolation and role permissions.
2. **Performance & Reliability:**
   - Fast UI response with optimistic state updates, loading skeletons, and accessible keyboard navigation.
   - Resilient AI orchestration: Server handles provider timeouts, retries, and clean error messages without dropping user input.
3. **Accessibility & Enterprise UX:**
   - WCAG 2.1 AA compliant contrast ratios, accessible form controls, clear status badges, and screen-reader-friendly modals.
4. **Offline / Mock Testing Capability:**
   - Backend includes a built-in mock LLM provider so local tests and automated CI do not incur API costs or fail due to network outages.

---

## 5. Acceptance Criteria

- **AC-1:** A Creator can log in, select a workspace, enter a prompt in AI Studio, and receive formatted content drafts.
- **AC-2:** The Creator can edit the draft and submit it to the Review Queue (`Draft` $\to$ `In Review`).
- **AC-3:** A Reviewer can view the queue, request revisions with feedback (`In Review` $\to$ `Draft`), and the Creator sees the feedback in their timeline.
- **AC-4:** Upon revision and re-submission, the Reviewer approves the content (`In Review` $\to$ `Approved`).
- **AC-5:** An Approved item can be assigned a scheduled date (`Approved` $\to$ `Scheduled`) and appears on the campaign calendar.
- **AC-6:** Brand Voice forbidden terms are validated and flagged in the content.
- **AC-7:** All operations are recorded in the audit event log with timestamps and user identifiers.
