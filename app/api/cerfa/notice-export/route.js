// app/api/cerfa/notice-export/route.js
// Génère la notice (PCMI4/PC4/DP7/PD4) en format DOCX téléchargeable.
// Usage: POST { notice: string, cerfa: string, demandeur?, commune? } → application/vnd.openxmlformats-officedocument.wordprocessingml.document
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function parseNotice(notice) {
  // Découpe la notice en sections "TITRE EN MAJ\n--------\ntexte"
  const lines = String(notice || '').split('\n');
  const sections = [];
  let current = null;
  for (const line of lines) {
    const isTitle = /^[A-ZÀ-Ý\s'\-,()/]{4,}$/u.test(line.trim()) && line.trim().length < 80;
    const isSep = /^[-=_]{3,}$/.test(line.trim());
    if (isTitle && !isSep) {
      if (current) sections.push(current);
      current = { title: line.trim(), content: [] };
    } else if (!isSep) {
      if (!current) current = { title: '', content: [] };
      current.content.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

export async function POST(request) {
  try {
    const { notice, cerfa, demandeur, commune, dateGen } = await request.json();
    if (!notice) return Response.json({ error: 'notice manquante' }, { status: 400 });

    const sections = parseNotice(notice);
    const cerfaLabel = cerfa || 'PCMI/DP';
    const today = dateGen || new Date().toLocaleDateString('fr-FR');

    const docChildren = [
      // En-tête
      new Paragraph({
        children: [
          new TextRun({ text: 'PermitAI', bold: true, size: 18, color: 'a07820' }),
          new TextRun({ text: '  ·  Notice descriptive', italics: true, size: 18, color: '666666' }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `CERFA ${cerfaLabel}`, size: 22, color: '0a0a14' }),
        ],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'NOTICE DESCRIPTIVE DU PROJET', bold: true, size: 32, color: '0a0a14' })],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Article R.431-8 du Code de l'urbanisme", italics: true, size: 18, color: '888888' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: '─'.repeat(80), color: 'a07820' })],
        spacing: { after: 200 },
      }),
    ];

    // Sections de la notice
    sections.forEach((sec) => {
      if (sec.title) {
        docChildren.push(new Paragraph({
          children: [new TextRun({ text: sec.title, bold: true, size: 24, color: 'a07820' })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 },
          border: { bottom: { color: 'e8b420', size: 6, style: BorderStyle.SINGLE } },
        }));
      }
      sec.content.filter(l => l.trim()).forEach((line) => {
        docChildren.push(new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
          spacing: { after: 80 },
        }));
      });
    });

    // Pied
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: '─'.repeat(80), color: 'cccccc' })],
      spacing: { before: 400, after: 200 },
    }));
    docChildren.push(new Paragraph({
      children: [
        new TextRun({ text: 'Fait à ', size: 22 }),
        new TextRun({ text: commune || '_______________', size: 22, bold: true }),
        new TextRun({ text: ', le ', size: 22 }),
        new TextRun({ text: today, size: 22, bold: true }),
      ],
      spacing: { after: 200 },
    }));
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: 'Signature du demandeur :', size: 22 })],
      spacing: { after: 800 },
    }));
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: '_________________________________', size: 22 })],
    }));

    const doc = new Document({
      creator: 'PermitAI',
      title: `Notice descriptive ${cerfaLabel}`,
      sections: [{
        properties: {
          page: {
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
          },
        },
        children: docChildren,
      }],
    });

    const buf = await Packer.toBuffer(doc);
    const filename = `notice-${cerfaLabel.replace(/[*/]/g, '-')}-${(demandeur || 'projet').replace(/[^a-zA-Z0-9]+/g, '-')}.docx`;

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[notice-export] error:', e);
    return Response.json({ error: 'Erreur génération DOCX', detail: e.message }, { status: 500 });
  }
}
