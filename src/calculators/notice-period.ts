// ──────────────────────────────────────────────
// Calculateur — Préavis de bail
// Droit belge du bail de résidence principale
// ──────────────────────────────────────────────

import type { NoticePeriodInput, NoticePeriodResult } from '../types.js'
import { CalculationError } from '../errors.js'

/**
 * Calcule le préavis et l'indemnité pour un bail de résidence principale belge.
 *
 * Base légale :
 * - Bail de 9 ans (standard) : Loi sur les baux de résidence principale
 * - Bail de courte durée : Art. 3 §6 (max 3 ans, non renouvelable plus d'une fois)
 *
 * Résumé des règles :
 *
 * LOCATAIRE (bail 9 ans) :
 *   - Préavis : 3 mois, à tout moment
 *   - Indemnité : 3 mois si < 1 an, 2 mois si < 2 ans, 1 mois si < 3 ans, 0 après
 *
 * PROPRIÉTAIRE (bail 9 ans) :
 *   - Usage personnel : 6 mois, à tout moment. Indemnité 0 (conditions strictes)
 *   - Travaux : 6 mois, à la fin de chaque triennat. Indemnité 0
 *   - Sans motif : 6 mois, à la fin de chaque triennat. Indemnité 9/6/3 mois selon le triennat
 *
 * BAIL COURTE DURÉE :
 *   - Pas de résiliation anticipée possible (sauf accord)
 *   - Si bail reconduit > 3 ans total → devient bail 9 ans
 */
export function calculateNoticePeriod(input: NoticePeriodInput): NoticePeriodResult {
  if (input.noticeDate < input.leaseStartDate) {
    throw new CalculationError(
      'notice-period',
      'La date de préavis ne peut pas être antérieure au début du bail',
    )
  }

  switch (input.leaseType) {
    case 'standard_9yr':
      return calculateStandard9yr(input)
    case 'short_term':
      return calculateShortTerm(input)
    case 'student':
      return calculateStudent(input)
    default:
      throw new CalculationError(
        'notice-period',
        `Type de bail "${input.leaseType}" : calcul non implémenté. Consultez un professionnel.`,
      )
  }
}

function calculateStandard9yr(input: NoticePeriodInput): NoticePeriodResult {
  const monthsElapsed = monthsDiff(input.leaseStartDate, input.noticeDate)

  if (input.initiator === 'tenant') {
    return calculateTenantNotice9yr(input, monthsElapsed)
  }

  return calculateLandlordNotice9yr(input, monthsElapsed)
}

function calculateTenantNotice9yr(
  input: NoticePeriodInput,
  monthsElapsed: number,
): NoticePeriodResult {
  const noticePeriodMonths = 3
  const endDate = addMonths(input.noticeDate, noticePeriodMonths)

  // Indemnité selon l'ancienneté
  let compensationMonths = 0
  if (monthsElapsed < 12) {
    compensationMonths = 3
  } else if (monthsElapsed < 24) {
    compensationMonths = 2
  } else if (monthsElapsed < 36) {
    compensationMonths = 1
  }

  const notes = [
    'Le locataire peut résilier à tout moment avec un préavis de 3 mois.',
  ]

  if (compensationMonths > 0) {
    notes.push(
      `Indemnité de ${compensationMonths} mois de loyer car le bail a moins de ${compensationMonths === 3 ? '1 an' : compensationMonths === 2 ? '2 ans' : '3 ans'}.`,
    )
  } else {
    notes.push('Pas d\'indemnité (bail en cours depuis plus de 3 ans).')
  }

  return {
    noticePeriodMonths,
    endDate,
    compensationMonths,
    legalBasis: 'Art. 3 §2-4, Loi sur les baux de résidence principale',
    notes,
  }
}

function calculateLandlordNotice9yr(
  input: NoticePeriodInput,
  monthsElapsed: number,
): NoticePeriodResult {
  const noticePeriodMonths = 6
  const endDate = addMonths(input.noticeDate, noticePeriodMonths)
  const reason = input.landlordReason ?? 'no_reason'
  const triennat = Math.floor(monthsElapsed / 36) + 1

  const notes: string[] = []
  let compensationMonths = 0

  switch (reason) {
    case 'personal_use':
      compensationMonths = 0
      notes.push('Usage personnel : le propriétaire peut résilier à tout moment avec 6 mois de préavis.')
      notes.push('Le propriétaire doit occuper le bien dans l\'année suivant la fin du préavis.')
      break

    case 'renovation':
      compensationMonths = 0
      notes.push('Travaux importants : résiliation possible à la fin de chaque triennat avec 6 mois de préavis.')
      notes.push('Les travaux doivent coûter au minimum 3 ans de loyer.')
      if (monthsElapsed % 36 > 30) {
        notes.push('⚠️ Le préavis doit être donné avant la fin du triennat en cours.')
      }
      break

    case 'no_reason':
      if (triennat === 1) compensationMonths = 9
      else if (triennat === 2) compensationMonths = 6
      else compensationMonths = 3

      notes.push(`Sans motif : résiliation possible à la fin de chaque triennat (actuellement : triennat ${triennat}).`)
      notes.push(`Indemnité de ${compensationMonths} mois de loyer.`)
      break
  }

  return {
    noticePeriodMonths,
    endDate,
    compensationMonths,
    legalBasis: 'Art. 3 §2-4, Loi sur les baux de résidence principale',
    notes,
  }
}

function calculateShortTerm(input: NoticePeriodInput): NoticePeriodResult {
  const notes = [
    'Bail de courte durée : en principe, pas de résiliation anticipée possible.',
    'Le bail se termine à la date convenue. Un préavis n\'est pas nécessaire si le bail prévoit une date de fin.',
  ]

  if (input.contractDuration > 36) {
    notes.push(
      '⚠️ Un bail de courte durée ne peut pas dépasser 3 ans (y compris renouvellements). Au-delà, il est requalifié en bail de 9 ans.',
    )
  }

  // Par exception, le locataire peut quitter avec 1 mois de préavis
  // si le bail le prévoit ou avec accord du propriétaire
  if (input.initiator === 'tenant') {
    notes.push(
      'Exception : si le bail le prévoit, le locataire peut résilier avec un mois de préavis et une indemnité d\'un mois.',
    )
  }

  return {
    noticePeriodMonths: 0,
    endDate: addMonths(input.leaseStartDate, input.contractDuration),
    compensationMonths: 0,
    legalBasis: 'Art. 3 §6, Loi sur les baux de résidence principale',
    notes,
  }
}

function calculateStudent(input: NoticePeriodInput): NoticePeriodResult {
  // Bail étudiant : max 12 mois, résiliation possible par l'étudiant
  // avec 2 mois de préavis
  const noticePeriodMonths = input.initiator === 'tenant' ? 2 : 0
  const endDate = addMonths(input.noticeDate, noticePeriodMonths)

  const notes = [
    'Bail étudiant : durée maximale de 12 mois.',
  ]

  if (input.initiator === 'tenant') {
    notes.push('L\'étudiant peut résilier avec 2 mois de préavis.')
    notes.push('Indemnité : pas d\'indemnité si préavis de 2 mois respecté.')
  } else {
    notes.push('Le bailleur ne peut pas résilier un bail étudiant en cours.')
  }

  return {
    noticePeriodMonths,
    endDate,
    compensationMonths: 0,
    legalBasis: 'Art. 1714bis, Code civil (bail étudiant)',
    notes,
  }
}

// ── Helpers ──

function monthsDiff(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}
