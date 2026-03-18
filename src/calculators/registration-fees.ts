// ──────────────────────────────────────────────
// Calculateur — Droits d'enregistrement
// 3 régions belges : Wallonie, Flandre, Bruxelles
// ──────────────────────────────────────────────

import type {
  RegistrationFeesInput,
  RegistrationFeesResult,
  RegistrationFeesBreakdown,
} from '../types.js'
import { REGISTRATION_RATES } from '../data/registration-rates.js'
import { CalculationError } from '../errors.js'

/**
 * Calcule les droits d'enregistrement pour un achat immobilier en Belgique.
 *
 * Règles par région :
 * - **Wallonie** : 12.5% standard, 6% si habitation unique + modeste, abattement 20K€
 * - **Flandre** : 12% standard, 3% si habitation unique (enige eigen woning)
 * - **Bruxelles** : 12.5% standard, abattement 200K€ si prix <= 600K€ et habitation unique
 */
export function calculateRegistrationFees(input: RegistrationFeesInput): RegistrationFeesResult {
  const rates = REGISTRATION_RATES[input.region]
  if (!rates) {
    throw new CalculationError('registration-fees', `Région inconnue : ${input.region}`)
  }

  if (input.purchasePrice <= 0) {
    throw new CalculationError('registration-fees', 'Le prix d\'achat doit être positif')
  }

  switch (input.region) {
    case 'wallonie':
      return calculateWallonia(input, rates)
    case 'flandre':
      return calculateFlanders(input, rates)
    case 'bruxelles':
      return calculateBrussels(input, rates)
  }
}

function calculateWallonia(
  input: RegistrationFeesInput,
  rates: typeof REGISTRATION_RATES.wallonie,
): RegistrationFeesResult {
  const isReduced = input.isOnlyHome && (input.isModestHome ?? false)
  const appliedRate = isReduced ? rates.reducedRate : rates.standardRate
  const abatement = input.isOnlyHome ? rates.abatement : 0
  const taxableBase = Math.max(0, input.purchasePrice - abatement)
  const amount = round2(taxableBase * (appliedRate / 100))

  const breakdown: RegistrationFeesBreakdown = {
    baseRate: rates.standardRate,
    reducedRate: isReduced ? rates.reducedRate : undefined,
    reductionReason: isReduced ? 'Habitation unique et modeste (Wallonie)' : undefined,
    abatementAmount: abatement,
  }

  return {
    amount,
    effectiveRate: input.purchasePrice > 0 ? round4((amount / input.purchasePrice) * 100) : 0,
    nominalRate: appliedRate,
    abatement,
    taxableBase,
    region: 'wallonie',
    breakdown,
  }
}

function calculateFlanders(
  input: RegistrationFeesInput,
  rates: typeof REGISTRATION_RATES.flandre,
): RegistrationFeesResult {
  const isReduced = input.isOnlyHome
  const appliedRate = isReduced ? rates.reducedRate : rates.standardRate
  // Pas d'abattement en Flandre — le taux réduit s'applique sur le prix total
  const taxableBase = input.purchasePrice
  const amount = round2(taxableBase * (appliedRate / 100))

  const breakdown: RegistrationFeesBreakdown = {
    baseRate: rates.standardRate,
    reducedRate: isReduced ? rates.reducedRate : undefined,
    reductionReason: isReduced ? 'Habitation unique (enige eigen woning)' : undefined,
    abatementAmount: 0,
  }

  return {
    amount,
    effectiveRate: input.purchasePrice > 0 ? round4((amount / input.purchasePrice) * 100) : 0,
    nominalRate: appliedRate,
    abatement: 0,
    taxableBase,
    region: 'flandre',
    breakdown,
  }
}

function calculateBrussels(
  input: RegistrationFeesInput,
  rates: typeof REGISTRATION_RATES.bruxelles,
): RegistrationFeesResult {
  const appliedRate = rates.standardRate // pas de taux réduit à Bruxelles

  // Abattement de 200K€ si habitation unique ET prix <= 600K€
  const eligibleForAbatement =
    input.isOnlyHome &&
    rates.maxPriceForReducedRate > 0 &&
    input.purchasePrice <= rates.maxPriceForReducedRate

  const abatement = eligibleForAbatement ? rates.abatement : 0
  const taxableBase = Math.max(0, input.purchasePrice - abatement)
  const amount = round2(taxableBase * (appliedRate / 100))

  const breakdown: RegistrationFeesBreakdown = {
    baseRate: rates.standardRate,
    reductionReason: eligibleForAbatement
      ? 'Abattement habitation unique (Bruxelles, prix <= 600.000€)'
      : undefined,
    abatementAmount: abatement,
    maxPriceForReducedRate: rates.maxPriceForReducedRate,
  }

  return {
    amount,
    effectiveRate: input.purchasePrice > 0 ? round4((amount / input.purchasePrice) * 100) : 0,
    nominalRate: appliedRate,
    abatement,
    taxableBase,
    region: 'bruxelles',
    breakdown,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
