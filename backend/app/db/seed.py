import json
from sqlalchemy.orm import Session
from ..models.user import User, Workspace, Membership
from ..models.brand import BrandProfile
from ..models.campaign import Campaign
from ..models.content import ContentItem, Comment, WorkflowEvent, AuditEvent
from ..core.security import get_password_hash

def seed_default_data(db: Session):
    # Check if already seeded
    if db.query(User).first():
        return

    # 1. Create Demo Users
    hashed_pwd = get_password_hash("demo123")
    user_creator = User(
        id="usr-1",
        email="creator@demo.com",
        display_name="Sarah Lin",
        hashed_password=hashed_pwd,
        is_active=True
    )
    user_reviewer = User(
        id="usr-2",
        email="reviewer@demo.com",
        display_name="David Miller",
        hashed_password=hashed_pwd,
        is_active=True
    )
    user_admin = User(
        id="usr-3",
        email="admin@demo.com",
        display_name="Elena Vance",
        hashed_password=hashed_pwd,
        is_active=True
    )
    db.add_all([user_creator, user_reviewer, user_admin])
    db.flush()

    # 2. Create Default Workspace
    ws = Workspace(
        id="ws-1",
        name="Acme Enterprise Global",
        slug="acme-global",
        created_by=user_admin.id
    )
    db.add(ws)
    db.flush()

    # 3. Create Memberships
    m1 = Membership(id="mb-1", workspace_id=ws.id, user_id=user_creator.id, role="creator")
    m2 = Membership(id="mb-2", workspace_id=ws.id, user_id=user_reviewer.id, role="reviewer")
    m3 = Membership(id="mb-3", workspace_id=ws.id, user_id=user_admin.id, role="admin")
    db.add_all([m1, m2, m3])
    db.flush()

    # 4. Create Brand Voice Profile
    bp = BrandProfile(
        id="bp-1",
        workspace_id=ws.id,
        name="Acme Enterprise Master Voice",
        tone="Thought-Leadership",
        audience="Enterprise IT decision makers, VP of Engineering, CTOs, and Product Leaders.",
        preferred_terms=json.dumps([
            "autonomous workflows",
            "verifiable governance",
            "zero trust",
            "time-to-market",
            "enterprise SLA"
        ]),
        prohibited_phrases=json.dumps([
            "cheap",
            "magic AI",
            "guaranteed overnight success",
            "disruptive hack",
            "flawless solution"
        ]),
        style_guidelines="Tone should be authoritative yet accessible. Avoid hyperbole. Back up claims with metrics and highlight governance and compliance safety."
    )
    db.add(bp)
    db.flush()

    # 5. Create Campaigns
    c1 = Campaign(
        id="cmp-1",
        workspace_id=ws.id,
        name="Q4 Enterprise Cloud Transformation",
        objective="Drive B2B demo requests for modern cloud governance architectures.",
        target_audience="Chief Information Security Officers & VP Architecture",
        start_date="2026-10-01",
        end_date="2026-12-15",
        status="active"
    )
    c2 = Campaign(
        id="cmp-2",
        workspace_id=ws.id,
        name="Build with IBM & Agentic AI Series",
        objective="Showcase practical agentic engineering workflows using Antigravity and IBM Bob.",
        target_audience="Software Engineers and Technical Architects",
        start_date="2026-10-10",
        end_date="2026-11-20",
        status="active"
    )
    db.add_all([c1, c2])
    db.flush()

    # 6. Create Initial Content Items with Workflow Events
    cnt1 = ContentItem(
        id="cnt-1",
        workspace_id=ws.id,
        campaign_id=c2.id,
        created_by=user_creator.id,
        title="Why Agentic SDLC is Replacing Static Copilots in 2026",
        body="Enterprise engineering teams are moving past single-turn chat suggestions. By pairing agentic builder environments with rigorous SDLC co-pilots like IBM Bob, teams can enforce verifiable governance, deterministic testing, and architectural fidelity before deploying a single line of production code.\n\nKey takeaways:\n1. Multi-turn autonomous orchestration with strict human review gates.\n2. Server-side isolation of model keys and secrets.\n3. Automatic synchronization between architectural blueprints and codebase reality.",
        platform="linkedin",
        format="Article / Thought Leadership",
        language="English",
        tone="Thought-Leadership",
        status="in_review",
        version=1
    )

    cnt2 = ContentItem(
        id="cnt-2",
        workspace_id=ws.id,
        campaign_id=c1.id,
        created_by=user_creator.id,
        title="The Real Cost of Cloud Misconfiguration (Infographic Summary)",
        body="Did you know that 82% of cloud breaches trace back to avoidable policy drift? Here is our 5-pillar security checklist to safeguard multi-tenant Kubernetes and database topologies before Q4 audit season.",
        platform="x",
        format="Thread / Carousel",
        language="English",
        tone="Professional",
        status="approved",
        scheduled_at="2026-10-15 14:00",
        version=2
    )

    cnt3 = ContentItem(
        id="cnt-3",
        workspace_id=ws.id,
        created_by=user_creator.id,
        title="Modern Architecture Best Practices for Multi-Platform Content",
        body="Publishing across LinkedIn, X, and Instagram requires more than copy-pasting. In this post, we explore how structured metadata tags and Agiloft-inspired review states guarantee brand voice protection.",
        platform="blog",
        format="Long-form Blog",
        language="English",
        tone="Educational",
        status="draft",
        version=1
    )

    db.add_all([cnt1, cnt2, cnt3])
    db.flush()

    # Comments & Workflow Events
    comm1 = Comment(
        id="cm-1",
        workspace_id=ws.id,
        content_id=cnt1.id,
        author_id=user_creator.id,
        author_name=user_creator.display_name,
        author_role="creator",
        body="Ready for editorial review! Checked against the Q4 voice guidelines and prohibited phrases."
    )
    ev1 = WorkflowEvent(
        id="he-1",
        workspace_id=ws.id,
        content_id=cnt1.id,
        actor_id=user_creator.id,
        actor_name=user_creator.display_name,
        actor_role="creator",
        from_status="draft",
        to_status="in_review",
        feedback="Submitted initial brief for tech review."
    )

    ev2 = WorkflowEvent(
        id="he-2",
        workspace_id=ws.id,
        content_id=cnt2.id,
        actor_id=user_reviewer.id,
        actor_name=user_reviewer.display_name,
        actor_role="reviewer",
        from_status="in_review",
        to_status="approved",
        feedback="Meets brand voice and technical standards."
    )

    audit1 = AuditEvent(
        id="aud-1",
        workspace_id=ws.id,
        actor_id=user_creator.id,
        action="CONTENT_SUBMITTED",
        resource_type="content_item",
        resource_id=cnt1.id,
        details=json.dumps({"title": cnt1.title, "to_status": "in_review"})
    )

    db.add_all([comm1, ev1, ev2, audit1])
    db.commit()
