// ──────────────────────────────────────────────
// Routes — Couche Documents (stateless)
// Génération DOCX/PDF à partir de JSON
// ──────────────────────────────────────────────

import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { generateRentalReceipt } from '../documents/rental-receipt.js'
import { generatePropertyTaxSummary } from '../documents/property-tax-summary.js'

const formatSchema = z.enum(['docx', 'pdf']).default('docx')

export async function registerDocumentRoutes(app: FastifyInstance): Promise<void> {
  // ── Quittance de loyer ──

  app.post('/rental-receipt', {
    schema: {
      tags: ['Documents'],
      summary: 'Générer une quittance de loyer',
      description: 'Produit un DOCX ou PDF de quittance de loyer à partir de données JSON',
    },
  }, async (request, reply) => {
    const body = z.object({
      format: formatSchema,
      tenantName: z.string(),
      landlordName: z.string(),
      propertyAddress: z.string(),
      monthlyRent: z.number().positive(),
      charges: z.number().min(0).default(0),
      period: z.string(), // ex: "Mars 2026"
      paymentDate: z.string(),
      receiptNumber: z.string().optional(),
    }).parse(request.body)

    const buffer = await generateRentalReceipt(body)

    const contentType = body.format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    const ext = body.format === 'pdf' ? 'pdf' : 'docx'

    return reply
      .header('Content-Type', contentType)
      .header('Content-Disposition', `attachment; filename="quittance-${body.period.replace(/\s/g, '-')}.${ext}"`)
      .send(buffer)
  })

  // ── Résumé précompte immobilier ──

  app.post('/property-tax-summary', {
    schema: {
      tags: ['Documents'],
      summary: 'Générer un résumé de précompte immobilier',
      description: 'Produit un DOCX ou PDF résumant le calcul du précompte',
    },
  }, async (request, reply) => {
    const body = z.object({
      format: formatSchema,
      ownerName: z.string(),
      propertyAddress: z.string(),
      postalCode: z.string().regex(/^\d{4}$/),
      region: z.enum(['wallonie', 'flandre', 'bruxelles']),
      baseCadastralIncome: z.number().positive(),
      fiscalYear: z.number().int().min(2020),
    }).parse(request.body)

    const buffer = await generatePropertyTaxSummary(body)

    const contentType = body.format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    const ext = body.format === 'pdf' ? 'pdf' : 'docx'

    return reply
      .header('Content-Type', contentType)
      .header('Content-Disposition', `attachment; filename="precompte-${body.fiscalYear}.${ext}"`)
      .send(buffer)
  })
}
