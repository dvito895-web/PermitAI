'use client';
// components/LegalAlerts.js — Bannières d'alerte légale (architecte, RE2020, ABF, DOC/DAACT)
import { AlertCircle, Info, ShieldAlert, Scale } from 'lucide-react';
import {
  architecteObligatoire, re2020Required, abfAlerte,
  DOC_RULE, DAACT_RULE, DELAIS_INSTRUCTION,
} from '@/lib/cerfaLegalRules';

const PALETTE = {
  red:    { bg: 'rgba(239,68,68,.08)',  bd: 'rgba(239,68,68,.4)',  fg: '#fca5a5', ic: '#ef4444' },
  amber:  { bg: 'rgba(232,180,32,.08)', bd: 'rgba(232,180,32,.4)', fg: '#fcd34d', ic: '#e8b420' },
  blue:   { bg: 'rgba(96,165,250,.08)', bd: 'rgba(96,165,250,.35)',fg: '#93c5fd', ic: '#60a5fa' },
  green:  { bg: 'rgba(74,222,128,.08)', bd: 'rgba(74,222,128,.3)', fg: '#86efac', ic: '#4ade80' },
};

function Banner({ tone = 'amber', icon: Icon = AlertCircle, title, message, action, testid }) {
  const p = PALETTE[tone] || PALETTE.amber;
  return (
    <div data-testid={testid} style={{
      padding: '12px 14px', background: p.bg, border: `0.5px solid ${p.bd}`, borderRadius: 9,
      display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10,
    }}>
      <Icon size={16} style={{ color: p.ic, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: p.fg, fontWeight: 600, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11, color: '#c4bfb8', lineHeight: 1.5 }}>{message}</div>
        {action && <div style={{ fontSize: 10, color: p.ic, marginTop: 6, fontStyle: 'italic' }}>→ {action}</div>}
      </div>
    </div>
  );
}

/**
 * <LegalAlerts /> — affiche toutes les alertes légales applicables au projet.
 *
 * Props:
 *   - cerfaNum: ex "13406" ou "13703*13"
 *   - surface_creee, surface_plancher_totale (number/string)
 *   - nature_travaux: "construction_neuve" | "extension" | ...
 *   - usage: "logement" | "bureau"
 *   - zone_abf: boolean (terrain en périmètre ABF)
 *   - est_personne_morale: boolean
 *   - showDocDaact: bool — affiche aussi les rappels DOC/DAACT (après PC accordé)
 */
export default function LegalAlerts({
  cerfaNum, surface_creee, surface_plancher_totale, nature_travaux,
  usage = 'logement', zone_abf = false, est_personne_morale = false,
  showDocDaact = false,
}) {
  const surfaceTot = parseFloat(surface_plancher_totale || surface_creee || 0);
  const arch = architecteObligatoire({ surface_plancher_totale: surfaceTot, est_personne_morale });
  const re20 = re2020Required(nature_travaux, usage);
  const abf  = abfAlerte(zone_abf, false, false);

  const cerfaKey = (cerfaNum || '').replace('*', '').slice(0, 5);
  const delaiInfo = DELAIS_INSTRUCTION[cerfaKey];

  const alerts = [];

  if (delaiInfo) {
    alerts.push(<Banner key="delai" tone="blue" icon={Info} testid="alert-delai"
      title={`CERFA ${cerfaNum} — Délai d'instruction ${delaiInfo.delai}`}
      message={`${delaiInfo.description}. Délai officiel article R.423-23 du Code de l'urbanisme. Accord tacite si la mairie ne répond pas avant échéance.`} />);
  }

  if (arch.obligatoire) {
    alerts.push(<Banner key="arch" tone="red" icon={Scale} testid="alert-architecte"
      title="⚖️ Architecte obligatoire"
      message={arch.raison}
      action="Faire signer les pièces graphiques par un architecte HMONP avant dépôt." />);
  }

  if (re20.requise) {
    alerts.push(<Banner key="re20" tone="amber" icon={AlertCircle} testid="alert-re2020"
      title="🌱 Attestation RE2020 obligatoire"
      message={re20.raison}
      action={`Joindre : ${re20.document}. Bureau d'études thermique habilité (~600-1500€).`} />);
  }

  if (abf.requise) {
    alerts.push(<Banner key="abf" tone="amber" icon={ShieldAlert} testid="alert-abf"
      title="🏛️ Avis ABF requis"
      message={`${abf.raison} ${abf.consequence}`}
      action={abf.action} />);
  }

  if (showDocDaact) {
    alerts.push(<Banner key="doc" tone="blue" icon={Info} testid="alert-doc"
      title={`📄 ${DOC_RULE.nom}`}
      message={`Délai : ${DOC_RULE.delai_depot}. ${DOC_RULE.obligation}`}
      action={`Référence : ${DOC_RULE.reference}.`} />);
    alerts.push(<Banner key="daact" tone="blue" icon={Info} testid="alert-daact"
      title={`📑 ${DAACT_RULE.nom}`}
      message={`Délai : ${DAACT_RULE.delai_depot}. ${DAACT_RULE.obligation}`}
      action={`Référence : ${DAACT_RULE.reference}.`} />);
  }

  if (alerts.length === 0) {
    return (
      <Banner tone="green" icon={Info}
        title="Aucune alerte légale critique"
        message="Votre dossier ne déclenche pas d'obligations légales additionnelles selon les données actuelles." />
    );
  }

  return <div data-testid="legal-alerts-wrapper">{alerts}</div>;
}
