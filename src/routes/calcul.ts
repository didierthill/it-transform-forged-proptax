// ──────────────────────────────────────────────
// Routes — Couche Calcul (stateless)
// 7 calculateurs fiscaux immobiliers belges
// ──────────────────────────────────────────────

import type { FastifyInstance } from 'fastify'

import { calculateRegistrationFees } from '../calculators/registration-fees.js'
import { calculateIndexation } from '../calculators/indexation.js'
import { calculateNoticePeriod } from '../calculators/notice-period.js'
import { calculateCapitalGains } from '../calculators/capital-gains.js'
import { calculateCadastralIncome } from '../calculators/cadastral-income.js'
import { calculateRentalGuarantee } from '../calculators/rental-guarantee.js'
import { calculatePropertyTax } from '../calculators/property-tax.js'

import {
  registrationFeesInputSchema,
  indexationInputSchema,
  noticePeriodInputSchema,
  capitalGainsInputSchema,
  cadastralIncomeInputSchema,
  rentalGuaranteeInputSchema,
  propertyTaxInputSchema,
} from '../types.js'

export async function registerCalculRoutes(app: FastifyInstance): Promise<void> {
  // ── Droits d'enregistrement ──

  app.post('/registration-fees', {
    schema: {
      tags: ['Calcul'],
      summary: 'Calcul des droits d\'enregistrement',
      description: 'Calcule les droits d\'enregistrement par région (Wallonie, Flandre, Bruxelles)',
    },
  }, async (request) => {
    const input = registrationFeesInputSchema.parse(request.body)
    return calculateRegistrationFees(input)
  })

  // ── Indexation du loyer ──

  app.post('/indexation', {
    schema: {
      tags: ['Calcul'],
      summary: 'Calcul de l\'indexation du loyer',
      description: 'Art. 1728bis — Formule : loyer_base × (nouvel_indice / indice_départ)',
    },
  }, async (request) => {
    const input = indexationInputSchema.parse(request.body)
    return calculateIndexation(input)
  })

  // ── Préavis de bail ──

  app.post('/notice-period', {
    schema: {
      tags: ['Calcul'],
      summary: 'Calcul du préavis de bail',
      description: 'Préavis et indemnité pour bail de résidence principale (9 ans, courte durée, étudiant)',
    },
  }, async (request) => {
    const input = noticePeriodInputSchema.parse(request.body)
    return calculateNoticePeriod(input)
  })

  // ── Plus-value immobilière ──

  app.post('/capital-gains', {
    schema: {
      tags: ['Calcul'],
      summary: 'Calcul de la plus-value immobilière',
      description: 'Taxation sur revente : exonération résidence principale, spéculative < 5 ans',
    },
  }, async (request) => {
    const input = capitalGainsInputSchema.parse(request.body)
    return calculateCapitalGains(input)
  })

  // ── Revenu cadastral indexé ──

  app.post('/cadastral-income', {
    schema: {
      tags: ['Calcul'],
      summary: 'Calcul du revenu cadastral indexé',
      description: 'RC (1975) × coefficient annuel d\'indexation = RC indexé',
    },
  }, async (request) => {
    const input = cadastralIncomeInputSchema.parse(request.body)
    return calculateCadastralIncome(input)
  })

  // ── Garantie locative ──

  app.post('/rental-guarantee', {
    schema: {
      tags: ['Calcul'],
      summary: 'Calcul de la garantie locative',
      description: 'Plafond légal par type de garantie (compte bloqué, bancaire, CPAS)',
    },
  }, async (request) => {
    const input = rentalGuaranteeInputSchema.parse(request.body)
    return calculateRentalGuarantee(input)
  })

  // ── Précompte immobilier ──

  app.post('/property-tax', {
    schema: {
      tags: ['Calcul'],
      summary: 'Calcul du précompte immobilier',
      description: 'RC indexé × taux régional + centimes additionnels (province + commune)',
    },
  }, async (request) => {
    const input = propertyTaxInputSchema.parse(request.body)
    return calculatePropertyTax(input)
  })
}
