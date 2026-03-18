// ──────────────────────────────────────────────
// Calculateur — Indexation de loyer
// Formule belge : loyer_base × (nouvel_indice / indice_départ)
// ──────────────────────────────────────────────

import type { IndexationInput, IndexationResult } from '../types.js'
import { CalculationError } from '../errors.js'

/**
 * Calcule le loyer indexé selon la formule belge.
 *
 * Formule : loyer_indexé = loyer_base × (nouvel_indice / indice_départ)
 *
 * Règles :
 * - L'indexation ne peut se faire qu'une fois par an (anniversaire du bail)
 * - L'indice de départ est celui du mois précédant la signature du bail
 * - Le nouvel indice est celui du mois précédant l'anniversaire
 * - Le résultat est arrondi au centime d'euro
 *
 * Base légale : Art. 1728bis du Code civil belge
 */
export function calculateIndexation(input: IndexationInput): IndexationResult {
  if (input.startIndex <= 0) {
    throw new CalculationError('indexation', 'L\'indice de départ doit être positif')
  }

  if (input.newIndex <= 0) {
    throw new CalculationError('indexation', 'Le nouvel indice doit être positif')
  }

  if (input.baseRent <= 0) {
    throw new CalculationError('indexation', 'Le loyer de base doit être positif')
  }

  if (input.calculationDate <= input.leaseStartDate) {
    throw new CalculationError(
      'indexation',
      'La date de calcul doit être postérieure à la date de début du bail',
    )
  }

  const ratio = input.newIndex / input.startIndex
  const indexedRent = round2(input.baseRent * ratio)
  const difference = round2(indexedRent - input.baseRent)
  const percentageIncrease = round4(((ratio - 1) * 100))

  return {
    indexedRent,
    difference,
    percentageIncrease,
    startIndex: input.startIndex,
    newIndex: input.newIndex,
    formula: `${input.baseRent} × (${input.newIndex} / ${input.startIndex}) = ${indexedRent}`,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
