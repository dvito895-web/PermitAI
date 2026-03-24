import jsPDF from 'jspdf';

/**
 * Génère un PDF CERFA avec jsPDF
 * @param {Object} formData - Données du formulaire
 * @param {Object} cerfaInfo - Informations sur le CERFA (num, name)
 * @returns {jsPDF} - Document PDF
 */
export function generateCerfaPDF(formData, cerfaInfo) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configuration des styles
  const colors = {
    primary: [160, 120, 32], // #a07820
    text: [240, 237, 232], // #f0ede8
    muted: [138, 133, 125], // #8a857d
    background: [15, 15, 26] // #0f0f1a
  };

  // En-tête du document
  doc.setFillColor(...colors.background);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Logo et titre
  doc.setFontSize(24);
  doc.setTextColor(...colors.primary);
  doc.text('PermitAI', 20, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(...colors.text);
  doc.text(`CERFA ${cerfaInfo.num}`, 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(...colors.muted);
  doc.text(cerfaInfo.name, 20, 35);

  // Date de génération
  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  const dateGeneration = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Généré le ${dateGeneration}`, 150, 35);

  // Ligne de séparation
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.line(20, 42, 190, 42);

  let yPosition = 55;

  // Section 1 - Informations du demandeur
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text('1. INFORMATIONS DU DEMANDEUR', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  
  const fields1 = [
    { label: 'Nom', value: formData.nom || '-' },
    { label: 'Prénom', value: formData.prenom || '-' },
    { label: 'Adresse', value: formData.adresse_demandeur || '-' },
    { label: 'Email', value: formData.email || '-' },
    { label: 'Téléphone', value: formData.telephone || '-' }
  ];

  fields1.forEach(field => {
    doc.setTextColor(...colors.muted);
    doc.text(`${field.label} :`, 25, yPosition);
    doc.setTextColor(...colors.text);
    doc.text(field.value, 70, yPosition);
    yPosition += 7;
  });

  yPosition += 5;

  // Section 2 - Informations du terrain
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text('2. INFORMATIONS DU TERRAIN', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  const fields2 = [
    { label: 'Adresse du terrain', value: formData.adresse_terrain || '-' },
    { label: 'Référence cadastrale', value: formData.reference_cadastrale || '-' },
    { label: 'Surface du terrain', value: formData.surface_terrain ? `${formData.surface_terrain} m²` : '-' }
  ];

  fields2.forEach(field => {
    doc.setTextColor(...colors.muted);
    doc.text(`${field.label} :`, 25, yPosition);
    doc.setTextColor(...colors.text);
    doc.text(field.value, 70, yPosition);
    yPosition += 7;
  });

  yPosition += 5;

  // Section 3 - Description des travaux
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text('3. DESCRIPTION DES TRAVAUX', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  
  // Nature des travaux (multiligne)
  doc.setTextColor(...colors.muted);
  doc.text('Nature des travaux :', 25, yPosition);
  yPosition += 7;
  
  doc.setTextColor(...colors.text);
  const natureLines = doc.splitTextToSize(formData.nature_travaux || '-', 160);
  doc.text(natureLines, 25, yPosition);
  yPosition += natureLines.length * 5 + 5;

  const fields3 = [
    { label: 'Surface créée', value: formData.surface_creee ? `${formData.surface_creee} m²` : '-' },
    { label: 'Hauteur', value: formData.hauteur ? `${formData.hauteur} m` : '-' },
    { label: 'Matériaux', value: formData.materiaux || '-' },
    { label: 'Couleurs', value: formData.couleurs || '-' }
  ];

  fields3.forEach(field => {
    doc.setTextColor(...colors.muted);
    doc.text(`${field.label} :`, 25, yPosition);
    doc.setTextColor(...colors.text);
    doc.text(field.value, 70, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Cadre de signature
  doc.setDrawColor(...colors.muted);
  doc.setLineWidth(0.3);
  doc.rect(20, yPosition, 170, 30);
  
  doc.setFontSize(9);
  doc.setTextColor(...colors.muted);
  doc.text('Signature du demandeur', 25, yPosition + 5);
  doc.text('(Précédée de la mention "Lu et approuvé")', 25, yPosition + 10);
  
  doc.setFontSize(8);
  doc.text(`Fait à _________________, le ${new Date().toLocaleDateString('fr-FR')}`, 25, yPosition + 25);

  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...colors.background);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(...colors.muted);
  doc.text('Généré par PermitAI — permitai.fr', 105, pageHeight - 10, { align: 'center' });
  
  doc.setFontSize(7);
  doc.text('Ce document a été généré automatiquement et doit être vérifié avant dépôt.', 105, pageHeight - 5, { align: 'center' });

  return doc;
}

/**
 * Télécharge le PDF généré
 */
export function downloadCerfaPDF(formData, cerfaInfo) {
  const doc = generateCerfaPDF(formData, cerfaInfo);
  const fileName = `CERFA_${cerfaInfo.num.replace(/\*/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}

/**
 * Génère un aperçu flou pour le mode gratuit
 */
export function generateBlurredPreview(cerfaInfo) {
  const doc = new jsPDF();
  
  // En-tête flou
  doc.setFontSize(20);
  doc.setTextColor(160, 120, 32);
  doc.text('CERFA ' + cerfaInfo.num, 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(cerfaInfo.name, 20, 30);
  
  // Texte de verrouillage
  doc.setFontSize(40);
  doc.setTextColor(200, 200, 200);
  doc.text('APERÇU', 105, 150, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Disponible avec plan Starter', 105, 165, { align: 'center' });
  doc.text('29 EUR/mois', 105, 175, { align: 'center' });
  
  return doc;
}
