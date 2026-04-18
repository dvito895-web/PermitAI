'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Lock, Search, FileText } from 'lucide-react';

/* ─── SUGGESTIONS D'ADRESSES ──────────────────────────────────────────────── */
// En production : remplacer par appel API https://api-adresse.data.gouv.fr/search/
const ADRESSES_DEMO = [
  { label: '12 rue des Lilas, Lyon 69006', commune: 'lyon', icon: '🏘' },
  { label: '45 avenue des Champs-Élysées, Paris 75008', commune: 'paris', icon: '🏙' },
  { label: '8 place de la Victoire, Bordeaux 33000', commune: 'bordeaux', icon: '🏡' },
  { label: '23 rue Paradis, Marseille 13006', commune: 'marseille', icon: '🌊' },
  { label: '15 allée des Roses, Toulouse 31000', commune: 'toulouse', icon: '🌹' },
  { label: '7 rue du Faubourg, Nice 06000', commune: 'nice', icon: '☀️' },
  { label: '34 boulevard de la Liberté, Lille 59000', commune: 'lille', icon: '🏗' },
  { label: '2 quai du Nouveau Bassin, Nantes 44000', commune: 'nantes', icon: '⚓' },
  { label: '89 rue de la République, Strasbourg 67000', commune: 'strasbourg', icon: '🇫🇷' },
  { label: '17 avenue Foch, Rennes 35000', commune: 'rennes', icon: '🏰' },
  { label: '56 rue Victor Hugo, Grenoble 38000', commune: 'grenoble', icon: '⛰' },
  { label: '3 rue du Moulin, Dijon 21000', commune: 'dijon', icon: '🍷' },
  { label: '11 place de la Comédie, Montpellier 34000', commune: 'montpellier', icon: '🌿' },
  { label: '28 boulevard Jean Jaurès, Brest 29000', commune: 'brest', icon: '🚢' },
  { label: '6 avenue du Général de Gaulle, Clermont-Ferrand 63000', commune: 'clermont', icon: '🌋' },
];

function getSuggestions(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return ADRESSES_DEMO.filter(a =>
    a.label.toLowerCase().includes(q) ||
    a.commune.includes(q)
  ).slice(0, 5);
}

/* ─── RÉSULTATS DEMO ─────────────────────────────────────────────────────── */
const RESULTS = {
  paris: {
    commune: 'Paris 8e (75008)', zone: 'UA2 — Urbain central', verdict: 'conforme', score: 89,
    rules: [
      { id:1, icon:'📐', label:'Hauteur maximale', article:'Art. UG.10.1', value:'25m (R+7)', status:'ok', detail:'Votre projet de R+4 est conforme. La zone UA2 parisienne autorise jusqu\'à 25m à l\'égout du toit.' },
      { id:2, icon:'📊', label:'Emprise au sol', article:'Art. UG.9.1', value:'80% maximum', status:'ok', detail:'L\'emprise calculée de 68% reste sous le seuil de 80%. Marge de 12% disponible pour les annexes.' },
      { id:3, icon:'📏', label:'Recul façade sur voie', article:'Art. UG.7.1', value:'À l\'alignement', status:'locked' },
      { id:4, icon:'🏛', label:'Aspect extérieur — matériaux', article:'Art. UG.11.2', value:'Pierre de taille ou enduit', status:'locked' },
    ],
  },
  lyon: {
    commune: 'Lyon 6e (69006)', zone: 'UC2 — Tissu résidentiel', verdict: 'attention', score: 71,
    rules: [
      { id:1, icon:'📐', label:'Hauteur maximale', article:'Art. UC.10', value:'13m (R+3+C)', status:'ok', detail:'Votre R+2 est conforme. La zone UC2 autorise R+3+combles, soit 13m à l\'égout.' },
      { id:2, icon:'⚠️', label:'Recul limite séparative', article:'Art. UC.7.3', value:'4m minimum', status:'warning', detail:'Votre plan indique 3,2m de recul. Le PLU exige 4m minimum côté Est. Risque de refus élevé — modifiez l\'implantation.' },
      { id:3, icon:'📊', label:'Emprise au sol', article:'Art. UC.9', value:'35% maximum', status:'locked' },
      { id:4, icon:'🚗', label:'Stationnement obligatoire', article:'Art. UC.12', value:'2 places / logement', status:'locked' },
    ],
  },
  default: {
    commune: 'Bordeaux (33000)', zone: 'UB3 — Résidentiel pavillonnaire', verdict: 'conforme', score: 92,
    rules: [
      { id:1, icon:'📐', label:'Hauteur maximale', article:'Art. UB.10', value:'9m (R+1+C)', status:'ok', detail:'Votre plain-pied + combles (7,2m) est conforme. La zone UB3 autorise jusqu\'à 9m à l\'égout.' },
      { id:2, icon:'📊', label:'Emprise au sol', article:'Art. UB.9', value:'40% maximum', status:'ok', detail:'Emprise calculée : 32%. Vous avez encore 8% de marge pour une future extension ou une piscine.' },
      { id:3, icon:'📏', label:'Recul voie publique', article:'Art. UB.7.1', value:'5m minimum', status:'locked' },
      { id:4, icon:'🔲', label:'Recul limites séparatives', article:'Art. UB.7.3', value:'H/2 ≥ 3m', status:'locked' },
    ],
  },
};

function getResult(addr) {
  const a = addr.toLowerCase();
  if (a.includes('paris')) return RESULTS.paris;
  if (a.includes('lyon')) return RESULTS.lyon;
  return RESULTS.default;
}

const STEPS = [
  'Identification de la commune...',
  'Récupération du PLU officiel...',
  'Analyse des zones cadastrales...',
  'Vérification des règles PLU...',
  'Calcul du score de conformité...',
  'Génération du rapport...',
];
const PCTS = [15, 30, 48, 65, 82, 96];
const TYPE_SHORTCUTS = ['Extension maison', 'Construction neuve', 'Piscine', 'Garage', 'Clôture', 'Ravalement'];

const C = {
  bg: '#06060e', surface: '#09090f', surface2: '#0e0e1a',
  border: '#1c1c2a', gold: '#a07820', goldL: '#e8b420',
  cream: '#f2efe9', muted: '#5a5650', dim: '#3e3a34',
};

/* ─── COMPOSANT AUTOCOMPLETE ──────────────────────────────────────────────── */
function AddressInput({ value, onChange, onSelect }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const suggestions = getSuggestions(value);
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search size={15} color={focused ? C.gold : C.dim} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color .2s' }} />
        <input
          type="text"
          value={value}
          autoComplete="off"
          placeholder="Ex: 12 rue des Lilas, Lyon 69006"
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}
          style={{
            width: '100%', background: '#0a0a14',
            border: `0.5px solid ${focused ? 'rgba(160,120,32,.4)' : C.border}`,
            borderRadius: 12, padding: '14px 20px 14px 44px',
            fontSize: 13, color: C.cream,
            fontFamily: "'DM Sans', sans-serif", outline: 'none',
            transition: 'border-color .2s',
          }}
        />
        {value && (
          <button onClick={() => { onChange(''); setOpen(false); }} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: C.dim, fontSize: 16, lineHeight: 1 }}>×</button>
        )}
      </div>

      {/* DROPDOWN */}
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
          background: C.surface2, border: `0.5px solid ${C.border}`,
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,.4)',
        }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={e => { e.preventDefault(); onSelect(s.label); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 16px', background: 'transparent',
                border: 'none', borderBottom: i < suggestions.length - 1 ? `0.5px solid ${C.border}` : 'none',
                cursor: 'pointer', textAlign: 'left',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,120,32,.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 28, height: 28, background: 'rgba(160,120,32,.08)', border: `0.5px solid rgba(160,120,32,.15)`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>
                {s.icon}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, color: C.cream, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {highlightMatch(s.label, value)}
                </div>
                <div style={{ fontSize: 10, color: C.dim, marginTop: 1 }}>France · PLU indexé ✓</div>
              </div>
              <MapPin size={12} color={C.gold} style={{ flexShrink: 0 }} />
            </button>
          ))}
          <div style={{ padding: '8px 16px', borderTop: `0.5px solid ${C.border}`, fontSize: 10, color: C.dim }}>
            34 970 communes indexées · Données Géoportail Urbanisme
          </div>
        </div>
      )}
    </div>
  );
}

function highlightMatch(text, query) {
  if (!query) return <span style={{ color: '#f2efe9' }}>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span style={{ color: '#f2efe9' }}>{text}</span>;
  return (
    <span style={{ color: '#f2efe9' }}>
      {text.slice(0, idx)}
      <span style={{ color: '#e8b420', fontWeight: 500 }}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </span>
  );
}

/* ─── VUES ────────────────────────────────────────────────────────────────── */
function IdleView({ onSubmit }) {
  const [addr, setAddr] = useState('');
  const [proj, setProj] = useState('');

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '52px 20px' }}>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', border: '0.5px solid rgba(74,222,128,.18)', borderRadius: 20, background: 'rgba(74,222,128,.06)', marginBottom: 28 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />
        <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 500 }}>34 970 communes indexées · France entière</span>
      </div>

      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 500, color: C.cream, letterSpacing: -1.2, lineHeight: 1.06, marginBottom: 14 }}>
        Analysez votre PLU<br /><em style={{ fontStyle: 'italic', color: C.goldL }}>en 3 minutes.</em>
      </h1>
      <p style={{ fontSize: 14, color: C.muted, fontWeight: 300, marginBottom: 40, lineHeight: 1.7 }}>
        Entrez votre adresse et décrivez votre projet.<br />
        L'IA vérifie toutes les règles PLU applicables à votre terrain.
      </p>

      <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: 18, padding: 28, marginBottom: 32, textAlign: 'left' }}>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 8 }}>
            Adresse du terrain
          </label>
          <AddressInput
            value={addr}
            onChange={setAddr}
            onSelect={v => { setAddr(v); }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 8 }}>
            Décrivez votre projet
          </label>
          <div style={{ position: 'relative' }}>
            <FileText size={14} color={C.dim} style={{ position: 'absolute', left: 16, top: 15, pointerEvents: 'none' }} />
            <textarea
              value={proj}
              onChange={e => setProj(e.target.value)}
              placeholder="Ex: Extension de 35m² plain-pied sur le côté de ma maison, toit plat..."
              style={{ width: '100%', background: '#0a0a14', border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '14px 20px 14px 44px', fontSize: 13, color: C.cream, fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none', height: 80, lineHeight: 1.6 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {TYPE_SHORTCUTS.map(t => (
            <button key={t} onClick={() => setProj(t + ' sur mon terrain')} style={{ padding: '5px 12px', background: '#131320', border: `0.5px solid ${C.border}`, borderRadius: 20, fontSize: 11, color: C.muted, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSubmit(addr || '12 place de la Victoire, Bordeaux 33000', proj)}
          style={{ width: '100%', padding: '14px 0', background: `linear-gradient(90deg, ${C.gold}, #c4960a)`, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Search size={15} />
          Analyser gratuitement
        </button>
        <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#1e1e28' }}>Sans inscription · Sans carte bancaire · 1 analyse offerte</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[['34 970', 'communes indexées', C.goldL], ['94%', 'dossiers accordés', '#4ade80'], ['3 min', 'par analyse', C.goldL]].map(([v, l, c]) => (
          <div key={l} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: c, fontWeight: 500, letterSpacing: -.5 }}>{v}</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingView({ address, stepIdx, pct }) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '52px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, marginBottom: 28 }}>
        <MapPin size={13} color={C.gold} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: C.cream, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{address}</span>
      </div>

      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48,
          border: `1.5px solid ${C.border}`,
          borderTopColor: C.gold,
          borderRadius: '50%',
          margin: '0 auto 20px',
          animation: 'spin .8s linear infinite',
        }} />
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: C.cream, fontWeight: 500, marginBottom: 6 }}>
          {STEPS[stepIdx] || 'Analyse en cours...'}
        </div>
        <div style={{ fontSize: 12, color: C.dim }}>Analyse IA · Gemini 1.5 Flash</div>
        <div style={{ marginTop: 20, height: 3, background: '#1a1a24', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldL})`, borderRadius: 20, width: `${pct}%`, transition: 'width .4s ease' }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: C.dim }}>{pct}%</div>
      </div>

      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[['40%', 12], ['70%', 10], ['55%', 10]].map(([w, h], i) => (
          <div key={i} style={{ height: h, width: w, background: '#1a1a26', borderRadius: 4 }} />
        ))}
        <div style={{ height: '0.5px', background: '#111118', margin: '2px 0' }} />
        {[['45%', 12], ['65%', 10]].map(([w, h], i) => (
          <div key={i} style={{ height: h, width: w, background: '#131320', borderRadius: 4 }} />
        ))}
      </div>
    </div>
  );
}

function ResultView({ address, result, onReset }) {
  const vColor = result.verdict === 'conforme' ? '#4ade80' : '#e8b420';
  const vLabel = result.verdict === 'conforme' ? '✓ Conforme' : '⚠ Vérification requise';
  const visible = result.rules.filter(r => r.status !== 'locked');
  const locked  = result.rules.filter(r => r.status === 'locked');

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>

      {/* VERDICT */}
      <div style={{ background: 'linear-gradient(135deg,#0d0d1c,rgba(160,120,32,.05))', border: '0.5px solid rgba(160,120,32,.2)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[['Verdict', <span key="v" style={{ fontSize: 16, fontWeight: 600, color: vColor }}>{vLabel}</span>], ['Commune', result.commune], ['Zone PLU', result.zone], ['Score IA', <span key="s" style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 500, color: C.goldL }}>{result.score}%</span>]].map(([lbl, val]) => (
            <div key={lbl}>
              <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>{lbl}</div>
              <div style={{ fontSize: 13, color: C.cream, fontWeight: 500, lineHeight: 1.3 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* LABEL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '.8px', fontWeight: 500 }}>Règles PLU applicables</div>
        <div style={{ fontSize: 11, color: C.gold }}>{result.rules.length} règles · 2 visibles</div>
      </div>

      {/* RÈGLES VISIBLES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        {visible.map(rule => {
          const ok = rule.status === 'ok';
          const accent = ok ? '#4ade80' : '#e8b420';
          return (
            <div key={rule.id} style={{ border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', background: C.surface }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{rule.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.cream }}>{rule.label}</span>
                    <span style={{ fontSize: 10, color: C.dim }}>{rule.article}</span>
                    <div style={{ marginLeft: 'auto', padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: `${accent}12`, color: accent, border: `0.5px solid ${accent}30` }}>
                      {ok ? 'Conforme ✓' : '⚠ À vérifier'}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 500, marginBottom: 6 }}>{rule.value}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{rule.detail}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RÈGLES LOCKED */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        {locked.map((rule, i) => (
          <div key={rule.id} style={{ border: `0.5px solid #111118`, borderRadius: 12, padding: '16px 18px', background: '#070710', marginBottom: 8, opacity: 1 - i * 0.35 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 18, opacity: .25, flexShrink: 0 }}>{rule.icon}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ height: 10, width: '38%', background: '#1a1a26', borderRadius: 4 }} />
                <div style={{ height: 8, width: '62%', background: '#131320', borderRadius: 4 }} />
                <div style={{ height: 8, width: '48%', background: '#111118', borderRadius: 4 }} />
              </div>
              <div style={{ width: 66, height: 20, background: '#131320', borderRadius: 20, flexShrink: 0 }} />
            </div>
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: `linear-gradient(transparent, ${C.bg})`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 14px', background: C.surface2, border: `0.5px solid rgba(160,120,32,.3)`, borderRadius: 20, whiteSpace: 'nowrap' }}>
            <Lock size={11} color={C.gold} />
            <span style={{ fontSize: 11, color: C.gold, fontWeight: 500 }}>{locked.length} règles supplémentaires — compte requis</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg,#0c0c1c,rgba(160,120,32,.06))', border: '0.5px solid rgba(160,120,32,.22)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 500, color: C.cream, letterSpacing: -.4, marginBottom: 8 }}>
          Voir l'analyse complète.<br />
          <em style={{ fontStyle: 'italic', color: C.goldL }}>Gratuitement.</em>
        </h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, fontWeight: 300, lineHeight: 1.6 }}>
          Créez un compte pour voir les {locked.length} règles supplémentaires,<br />
          obtenir votre CERFA pré-rempli et déposer en mairie.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/sign-up">
            <button style={{ padding: '13px 28px', background: `linear-gradient(90deg, ${C.gold}, #c4960a)`, border: 'none', borderRadius: 11, color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Créer un compte gratuit <ArrowRight size={14} />
            </button>
          </Link>
          <button onClick={onReset} style={{ padding: '13px 24px', background: 'transparent', border: `0.5px solid rgba(160,120,32,.3)`, borderRadius: 11, color: '#c4960a', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
            Nouvelle analyse
          </button>
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: 11, color: '#1e1e28' }}>
          {['Sans carte bancaire', '1 analyse offerte', 'Résiliation en 1 clic'].map((t, i, a) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {t}{i < a.length - 1 && <span style={{ marginLeft: 14, color: '#111' }}>·</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────── */
export default function DemoPage() {
  const [phase, setPhase]   = useState('idle');
  const [address, setAddr]  = useState('');
  const [stepIdx, setStep]  = useState(0);
  const [pct, setPct]       = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  function submit(addr) {
    const a = addr?.trim() || '12 place de la Victoire, Bordeaux 33000';
    setAddr(a);
    setPhase('loading');
    setStep(0);
    setPct(0);
    let i = 0;
    const tick = () => {
      if (i >= STEPS.length) { setResult(getResult(a)); setPhase('result'); return; }
      setStep(i); setPct(PCTS[i]); i++;
      timerRef.current = setTimeout(tick, 370);
    };
    tick();
  }

  function reset() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle'); setAddr(''); setStep(0); setPct(0); setResult(null);
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.cream }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: `0.5px solid ${C.border}`, background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, background: C.gold, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1 5.5L7 1L13 5.5V13H1V5.5Z" stroke="white" strokeWidth="1.2" /><rect x="4.5" y="8" width="4" height="5" rx=".4" fill="white" /></svg>
            </div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: C.cream }}>PermitAI</span>
            <div style={{ padding: '2px 8px', background: 'rgba(160,120,32,.1)', border: `0.5px solid rgba(160,120,32,.2)`, borderRadius: 20, fontSize: 10, color: C.gold, fontWeight: 600, marginLeft: 4 }}>DÉMO</div>
          </Link>
          {phase !== 'idle' && (
            <div style={{ flex: 1, maxWidth: 360, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 8 }}>
              <MapPin size={12} color={C.gold} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.cream, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{address}</span>
              <button onClick={reset} style={{ fontSize: 11, color: C.dim, background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Changer</button>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: C.muted }}>2 règles visibles sur {result?.rules?.length || 4}</span>
            <Link href="/sign-up">
              <button style={{ padding: '8px 16px', background: `linear-gradient(90deg, ${C.gold}, #c4960a)`, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                Compte gratuit <ArrowRight size={12} />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {phase === 'idle'    && <IdleView    onSubmit={submit} />}
      {phase === 'loading' && <LoadingView address={address} stepIdx={stepIdx} pct={pct} />}
      {phase === 'result'  && <ResultView  address={address} result={result} onReset={reset} />}
    </div>
  );
}

export const metadata = {
  title: 'Démo gratuite — Analyse PLU en 3 minutes | PermitAI',
  description: 'Testez PermitAI sur votre adresse. Résultat immédiat. 34 970 communes françaises indexées. Sans inscription.',
  openGraph: {
    title: 'Démo PermitAI — Analysez votre PLU gratuitement',
    description: 'Entrez votre adresse et obtenez les règles PLU en 3 minutes.',
    url: 'https://permitai.eu/demo',
  },
};