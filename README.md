# ContentPilot AI 🚀

> **Enterprise AI Content Creation, Repurposing & Governance Platform**  
> *PS 02 — Build with IBM Hackathon*  
> **Development Environment:** Google Antigravity + IBM Bob | **Design Reference:** Agiloft-inspired Enterprise SaaS  

[![Status](https://img.shields.io/badge/Status-Phase%200%20Complete-success)](#roadmap-status)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20TailwindCSS-blue)](#tech-stack)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-green)](#tech-stack)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-indigo)](#tech-stack)

---

## 📖 Overview

ContentPilot AI is an enterprise-grade AI content creation, repurposing, and governance platform. While standard generative AI tools create copy in isolation, ContentPilot AI brings **enterprise accountability and workflow governance** to multi-channel content operations.

### Key Capabilities
- ✍️ **AI Studio:** Brief-to-draft generation across formats and languages (English, Hindi, Marathi) with inline editing, length adjustment, and real-time advisory quality checks.
- 🔄 **Platform Repurposing:** Adapt single source assets into tailored variants for LinkedIn, Instagram, X, YouTube, and Blog.
- 🛡️ **Enterprise Governance (Agiloft-inspired):** Strict state machine workflow (`Draft` $\to$ `In Review` $\to$ `Approved` $\to$ `Scheduled`) with mandatory change requests, reviewer feedback loops, and immutable audit logs.
- 🎨 **Brand Voice Guardian:** Workspace-level brand profiles specifying tone, target audience, preferred terms, and prohibited phrases injected into prompt construction.
- 📅 **Campaigns & Calendar Planner:** Organize content into marketing campaigns with timezone-aware scheduled dates.
- 👥 **Role-Based Access Control:** Distinct views and capabilities for **Creator**, **Reviewer**, and **Admin** personas.

---

## 🏗️ Tech Stack & Architecture

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons
- **Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy, Alembic
- **Database:** PostgreSQL (with automatic SQLite fallback for zero-setup local dev)
- **AI Orchestration:** Provider-neutral adapter (supports Mock provider for tests, OpenAI, Google Gemini, IBM watsonx)
- **Security:** JWT authentication, bcrypt hashing, workspace isolation, zero client-side API secrets

### System Architecture Overview
```
[ Browser / React + TS + Tailwind ]
               |
        HTTPS / REST JSON
               v
   [ FastAPI Application API ]
      |-- Auth & Role Permissions (Creator / Reviewer / Admin)
      |-- Content, Campaign & Brand Voice Services
      |-- Governance State Engine & Audit Service
      +-- AI Orchestration Service ---> [ LLM Provider API / Mock ]
               |
               v
     [ PostgreSQL / SQLite ]
```

---

## 📂 Repository Structure

```
contentpilot-ai/
├── docs/
│   ├── PRODUCT_REQUIREMENTS.md      # Detailed PRD & Acceptance Criteria
│   ├── ARCHITECTURE.md              # Technical architecture & state machine
│   └── PHASE_PLAN.md                # Phase-by-phase implementation checklist
├── frontend/                        # React + TypeScript + Tailwind UI (Vite)
│   ├── src/
│   │   ├── app/                     # Layout, navigation & routing
│   │   ├── components/              # Atomic enterprise UI design system
│   │   ├── features/                # AI Studio, Library, Approvals, Campaigns
│   │   └── services/                # Typed API client
├── backend/                         # FastAPI Python backend
│   ├── app/
│   │   ├── api/                     # REST API routers
│   │   ├── core/                    # Security, auth, settings
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   ├── schemas/                 # Pydantic schemas
│   │   └── services/                # Business logic, state engine & AI adapter
│   └── tests/                       # Pytest test suite
├── IBM_BOB_IMPLEMENTATION.md        # Verifiable SDLC contribution log
├── .env.example                     # Environment configuration template
├── .gitignore                       # Git ignore rules
└── README.md                        # Project documentation
```

---

## 🚦 Roadmap & Implementation Status

- [x] **Phase 0:** Requirements, Repository Audit & Baseline Setup
- [ ] **Phase 1:** SaaS Design System & Application Shell
- [ ] **Phase 2:** Backend Foundation, Database & Authentication
- [ ] **Phase 3:** AI Studio & Content Generation
- [ ] **Phase 4:** Content Library, Brand Voice & Search
- [ ] **Phase 5:** Review, Approval & Audit Workflow
- [ ] **Phase 6:** Campaigns, Calendar & Collaboration
- [ ] **Phase 7:** Testing, Security Polish & Deployment
- [ ] **Phase 8:** IBM Bob Evidence & Final Submission Package

---

## ⚙️ Quick Start (Local Development)

### 1. Prerequisites
- **Node.js:** v18+ (tested on v24)
- **Python:** v3.10+ (tested on v3.12)
- **Git**

### 2. Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env
```
*(By default, `LLM_PROVIDER=mock` and `USE_SQLITE_FALLBACK=True` allow instant running without external API keys or a running PostgreSQL server).*

### 3. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API docs available at: `http://localhost:8000/docs`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend application available at: `http://localhost:5173`

---

## 🔐 Seed Demo Accounts

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Creator** | `creator@demo.com` | `demo123` | Draft creation, AI generation, submit for review |
| **Reviewer** | `reviewer@demo.com` | `demo123` | Review queue, approve, request changes, reject |
| **Admin** | `admin@demo.com` | `demo123` | Full workspace access, brand voice configuration |

---

## 🤝 Development & IBM Bob Attribution

This project is built using **Google Antigravity** as the primary agentic builder environment and **IBM Bob** as the software development lifecycle (SDLC) co-pilot. All collaborative tasks—from architectural analysis to test generation—are documented in [`IBM_BOB_IMPLEMENTATION.md`](./IBM_BOB_IMPLEMENTATION.md).
