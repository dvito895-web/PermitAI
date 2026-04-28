'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, Home, Ruler, TrendingUp, ArrowRight } from 'lucide-react';

export default function CalculateursPage() {
  const [emp, setEmp] = useState({ terrain: '', construction: '' });
  const [sp, setSp] = useState({ longueur: '', largeur: '', etages: '1' });
  const [roi, setRoi] = useState({ valeur: '', projets: '' });

  const empPct = emp.terrain && emp.construction ? ((parseFloat(emp.construction) / parseFloat(emp.terrain)) * 100).toFixed(1) : null;
  const empVerdict = empPct ? (parseFloat(empPct) <= 40 ? { txt: 'Conforme (≤ 40%)', col: '#4ade80' } : { txt: 'Non conforme — vérifiez le PLU', col: '#ef4444' }) : null;

  const surfacePlancher = sp.longueur && sp.largeur ? (parseFloat(sp.longueur) * parseFloat(sp.largeur) * parseInt(sp.etages || '1')).toFixed(1) : null;
  const declarationType = surfacePlancher ? (parseFloat(surfacePlancher) <= 5 ? 'Pas de déclaration nécessaire' : parseFloat(surfacePlancher) <= 20 ? 'Déclaration préalable (DP)' : parseFloat(surfacePlancher) <= 150 ? 'Déclaration préalable ou Permis de construire' : 'Permis de construire obligatoire (architecte requis)') : null;

  const roiCalc = roi.valeur && roi.projets ? {
    cout: (parseFloat(roi.valeur) * 0.3 * parseInt(roi.projets || '1')).toFixed(0),
    eco: (parseFloat(roi.valeur) * 0.25 * parseInt(roi.projets || '1')).toFixed(0),
    permitai: (149 * 12).toFixed(0),
  } : null;

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', fontFamily: "'DM Sans', sans-serif", color: '#f2efe9' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 60, borderBottom: '0.5px solid #1c1c2a', background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, color: '#f2efe9', textDecoration: 'none' }}>PermitAI</Link>
          <Link href="/sign-up"><button style={{ padding: '10px 22px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Essai gratuit</button></Link>
        </div>
      </nav>

      <section style={{ padding: '80px 52px 60px', textAlign: 'center' }}>
        <Calculator size={36} color="#e8b420" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 500, lineHeight: 1.05, letterSpacing: -1.2, marginBottom: 14 }}>
          Calculateurs <em style={{ color: '#e8b420' }}>gratuits</em>
        </h1>
        <p style={{ fontSize: 14, color: '#8d887f', maxWidth: 540, margin: '0 auto' }}>3 outils pour estimer rapidement votre projet : emprise au sol, surface plancher, ROI.</p>
      </section>

      <section style={{ padding: '0 52px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>

          {/* Emprise */}
          <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 16, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Home size={20} color="#e8b420" />
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500 }}>Emprise au sol</h3>
            </div>
            <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Surface du terrain (m²)</label>
            <input type="number" value={emp.terrain} onChange={e => setEmp({ ...emp, terrain: e.target.value })} placeholder="500" style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', marginBottom: 14, fontFamily: 'inherit', outline: 'none' }} />
            <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Surface construction (m²)</label>
            <input type="number" value={emp.construction} onChange={e => setEmp({ ...emp, construction: e.target.value })} placeholder="180" style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', marginBottom: 18, fontFamily: 'inherit', outline: 'none' }} />
            {empPct && (
              <div style={{ padding: 16, background: '#14141f', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 4 }}>Emprise calculée</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 500, color: '#e8b420', marginBottom: 6 }}>{empPct} %</div>
                <div style={{ fontSize: 12, color: empVerdict.col, fontWeight: 500 }}>{empVerdict.txt}</div>
              </div>
            )}
          </div>

          {/* Surface plancher */}
          <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 16, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Ruler size={20} color="#e8b420" />
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500 }}>Surface plancher</h3>
            </div>
            <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Longueur (m)</label>
            <input type="number" value={sp.longueur} onChange={e => setSp({ ...sp, longueur: e.target.value })} placeholder="10" style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', marginBottom: 12, fontFamily: 'inherit', outline: 'none' }} />
            <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Largeur (m)</label>
            <input type="number" value={sp.largeur} onChange={e => setSp({ ...sp, largeur: e.target.value })} placeholder="8" style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', marginBottom: 12, fontFamily: 'inherit', outline: 'none' }} />
            <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Étages</label>
            <select value={sp.etages} onChange={e => setSp({ ...sp, etages: e.target.value })} style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', marginBottom: 18, fontFamily: 'inherit', outline: 'none' }}>
              <option value="1">RDC</option><option value="2">RDC + 1</option><option value="3">RDC + 2</option>
            </select>
            {surfacePlancher && (
              <div style={{ padding: 16, background: '#14141f', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 4 }}>Surface plancher</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 500, color: '#e8b420', marginBottom: 6 }}>{surfacePlancher} m²</div>
                <div style={{ fontSize: 12, color: '#f2efe9', fontWeight: 500 }}>{declarationType}</div>
              </div>
            )}
          </div>

          {/* ROI */}
          <div style={{ background: '#0c0c18', border: '0.5px solid #1c1c2a', borderRadius: 16, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <TrendingUp size={20} color="#e8b420" />
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500 }}>ROI PermitAI</h3>
            </div>
            <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Valeur projet moyen (€)</label>
            <input type="number" value={roi.valeur} onChange={e => setRoi({ ...roi, valeur: e.target.value })} placeholder="150000" style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', marginBottom: 12, fontFamily: 'inherit', outline: 'none' }} />
            <label style={{ display: 'block', fontSize: 11, color: '#8d887f', marginBottom: 6 }}>Projets / an</label>
            <input type="number" value={roi.projets} onChange={e => setRoi({ ...roi, projets: e.target.value })} placeholder="10" style={{ width: '100%', background: '#0a0a14', border: '0.5px solid #1c1c2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f2efe9', marginBottom: 18, fontFamily: 'inherit', outline: 'none' }} />
            {roiCalc && (
              <div style={{ padding: 16, background: '#14141f', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 4 }}>Coût refus potentiel</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: '#ef4444', marginBottom: 12 }}>{Number(roiCalc.cout).toLocaleString('fr-FR')} €</div>
                <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 4 }}>Économies PermitAI / an</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: '#4ade80', marginBottom: 12 }}>{Number(roiCalc.eco).toLocaleString('fr-FR')} €</div>
                <div style={{ fontSize: 11, color: '#8d887f' }}>Coût PermitAI Pro : {Number(roiCalc.permitai).toLocaleString('fr-FR')} €/an</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 52px', borderTop: '0.5px solid #1c1c2a', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, marginBottom: 12 }}>Besoin d'une analyse PLU complète ?</h2>
        <p style={{ fontSize: 13, color: '#8d887f', marginBottom: 24 }}>Ces calculateurs sont indicatifs. PermitAI vérifie les règles exactes de votre commune.</p>
        <Link href="/sign-up"><button style={{ padding: '14px 32px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Analyser mon terrain <ArrowRight size={16} /></button></Link>
      </section>
    </div>
  );
}
