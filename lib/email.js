import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@permitai.eu';

export async function sendWelcomeEmail(userEmail, userName) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: 'Bienvenue sur PermitAI !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #a07820;">Bienvenue ${userName} !</h1>
          <p>Merci de rejoindre PermitAI, votre assistant intelligent pour les permis de construire.</p>
          <p>Vous pouvez désormais :</p>
          <ul>
            <li>Analyser les règles PLU de n'importe quelle commune française</li>
            <li>Générer vos formulaires CERFA automatiquement</li>
            <li>Déposer vos dossiers en mairie en quelques clics</li>
          </ul>
          <a href="https://permitai.eu/dashboard" style="display: inline-block; background: #a07820; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Accéder à mon tableau de bord</a>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">Questions ? Répondez à cet email ou contactez-nous à contact@permitai.eu</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

export async function sendAnalyseConfirmationEmail(userEmail, userName, analysisData) {
  try {
    const { verdict, commune, resume, adresse } = analysisData;
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Analyse PLU terminée - ${commune}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #a07820;">Analyse PLU terminée</h1>
          <p>Bonjour ${userName},</p>
          <p>Votre analyse PLU pour <strong>${adresse}</strong> est terminée.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333;">Résultat : ${verdict}</h2>
            <p style="color: #666;">${resume}</p>
            <p style="font-size: 12px; color: #888;">Commune : ${commune}</p>
          </div>
          <a href="https://permitai.eu/dashboard" style="display: inline-block; background: #a07820; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Voir l'analyse complète</a>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">Cette analyse est donnée à titre indicatif. Consultez un professionnel pour valider votre projet.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

export async function sendDepotConfirmationEmail(userEmail, userName, depotData) {
  try {
    const { numeroDossier, commune, typeDossier, dateDepot, delaiInstruction } = depotData;
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Dépôt confirmé - Dossier n°${numeroDossier}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #a07820;">Dépôt en mairie confirmé ✓</h1>
          <p>Bonjour ${userName},</p>
          <p>Votre dossier a bien été déposé auprès de la mairie de <strong>${commune}</strong>.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Numéro de dossier :</strong> ${numeroDossier}</p>
            <p><strong>Type :</strong> ${typeDossier}</p>
            <p><strong>Date de dépôt :</strong> ${dateDepot}</p>
            <p><strong>Délai d'instruction :</strong> ${delaiInstruction}</p>
          </div>
          <p>Vous recevrez des alertes automatiques pour les échéances importantes.</p>
          <a href="https://permitai.eu/suivi" style="display: inline-block; background: #a07820; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Suivre mon dossier</a>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

export async function sendPLURevisedAlert(userEmail, userName, commune) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Alerte : PLU révisé à ${commune}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #a07820;">⚠️ PLU révisé</h1>
          <p>Bonjour ${userName},</p>
          <p>Le Plan Local d'Urbanisme de <strong>${commune}</strong> a été révisé.</p>
          <p>Les règles d'urbanisme ont peut-être changé. Nous vous recommandons de relancer une analyse si vous avez un projet en cours dans cette commune.</p>
          <a href="https://permitai.eu/analyse" style="display: inline-block; background: #a07820; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Lancer une nouvelle analyse</a>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

export async function sendDeadlineReminderEmail(userEmail, userName, dossierData) {
  try {
    const { numeroDossier, typeEcheance, dateEcheance, joursRestants } = dossierData;
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Rappel : ${typeEcheance} dans ${joursRestants} jours`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #a07820;">⏰ Rappel d'échéance</h1>
          <p>Bonjour ${userName},</p>
          <p><strong>${typeEcheance}</strong> approche pour votre dossier n°${numeroDossier}.</p>
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Date limite :</strong> ${dateEcheance}</p>
            <p style="margin: 5px 0 0 0; color: #856404;">Il vous reste ${joursRestants} jours</p>
          </div>
          <p>Action requise : Consultez votre dossier pour les détails.</p>
          <a href="https://permitai.eu/suivi" style="display: inline-block; background: #a07820; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Voir mon dossier</a>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}
