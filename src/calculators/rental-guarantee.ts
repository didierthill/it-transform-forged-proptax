// ──────────────────────────────────────────────
// Calculateur — Garantie locative
// Droit belge du bail de résidence principale
// ──────────────────────────────────────────────

import type { RentalGuaranteeInput, RentalGuaranteeResult, GuaranteeType } from '../types.js'
import { CalculationError } from '../errors.js'

/**
 * Nombre maximum de mois de loyer par type de garantie.
 *
 * Base légale : Art. 10 de la Loi sur les baux de résidence principale
 *
 * - Compte bancaire bloqué : max 2 mois
 * - Garantie bancaire (crédit) : max 3 mois
 * - Garantie CPAS : max 3 mois (le CPAS se porte garant)
 */
const MAX_MONTHS: Record<GuaranteeType, number> = {
  bank_account: 2,
  bank_guarantee: 3,
  cpas_guarantee: 3,
}

const LEGAL_BASIS: Record<GuaranteeType, string> = {
  bank_account: 'Art. 10 §1, Loi sur les baux de résidence principale — compte individualisé',
  bank_guarantee: 'Art. 10 §2, Loi sur les baux de résidence principale — garantie bancaire',
  cpas_guarantee: 'Art. 10 §3, Loi sur les baux de résidence principale — garantie CPAS',
}

/**
 * Calcule le montant maximum de la garantie locative.
 *
 * En Belgique, la garantie locative est plafonnée :
 * - Compte bloqué individuel : max 2 mois de loyer
 * - Garantie bancaire : max 3 mois de loyer (remboursement progressif)
 * - Garantie CPAS : max 3 mois de loyer (pour les locataires en difficulté)
 *
 * Le propriétaire ne peut PAS exiger un montant supérieur.
 * La garantie doit être restituée dans les 3 mois suivant la fin du bail
 * (après état des lieux de sortie).
 */
export function calculateRentalGuarantee(input: RentalGuaranteeInput): RentalGuaranteeResult {
  if (input.monthlyRent <= 0) {
    throw new CalculationError('rental-guarantee', 'Le loyer mensuel doit être positif')
  }

  const maxMonths = MAX_MONTHS[input.guaranteeType]
  if (maxMonths === undefined) {
    throw new CalculationError(
      'rental-guarantee',
      `Type de garantie inconnu : "${input.guaranteeType}"`,
    )
  }

  const maxAmount = round2(input.monthlyRent * maxMonths)
  const notes: string[] = []

  switch (input.guaranteeType) {
    case 'bank_account':
      notes.push('Le compte est bloqué au nom du locataire dans une institution financière.')
      notes.push('Les intérêts sont capitalisés au profit du locataire.')
      notes.push('Le propriétaire ne peut accéder au compte qu\'avec l\'accord du locataire ou une décision judiciaire.')
      break

    case 'bank_guarantee':
      notes.push('La banque garantit le montant. Le locataire rembourse progressivement (max 3 ans).')
      notes.push('Le locataire ne doit pas avancer la somme en une fois.')
      notes.push('Ce type de garantie est souvent proposé quand le locataire ne dispose pas de l\'épargne nécessaire.')
      break

    case 'cpas_guarantee':
      notes.push('Le CPAS se porte garant auprès du propriétaire.')
      notes.push('Le locataire doit être éligible à l\'aide du CPAS.')
      notes.push('Le propriétaire ne peut pas refuser une garantie CPAS.')
      break
  }

  notes.push('La garantie doit être restituée dans les 3 mois suivant la fin du bail (après état des lieux de sortie).')

  return {
    maxAmount,
    maxMonths,
    guaranteeType: input.guaranteeType,
    legalBasis: LEGAL_BASIS[input.guaranteeType],
    notes,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
