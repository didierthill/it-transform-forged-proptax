// ──────────────────────────────────────────────
// Taux des droits d'enregistrement par région
// Source : SPF Finances, Vlabel, SPW Fiscalité
// Dernière mise à jour : 2026-01-01
// ──────────────────────────────────────────────

import type { BelgianRegion } from '../types.js'

export interface RegionRegistrationRates {
  /** Taux standard (%) */
  standardRate: number
  /** Taux réduit habitation unique (%) */
  reducedRate: number
  /** Abattement (€) — base sur laquelle le taux est exonéré */
  abatement: number
  /** Prix max pour bénéficier du taux réduit (€, 0 = pas de plafond) */
  maxPriceForReducedRate: number
  /** Conditions pour le taux réduit */
  reducedRateConditions: string[]
}

export const REGISTRATION_RATES: Record<BelgianRegion, RegionRegistrationRates> = {
  wallonie: {
    standardRate: 12.5,
    reducedRate: 6,
    abatement: 20_000,
    maxPriceForReducedRate: 0, // pas de plafond en Wallonie (habitation modeste séparée)
    reducedRateConditions: [
      'Habitation unique',
      'Habitation modeste (RC <= seuil)',
      'Occupation personnelle dans les 3 ans',
      'Conservation pendant 3 ans minimum',
    ],
  },
  flandre: {
    standardRate: 12,
    reducedRate: 3,
    abatement: 0, // pas d'abattement en Flandre, le taux réduit s'applique sur tout
    maxPriceForReducedRate: 0, // pas de plafond de prix
    reducedRateConditions: [
      'Habitation unique (enige eigen woning)',
      'Occupation personnelle dans les 2 ans',
      'Pas de propriété d\'un autre bien en pleine propriété',
    ],
  },
  bruxelles: {
    standardRate: 12.5,
    reducedRate: 12.5, // pas de taux réduit à Bruxelles, mais abattement
    abatement: 200_000,
    maxPriceForReducedRate: 600_000, // abattement si prix <= 600K€
    reducedRateConditions: [
      'Habitation unique',
      'Prix d\'achat <= 600.000 €',
      'Occupation personnelle dans les 2 ans',
      'Conservation pendant 5 ans minimum',
    ],
  },
}

/**
 * Seuil RC "habitation modeste" en Wallonie
 * Le RC non indexé ne doit pas dépasser ce seuil pour le taux réduit
 */
export const WALLONIA_MODEST_HOME_RC_THRESHOLD = 745
