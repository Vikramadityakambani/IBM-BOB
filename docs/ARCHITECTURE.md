# ContentPilot AI — System Architecture & Technical Design

**Document Version:** 1.0.0 (Phase 0 Baseline)  
**Problem Statement:** PS 02 — Build with IBM Hackathon  
**Target Architecture:** Multi-tenant Enterprise SaaS with AI Governance  

---

## 1. High-Level Architecture Overview

ContentPilot AI decouples the client interface, API gateway, AI orchestration, and relational data persistence layer to ensure enterprise reliability, security, and testability.

```
+-------------------------------------------------------------------------+
|                        DEVELOPMENT TOOLING                              |
|       Google Antigravity (Agentic IDE)  <--->  IBM Bob (SDLC Co-pilot)  |
|                               |                                         |
|                               v                                         |
|                        Git Repository                                   |
+-------------------------------------------------------------------------+
                                |
                                v
+-------------------------------------------------------------------------+
|                       PRESENTATION LAYER                                |
|        React 18 + TypeScript + Tailwind CSS (Vite SPA Application)      |
|     - Reusable Design Tokens & UI Component System                      |
|     - AI Studio, Content Library, Campaigns, Calendar, Review Queue    |
|     - Workspace & Role-based View Context                               |
+-------------------------------------------------------------------------+
                                |  HTTPS / REST JSON
                                v
+-------------------------------------------------------------------------+
|                    APPLICATION & API LAYER (FastAPI)                    |
|   - Authentication & Workspace Role Verification (Creator/Reviewer/Admin)|
|   - Content CRUD & Campaign Association Service                         |
|   - Enterprise Workflow State Engine & Audit Logging Service            |
|   - Brand Voice Sanitization & Prompt Assembly Service                  |
+-------------------------------------------------------------------------+
             |                                             |
             v                                             v
+-----------------------------+               +---------------------------+
|      AI ORCHESTRATION       |               |        DATA LAYER         |
|  - Provider-Neutral Adapter |               |    PostgreSQL / SQLite    |
|  - Prompt Injection Guard   |               |  - Users & Workspaces     |
|  - Timeout & Retry Policies |               |  - Content & Brand Models |
|  - Mock Adapter for Testing |               |  - Workflow & Audit Logs  |
|              |              |               +---------------------------+
|              v              |
|  External LLM Provider APIs |
|  (OpenAI / Gemini / watsonx)|
+-----------------------------+
```

---

## 2. Core Modules & Responsibilities

| Module | Location | Primary Responsibilities |
| :--- | :--- | :--- |
| **Frontend Shell** | `frontend/src/app` | Layouts, sidebar navigation, top bar, role badge, workspace switcher, and routing. |
| **Component System** | `frontend/src/components` | Buttons, dialogs, inputs, dropdowns, tables, status badges, skeletons, and toasts. |
| **Feature Views** | `frontend/src/features` | AI Studio (`ai-studio`), Library (`library`), Review Queue (`approvals`), Campaigns (`campaigns`), Settings (`settings`). |
| **API Client** | `frontend/src/services` | Typed Axios/Fetch client handling JWT tokens, workspace headers, and error toasts. |
| **API Routers** | `backend/app/api` | REST endpoints for `/auth`, `/workspaces`, `/content`, `/ai`, `/approvals`, `/campaigns`, `/audit`. |
| **Workflow Engine** | `backend/app/services` | Server-side validation of content state transitions, reviewer notes, and audit emission. |
| **AI Orchestration** | `backend/app/services/ai` | Provider abstraction, system prompt engineering with brand voice, and fallback handling. |
| **Database & ORM** | `backend/app/models` | SQLAlchemy models, Alembic migrations, database session management, indexes. |

---

## 3. Data Model & Entity Relationship Schema

The relational schema strictly isolates data by `workspace_id` to ensure enterprise data privacy:

### 3.1 Entities
- **User:** `id` (UUID), `email`, `display_name`, `hashed_password`, `is_active`, `created_at`
- **Workspace:** `id` (UUID), `name`, `slug`, `created_by` (FK $\to$ User), `created_at`
- **Membership:** `id` (UUID), `workspace_id` (FK), `user_id` (FK), `role` (`creator`, `reviewer`, `admin`), `created_at` (Unique: `workspace_id` + `user_id`)
- **BrandProfile:** `id` (UUID), `workspace_id` (FK), `name`, `tone`, `audience`, `preferred_terms` (JSON/Array), `prohibited_phrases` (JSON/Array), `style_guidelines` (Text)
- **Campaign:** `id` (UUID), `workspace_id` (FK), `name`, `objective`, `target_audience`, `start_date`, `end_date`, `status` (`planning`, `active`, `completed`)
- **ContentItem:** `id` (UUID), `workspace_id` (FK), `campaign_id` (FK nullable), `created_by` (FK $\to$ User), `title`, `body`, `platform` (`linkedin`, `instagram`, `x`, `youtube`, `blog`), `format`, `language` (`English`, `Hindi`, `Marathi`), `status` (`draft`, `in_review`, `approved`, `scheduled`, `rejected`), `scheduled_at` (Timestamp nullable), `version` (Int), `created_at`, `updated_at`
- **Comment:** `id` (UUID), `workspace_id` (FK), `content_item_id` (FK), `author_id` (FK $\to$ User), `body`, `created_at`
- **WorkflowEvent:** `id` (UUID), `workspace_id` (FK), `content_item_id` (FK), `actor_id` (FK $\to$ User), `from_status`, `to_status`, `feedback` (Text nullable), `created_at`
- **AuditEvent:** `id` (UUID), `workspace_id` (FK), `actor_id` (FK $\to$ User), `action`, `resource_type`, `resource_id`, `details` (JSON), `request_id`, `created_at`

---

## 4. Workflow State Machine Specification

Transitions are enforced in `backend/app/services/workflow_service.py`:

```
               [Draft]
                  |
         (Submit for Review)
                  v
             [In Review]
            /     |     \
 (Approve) /      |      \ (Reject)
          v       |       v
     [Approved]   |   [Rejected]
          |       |
(Schedule)|       | (Request Changes with Feedback)
          v       v
    [Scheduled]  [Draft]
```

### Transition Validation Rules:
1. **Submit for Review (`Draft` $\to$ `In Review`):** Allowed by Creator, Reviewer, or Admin.
2. **Approve (`In Review` $\to$ `Approved`):** Allowed only by Reviewer or Admin. Creator cannot self-approve.
3. **Request Changes (`In Review` $\to$ `Draft`):** Allowed by Reviewer or Admin. Mandatory feedback note required.
4. **Reject (`In Review` $\to$ `Rejected`):** Allowed by Reviewer or Admin with mandatory rationale.
5. **Schedule (`Approved` $\to$ `Scheduled`):** Allowed by Reviewer or Admin. Requires a valid future `scheduled_at` timestamp.
6. **Reopening (`Scheduled` or `Approved` $\to$ `Draft`):** Re-editing automatically returns item to `Draft` for safety.

---

## 5. Security & Trust Boundaries

1. **LLM Provider Isolation:** The client browser never receives OpenAI/Gemini/watsonx API keys. All calls terminate at the FastAPI backend.
2. **Multi-Tenant Scoping:** Every SQL query explicitly scopes to `workspace_id` derived from the validated JWT token session.
3. **Audit Immutability:** `WorkflowEvent` and `AuditEvent` records are append-only. No deletion or modification endpoints exist.
4. **Mock Mode for Safety:** By default, `LLM_PROVIDER=mock` allows offline verification, zero token costs during CI, and deterministic testing.

---

## 6. Deployment Topology

- **Frontend:** Static SPA build served via Nginx or Vercel/Netlify.
- **Backend:** FastAPI ASGI application run via Uvicorn/Gunicorn in a containerized environment.
- **Database:** PostgreSQL (with SQLite zero-dependency fallback for initial local development and evaluation).
- **Configuration:** Environment variables defined in `.env`.
