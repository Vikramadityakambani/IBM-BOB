import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_draft_multilingual():
    # English
    en_res = client.post("/api/ai/generate", json={
        "topic": "Zero Trust Security",
        "platform": "linkedin",
        "format_type": "Article",
        "tone": "Thought-Leadership",
        "language": "English"
    })
    assert en_res.status_code == 200
    assert "Zero Trust Security" in en_res.json()["title"] or "Zero Trust" in en_res.json()["body"]

    # Hindi
    hi_res = client.post("/api/ai/generate", json={
        "topic": "क्लाउड सुरक्षा",
        "platform": "linkedin",
        "format_type": "Post",
        "tone": "Professional",
        "language": "Hindi"
    })
    assert hi_res.status_code == 200
    assert "दिशानिर्देश" in hi_res.json()["body"]

    # Marathi
    mr_res = client.post("/api/ai/generate", json={
        "topic": "एंटरप्राइज गव्हर्नन्स",
        "platform": "linkedin",
        "format_type": "Post",
        "tone": "Thought-Leadership",
        "language": "Marathi"
    })
    assert mr_res.status_code == 200
    assert "पडताळणीयोग्य" in mr_res.json()["body"]

def test_quality_check_and_prohibited_words():
    # Clean text
    clean_res = client.post("/api/ai/quality-check", json={
        "body": "Our enterprise SLA guarantees verifiable governance for all cloud workloads.",
        "platform": "linkedin"
    })
    assert clean_res.status_code == 200
    assert clean_res.json()["is_brand_compliant"] is True
    assert len(clean_res.json()["prohibited_terms_found"]) == 0

    # Text containing prohibited phrase "cheap"
    flagged_res = client.post("/api/ai/quality-check", json={
        "body": "This is a cheap tool with a disruptive hack.",
        "platform": "linkedin"
    })
    assert flagged_res.status_code == 200
    assert flagged_res.json()["is_brand_compliant"] is False
    assert "cheap" in flagged_res.json()["prohibited_terms_found"]
