import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token(email: str, role: str):
    res = client.post(f"/api/auth/demo-switch?role={role}")
    assert res.status_code == 200
    return res.json()["access_token"]

def test_create_read_update_content():
    token = get_auth_token("creator@demo.com", "creator")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create content
    create_payload = {
        "title": "Autonomous DevOps in Enterprise Clouds",
        "body": "Detailed technical analysis of CI/CD pipeline automation and deterministic testing.",
        "platform": "linkedin",
        "format": "Article",
        "language": "English",
        "tone": "Thought-Leadership"
    }
    create_res = client.post("/api/content", json=create_payload, headers=headers)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["title"] == "Autonomous DevOps in Enterprise Clouds"
    assert created["status"] == "draft"
    assert created["version"] == 1
    content_id = created["id"]

    # 2. Read single content item
    get_res = client.get(f"/api/content/{content_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == content_id

    # 3. Update content (increments version)
    update_res = client.patch(
        f"/api/content/{content_id}",
        json={"title": "Autonomous DevOps in Enterprise Clouds (Revised)"},
        headers=headers
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["title"] == "Autonomous DevOps in Enterprise Clouds (Revised)"
    assert updated["version"] == 2
    assert len(updated["workflow_events"]) >= 2

def test_duplicate_content():
    token = get_auth_token("creator@demo.com", "creator")
    headers = {"Authorization": f"Bearer {token}"}

    # Create initial item
    create_res = client.post("/api/content", json={
        "title": "Original Seed Article",
        "body": "Initial seed copy for duplication testing.",
        "platform": "blog",
        "format": "Long-form",
        "language": "English",
        "tone": "Professional"
    }, headers=headers)
    assert create_res.status_code == 200
    orig = create_res.json()
    orig_id = orig["id"]

    # Duplicate it
    dup_res = client.post(f"/api/content/{orig_id}/duplicate", headers=headers)
    assert dup_res.status_code == 200
    dup = dup_res.json()
    assert dup["id"] != orig_id
    assert dup["title"] == "Original Seed Article (Copy)"
    assert dup["status"] == "draft"
    assert dup["version"] == 1
    assert any("Duplicated from" in e["feedback"] for e in dup["workflow_events"])

def test_search_and_filter_content():
    token = get_auth_token("creator@demo.com", "creator")
    headers = {"Authorization": f"Bearer {token}"}

    # Search for known term
    res = client.get("/api/content?search=Duplicated", headers=headers)
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)

    # Filter by platform
    res_platform = client.get("/api/content?platform=blog", headers=headers)
    assert res_platform.status_code == 200
    for item in res_platform.json():
        assert item["platform"] == "blog"

def test_brand_voice_admin_vs_creator():
    creator_token = get_auth_token("creator@demo.com", "creator")
    admin_token = get_auth_token("admin@demo.com", "admin")

    # Creator is forbidden from updating brand profile
    denied_res = client.patch(
        "/api/brand-profile",
        json={"name": "Hacked Brand Name"},
        headers={"Authorization": f"Bearer {creator_token}"}
    )
    assert denied_res.status_code == 403

    # Admin successfully updates brand profile
    update_res = client.patch(
        "/api/brand-profile",
        json={
            "name": "Acme Governed Brand",
            "preferred_terms": ["governed pipelines", "audit trails", "SDLC reliability"],
            "prohibited_phrases": ["cheap", "unverified", "sloppy"]
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert update_res.status_code == 200
    bp = update_res.json()
    assert bp["name"] == "Acme Governed Brand"
    assert "governed pipelines" in bp["preferred_terms"]

    # AI generation now reflects updated brand profile
    gen_res = client.post(
        "/api/ai/generate",
        json={
            "topic": "CI/CD Gatekeeping",
            "platform": "linkedin",
            "format_type": "Article",
            "tone": "Thought-Leadership",
            "language": "English"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert gen_res.status_code == 200
    gen_data = gen_res.json()
    assert gen_data["brand_aligned"] is True
    assert "governed pipelines" in gen_data["body"]
