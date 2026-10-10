import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token(role: str):
    res = client.post(f"/api/auth/demo-switch?role={role}")
    assert res.status_code == 200
    return res.json()["access_token"]

def test_full_governance_state_machine_lifecycle():
    creator_token = get_auth_token("creator")
    reviewer_token = get_auth_token("reviewer")
    creator_headers = {"Authorization": f"Bearer {creator_token}"}
    reviewer_headers = {"Authorization": f"Bearer {reviewer_token}"}

    # 1. Creator drafts new content (v1)
    create_res = client.post("/api/content", json={
        "title": "Enterprise Cloud Architecture Governance",
        "body": "Detailed review of policy drift, tenant isolation, and auditability.",
        "platform": "linkedin",
        "format": "Article",
        "language": "English",
        "tone": "Thought-Leadership"
    }, headers=creator_headers)
    assert create_res.status_code == 200
    content = create_res.json()
    content_id = content["id"]
    assert content["status"] == "draft"
    assert content["version"] == 1

    # 2. Creator submits for review
    submit_res = client.post(f"/api/content/{content_id}/submit-review", headers=creator_headers)
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "in_review"

    # 3. Separation of Duties: Creator tries to self-approve -> 403 Forbidden!
    forbidden_approve = client.post(f"/api/content/{content_id}/approve", headers=creator_headers)
    assert forbidden_approve.status_code == 403
    assert "Separation of Duties" in forbidden_approve.json()["detail"]

    # 4. Reviewer requests changes with mandatory revision notes
    changes_res = client.post(
        f"/api/content/{content_id}/request-changes",
        json={"action": "request_changes", "feedback": "Please cite the Q3 downtime statistics and add a CTA."},
        headers=reviewer_headers
    )
    assert changes_res.status_code == 200
    assert changes_res.json()["status"] == "draft"

    # Verify that the revision note was automatically recorded as a comment
    comments_res = client.get(f"/api/content/{content_id}/comments", headers=creator_headers)
    assert comments_res.status_code == 200
    comments = comments_res.json()
    assert len(comments) >= 1
    assert "Please cite the Q3 downtime statistics" in comments[0]["body"]

    # 5. Creator updates draft (bumping version to v2)
    update_res = client.patch(
        f"/api/content/{content_id}",
        json={"body": "Detailed review of policy drift with Q3 downtime statistics (34% reduction). What are your thoughts?"},
        headers=creator_headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["version"] == 2

    # 6. Creator adds a comment explaining the fixes
    add_comm_res = client.post(
        f"/api/content/{content_id}/comments",
        json={"body": "Updated body with downtime statistics and question CTA as requested."},
        headers=creator_headers
    )
    assert add_comm_res.status_code == 200
    assert add_comm_res.json()["author_role"] == "creator"

    # 7. Creator re-submits for review
    resubmit_res = client.post(f"/api/content/{content_id}/submit-review", headers=creator_headers)
    assert resubmit_res.status_code == 200
    assert resubmit_res.json()["status"] == "in_review"

    # 8. Reviewer approves
    approve_res = client.post(f"/api/content/{content_id}/approve", headers=reviewer_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

    # 9. Creator cannot schedule -> 403 Forbidden
    creator_sched = client.post(
        f"/api/content/{content_id}/schedule",
        json={"action": "schedule", "scheduled_at": "2026-10-25 14:00"},
        headers=creator_headers
    )
    assert creator_sched.status_code == 403

    # 10. Reviewer schedules
    review_sched = client.post(
        f"/api/content/{content_id}/schedule",
        json={"action": "schedule", "scheduled_at": "2026-10-25 14:00"},
        headers=reviewer_headers
    )
    assert review_sched.status_code == 200
    assert review_sched.json()["status"] == "scheduled"
    assert review_sched.json()["scheduled_at"] == "2026-10-25 14:00"

    # 11. Retrieve immutable audit trail
    audit_res = client.get(f"/api/content/{content_id}/audit-trail", headers=reviewer_headers)
    assert audit_res.status_code == 200
    audit_events = audit_res.json()
    assert len(audit_events) >= 4
    actions = [e["action"] for e in audit_events]
    assert any("WORKFLOW_SCHEDULE" in a for a in actions)
    assert any("WORKFLOW_APPROVE" in a for a in actions)
    assert any("WORKFLOW_REQUEST_CHANGES" in a for a in actions)
    assert any("WORKFLOW_SUBMIT_REVIEW" in a for a in actions)

    # 12. Workspace audit event list
    ws_audit_res = client.get("/api/content/audit/events", headers=reviewer_headers)
    assert ws_audit_res.status_code == 200
    assert len(ws_audit_res.json()) >= len(audit_events)
