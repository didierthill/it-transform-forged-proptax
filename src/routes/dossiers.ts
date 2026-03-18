// ──────────────────────────────────────────────
// Routes — Couche Dossiers (requires MongoDB)
// CRUD pour dossiers immobiliers
// ──────────────────────────────────────────────

import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { Dossier, type IDossier } from '../dossiers/model.js'

const createDossierSchema = z.object({
  reference: z.string().min(1),
  type: z.enum(['vente', 'location']),
  status: z.enum(['draft', 'active', 'pending', 'closed', 'archived']).default('draft'),
  property: z.object({
    address: z.string(),
    postalCode: z.string().regex(/^\d{4}$/),
    city: z.string(),
    region: z.enum(['wallonie', 'flandre', 'bruxelles']),
    cadastralIncome: z.number().positive().optional(),
    type: z.enum(['appartement', 'maison', 'studio', 'garage', 'terrain', 'commerce', 'autre']).optional(),
  }),
  parties: z.object({
    sellers: z.array(z.object({
      name: z.string(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      notary: z.string().optional(),
    })).default([]),
    buyers: z.array(z.object({
      name: z.string(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      notary: z.string().optional(),
    })).default([]),
  }),
  financial: z.object({
    askingPrice: z.number().positive().optional(),
    salePrice: z.number().positive().optional(),
    monthlyRent: z.number().positive().optional(),
    charges: z.number().min(0).optional(),
    commission: z.number().min(0).optional(),
    commissionRate: z.number().min(0).max(100).optional(),
  }).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

const updateDossierSchema = createDossierSchema.partial()

const querySchema = z.object({
  type: z.enum(['vente', 'location']).optional(),
  status: z.enum(['draft', 'active', 'pending', 'closed', 'archived']).optional(),
  region: z.enum(['wallonie', 'flandre', 'bruxelles']).optional(),
  postalCode: z.string().regex(/^\d{4}$/).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export async function registerDossierRoutes(app: FastifyInstance): Promise<void> {
  // ── List / Search ──

  app.get('/', {
    schema: {
      tags: ['Dossiers'],
      summary: 'Lister les dossiers',
      description: 'Liste paginée avec filtres optionnels',
    },
  }, async (request) => {
    const query = querySchema.parse(request.query)

    const filter: Record<string, unknown> = {}
    if (query.type) filter.type = query.type
    if (query.status) filter.status = query.status
    if (query.region) filter['property.region'] = query.region
    if (query.postalCode) filter['property.postalCode'] = query.postalCode
    if (query.search) {
      filter.$text = { $search: query.search }
    }

    const skip = (query.page - 1) * query.limit

    const [items, total] = await Promise.all([
      Dossier.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      Dossier.countDocuments(filter),
    ])

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    }
  })

  // ── Get by ID ──

  app.get('/:id', {
    schema: {
      tags: ['Dossiers'],
      summary: 'Détail d\'un dossier',
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const dossier = await Dossier.findById(id).lean()

    if (!dossier) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: `Dossier ${id} introuvable`,
        statusCode: 404,
      })
    }

    return dossier
  })

  // ── Create ──

  app.post('/', {
    schema: {
      tags: ['Dossiers'],
      summary: 'Créer un dossier',
    },
  }, async (request, reply) => {
    const data = createDossierSchema.parse(request.body)
    const dossier = await Dossier.create(data)
    return reply.status(201).send(dossier.toJSON())
  })

  // ── Update ──

  app.patch('/:id', {
    schema: {
      tags: ['Dossiers'],
      summary: 'Modifier un dossier',
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = updateDossierSchema.parse(request.body)

    const dossier = await Dossier.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean()

    if (!dossier) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: `Dossier ${id} introuvable`,
        statusCode: 404,
      })
    }

    return dossier
  })

  // ── Delete ──

  app.delete('/:id', {
    schema: {
      tags: ['Dossiers'],
      summary: 'Supprimer un dossier',
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const dossier = await Dossier.findByIdAndDelete(id)

    if (!dossier) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: `Dossier ${id} introuvable`,
        statusCode: 404,
      })
    }

    return { deleted: true, id }
  })

  // ── Attach calculation to dossier ──

  app.post('/:id/calculations', {
    schema: {
      tags: ['Dossiers'],
      summary: 'Attacher un calcul à un dossier',
      description: 'Sauvegarde le résultat d\'un calcul (n\'importe quel type) dans le dossier',
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z.object({
      type: z.string(),
      input: z.record(z.unknown()),
      result: z.record(z.unknown()),
    }).parse(request.body)

    const dossier = await Dossier.findByIdAndUpdate(
      id,
      {
        $push: {
          calculations: {
            type: body.type,
            input: body.input,
            result: body.result,
            calculatedAt: new Date(),
          },
        },
      },
      { new: true },
    ).lean()

    if (!dossier) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: `Dossier ${id} introuvable`,
        statusCode: 404,
      })
    }

    return dossier
  })
}
