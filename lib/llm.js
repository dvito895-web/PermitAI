// lib/llm.js
// Helper unifié pour appeler Claude (et autres) via:
//   1. Emergent LLM Key (proxy OpenAI-compatible)  ← privilégié, sans config user
//   2. Anthropic direct (clé ANTHROPIC_API_KEY) en fallback si dispo
// Retourne toujours { text, model, provider, ok, raw, error? }.

const EMERGENT_PROXY = 'https://integrations.emergentagent.com/llm/chat/completions';
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

const DEFAULT_MODEL_EMERGENT  = 'claude-sonnet-4-5-20250929';
const DEFAULT_MODEL_ANTHROPIC = 'claude-sonnet-4-5-20250929';

function hasEmergent() {
  const k = process.env.EMERGENT_LLM_KEY;
  return !!(k && k.startsWith('sk-emergent-'));
}
function hasAnthropic() {
  const k = process.env.ANTHROPIC_API_KEY;
  return !!(k && k.startsWith('sk-ant-'));
}

// content = string OR Array<{type, text|image_url}>
async function callEmergent({ system, content, model = DEFAULT_MODEL_EMERGENT, maxTokens = 4000 }) {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: typeof content === 'string' ? content : content });

  const res = await fetch(EMERGENT_PROXY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EMERGENT_LLM_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return { ok: false, provider: 'emergent', model, error: `HTTP ${res.status} ${errText.slice(0, 240)}` };
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  return { ok: true, provider: 'emergent', model, text, raw: data };
}

async function callAnthropic({ system, content, model = DEFAULT_MODEL_ANTHROPIC, maxTokens = 4000 }) {
  // Anthropic native format: content is array of blocks (text/image)
  const body = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: Array.isArray(content) ? content : [{ type: 'text', text: content }] }],
  };
  if (system) body.system = system;

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return { ok: false, provider: 'anthropic', model, error: `HTTP ${res.status} ${errText.slice(0, 240)}` };
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text || '';
  return { ok: true, provider: 'anthropic', model, text, raw: data };
}

// Convert Anthropic-style content (array with image_url) to OpenAI-compatible (Emergent proxy uses OpenAI format)
function normalizeForEmergent(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return String(content);
  return content.map(block => {
    if (block.type === 'text') return { type: 'text', text: block.text };
    if (block.type === 'image') {
      // Anthropic-native => convert to OpenAI image_url data URL
      const src = block.source || {};
      const url = src.type === 'base64'
        ? `data:${src.media_type || 'image/jpeg'};base64,${src.data}`
        : src.url;
      return { type: 'image_url', image_url: { url } };
    }
    if (block.type === 'image_url') return block;
    return block;
  });
}

/**
 * Appel LLM unifié — texte ou multimodal (vision).
 * @param {Object} opts
 * @param {string} [opts.system]   — system prompt
 * @param {string|Array} opts.content — texte OU tableau de blocs (text + image)
 * @param {string} [opts.model]    — surcharge modèle
 * @param {number} [opts.maxTokens]
 * @param {boolean} [opts.preferAnthropic] — force Anthropic si dispo
 */
export async function llmCall({ system, content, model, maxTokens = 4000, preferAnthropic = false }) {
  const wantEmergent  = hasEmergent();
  const wantAnthropic = hasAnthropic();

  if (preferAnthropic && wantAnthropic) {
    const r = await callAnthropic({ system, content, model, maxTokens });
    if (r.ok) return r;
    if (wantEmergent) return callEmergent({ system, content: normalizeForEmergent(content), model: model || DEFAULT_MODEL_EMERGENT, maxTokens });
    return r;
  }

  if (wantEmergent) {
    const r = await callEmergent({ system, content: normalizeForEmergent(content), model: model || DEFAULT_MODEL_EMERGENT, maxTokens });
    if (r.ok) return r;
    if (wantAnthropic) return callAnthropic({ system, content, model: model || DEFAULT_MODEL_ANTHROPIC, maxTokens });
    return r;
  }

  if (wantAnthropic) return callAnthropic({ system, content, model: model || DEFAULT_MODEL_ANTHROPIC, maxTokens });

  return { ok: false, provider: 'none', model: null, error: 'No LLM key configured (EMERGENT_LLM_KEY or ANTHROPIC_API_KEY).' };
}

export function isLlmConfigured() {
  return hasEmergent() || hasAnthropic();
}

// ── Image generation via Emergent (Gemini Nano Banana) ──────────────
const EMERGENT_IMAGE_MODEL_DEFAULT = 'gemini-3.1-flash-image-preview';

/**
 * Génère ou édite une image via Gemini Nano Banana (Emergent LLM Key).
 * @param {Object} opts
 * @param {string} opts.prompt — description texte du rendu attendu
 * @param {string} [opts.referenceImageBase64] — image de référence (paysage…)
 * @param {string} [opts.referenceMime='image/jpeg']
 * @param {string} [opts.model='gemini-3.1-flash-image-preview']
 * @returns {Promise<{ok:boolean, image?:{base64, mime}, text?:string, error?:string}>}
 */
export async function generateImage({ prompt, referenceImageBase64, referenceMime = 'image/jpeg', model = EMERGENT_IMAGE_MODEL_DEFAULT }) {
  if (!hasEmergent()) {
    return { ok: false, error: 'EMERGENT_LLM_KEY non configurée — génération image impossible.' };
  }

  // Build user content: [text] + optional image as SEPARATE messages (Gemini Nano Banana style)
  const messages = [];
  messages.push({ role: 'user', content: [{ type: 'text', text: prompt }] });
  if (referenceImageBase64) {
    messages.push({ role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${referenceMime};base64,${referenceImageBase64}` } }] });
  }

  const res = await fetch(EMERGENT_PROXY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EMERGENT_LLM_KEY}`,
    },
    body: JSON.stringify({
      model: `gemini/${model}`,
      messages,
      modalities: ['image', 'text'],
    }),
  });

  if (!res.ok) {
    const errTxt = await res.text().catch(() => '');
    return { ok: false, error: `HTTP ${res.status}: ${errTxt.slice(0, 240)}` };
  }
  const data = await res.json();
  const msg = data?.choices?.[0]?.message || {};
  const images = msg.images || [];
  const first = images[0];
  if (!first?.image_url?.url) {
    return { ok: false, error: 'Aucune image dans la réponse', text: msg.content || '' };
  }
  const url = first.image_url.url;
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { ok: false, error: 'Format image inattendu' };
  return {
    ok: true,
    image: { mime: match[1], base64: match[2] },
    text: msg.content || '',
    model,
  };
}

// Extract first {...} JSON block from a text (LLM often wraps in prose / markdown).
export function extractJson(text) {
  if (!text) return null;
  const clean = String(text).replace(/```json\n?|\n?```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}
