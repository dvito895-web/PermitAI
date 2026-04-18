// app/lib/email.js
// Colle ce fichier dans : app/lib/email.js
// Puis ajoute dans .env : RESEND_API_KEY=re_xxx

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'PermitAI <noreply@permitai.eu>';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://permitai.eu';

// ─── TEMPLATE BASE ───────────────────────────────────────────────────────────
function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PermitAI</title>
</head>
<body style="margin:0;padding:0;background:#06060e;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#f2efe9;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- LOGO -->
    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;background:#a07820;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:14px;font-weight:700;">P</span>
        </div>
        <span style="font-size:18px;font-weight:600;color:#f2efe9;">PermitAI</span>
      </div>
    </div>

    <!-- CONTENU -->
    <div style="background:#0e0e1a;border:0.5px solid #1c1c2a;border-radius:16px;padding:36px;">
      ${content}
    </div>

    <!-- FOOTER -->
    <div style="margin-top:24px;text-align:center;">
      <p style="font-size:11px;color:#3e3a34;margin-bottom:8px;">
        © 2025 PermitAI · <a href="${BASE_URL}/politique-confidentialite" style="color:#3e3a34;">Confidentialité</a> · <a href="${BASE_URL}/cgu" style="color:#3e3a34;">CGU</a>
      </p>
      <p style="font-size:11px;color:#1e1e28;">contact@permitai.eu</p>
    </div>
  </div>
</body>
</html>`;
}

function btn(text, url) {
  return `<a href="${url}" style="display:inline-block;padding:13px 28px;background:linear-gradient(90deg,#a07820,#c4960a);color:#fff;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;margin-top:8px;">${text} →</a>`;
}

function stat(value, label) {
  return `<div style="text-align:center;padding:12px;background:#131320;border-radius:8px;border:0.5px solid #1c1c2a;">
    <div style="font-size:22px;font-weight:700;color:#e8b420;">${value}</div>
    <div style="font-size:10px;color:#3e3a34;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">${label}</div>
  </div>`;
}

// ─── EMAIL 1 : BIENVENUE ─────────────────────────────────────────────────────
export async function sendWelcomeEmail({ to, firstName }) {
  const content = `
    <h1 style="font-size:26px;font-weight:600;color:#f2efe9;margin-bottom:8px;">
      Bienvenue, ${firstName} 👋
    </h1>
    <p style="font-size:14px;color:#8d887f;line-height:1.7;margin-bottom:24px;">
      Votre compte PermitAI est actif. Vous avez <strong style="color:#e8b420;">1 analyse PLU gratuite</strong> disponible — utilisez-la pour vérifier la faisabilité de votre projet.
    </p>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:24px;">
      ${stat('36 000', 'Communes')}
      ${stat('3 min', 'Résultat')}
      ${stat('94%', 'Accordés')}
    </div>

    <div style="border-left:2px solid rgba(160,120,32,.4);padding-left:14px;margin-bottom:24px;">
      <p style="font-size:13px;color:#8d887f;line-height:1.7;margin:0;">
        <strong style="color:#f2efe9;">Ce que vous pouvez faire maintenant :</strong><br/>
        1. Entrez votre adresse et décrivez votre projet<br/>
        2. Obtenez votre analyse PLU en 3 minutes<br/>
        3. Téléchargez votre CERFA pré-rempli
      </p>
    </div>

    <div style="text-align:center;">
      ${btn('Lancer ma première analyse', `${BASE_URL}/analyse`)}
    </div>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Bienvenue sur PermitAI, ${firstName} — 1 analyse offerte`,
    html: baseTemplate(content),
  });
}

// ─── EMAIL 2 : CONFIRMATION ANALYSE PLU ─────────────────────────────────────
export async function sendAnalyseConfirmationEmail({ to, firstName, adresse, verdict, commune, score }) {
  const verdictColor = verdict === 'conforme' ? '#4ade80' : verdict === 'non_conforme' ? '#ef4444' : '#e8b420';
  const verdictLabel = verdict === 'conforme' ? 'Conforme ✓' : verdict === 'non_conforme' ? 'Non conforme ✗' : 'Conforme sous conditions ⚠';

  const content = `
    <h1 style="font-size:22px;font-weight:600;color:#f2efe9;margin-bottom:6px;">
      Votre analyse PLU est prête
    </h1>
    <p style="font-size:13px;color:#5a5650;margin-bottom:24px;">${adresse}</p>

    <div style="background:rgba(160,120,32,.06);border:0.5px solid rgba(160,120,32,.2);border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:11px;color:#3e3a34;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Verdict</div>
          <div style="font-size:18px;font-weight:600;color:${verdictColor};">${verdictLabel}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;color:#3e3a34;margin-bottom:4px;">Commune</div>
          <div style="font-size:13px;color:#f2efe9;">${commune}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;color:#3e3a34;margin-bottom:4px;">Confiance</div>
          <div style="font-size:18px;font-weight:600;color:#e8b420;">${score}%</div>
        </div>
      </div>
    </div>

    <p style="font-size:13px;color:#8d887f;line-height:1.7;margin-bottom:20px;">
      Retrouvez l'analyse complète avec toutes les règles PLU applicables, votre CERFA recommandé et les prochaines étapes dans votre dashboard.
    </p>

    <div style="text-align:center;">
      ${btn('Voir l\'analyse complète', `${BASE_URL}/dashboard`)}
    </div>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Analyse PLU prête — ${verdict === 'conforme' ? '✓ Conforme' : verdict === 'non_conforme' ? '✗ Non conforme' : '⚠ Sous conditions'} — ${commune}`,
    html: baseTemplate(content),
  });
}

// ─── EMAIL 3 : CONFIRMATION DÉPÔT EN MAIRIE ──────────────────────────────────
export async function sendDepotConfirmationEmail({ to, firstName, adresse, commune, numeroDossier, dateDepot, delaiInstruction }) {
  const content = `
    <h1 style="font-size:22px;font-weight:600;color:#f2efe9;margin-bottom:6px;">
      Dossier déposé en mairie ✓
    </h1>
    <p style="font-size:13px;color:#5a5650;margin-bottom:24px;">${adresse} · ${commune}</p>

    <div style="background:rgba(74,222,128,.05);border:0.5px solid rgba(74,222,128,.18);border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <div style="font-size:10px;color:#3e3a34;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">N° de dossier</div>
          <div style="font-size:14px;font-weight:600;color:#4ade80;">${numeroDossier}</div>
        </div>
        <div>
          <div style="font-size:10px;color:#3e3a34;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Date de dépôt</div>
          <div style="font-size:13px;color:#f2efe9;">${dateDepot}</div>
        </div>
        <div>
          <div style="font-size:10px;color:#3e3a34;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Délai d'instruction</div>
          <div style="font-size:13px;color:#f2efe9;">${delaiInstruction}</div>
        </div>
        <div>
          <div style="font-size:10px;color:#3e3a34;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Mairie</div>
          <div style="font-size:13px;color:#f2efe9;">${commune}</div>
        </div>
      </div>
    </div>

    <div style="border-left:2px solid rgba(160,120,32,.4);padding-left:14px;margin-bottom:24px;">
      <p style="font-size:12px;color:#8d887f;line-height:1.7;margin:0;">
        PermitAI surveille automatiquement votre dossier et vous alertera avant l'expiration du délai légal. En cas d'absence de réponse, vous bénéficiez d'un accord tacite.
      </p>
    </div>

    <div style="text-align:center;">
      ${btn('Suivre mon dossier', `${BASE_URL}/suivi`)}
    </div>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Dossier déposé ✓ — N° ${numeroDossier} — ${commune}`,
    html: baseTemplate(content),
  });
}

// ─── EMAIL 4 : ALERTE PLU RÉVISÉ ─────────────────────────────────────────────
export async function sendAlertePLUEmail({ to, firstName, commune, dateRevision, impact }) {
  const content = `
    <div style="display:inline-block;padding:4px 12px;background:rgba(232,180,32,.1);border:0.5px solid rgba(232,180,32,.25);border-radius:20px;font-size:10px;color:#e8b420;font-weight:600;margin-bottom:20px;text-transform:uppercase;letter-spacing:0.5px;">
      ⚡ Alerte PLU
    </div>

    <h1 style="font-size:22px;font-weight:600;color:#f2efe9;margin-bottom:8px;">
      Le PLU de ${commune} a été révisé
    </h1>
    <p style="font-size:13px;color:#5a5650;margin-bottom:24px;">Révision du ${dateRevision}</p>

    <div style="background:rgba(232,180,32,.05);border:0.5px solid rgba(232,180,32,.15);border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:12px;color:#8d887f;line-height:1.7;">${impact || 'Des changements ont été apportés aux règles d\'urbanisme de cette commune. Vos projets en cours peuvent être impactés.'}</div>
    </div>

    <p style="font-size:13px;color:#8d887f;line-height:1.7;margin-bottom:20px;">
      Si vous avez un dossier en cours ou un projet prévu à ${commune}, nous vous recommandons de relancer une analyse PLU pour vérifier que votre projet est toujours conforme aux nouvelles règles.
    </p>

    <div style="text-align:center;">
      ${btn(`Relancer une analyse à ${commune}`, `${BASE_URL}/analyse`)}
    </div>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `⚡ PLU révisé — ${commune} — Vérifiez votre projet`,
    html: baseTemplate(content),
  });
}

// ─── EMAIL 5 : RAPPEL ÉCHÉANCE DÉLAI ─────────────────────────────────────────
export async function sendRappelEcheanceEmail({ to, firstName, adresse, commune, numeroDossier, dateEcheance, joursRestants }) {
  const urgent = joursRestants <= 5;
  const accentColor = urgent ? '#ef4444' : '#e8b420';

  const content = `
    <div style="display:inline-block;padding:4px 12px;background:${urgent ? 'rgba(239,68,68,.1)' : 'rgba(232,180,32,.1)'};border:0.5px solid ${urgent ? 'rgba(239,68,68,.25)' : 'rgba(232,180,32,.25)'};border-radius:20px;font-size:10px;color:${accentColor};font-weight:600;margin-bottom:20px;text-transform:uppercase;letter-spacing:0.5px;">
      ${urgent ? '🚨 URGENT' : '⏰ Rappel échéance'}
    </div>

    <h1 style="font-size:22px;font-weight:600;color:#f2efe9;margin-bottom:8px;">
      ${joursRestants <= 0 ? 'Délai expiré — accord tacite possible' : `${joursRestants} jour${joursRestants > 1 ? 's' : ''} avant l'échéance`}
    </h1>
    <p style="font-size:13px;color:#5a5650;margin-bottom:24px;">${adresse} · N° ${numeroDossier}</p>

    <div style="background:${urgent ? 'rgba(239,68,68,.05)' : 'rgba(232,180,32,.05)'};border:0.5px solid ${urgent ? 'rgba(239,68,68,.18)' : 'rgba(232,180,32,.18)'};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:10px;color:#3e3a34;text-transform:uppercase;margin-bottom:4px;">Date limite mairie</div>
          <div style="font-size:18px;font-weight:700;color:${accentColor};">${dateEcheance}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px;color:#3e3a34;text-transform:uppercase;margin-bottom:4px;">Commune</div>
          <div style="font-size:13px;color:#f2efe9;">${commune}</div>
        </div>
      </div>
    </div>

    ${joursRestants <= 0 ? `
    <div style="border-left:2px solid rgba(74,222,128,.5);padding-left:14px;margin-bottom:24px;background:rgba(74,222,128,.04);border-radius:0 8px 8px 0;padding:12px 14px;">
      <p style="font-size:12px;color:#4ade80;line-height:1.7;margin:0;font-weight:600;">
        ✓ Le délai légal est dépassé. Si la mairie ne vous a pas répondu, vous bénéficiez d'un accord tacite. Demandez un certificat de non-opposition à la mairie de ${commune}.
      </p>
    </div>` : `
    <p style="font-size:13px;color:#8d887f;line-height:1.7;margin-bottom:20px;">
      Si la mairie ne répond pas avant le ${dateEcheance}, votre permis sera tacitement accordé. Vérifiez votre dossier et gardez une trace de votre dépôt.
    </p>`}

    <div style="text-align:center;">
      ${btn('Suivre mon dossier', `${BASE_URL}/suivi`)}
    </div>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: joursRestants <= 0
      ? `✓ Accord tacite possible — ${commune} — Délai expiré`
      : `${urgent ? '🚨 URGENT' : '⏰'} ${joursRestants}j avant échéance — Dossier ${numeroDossier} — ${commune}`,
    html: baseTemplate(content),
  });
}