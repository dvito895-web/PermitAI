"""PermitAI - Next.js API regression + AI integration tests.

Covers:
  - /api/cerfa/all (regression CERFA list)
  - /api/cerfa/analyze-plan (vision via Emergent LLM)
  - /api/cerfa/notice (text generation via Emergent LLM)
  - Public pages (home, /cerfa, /cerfa/wizard?cerfa=13406)
"""

import os
import base64
import io
import pytest
import requests
from PIL import Image, ImageDraw

BASE_URL = os.environ.get("NEXT_PUBLIC_BASE_URL", "http://localhost:3000").rstrip("/")
LOCAL_URL = "http://localhost:3000"


def _make_test_png(width=200, height=200):
    """Generate a simple architectural plan-like PNG (lines + rectangles)."""
    img = Image.new("RGB", (width, height), (245, 245, 240))
    d = ImageDraw.Draw(img)
    d.rectangle([20, 20, 180, 180], outline=(0, 0, 0), width=2)
    d.rectangle([50, 50, 130, 110], outline=(0, 0, 0), width=2)
    d.line([(20, 100), (180, 100)], fill=(120, 120, 120), width=1)
    d.line([(100, 20), (100, 180)], fill=(120, 120, 120), width=1)
    d.text((25, 5), "Plan masse test", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return base64.b64encode(buf.getvalue()).decode()


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ── Public pages (regression) ─────────────────────────────────────────
class TestPublicPages:
    def test_home_loads(self, api_client):
        r = api_client.get(LOCAL_URL + "/", timeout=20)
        assert r.status_code == 200

    def test_cerfa_list_page_loads(self, api_client):
        r = api_client.get(LOCAL_URL + "/cerfa", timeout=20)
        assert r.status_code == 200

    def test_wizard_page_loads_13406(self, api_client):
        r = api_client.get(LOCAL_URL + "/cerfa/wizard?cerfa=13406", timeout=20)
        assert r.status_code == 200


# ── /api/cerfa/all regression ─────────────────────────────────────────
class TestCerfaAll:
    def test_all_cerfa_returned(self, api_client):
        r = api_client.get(LOCAL_URL + "/api/cerfa/all", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "cerfa" in data
        numbers = {c.get("numero") for c in data["cerfa"]}
        # The major CERFAs must be present
        for n in ("13406", "13703"):
            assert n in numbers, f"CERFA {n} missing in /api/cerfa/all"


# ── /api/cerfa/notice (text gen via Emergent) ─────────────────────────
class TestCerfaNotice:
    def test_notice_generation_pcmi7(self, api_client):
        payload = {
            "adresse_terrain": "12 rue de la Paix, 75002 Paris",
            "commune": "Paris",
            "code_postal": "75002",
            "nature_travaux": "construction_neuve",
            "surface_creee": 120,
            "surface_terrain": 500,
            "cerfa": "13406",
        }
        r = api_client.post(LOCAL_URL + "/api/cerfa/notice", json=payload, timeout=120)
        assert r.status_code == 200, f"notice HTTP {r.status_code}: {r.text[:300]}"
        data = r.json()
        # Must indicate AI was used
        assert data.get("ai_powered") is True, f"ai_powered != true → {data}"
        # Notice route currently does not return 'provider' field; just verify text length
        text_field = data.get("notice") or data.get("text") or data.get("content") or ""
        assert isinstance(text_field, str) and len(text_field) > 30, f"notice text too short: {text_field[:200]}"


# ── /api/cerfa/analyze-plan (vision via Emergent) ─────────────────────
class TestCerfaAnalyzePlan:
    def test_analyze_plan_with_real_png(self, api_client):
        b64 = _make_test_png(200, 200)
        payload = {
            "imageBase64": b64,
            "mimeType": "image/png",
            "type_cerfa": "13406",
            "surface_terrain": 500,
            "nature_travaux": "construction_neuve",
            "surface_declaree": 120,
        }
        r = api_client.post(LOCAL_URL + "/api/cerfa/analyze-plan", json=payload, timeout=180)
        assert r.status_code == 200, f"analyze-plan HTTP {r.status_code}: {r.text[:400]}"
        data = r.json()
        assert data.get("ai_powered") is True, f"ai_powered != true → {data}"
        assert data.get("provider") == "emergent", f"expected provider=emergent, got {data.get('provider')} | {str(data)[:300]}"
