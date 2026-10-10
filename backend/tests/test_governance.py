import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token(role: str) -> str:
    res = client.post(f"/api/auth/demo-switch?role={role}")
    return res.json()["access_token"]

def test_governance_workflow_and_separation_of_duties():
    creator_token = get_auth_token("creator")
    reviewer_token = get_auth_token("reviewer")

    creator_headers = {"Authorization": f"Bearer {creator_token}"}
    reviewer_headers = {"Authorization": f"Bearer {reviewer_token}"}

    # 1. Creator creates draft
    create_res = client.post("/api/content", json={
        "title": "Automated Governance Benchmark Test",
        "body": "Verifiable state machines prevent unauthorized publishing in cloud topologies.",
        "platform": "linkedin",
        "format": "Post",
        "language": "English",
        "tone": "Thought-Leadership"
    }, headers=creator_headers)
    assert create_res.status_code == 200
    item = create_res.json()
    item_id = item["id"]
    assert item["status"] == "draft"

    # 2. Creator submits draft for review
    submit_res = client.post(f"/api/content/{item_id}/transition", json={
        "action": "submit_review"
    }, headers=creator_headers)
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "in_review"

    # 3. Separation of duties check: Creator CANNOT self-approve!
    self_approve_res = client.post(f"/api/content/{item_id}/transition", json={
        "action": "approve"
    }, headers=creator_headers)
    assert self_approve_res.status_code == 403
    assert "Separation of Duties violation" in self_approve_res.json()["detail"]

    # 4. Reviewer requests changes with mandatory notes
    req_changes_res = client.post(f"/api/content/{item_id}/transition", json={
        "action": "request_changes",
        "feedback": "Please add supporting metrics on workflow speedup."
    }, headers=reviewer_headers)
    assert req_changes_res.status_code == 200
    assert req_changes_res.json()["status"] == "draft"

    # 5. Creator re-submits after revising
    resubmit_res = client.post(f"/api/content/{item_id}/transition", json={
        "action": "submit_review"
    }, headers=creator_headers)
    assert resubmit_res.status_code == 200
    assert resubmit_res.json()["status"] == "in_review"

    # 6. Reviewer approves
    approve_res = client.post(f"/api/content/{item_id}/transition", json={
        "action": "approve"
    }, headers=reviewer_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

    # 7. Reviewer assigns publishing schedule
    schedule_res = client.post(f"/api/content/{item_id}/transition", json={
        "action": "schedule",
        "scheduled_at": "2026-10-25 15:00"
    }, headers=reviewer_headers)
    assert schedule_res.status_code == 200
    assert schedule_res.json()["status"] == "scheduled"
    assert schedule_res.json()["scheduled_at"] == "2026-10-25 15:00"

    # 8. Check audit trail and history
    final_item = client.get(f"/api/content/{item_id}", headers=reviewer_headers).json()
    assert len(final_item["workflow_events"]) >= 5
