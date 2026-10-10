import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_success_creator():
    response = client.post("/api/auth/login", json={
        "email": "creator@demo.com",
        "password": "demo123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "creator"
    assert data["email"] == "creator@demo.com"

def test_login_success_reviewer():
    response = client.post("/api/auth/login", json={
        "email": "reviewer@demo.com",
        "password": "demo123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "reviewer"

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "creator@demo.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_demo_switch_endpoint():
    response = client.post("/api/auth/demo-switch?role=admin")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"
    assert data["email"] == "admin@demo.com"
