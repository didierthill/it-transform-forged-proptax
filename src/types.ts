// ──────────────────────────────────────────────
// PropTax Engine — Types & Zod Schemas
// Moteur de calcul fiscal immobilier belge
// Matches @saas/proptax source types exactly
// ──────────────────────────────────────────────

import { z } from 'zod'

// ── Régions belges ──

export type BelgianRegion = 'wallonie' | 'flandre' | 'bruxelles'

export const belgianRegionSchema = z.enum(['wallonie', 'flandre', 'bruxelles'])

// ── Droits d'enregistrement ──

export interface RegistrationFeesInput {
  /** Prix d'achat du bien */
  purchasePrice: number
  /** Région du bien */
  region: BelgianRegion
  /** Est-ce l'habitation unique de l'acheteur ? */
  isOnlyHome: boolean
  /** Est-ce une habitation modeste (Wallonie) ? */
  isModestHome?: boolean
  /** Montant du crédit hypothécaire (Bruxelles — abattement) */
  mortgageAmount?: number
}

export interface RegistrationFeesResult {
  /** Montant des droits d'enregistrement */
  amount: number
  /** Taux effectif appliqué (%) */
  effectiveRate: number
  /** Taux nominal (%) */
  nominalRate: number
  /** Abattement appliqué (€) */
  abatement: number
  /** Base imposable après abattement (€) */
  taxableBase: number
  /** Région utilisée */
  region: BelgianRegion
  /** Détail du calcul */
  breakdown: RegistrationFeesBreakdown
}

export interface RegistrationFeesBreakdown {
  /** Taux de base de la région */
  baseRate: number
  /** Taux réduit applicable (si éligible) */
  reducedRate?: number
  /** Raison de la réduction */
  reductionReason?: string
  /** Montant de l'abattement */
  abatementAmount: number
  /** Seuil max pour le taux réduit (si applicable) */
  maxPriceForReducedRate?: number
}

// ── Indexation de loyer ──

export interface IndexationInput {
  /** Loyer de base (montant du bail) */
  baseRent: number
  /** Indice santé de départ (mois de signature du bail) */
  startIndex: number
  /** Nouvel indice santé (mois de calcul) */
  newIndex: number
  /** Date de début du bail */
  leaseStartDate: Date
  /** Date de calcul de l'indexation */
  calculationDate: Date
}

export interface IndexationResult {
  /** Nouveau loyer indexé */
  indexedRent: number
  /** Différence avec le loyer de base */
  difference: number
  /** Pourcentage d'augmentation */
  percentageIncrease: number
  /** Indice de départ utilisé */
  startIndex: number
  /** Nouvel indice utilisé */
  newIndex: number
  /** Formule appliquée : loyer_base × (nouvel_indice / indice_départ) */
  formula: string
}

// ── Préavis de bail ──

export type LeaseType =
  | 'short_term'      // bail de courte durée (max 3 ans)
  | 'standard_9yr'    // bail de 9 ans (résidence principale)
  | 'long_term'       // bail de longue durée (> 9 ans)
  | 'lifetime'        // bail à vie
  | 'student'         // bail étudiant
  | 'commercial'      // bail commercial

export type NoticeInitiator = 'tenant' | 'landlord'

export interface NoticePeriodInput {
  /** Type de bail */
  leaseType: LeaseType
  /** Qui donne le préavis ? */
  initiator: NoticeInitiator
  /** Date de début du bail */
  leaseStartDate: Date
  /** Date de notification du préavis */
  noticeDate: Date
  /** Durée contractuelle du bail (en mois) */
  contractDuration: number
  /** Région du bien */
  region: BelgianRegion
  /** Motif du préavis (propriétaire) */
  landlordReason?: 'personal_use' | 'renovation' | 'no_reason'
}

export interface NoticePeriodResult {
  /** Durée du préavis en mois */
  noticePeriodMonths: number
  /** Date de fin de préavis */
  endDate: Date
  /** Indemnité due (en mois de loyer) */
  compensationMonths: number
  /** Base légale */
  legalBasis: string
  /** Notes explicatives */
  notes: string[]
}

// ── Plus-value immobilière ──

export interface CapitalGainsInput {
  /** Prix d'achat */
  purchasePrice: number
  /** Date d'achat */
  purchaseDate: Date
  /** Prix de vente */
  salePrice: number
  /** Date de vente */
  saleDate: Date
  /** Frais d'acquisition (notaire, droits d'enregistrement) */
  acquisitionCosts: number
  /** Travaux réalisés (avec factures) */
  renovationCosts: number
  /** Est-ce la résidence principale ? */
  isPrimaryResidence: boolean
  /** Région du bien */
  region: BelgianRegion
}

export interface CapitalGainsResult {
  /** Montant de la plus-value brute */
  grossGain: number
  /** Montant de la plus-value imposable */
  taxableGain: number
  /** Impôt estimé sur la plus-value */
  estimatedTax: number
  /** Taux d'imposition appliqué (%) */
  taxRate: number
  /** Exonéré ? */
  isExempt: boolean
  /** Raison de l'exonération */
  exemptionReason?: string
  /** Nombre d'années de détention */
  holdingYears: number
  /** Détail du calcul */
  breakdown: CapitalGainsBreakdown
}

export interface CapitalGainsBreakdown {
  /** Prix d'achat majoré (frais + travaux + forfait 25%) */
  adjustedPurchasePrice: number
  /** Prix de vente net */
  netSalePrice: number
  /** Forfait 25% sur frais d'acquisition (si pas de justificatifs) */
  acquisitionCostsForfait: number
  /** Forfait 5%/an sur travaux (si pas de justificatifs > 5 ans) */
  renovationCostsForfait: number
  /** Abattement temporel (si applicable) */
  timeAbatement?: number
}

// ── Revenu cadastral indexé ──

export interface CadastralIncomeInput {
  /** Revenu cadastral non indexé (RC de base) */
  baseCadastralIncome: number
  /** Année fiscale */
  fiscalYear: number
}

export interface CadastralIncomeResult {
  /** RC indexé */
  indexedIncome: number
  /** Coefficient d'indexation utilisé */
  indexCoefficient: number
  /** Année fiscale */
  fiscalYear: number
  /** RC de base */
  baseCadastralIncome: number
  /** Source du coefficient */
  source: string
}

// ── Garantie locative ──

export type GuaranteeType =
  | 'bank_account'        // compte bloqué individuel
  | 'bank_guarantee'      // garantie bancaire
  | 'cpas_guarantee'      // garantie CPAS

export interface RentalGuaranteeInput {
  /** Loyer mensuel */
  monthlyRent: number
  /** Type de garantie */
  guaranteeType: GuaranteeType
  /** Région du bien */
  region: BelgianRegion
}

export interface RentalGuaranteeResult {
  /** Montant maximum de la garantie */
  maxAmount: number
  /** Nombre de mois de loyer */
  maxMonths: number
  /** Type de garantie */
  guaranteeType: GuaranteeType
  /** Base légale */
  legalBasis: string
  /** Notes */
  notes: string[]
}

// ── Précompte immobilier ──

export interface PropertyTaxInput {
  /** Revenu cadastral non indexé */
  baseCadastralIncome: number
  /** Code postal (pour identifier la commune) */
  postalCode: string
  /** Année fiscale */
  fiscalYear: number
  /** Région du bien */
  region: BelgianRegion
}

export interface PropertyTaxResult {
  /** Montant total du précompte immobilier */
  totalTax: number
  /** Part régionale */
  regionalTax: number
  /** Part provinciale (centimes additionnels) */
  provincialTax: number
  /** Part communale (centimes additionnels) */
  municipalTax: number
  /** RC indexé utilisé */
  indexedCadastralIncome: number
  /** Coefficient d'indexation */
  indexCoefficient: number
  /** Taux régional de base (%) */
  regionalRate: number
  /** Centimes additionnels province */
  provincialCentimes: number
  /** Centimes additionnels commune */
  municipalCentimes: number
  /** Commune identifiée */
  municipality?: string
  /** Année fiscale */
  fiscalYear: number
  /** Disclaimer */
  disclaimer: string
}

// ── Schémas Zod pour validation d'entrées API ──

export const registrationFeesInputSchema = z.object({
  purchasePrice: z.number().positive(),
  region: belgianRegionSchema,
  isOnlyHome: z.boolean(),
  isModestHome: z.boolean().optional(),
  mortgageAmount: z.number().positive().optional(),
})

export const indexationInputSchema = z.object({
  baseRent: z.number().positive(),
  startIndex: z.number().positive(),
  newIndex: z.number().positive(),
  leaseStartDate: z.coerce.date(),
  calculationDate: z.coerce.date(),
})

export const noticePeriodInputSchema = z.object({
  leaseType: z.enum(['short_term', 'standard_9yr', 'long_term', 'lifetime', 'student', 'commercial']),
  initiator: z.enum(['tenant', 'landlord']),
  leaseStartDate: z.coerce.date(),
  noticeDate: z.coerce.date(),
  contractDuration: z.number().int().positive(),
  region: belgianRegionSchema,
  landlordReason: z.enum(['personal_use', 'renovation', 'no_reason']).optional(),
})

export const capitalGainsInputSchema = z.object({
  purchasePrice: z.number().positive(),
  purchaseDate: z.coerce.date(),
  salePrice: z.number().positive(),
  saleDate: z.coerce.date(),
  acquisitionCosts: z.number().nonnegative(),
  renovationCosts: z.number().nonnegative(),
  isPrimaryResidence: z.boolean(),
  region: belgianRegionSchema,
})

export const cadastralIncomeInputSchema = z.object({
  baseCadastralIncome: z.number().positive(),
  fiscalYear: z.number().int().min(2000).max(2040),
})

export const rentalGuaranteeInputSchema = z.object({
  monthlyRent: z.number().positive(),
  guaranteeType: z.enum(['bank_account', 'bank_guarantee', 'cpas_guarantee']),
  region: belgianRegionSchema,
})

export const propertyTaxInputSchema = z.object({
  baseCadastralIncome: z.number().positive(),
  postalCode: z.string().regex(/^\d{4}$/, 'Code postal belge : 4 chiffres'),
  fiscalYear: z.number().int().min(2000).max(2040),
  region: belgianRegionSchema,
})
