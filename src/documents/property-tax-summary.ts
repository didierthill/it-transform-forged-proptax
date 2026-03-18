// ──────────────────────────────────────────────
// Document Generator — Résumé précompte immobilier
// Génère un rapport DOCX/PDF du calcul du précompte
// ──────────────────────────────────────────────

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
} from 'docx'
import { calculatePropertyTax } from '../calculators/property-tax.js'
import type { BelgianRegion } from '../types.js'

interface PropertyTaxSummaryData {
  format: 'docx' | 'pdf'
  ownerName: string
  propertyAddress: string
  postalCode: string
  region: BelgianRegion
  baseCadastralIncome: number
  fiscalYear: number
}

export async function generatePropertyTaxSummary(data: PropertyTaxSummaryData): Promise<Buffer> {
  // Run the calculation
  const result = calculatePropertyTax({
    baseCadastralIncome: data.baseCadastralIncome,
    fiscalYear: data.fiscalYear,
    region: data.region,
    postalCode: data.postalCode,
  })

  if (data.format === 'pdf') {
    return generatePdf(data, result)
  }
  return generateDocx(data, result)
}

// ── DOCX ──

async function generateDocx(data: PropertyTaxSummaryData, result: ReturnType<typeof calculatePropertyTax>): Promise<Buffer> {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
  const borders = { top: border, bottom: border, left: border, right: border }
  const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 }

  const regionLabel = { wallonie: 'Wallonie', flandre: 'Flandre', bruxelles: 'Bruxelles' }[data.region]

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: 'RÉSUMÉ DU PRÉCOMPTE IMMOBILIER', bold: true, size: 32, font: 'Calibri' })],
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: `Exercice ${data.fiscalYear}`, italics: true, size: 24 })],
        }),

        // Identité
        heading('Identification du bien'),
        infoParagraph('Propriétaire', data.ownerName),
        infoParagraph('Adresse', data.propertyAddress),
        infoParagraph('Code postal', data.postalCode),
        infoParagraph('Région', regionLabel),
        ...(result.municipality ? [infoParagraph('Commune', result.municipality)] : []),

        new Paragraph({ spacing: { before: 200 }, children: [] }),

        // Données de base
        heading('Données de base'),
        infoParagraph('RC de base (1975)', `${data.baseCadastralIncome.toFixed(2)} €`),
        infoParagraph('Coefficient d\'indexation', result.indexCoefficient.toString()),
        infoParagraph('RC indexé', `${result.indexedCadastralIncome.toFixed(2)} €`),

        new Paragraph({ spacing: { before: 200 }, children: [] }),

        // Détail du calcul
        heading('Détail du calcul'),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [5500, 3526],
          rows: [
            makeRow('Taux régional', `${result.regionalRate}%`, borders, cellMargins, 'E3F2FD'),
            makeRow('Part régionale', `${result.regionalTax.toFixed(2)} €`, borders, cellMargins),
            makeRow(`Centimes provinciaux (${result.provincialCentimes})`, `${result.provincialTax.toFixed(2)} €`, borders, cellMargins),
            makeRow(`Centimes communaux (${result.municipalCentimes})`, `${result.municipalTax.toFixed(2)} €`, borders, cellMargins),
            makeRow('TOTAL PRÉCOMPTE', `${result.totalTax.toFixed(2)} €`, borders, cellMargins, 'C8E6C9', true),
          ],
        }),

        new Paragraph({ spacing: { before: 400 }, children: [] }),

        // Disclaimer
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: result.disclaimer,
              italics: true,
              size: 18,
              color: '666666',
            }),
          ],
        }),

        new Paragraph({ spacing: { before: 200 }, children: [] }),

        new Paragraph({
          children: [
            new TextRun({
              text: `Document généré le ${new Date().toLocaleDateString('fr-BE')} par PropTax Engine`,
              size: 16,
              color: '999999',
            }),
          ],
        }),
      ],
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  return Buffer.from(buffer)
}

function heading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 26, font: 'Calibri', color: '1565C0' })],
  })
}

function infoParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label} : `, bold: true }),
      new TextRun({ text: value }),
    ],
  })
}

function makeRow(
  label: string,
  value: string,
  borders: Record<string, unknown>,
  margins: Record<string, number>,
  fill?: string,
  bold = false,
): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        borders: borders as never,
        width: { size: 5500, type: WidthType.DXA },
        margins,
        ...(fill ? { shading: { fill, type: ShadingType.CLEAR } } : {}),
        children: [new Paragraph({ children: [new TextRun({ text: label, bold })] })],
      }),
      new TableCell({
        borders: borders as never,
        width: { size: 3526, type: WidthType.DXA },
        margins,
        ...(fill ? { shading: { fill, type: ShadingType.CLEAR } } : {}),
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: value, bold })],
        })],
      }),
    ],
  })
}

// ── PDF ──

async function generatePdf(data: PropertyTaxSummaryData, result: ReturnType<typeof calculatePropertyTax>): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default
  const regionLabel = { wallonie: 'Wallonie', flandre: 'Flandre', bruxelles: 'Bruxelles' }[data.region]

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.font('Helvetica-Bold').fontSize(18).text('RÉSUMÉ DU PRÉCOMPTE IMMOBILIER', { align: 'center' })
    doc.font('Helvetica-Oblique').fontSize(12).text(`Exercice ${data.fiscalYear}`, { align: 'center' })
    doc.moveDown(2)

    doc.font('Helvetica-Bold').fontSize(14).text('Identification du bien')
    doc.font('Helvetica').fontSize(11)
    doc.text(`Propriétaire : ${data.ownerName}`)
    doc.text(`Adresse : ${data.propertyAddress}`)
    doc.text(`Code postal : ${data.postalCode} — Région : ${regionLabel}`)
    if (result.municipality) doc.text(`Commune : ${result.municipality}`)
    doc.moveDown()

    doc.font('Helvetica-Bold').fontSize(14).text('Données de base')
    doc.font('Helvetica').fontSize(11)
    doc.text(`RC de base (1975) : ${data.baseCadastralIncome.toFixed(2)} €`)
    doc.text(`Coefficient d'indexation : ${result.indexCoefficient}`)
    doc.text(`RC indexé : ${result.indexedCadastralIncome.toFixed(2)} €`)
    doc.moveDown()

    doc.font('Helvetica-Bold').fontSize(14).text('Détail du calcul')
    doc.font('Helvetica').fontSize(11)

    const col1 = 50
    const col2 = 380
    let y = doc.y + 10

    doc.text(`Taux régional : ${result.regionalRate}%`, col1, y)
    y += 20
    doc.text('Part régionale', col1, y)
    doc.text(`${result.regionalTax.toFixed(2)} €`, col2, y, { align: 'right', width: 120 })
    y += 20
    doc.text(`Centimes provinciaux (${result.provincialCentimes})`, col1, y)
    doc.text(`${result.provincialTax.toFixed(2)} €`, col2, y, { align: 'right', width: 120 })
    y += 20
    doc.text(`Centimes communaux (${result.municipalCentimes})`, col1, y)
    doc.text(`${result.municipalTax.toFixed(2)} €`, col2, y, { align: 'right', width: 120 })
    y += 25
    doc.moveTo(col1, y).lineTo(500, y).stroke()
    y += 10
    doc.font('Helvetica-Bold')
    doc.text('TOTAL PRÉCOMPTE', col1, y)
    doc.text(`${result.totalTax.toFixed(2)} €`, col2, y, { align: 'right', width: 120 })

    doc.moveDown(4)
    doc.font('Helvetica-Oblique').fontSize(9).fillColor('#666666')
    doc.text(result.disclaimer)

    doc.moveDown()
    doc.fontSize(8).fillColor('#999999')
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-BE')} par PropTax Engine`)

    doc.end()
  })
}
