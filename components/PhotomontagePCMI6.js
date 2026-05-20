'use client';
// components/PhotomontagePCMI6.js
// Photomontage d'insertion paysagère — upload photo paysage → Gemini Nano Banana
// génère le projet inséré photoréaliste. Bouton "Régénérer" + export.
import React, { useState, useRef } from 'react';

export default function PhotomontagePCMI6({ formData, analysis, cerfaId, onSave }) {
  const [source, setSource] = useState(null);       // { base64, mime, name }
  const [generated, setGenerated] = useState(null); // { base64, mime }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Format non supporté — utilisez une image.'); return; }
    if (f.size > 8 * 1024 * 1024) { setError('Image trop lourde (>8 MB). Compressez avant.'); return; }
    setError(null);
    const r = new FileReader();
    r.onload = () => {
      const url = r.result;
      const m = url.match(/^data:([^;]+);base64,(.+)$/);
      if (!m) return setError('Erreur lecture image.');
      setSource({ base64: m[2], mime: m[1], name: f.name });
      setGenerated(null);
    };
    r.readAsDataURL(f);
  };

  const generate = async () => {
    if (!source) { setError('Uploadez d\'abord une photo du paysage.'); return; }
    setLoading(true); setError(null); setProgress(5);
    const ti = setInterval(() => setProgress(p => Math.min(p + 4, 90)), 800);
    try {
      const r = await fetch('/api/cerfa/photomontage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: source.base64,
          mimeType: source.mime,
          nature_travaux: formData?.nature_travaux,
          surface_creee: formData?.surface_creee || formData?.surface_plancher,
          hauteur_projet: formData?.hauteur_projet || analysis?.dimensions?.hauteur_estimee || 7,
          materiaux_facade: formData?.materiaux_facade || analysis?.facades?.materiau_principal || 'enduit lisse',
          couleur_facade:   formData?.couleur_facade  || 'blanc cassé',
          materiaux_toiture: formData?.materiaux_toiture || analysis?.toiture?.materiau || 'tuiles terre cuite',
          couleur_toiture:   formData?.couleur_toiture   || 'terracotta',
          type_toiture: analysis?.toiture?.type || '2 pans',
          description_libre: formData?.description_libre,
          commune: formData?.commune,
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Échec génération');
      setGenerated(j.image);
      setProgress(100);
      if (onSave) onSave(`data:${j.image.mime};base64,${j.image.base64}`, 'PCMI6');
    } catch (e) {
      setError(e.message);
    } finally {
      clearInterval(ti);
      setTimeout(() => { setLoading(false); setProgress(0); }, 600);
    }
  };

  const download = () => {
    if (!generated) return;
    const a = document.createElement('a');
    a.href = `data:${generated.mime};base64,${generated.base64}`;
    a.download = `PCMI6-photomontage-${cerfaId || 'projet'}.${generated.mime.includes('png') ? 'png' : 'jpg'}`;
    a.click();
  };

  return (
    <div data-testid="photomontage-pcmi6">
      {!source && (
        <div style={{ padding: 24, border: '1px dashed #1c1c2a', borderRadius: 10, textAlign: 'center', background: '#111118' }}>
          <div style={{ fontSize: 12, color: '#8d887f', marginBottom: 12 }}>
            📸 Uploadez une photo du paysage actuel depuis la voie publique<br />
            <span style={{ fontSize: 10, color: '#5a5650' }}>L'IA insèrera votre projet (style, matériaux, couleurs) de manière photoréaliste</span>
          </div>
          <button onClick={() => fileRef.current?.click()} data-testid="photomontage-upload-btn"
            style={{ padding: '10px 22px', background: 'linear-gradient(90deg, #a07820, #c4960a)', border: 0, borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            📷 Choisir une photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} data-testid="photomontage-input" />
        </div>
      )}

      {source && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>📷 Paysage source</div>
            <img src={`data:${source.mime};base64,${source.base64}`} alt="source" style={{ width: '100%', borderRadius: 8, border: '0.5px solid #1c1c2a' }} />
            <button onClick={() => { setSource(null); setGenerated(null); }} style={{ marginTop: 6, padding: '5px 10px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 5, color: '#8d887f', fontSize: 10, cursor: 'pointer' }}>
              ↺ Changer
            </button>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#5a5650', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>🤖 Insertion paysagère IA</div>
            {generated ? (
              <>
                <img src={`data:${generated.mime};base64,${generated.base64}`} alt="photomontage" data-testid="photomontage-result" style={{ width: '100%', borderRadius: 8, border: '0.5px solid rgba(74,222,128,.3)' }} />
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button onClick={download} data-testid="photomontage-download" style={{ flex: 1, padding: '6px 10px', background: '#a07820', border: 0, borderRadius: 5, color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ⬇ Télécharger PCMI6
                  </button>
                  <button onClick={generate} disabled={loading} style={{ padding: '6px 10px', background: 'transparent', border: '0.5px solid #1c1c2a', borderRadius: 5, color: '#8d887f', fontSize: 10, cursor: 'pointer' }}>
                    🔄 Régénérer
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, background: '#0a0a14', border: '0.5px dashed #1c1c2a', borderRadius: 8, padding: 16 }}>
                {loading ? (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>🎨</div>
                    <div style={{ fontSize: 11, color: '#e8b420', marginBottom: 12, textAlign: 'center' }}>Gemini Nano Banana génère votre photomontage…<br /><span style={{ fontSize: 9, color: '#5a5650' }}>15-30 secondes</span></div>
                    <div style={{ width: '80%', height: 4, background: '#1c1c2a', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #a07820, #e8b420)', transition: 'width .3s' }} />
                    </div>
                  </>
                ) : (
                  <button onClick={generate} data-testid="photomontage-generate-btn"
                    style={{ padding: '10px 22px', background: 'linear-gradient(90deg, #7e3aed, #a855f7)', border: 0, borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    🤖 Générer le photomontage
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div data-testid="photomontage-error" style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,.08)', border: '0.5px solid rgba(239,68,68,.3)', borderRadius: 6, fontSize: 11, color: '#ef4444' }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
