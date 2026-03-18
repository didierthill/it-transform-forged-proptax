// ──────────────────────────────────────────────
// Calculateur — Revenu Cadastral Indexé
// RC (1975) × coefficient annuel = RC indexé
// ──────────────────────────────────────────────

import type { CadastralIncomeInput, CadastralIncomeResult } from '../types.js'
import { RC_INDEX_COEFFICIENTS } from '../data/rc-coefficients.js'
import { FiscalYearNotSupportedError, CalculationError } from '../errors.js'

/**
 * Calcule le revenu cadastral indexé pour une année fiscale.
 *
 * Le RC est fixé en 1975 et indexé chaque année par un coefficient
 * publié au Moniteur belge (Arrêté Royal).
 *
 * Formule : RC_indexé = RC_base × coefficient
 *
 * Le RC indexé sert de base au calcul du précompte immobilier
 * et à la déclaration IPP (cadre III).
 */
export function calculateCadastralIncome(input: CadastralIncomeInput): CadastralIncomeResult {
  if (input.baseCadastralIncome <= 0) {
    throw new CalculationError('cadastral-income', 'Le RC de base doit être positif')
  }

  const coefficient = RC_INDEX_COEFFICIENTS[input.fiscalYear]
  if (coefficient === undefined) {
    const years = Object.keys(RC_INDEX_COEFFICIENTS).map(Number)
    throw new FiscalYearNotSupportedError(input.fiscalYear, {
      min: Math.min(...years),
      max: Math.max(...years),
    })
  }

  const indexedIncome = round2(input.baseCadastralIncome * coefficient)

  return {
    indexedIncome,
    indexCoefficient: coefficient,
    fiscalYear: input.fiscalYear,
    baseCadastralIncome: input.baseCadastralIncome,
    source: `SPF Finances — Coefficient d'indexation ${input.fiscalYear} : ${coefficient}`,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
