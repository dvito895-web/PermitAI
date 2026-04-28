'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Building2, ArrowLeft, ArrowRight, Sparkles, ChevronRight, CheckCircle2, Download, Send, Clock } from 'lucide-react';
import { CERFA_LIST, getCerfaByNumero } from '../../../lib/cerfaList';

const PIECES_BY_CERFA = {
  '13406': ['Plan de masse (PCMI 2)', 'Plan de situation (PCMI 1)', 'Plan en coupe du terrain (PCMI 3)', 'Notice descriptive (PCMI 4)', 'Plan des façades et toitures (PCMI 5)', 'Document graphique d\'insertion (PCMI 6)', 'Photographie environnement proche (PCMI 7)', 'Photographie environnement lointain (PCMI 8)'],
  '13703': ['Plan de masse', 'Plan de situation', 'Photographies', 'Notice descriptive du projet'],
  '13411': ['Plan de masse de la démolition', 'Plan de situation', 'Photographies avant démolition', 'Description des travaux'],
  '13404': ['Plan de situation', 'Note descriptive du projet', 'Plan du terrain'],
  '13409': ['Plan de masse', 'Plan de situation', 'Plan en coupe', 'Notice descriptive', 'Plan des façades', 'Insertion paysagère', 'Photographies'],
  '13702': ['Justificatif d\'identité', 'Plan de situation', 'Description du projet'],
  '13408': ['Plan modifié', 'Déclaration des modifications'],
};

const PROJECT_TYPES = [
  { id: 'extension', label: 'Extension', desc: 'Agrandissement d\'une construction existante' },
  { id: 'construction', label: 'Construction neuve', desc: 'Bâtiment neuf sur terrain nu' },
  { id: 'renovation', label: 'Rénovation', desc: 'Modification de façade ou toiture' },
  { id: 'surelevation', label: 'Surélévation', desc: 'Ajout d\'un étage' },
  { id: 'annexe', label: 'Annexe / Garage', desc: 'Bâtiment secondaire' },
  { id: 'piscine', label: 'Piscine', desc: 'Construction d\'une piscine' },
  { id: 'cloture', label: 'Clôture', desc: 'Pose d\'une clôture' },
  { id: 'demolition', label: 'Démolition', desc: 'Suppression d\'une construction' },
];

function WizardContent() {
  const params = useSearchParams();
  const cerfaParam = params.get('cerfa') || '';
  const adresseParam = params.get('adresse') || '';
  const communeParam = params.get('commune') || '';
  const zoneParam = params.get('zone') || '';
  const surfaceParam = params.get('surface') || '';
  const typeParam = params.get('type') || '';

  const [step, setStep] = useState(1);
  const [selectedCerfa, setSelectedCerfa] = useState(null);
  const [type, setType] = useState(typeParam);
  const [adresse, setAdresse] = useState(adresseParam);
  const [commune, setCommune] = useState(communeParam);
  const [zone, setZone] = useState(zoneParam);
  const [surface, setSurface] = useState(surfaceParam);
  const [hauteur, setHauteur] = useState('');
  const [description, setDescription] = useState('');

  // Pre-fill from params
  useEffect(() => {
    if (cerfaParam) {
      const c = getCerfaByNumero(cerfaParam);
      if (c) setSelectedCerfa(c);
    }
    // If we have params, jump to last step (preview/complete)
    if (cerfaParam && adresseParam) setStep(4);
    else if (cerfaParam) setStep(2);
  }, [cerfaParam, adresseParam]);

  const next = () => setStep(s => Math.min(4, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleSelectCerfa = (c) => { setSelectedCerfa(c); next(); };

  const pieces = selectedCerfa ? (PIECES_BY_CERFA[selectedCerfa.numero] || ['Plan de situation', 'Plan de masse', 'Notice descriptive']) : [];

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#f2efe9' }}>
            <Building2 size={20} color="#e8b420" />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500 }}>PermitAI</span>
          </Link>
          <Link href="/cerfa" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8d887f', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Tous les CERFA
          </Link>
        </div>
      </nav>

      <section style={{ padding: '50px 36px', maxWidth: 880, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, background: 'rgba(160,120,32,.1)', border: '0.5px solid rgba(160,120,32,.3)', fontSize: 11, color: '#e8b420', fontWeight: 600, marginBottom: 18 }}>
            <Sparkles size={12} /> Assistant CERFA
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 500, lineHeight: 1.1, marginBottom: 10, letterSpacing: -0.8 }}>
            Remplissez votre CERFA<br /><em style={{ color: '#e8b420' }}>en 5 minutes</em>
          </h1>
          <p style={{ fontSize: 13, color: '#8d887f' }}>4 étapes guidées · PDF officiel à télécharger</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 36 }}>
          {['Type', 'Terrain', 'Projet', 'Rapport'].map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const current = step === num;
            return (
              <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: done || current ? '#a07820' : '#1c1c2a', color: done || current ? '#fff' : '#5a5650', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done ? <CheckCircle2 size={14} /> : num}
                  </div>
                  <span style={{ fontSize: 12, color: current ? '#f2efe9' : '#5a5650', fontWeight: current ? 500 : 400 }}>{label}</span>
                </div>
                {num < 4 && <div style={{ width: 30, height: 1, background: done ? '#a07820' : '#1c1c2a' }} />}
              </div>
            );
          })}
        </div>

        {/* === STEP 1 : TYPE === */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, marginBottom: 18, textAlign: 'center' }}>Quel type de projet ?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {PROJECT_TYPES.map(p => (
                <button key={p.id} onClick={() => { setType(p.id); next(); }}
                  style={{ padding: '18px 20px', background: type === p.id ? 'rgba(160,120,32,.08)' : '#0c0c18', border: `0.5px solid ${type === p.id ? '#a07820' : '#1c1c2a'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all .15s' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: '#5a5650' }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === STEP 2 : TERRAIN === */}
        {step === 2 && (
          <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 28 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, marginBottom: 22 }}>Informations du terrain</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.3px' }}>Adresse complète</label>
                <input value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="47 avenue Victor Hugo, 69003 Lyon" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.3px' }}>Commune</label>
                  <input value={commune} onChange={e => setCommune(e.target.value)} placeholder="Lyon" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.3px' }}>Zone PLU</label>
                  <input value={zone} onChange={e => setZone(e.target.value)} placeholder="UB" style={inputStyle} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={prev} style={btnSecondary}>← Précédent</button>
              <button onClick={next} disabled={!adresse} style={{ ...btnPrimary, opacity: !adresse ? .5 : 1 }}>Continuer <ArrowRight size={14} style={{ marginLeft: 6 }} /></button>
            </div>
          </div>
        )}

        {/* === STEP 3 : PROJET === */}
        {step === 3 && (
          <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 14, padding: 28 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, marginBottom: 22 }}>Détails du projet</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.3px' }}>Surface plancher (m²)</label>
                  <input type="number" value={surface} onChange={e => setSurface(e.target.value)} placeholder="40" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.3px' }}>Hauteur faitage (m)</label>
                  <input type="number" value={hauteur} onChange={e => setHauteur(e.target.value)} placeholder="7" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.3px' }}>Description détaillée</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez votre projet en quelques lignes…" rows={4} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={prev} style={btnSecondary}>← Précédent</button>
              <button onClick={next} style={btnPrimary}>Générer le rapport <ArrowRight size={14} style={{ marginLeft: 6 }} /></button>
            </div>
          </div>
        )}

        {/* === STEP 4 : RAPPORT === */}
        {step === 4 && selectedCerfa && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #0c0c18, rgba(74,222,128,.04))', border: '0.5px solid rgba(74,222,128,.25)', borderRadius: 14, padding: 28, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <CheckCircle2 size={32} color="#4ade80" />
                <div>
                  <div style={{ fontSize: 11, color: '#5a5650', textTransform: 'uppercase', marginBottom: 2 }}>CERFA recommandé</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: '#f2efe9' }}>CERFA {selectedCerfa.numero}</div>
                  <div style={{ fontSize: 12, color: '#8d887f' }}>{selectedCerfa.nom}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
                <div style={{ padding: 14, background: '#0a0a14', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', marginBottom: 4 }}>Délai instruction</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#f2efe9', fontWeight: 500 }}><Clock size={12} color="#e8b420" />{selectedCerfa.delaiInstruction}</div>
                </div>
                <div style={{ padding: 14, background: '#0a0a14', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', marginBottom: 4 }}>Catégorie</div>
                  <div style={{ fontSize: 13, color: '#f2efe9', fontWeight: 500 }}>{selectedCerfa.categorie}</div>
                </div>
                <div style={{ padding: 14, background: '#0a0a14', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: '#5a5650', textTransform: 'uppercase', marginBottom: 4 }}>Pièces</div>
                  <div style={{ fontSize: 13, color: '#f2efe9', fontWeight: 500 }}>{pieces.length} requises</div>
                </div>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 500, color: '#f2efe9', marginBottom: 12 }}>Pièces à joindre obligatoirement</h3>
              <div style={{ display: 'grid', gap: 6 }}>
                {pieces.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#0a0a14', borderRadius: 8 }}>
                    <CheckCircle2 size={14} color="#4ade80" />
                    <span style={{ fontSize: 12, color: '#f2efe9' }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button style={{ padding: '14px 0', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 10, color: '#f2efe9', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Download size={14} /> Télécharger le rapport
              </button>
              <Link href="/dashboard">
                <button style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Send size={14} /> Déposer en mairie
                </button>
              </Link>
            </div>

            <div style={{ marginTop: 18, padding: 14, background: 'rgba(96,165,250,.05)', border: '0.5px solid rgba(96,165,250,.2)', borderRadius: 10, fontSize: 11, color: '#60a5fa', textAlign: 'center' }}>
              💡 Le dépôt en mairie utilise PLAT'AU pour les mairies raccordées, ou LRAR La Poste sinon.
            </div>
          </div>
        )}

        {/* If step 4 but no cerfa selected, fallback to step 1 selection */}
        {step === 4 && !selectedCerfa && (
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, marginBottom: 18, textAlign: 'center' }}>Quel formulaire CERFA ?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {CERFA_LIST.slice(0, 6).map(c => (
                <button key={c.numero} onClick={() => handleSelectCerfa(c)}
                  style={{ padding: 18, background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ padding: '3px 8px', background: 'rgba(160,120,32,.1)', color: '#e8b420', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>CERFA {c.numero}</div>
                    <ChevronRight size={14} color="#8d887f" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#f2efe9', marginBottom: 4 }}>{c.nom}</div>
                  <div style={{ fontSize: 11, color: '#5a5650' }}>{c.description?.slice(0, 80)}…</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const inputStyle = { width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#f2efe9', fontFamily: 'inherit', outline: 'none' };
const btnPrimary = { flex: 1, padding: '12px 0', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const btnSecondary = { padding: '12px 18px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 10, color: '#8d887f', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' };

export default function CerfaWizardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8d887f', fontSize: 13 }}>Chargement…</div>}>
      <WizardContent />
    </Suspense>
  );
}
