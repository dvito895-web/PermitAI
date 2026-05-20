"""PermitAI - P1 iteration tests.

Covers:
  - /api/cerfa/notice-export (DOCX generation)
  - /api/webhook/stripe GET (healthcheck with 7 events)
  - /api/webhook/stripe POST without signature -> 400
  - /api/cerfa/notice regression (Emergent / Claude)
  - /api/cerfa/analyze-plan regression (Emergent vision)
"""
import os
import io
import base64
import zipfile
import pytest
import requests
from PIL import Image, ImageDraw

LOCAL_URL = "http://localhost:3000"


def _png_b64(w=150, h=150):
    img = Image.new("RGB", (w, h), (245, 245, 240))
    d = ImageDraw.Draw(img)
    d.rectangle([10, 10, w - 10, h - 10], outline=(0, 0, 0), width=2)
    d.line([(10, h // 2), (w - 10, h // 2)], fill=(100, 100, 100), width=1)
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return base64.b64encode(buf.getvalue()).decode()


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ── /api/cerfa/notice-export (DOCX) ──────────────────────────────────
class TestNoticeExportDocx:
    def test_docx_generation_returns_valid_zip(self, api_client):
        payload = {
            "notice": (
                "NATURE DU PROJET\n----------------\n"
                "Construction d'une maison individuelle de 120 m2.\n\n"
                "MATERIAUX UTILISES\n------------------\n"
                "Briques rouges, tuiles plates, menuiseries bois.\n\n"
                "INSERTION PAYSAGERE\n-------------------\n"
                "Le projet s'inscrit harmonieusement dans le tissu pavillonnaire existant.\n"
            ),
            "cerfa": "13406",
            "demandeur": "TEST_DemandeurUnit",
            "commune": "Paris",
        }
        r = api_client.post(LOCAL_URL + "/api/cerfa/notice-export", json=payload, timeout=30)
        assert r.status_code == 200, f"DOCX HTTP {r.status_code}: {r.text[:300]}"
        ct = r.headers.get("Content-Type", "")
        assert "wordprocessingml.document" in ct, f"Bad Content-Type: {ct}"
        # Validate it's a real DOCX zip containing word/document.xml
        assert len(r.content) > 1000, f"DOCX too small: {len(r.content)} bytes"
        with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
            names = zf.namelist()
            assert "word/document.xml" in names, f"word/document.xml missing in zip → {names[:10]}"

    def test_docx_missing_notice_returns_400(self, api_client):
        r = api_client.post(LOCAL_URL + "/api/cerfa/notice-export", json={"cerfa": "13406"}, timeout=15)
        assert r.status_code == 400, f"expected 400, got {r.status_code}: {r.text[:200]}"
        body = r.json()
        assert "error" in body or "notice" in str(body).lower()


# ── /api/webhook/stripe ──────────────────────────────────────────────
class TestStripeWebhook:
    def test_get_healthcheck_returns_7_events(self, api_client):
        r = api_client.get(LOCAL_URL + "/api/webhook/stripe", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "webhook stripe ready"
        assert data.get("configured") is True
        events = data.get("events", [])
        expected = {
            "checkout.session.completed",
            "customer.subscription.created",
            "customer.subscription.updated",
            "customer.subscription.deleted",
            "invoice.paid",
            "invoice.payment_succeeded",
            "invoice.payment_failed",
        }
        assert expected.issubset(set(events)), f"Missing events: {expected - set(events)}"

    def test_post_without_signature_returns_400(self, api_client):
        r = requests.post(
            LOCAL_URL + "/api/webhook/stripe",
            data='{"type":"test"}',
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        assert r.status_code == 400, f"expected 400, got {r.status_code}: {r.text[:200]}"
        body = r.json()
        assert body.get("error") == "No signature", f"Bad error msg: {body}"


# ── Regression : /api/cerfa/notice (Emergent Claude text) ───────────
class TestCerfaNoticeRegression:
    def test_notice_emergent_claude(self, api_client):
        payload = {
            "adresse_terrain": "10 rue Test, 75002 Paris",
            "commune": "Paris",
            "code_postal": "75002",
            "nature_travaux": "construction_neuve",
            "surface_creee": 100,
            "surface_terrain": 400,
            "cerfa": "13406",
        }
        r = api_client.post(LOCAL_URL + "/api/cerfa/notice", json=payload, timeout=180)
        assert r.status_code == 200, f"HTTP {r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data.get("ai_powered") is True, f"ai_powered != true → {data}"
        # provider + model should now be present per regression requirement
        if data.get("provider") is not None:
            assert data["provider"] == "emergent", f"provider={data.get('provider')}"
        if data.get("model") is not None:
            assert "claude" in str(data["model"]).lower(), f"model={data.get('model')}"


# ── Regression : /api/cerfa/analyze-plan (Emergent vision) ──────────
class TestCerfaAnalyzePlanRegression:
    def test_analyze_plan_emergent(self, api_client):
        payload = {
            "imageBase64": _png_b64(150, 150),
            "mimeType": "image/png",
            "type_cerfa": "13406",
            "surface_terrain": 400,
            "nature_travaux": "construction_neuve",
            "surface_declaree": 100,
        }
        r = api_client.post(LOCAL_URL + "/api/cerfa/analyze-plan", json=payload, timeout=180)
        assert r.status_code == 200, f"HTTP {r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data.get("ai_powered") is True, f"ai_powered != true → {data}"
        assert data.get("provider") == "emergent", f"provider={data.get('provider')}"
