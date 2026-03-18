// ──────────────────────────────────────────────
// Document Generator — Quittance de loyer
// DOCX via docx npm, PDF via pdfkit
// ──────────────────────────────────────────────

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
} from 'docx'

interface RentalReceiptData {
  format: 'docx' | 'pdf'
  tenantName: string
  landlordName: string
  propertyAddress: string
  monthlyRent: number
  charges: number
  period: string
  paymentDate: string
  receiptNumber?: string
}

export async function generateRentalReceipt(data: RentalReceiptData): Promise<Buffer> {
  if (data.format === 'pdf') {
    return generatePdf(data)
  }
  return generateDocx(data)
}

// ── DOCX ──

async function generateDocx(data: RentalReceiptData): Promise<Buffer> {
  const total = data.monthlyRent + data.charges
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
  const borders = { top: border, bottom: border, left: border, right: border }
  const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: 'QUITTANCE DE LOYER', bold: true, size: 32, font: 'Calibri' })],
        }),

        ...(data.receiptNumber ? [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [new TextRun({ text: `N° ${data.receiptNumber}`, italics: true, size: 20 })],
          }),
        ] : []),

        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({ text: 'Je soussigné(e) ' }),
            new TextRun({ text: data.landlordName, bold: true }),
            new TextRun({ text: ', propriétaire du bien situé au ' }),
            new TextRun({ text: data.propertyAddress, bold: true }),
            new TextRun({ text: ', déclare avoir reçu de ' }),
            new TextRun({ text: data.tenantName, bold: true }),
            new TextRun({ text: ` la somme détaillée ci-dessous pour la période de ${data.period}.` }),
          ],
        }),

        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [5500, 3526],
          rows: [
            makeRow('Loyer', `${data.monthlyRent.toFixed(2)} €`, borders, cellMargins, 'D5E8F0'),
            makeRow('Charges', `${data.charges.toFixed(2)} €`, borders, cellMargins),
            makeRow('TOTAL', `${total.toFixed(2)} €`, borders, cellMargins, 'E8F5E9', true),
          ],
        }),

        new Paragraph({ spacing: { before: 400 }, children: [] }),

        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: 'Période : ', bold: true }),
            new TextRun({ text: data.period }),
          ],
        }),

        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: 'Date de paiement : ', bold: true }),
            new TextRun({ text: data.paymentDate }),
          ],
        }),

        new Paragraph({ spacing: { before: 600 }, children: [] }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Fait le .................., à ..................' }),
          ],
        }),

        new Paragraph({ spacing: { before: 400 }, children: [] }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Signature du bailleur : ..............................' }),
          ],
        }),
      ],
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  return Buffer.from(buffer)
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

async function generatePdf(data: RentalReceiptData): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default
  const total = data.monthlyRent + data.charges

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Title
    doc.font('Helvetica-Bold').fontSize(18).text('QUITTANCE DE LOYER', { align: 'center' })
    doc.moveDown()

    if (data.receiptNumber) {
      doc.font('Helvetica-Oblique').fontSize(10).text(`N° ${data.receiptNumber}`, { align: 'right' })
      doc.moveDown()
    }

    // Body
    doc.font('Helvetica').fontSize(11)
    doc.text(
      `Je soussigné(e) ${data.landlordName}, propriétaire du bien situé au ${data.propertyAddress}, ` +
      `déclare avoir reçu de ${data.tenantName} la somme détaillée ci-dessous pour la période de ${data.period}.`,
    )
    doc.moveDown()

    // Table
    const tableTop = doc.y
    const col1 = 50
    const col2 = 400

    doc.font('Helvetica-Bold').text('Loyer', col1, tableTop)
    doc.text(`${data.monthlyRent.toFixed(2)} €`, col2, tableTop, { align: 'right', width: 100 })

    doc.font('Helvetica').text('Charges', col1, tableTop + 25)
    doc.text(`${data.charges.toFixed(2)} €`, col2, tableTop + 25, { align: 'right', width: 100 })

    doc.moveTo(col1, tableTop + 45).lineTo(500, tableTop + 45).stroke()

    doc.font('Helvetica-Bold').text('TOTAL', col1, tableTop + 55)
    doc.text(`${total.toFixed(2)} €`, col2, tableTop + 55, { align: 'right', width: 100 })

    doc.moveDown(3)
    doc.font('Helvetica').fontSize(11)
    doc.text(`Période : ${data.period}`)
    doc.text(`Date de paiement : ${data.paymentDate}`)

    doc.moveDown(3)
    doc.text('Fait le .................., à ..................')
    doc.moveDown(2)
    doc.text('Signature du bailleur : ..............................')

    doc.end()
  })
}
