'use client';
// components/CerfaPiecesList.js — Liste des pièces obligatoires par CERFA avec statut + actions.
import { useMemo } from 'react';
import { Check, Upload, Sparkles, FileText, Download, AlertCircle } from 'lucide-react';
import { getPiecesForCerfa } from '@/lib/cerfaLegalRules';

const SOURCE_BADGES = {
  auto_ign:           { label: 'AUTO IGN',          icon: Sparkles, color: '#4ade80', tone: 'rgba(74,222,128,.1)' },
  auto_analyse:       { label: 'AUTO ANALYSE',      icon: Sparkles, color: '#60a5fa', tone: 'rgba(96,165,250,.1)' },
  ia_claude:          { label: 'IA CLAUDE',         icon: Sparkles, color: '#a78bfa', tone: 'rgba(167,139,250,.1)' },
  dessin_interactif:  { label: 'DESSIN AUTO',       icon: Sparkles, color: '#a78bfa', tone: 'rgba(167,139,250,.1)' },
  a_uploader:         { label: 'À UPLOADER',        icon: Upload,   color: '#e8b420', tone: 'rgba(232,180,32,.1)' },
};

const STATUT_BADGES = {
  GENERE:     { label: 'GÉNÉRÉ',     bg: 'rgba(74,222,128,.12)', fg: '#4ade80', border: 'rgba(74,222,128,.3)' },
  UPLOAD:     { label: 'UPLOADÉ',    bg: 'rgba(74,222,128,.12)', fg: '#4ade80', border: 'rgba(74,222,128,.3)' },
  EN_ATTENTE: { label: 'EN ATTENTE', bg: 'rgba(232,180,32,.12)', fg: '#e8b420', border: 'rgba(232,180,32,.3)' },
  MANQUANT:   { label: 'MANQUANT',   bg: 'rgba(239,68,68,.12)',  fg: '#ef4444', border: 'rgba(239,68,68,.3)' },
};

/**
 * <CerfaPiecesList />
 *
 * Props:
 *  - cerfaNum: ex "13406" ou "13406*13"
 *  - estNeuf: boolean (active la pièce RE2020)
 *  - statuses: objet { 'PC1': 'GENERE', 'PC7': 'UPLOAD', ... }
 *               -- statut par défaut: 'EN_ATTENTE' pour auto/ia, 'MANQUANT' pour a_uploader
 *  - onDownload: (codePiece) => void  — clic sur "Télécharger" si statut = GENERE
 *  - onUpload:   (codePiece, file) => void — input file sur 'a_uploader'
 *  - compact: boolean (mode liste compact pour récap step 6)
 */
export default function CerfaPiecesList({
  cerfaNum, estNeuf = false, statuses = {}, onDownload, onUpload, compact = false,
}) {
  const pieces = useMemo(() => getPiecesForCerfa(cerfaNum), [cerfaNum]);

  // Filtre les pièces conditionnelles (critique === 'si_neuf')
  const filtered = pieces.filter(p => p.critique !== 'si_neuf' || estNeuf);

  const computeStatut = (p) => {
    if (statuses[p.code]) return statuses[p.code];
    if (p.source === 'a_uploader') return 'MANQUANT';
    return 'EN_ATTENTE';
  };

  // Stats globales
  const total = filtered.length;
  const ok = filtered.filter(p => {
    const s = computeStatut(p);
    return s === 'GENERE' || s === 'UPLOAD';
  }).length;
  const missing = filtered.filter(p => computeStatut(p) === 'MANQUANT' && p.critique === true).length;

  return (
    <div data-testid="cerfa-pieces-list">
      {!compact && (
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: '#5a5650', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 3, fontWeight: 600 }}>Pièces du dossier CERFA {cerfaNum}</div>
            <div style={{ fontSize: 13, color: '#f2efe9' }}>
              <strong style={{ color: '#e8b420', fontSize: 16 }}>{ok}/{total}</strong> prêtes
              {missing > 0 && <span style={{ marginLeft: 12, color: '#ef4444', fontWeight: 500 }}>· {missing} critique{missing>1?'s':''} manquante{missing>1?'s':''}</span>}
            </div>
          </div>
          <div style={{ width: 80, height: 80, position: 'relative' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1c1c2a" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={missing > 0 ? '#ef4444' : ok === total ? '#4ade80' : '#e8b420'}
                strokeWidth="2.5"
                strokeDasharray={`${(ok/total)*100} 100`}
                strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#f2efe9' }}>
              {Math.round((ok/total)*100)}%
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {filtered.map((p) => {
          const statut = computeStatut(p);
          const srcBadge = SOURCE_BADGES[p.source] || SOURCE_BADGES.a_uploader;
          const statBadge = STATUT_BADGES[statut];
          const SrcIcon = srcBadge.icon;
          const isReady = statut === 'GENERE' || statut === 'UPLOAD';

          return (
            <div key={p.code} data-testid={`piece-${p.code}`} style={{
              padding: '12px 14px', background: '#0c0c18', border: `0.5px solid ${isReady ? 'rgba(74,222,128,.18)' : '#1c1c2a'}`,
              borderRadius: 9, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: srcBadge.tone, border: `0.5px solid ${srcBadge.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isReady ? <Check size={16} color="#4ade80" /> : <SrcIcon size={15} color={srcBadge.color} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#a07820', fontWeight: 600 }}>{p.code}</span>
                  <span style={{ fontSize: 13, color: '#f2efe9', fontWeight: 500 }}>{p.intitule}</span>
                  {p.critique === true && <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 600 }}>OBLIGATOIRE</span>}
                </div>
                {!compact && (
                  <div style={{ fontSize: 11, color: '#c4bfb8', lineHeight: 1.45 }}>{p.description}</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 10, background: statBadge.bg, color: statBadge.fg, border: `0.5px solid ${statBadge.border}`, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {statBadge.label}
                </span>
                {isReady && onDownload && (
                  <button onClick={() => onDownload(p.code)} data-testid={`download-${p.code}`}
                    style={{ padding: '6px 10px', background: 'rgba(160,120,32,.1)', border: '0.5px solid rgba(160,120,32,.3)', borderRadius: 6, color: '#e8b420', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Download size={11} /> PDF
                  </button>
                )}
                {p.source === 'a_uploader' && statut === 'MANQUANT' && onUpload && (
                  <label style={{ padding: '6px 10px', background: 'rgba(232,180,32,.1)', border: '0.5px dashed rgba(232,180,32,.4)', borderRadius: 6, color: '#e8b420', fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Upload size={11} /> Téléverser
                    <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files?.[0] && onUpload(p.code, e.target.files[0])} data-testid={`upload-${p.code}`} />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {missing > 0 && !compact && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,.08)', border: '0.5px solid rgba(239,68,68,.3)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 9 }}>
          <AlertCircle size={14} color="#ef4444" />
          <span style={{ fontSize: 12, color: '#fca5a5' }}>
            <strong>{missing} pièce{missing>1?'s':''} obligatoire{missing>1?'s':''}</strong> manquante{missing>1?'s':''}. Le dépôt en mairie sera refusé tant que toutes les pièces critiques ne sont pas fournies.
          </span>
        </div>
      )}
    </div>
  );
}
