// ──────────────────────────────────────────────
// Calculateur — Plus-value immobilière
// Taxation des plus-values sur revente d'immeubles en Belgique
// ──────────────────────────────────────────────

import type { CapitalGainsInput, CapitalGainsResult, CapitalGainsBreakdown } from '../types.js'
import { CalculationError } from '../errors.js'

/**
 * Forfait appliqué sur le prix d'achat si les frais réels
 * ne sont pas justifiés (25% du prix d'achat)
 */
const ACQUISITION_COST_FORFAIT_RATE = 0.25

/**
 * Forfait travaux : 5% du prix d'achat par année de détention
 * si les travaux ne sont pas justifiés par factures
 * et que le bien est détenu depuis plus de 5 ans
 */
const RENOVATION_FORFAIT_RATE_PER_YEAR = 0.05

/**
 * Taux d'imposition sur les plus-values immobilières
 * - < 5 ans : 16.5% (plus-value spéculative)
 * - 5-... ans : 16.5% (réduit progressivement selon la durée)
 * Note : la résidence principale est EXONÉRÉE
 */
const TAX_RATE_SPECULATIVE = 16.5
const TAX_RATE_STANDARD = 16.5

/**
 * Calcule la plus-value immobilière et l'impôt estimé.
 *
 * Règles belges :
 * 1. Résidence principale : TOUJOURS exonérée
 * 2. Autres biens :
 *    - Vente < 5 ans après achat : plus-value spéculative (16.5%)
 *    - Vente > 5 ans : exonéré (en principe) pour les biens bâtis
 *    - Terrains non bâtis : règles différentes (8 ans)
 *
 * Ce calculateur gère le cas simplifié des biens bâtis.
 * Pour les terrains non bâtis, consultez un fiscaliste.
 */
export function calculateCapitalGains(input: CapitalGainsInput): CapitalGainsResult {
  if (input.saleDate <= input.purchaseDate) {
    throw new CalculationError('capital-gains', 'La date de vente doit être postérieure à la date d\'achat')
  }

  if (input.salePrice <= 0 || input.purchasePrice <= 0) {
    throw new CalculationError('capital-gains', 'Les prix d\'achat et de vente doivent être positifs')
  }

  const holdingYears = yearsDiff(input.purchaseDate, input.saleDate)

  // Résidence principale → exonérée
  if (input.isPrimaryResidence) {
    return buildExemptResult(input, holdingYears, 'Résidence principale — exonération totale')
  }

  // Détenu > 5 ans (bien bâti) → exonéré
  if (holdingYears >= 5) {
    return buildExemptResult(
      input,
      holdingYears,
      'Bien bâti détenu depuis plus de 5 ans — exonération (Art. 90, 10° CIR)',
    )
  }

  // Plus-value spéculative (< 5 ans)
  return calculateSpeculativeGain(input, holdingYears)
}

function buildExemptResult(
  input: CapitalGainsInput,
  holdingYears: number,
  reason: string,
): CapitalGainsResult {
  const grossGain = input.salePrice - input.purchasePrice

  return {
    grossGain,
    taxableGain: 0,
    estimatedTax: 0,
    taxRate: 0,
    isExempt: true,
    exemptionReason: reason,
    holdingYears,
    breakdown: {
      adjustedPurchasePrice: input.purchasePrice,
      netSalePrice: input.salePrice,
      acquisitionCostsForfait: 0,
      renovationCostsForfait: 0,
    },
  }
}

function calculateSpeculativeGain(
  input: CapitalGainsInput,
  holdingYears: number,
): CapitalGainsResult {
  // Prix d'achat majoré : frais réels OU forfait 25%
  const acquisitionCostsForfait = round2(input.purchasePrice * ACQUISITION_COST_FORFAIT_RATE)
  const effectiveAcquisitionCosts = Math.max(input.acquisitionCosts, acquisitionCostsForfait)

  // Travaux : montant réel OU forfait 5%/an (si détenu > 5 ans uniquement, sinon 0)
  const renovationCostsForfait = holdingYears >= 5
    ? round2(input.purchasePrice * RENOVATION_FORFAIT_RATE_PER_YEAR * holdingYears)
    : 0
  const effectiveRenovationCosts = Math.max(input.renovationCosts, renovationCostsForfait)

  const adjustedPurchasePrice = input.purchasePrice + effectiveAcquisitionCosts + effectiveRenovationCosts
  const grossGain = input.salePrice - input.purchasePrice
  const taxableGain = Math.max(0, input.salePrice - adjustedPurchasePrice)

  const taxRate = holdingYears < 5 ? TAX_RATE_SPECULATIVE : TAX_RATE_STANDARD
  const estimatedTax = round2(taxableGain * (taxRate / 100))

  return {
    grossGain,
    taxableGain,
    estimatedTax,
    taxRate,
    isExempt: false,
    holdingYears,
    breakdown: {
      adjustedPurchasePrice,
      netSalePrice: input.salePrice,
      acquisitionCostsForfait,
      renovationCostsForfait,
    },
  }
}

// ── Helpers ──

function yearsDiff(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
