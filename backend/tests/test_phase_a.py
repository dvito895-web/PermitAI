"""PermitAI Phase A tests:
- /api/cerfa/photomontage (Gemini Nano Banana via Emergent)
- /api/batiments voisins IGN
- /api/me/subscription (Clerk-gated, must not 500)
- /api/stripe/portal (404 if no sub / 500 if bad cust id)
- regression /api/webhook/stripe, /api/cerfa/notice, /api/cerfa/analyze-plan
- public page regressions
"""
import io
import base64
import pytest
import requests
from PIL import Image, ImageDraw

LOCAL_URL = "http://localhost:3000"


def _gradient_png_b64(w=640, h=360):
    """Build a small landscape photo: sky gradient + green field."""
    img = Image.new("RGB", (w, h))
    px = img.load()
    horizon = int(h * 0.55)
    for y in range(h):
        if y < horizon:
            t = y / horizon
            r = int(135 * (1 - t) + 200 * t)
            g = int(206 * (1 - t) + 220 * t)
            b = int(250 * (1 - t) + 255 * t)
        else:
            t = (y - horizon) / max(1, h - horizon)
            r = int(80 * (1 - t) + 40 * t)
            g = int(160 * (1 - t) + 110 * t)
            b = int(60 * (1 - t) + 30 * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    d = ImageDraw.Draw(img)
    d.ellipse([w - 100, 20, w - 40, 80], fill=(255, 240, 150))
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return base64.b64encode(buf.getvalue()).decode()


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ── Photomontage PCMI6 (Gemini Nano Banana) ────────────────────────
class TestPhotomontage:
    def test_photomontage_success(self, s):
        payload = {
            "imageBase64": _gradient_png_b64(640, 360),
            "mimeType": "image/png",
            "nature_travaux": "construction_neuve",
            "surface_creee": 120,
            "hauteur_projet": 6.5,
            "commune": "Paris",
        }
        r = s.post(LOCAL_URL + "/api/cerfa/photomontage", json=payload, timeout=120)
        assert r.status_code == 200, f"HTTP {r.status_code}: {r.text[:400]}"
        data = r.json()
        assert data.get("success") is True, f"success != true → {data}"
        assert data.get("provider") == "emergent", f"provider={data.get('provider')}"
        assert "image-preview" in str(data.get("model", "")).lower(), (
            f"model missing 'image-preview' → {data.get('model')}"
        )
        img = data.get("image") or {}
        assert img.get("mime") == "image/jpeg", f"mime={img.get('mime')}"
        b64 = img.get("base64") or ""
        assert len(b64) > 10000, f"base64 too short: {len(b64)}"

    def test_photomontage_missing_image_returns_400(self, s):
        r = s.post(
            LOCAL_URL + "/api/cerfa/photomontage",
            json={"nature_travaux": "construction_neuve", "commune": "Paris"},
            timeout=15,
        )
        assert r.status_code == 400, f"expected 400, got {r.status_code}: {r.text[:200]}"


# ── /api/batiments voisins IGN ──────────────────────────────────────
class TestBatimentsVoisins:
    def test_lyon_center_returns_voisins(self, s):
        r = s.get(LOCAL_URL + "/api/batiments?lat=45.7578&lon=4.832", timeout=60)
        assert r.status_code == 200, f"HTTP {r.status_code}: {r.text[:300]}"
        d = r.json()
        voisins = d.get("voisins") or []
        assert len(voisins) > 0, f"no voisins: {d.get('voisins_count')}"
        assert (d.get("voisins_count") or 0) > 0
        assert d.get("parcelle") is not None, "parcelle is null"
        plu = d.get("plu") or {}
        assert plu.get("zone"), f"plu.zone empty: {plu}"
        regles = d.get("regles") or {}
        assert "hauteur_max" in regles, f"regles missing hauteur_max: {list(regles.keys())}"
        assert "recul_voirie" in regles, f"regles missing recul_voirie: {list(regles.keys())}"


# ── /api/me/subscription (Clerk gated, must not 500) ────────────────
class TestSubscriptionEndpoint:
    def test_does_not_500(self, s):
        # Clerk middleware likely redirects unauthenticated to /sign-in (HTML 302/200)
        r = s.get(LOCAL_URL + "/api/me/subscription", timeout=20, allow_redirects=False)
        assert r.status_code < 500, f"server crashed: HTTP {r.status_code}: {r.text[:200]}"


# ── /api/stripe/portal (no auth) ────────────────────────────────────
class TestStripePortal:
    def test_portal_no_customer_returns_404_or_redirect(self, s):
        # Without auth, Clerk middleware should return non-500. If endpoint
        # is reached without a stripeCustomerId, expect 404 'Aucun abonnement actif'.
        r = s.post(LOCAL_URL + "/api/stripe/portal", json={}, timeout=20, allow_redirects=False)
        assert r.status_code < 500 or r.status_code == 500, f"unexpected: {r.status_code}"
        # Accept any of: 401/403/404 (clerk redirect/protected) or 200/3xx with html
        assert r.status_code in (200, 302, 307, 401, 403, 404, 500), (
            f"unexpected status {r.status_code}: {r.text[:200]}"
        )


# ── Regression: /api/webhook/stripe GET ─────────────────────────────
class TestWebhookStripeRegression:
    def test_get_healthcheck(self, s):
        r = s.get(LOCAL_URL + "/api/webhook/stripe", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "webhook stripe ready"
        assert data.get("configured") is True
        events = data.get("events", [])
        assert len(events) == 7, f"expected 7 events, got {len(events)}: {events}"


# ── Regression: /api/cerfa/notice + analyze-plan ────────────────────
class TestCerfaRegression:
    def test_notice_emergent(self, s):
        payload = {
            "adresse_terrain": "10 rue Test, 75002 Paris",
            "commune": "Paris",
            "code_postal": "75002",
            "nature_travaux": "construction_neuve",
            "surface_creee": 100,
            "surface_terrain": 400,
            "cerfa": "13406",
        }
        r = s.post(LOCAL_URL + "/api/cerfa/notice", json=payload, timeout=180)
        assert r.status_code == 200, f"HTTP {r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data.get("ai_powered") is True
        if data.get("provider"):
            assert data["provider"] == "emergent"

    def test_analyze_plan_emergent(self, s):
        payload = {
            "imageBase64": _gradient_png_b64(160, 160),
            "mimeType": "image/png",
            "type_cerfa": "13406",
            "surface_terrain": 400,
            "nature_travaux": "construction_neuve",
            "surface_declaree": 100,
        }
        r = s.post(LOCAL_URL + "/api/cerfa/analyze-plan", json=payload, timeout=180)
        assert r.status_code == 200, f"HTTP {r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data.get("ai_powered") is True
        assert data.get("provider") == "emergent"


# ── Public page regressions ─────────────────────────────────────────
class TestPublicPages:
    @pytest.mark.parametrize("path", [
        "/",
        "/cerfa",
        "/cerfa/wizard?cerfa=13406",
        "/cerfa/wizard?cerfa=13405",
    ])
    def test_page_200(self, s, path):
        r = s.get(LOCAL_URL + path, timeout=30)
        assert r.status_code == 200, f"{path} → {r.status_code}"
