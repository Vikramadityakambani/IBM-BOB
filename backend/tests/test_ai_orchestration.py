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

def test_refine_actions():
    sample_text = "Paragraph 1: Overview of architecture.\n\nParagraph 2: Implementation details.\n\nParagraph 3: Metrics."

    # Shorten
    short_res = client.post("/api/ai/refine", json={
        "body": sample_text,
        "action": "shorten"
    })
    assert short_res.status_code == 200
    assert "#QuickTake" in short_res.json()["refined_body"]

    # Expand
    exp_res = client.post("/api/ai/refine", json={
        "body": sample_text,
        "action": "expand"
    })
    assert exp_res.status_code == 200
    assert "Deep Dive Analysis" in exp_res.json()["refined_body"]

    # Rewrite
    rw_res = client.post("/api/ai/refine", json={
        "body": sample_text,
        "action": "rewrite"
    })
    assert rw_res.status_code == 200
    assert "Reframed Perspective" in rw_res.json()["refined_body"]

def test_repurpose_actions():
    sample_text = "Modern enterprises must safeguard compliance and enforce verification before releasing code."

    # Repurpose for X (Twitter)
    x_res = client.post("/api/ai/repurpose", json={
        "source_body": sample_text,
        "target_platform": "x"
    })
    assert x_res.status_code == 200
    assert "🧵 1/3" in x_res.json()["adapted_body"]

    # Repurpose for YouTube
    yt_res = client.post("/api/ai/repurpose", json={
        "source_body": sample_text,
        "target_platform": "youtube"
    })
    assert yt_res.status_code == 200
    assert "VIDEO SCRIPT OUTLINE" in yt_res.json()["adapted_body"]

def test_quality_check_and_prohibited_words():
    # Clean text
    clean_res = client.post("/api/ai/quality-check", json={
        "body": "Our enterprise SLA guarantees verifiable governance for all cloud workloads. How is your team managing this?",
        "platform": "linkedin"
    })
    assert clean_res.status_code == 200
    assert clean_res.json()["is_brand_compliant"] is True
    assert clean_res.json()["has_cta"] is True
    assert len(clean_res.json()["prohibited_terms_found"]) == 0

    # Text containing prohibited phrase "cheap"
    flagged_res = client.post("/api/ai/quality-check", json={
        "body": "This is a cheap tool with a disruptive hack.",
        "platform": "linkedin"
    })
    assert flagged_res.status_code == 200
    assert flagged_res.json()["is_brand_compliant"] is False
    assert "cheap" in flagged_res.json()["prohibited_terms_found"]
