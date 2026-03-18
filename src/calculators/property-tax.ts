// ──────────────────────────────────────────────
// Calculateur — Précompte immobilier
// RC indexé × taux régional + centimes additionnels (province + commune)
// ──────────────────────────────────────────────

import type { PropertyTaxInput, PropertyTaxResult } from '../types.js'
import { calculateCadastralIncome } from './cadastral-income.js'
import {
  REGIONAL_PROPERTY_TAX_RATES,
  PROVINCIAL_CENTIMES,
  MUNICIPAL_CENTIMES,
  DEFAULT_MUNICIPAL_CENTIMES,
  getProvinceByPostalCode,
} from '../data/rc-coefficients.js'
import { CalculationError } from '../errors.js'

/**
 * Calcule le précompte immobilier belge.
 *
 * Formule :
 *   Précompte = (RC indexé × taux régional) × (1 + centimes provinciaux/100 + centimes communaux/100)
 *
 * En réalité :
 *   Part régionale = RC indexé × taux régional (%)
 *   Part provinciale = Part régionale × (centimes provinciaux / 100)
 *   Part communale = Part régionale × (centimes communaux / 100)
 *   Total = Part régionale + Part provinciale + Part communale
 *
 * Note : les centimes additionnels sont exprimés en centimes (ex: 2600 = 26× le taux régional)
 */
export function calculatePropertyTax(input: PropertyTaxInput): PropertyTaxResult {
  if (!input.postalCode || !/^\d{4}$/.test(input.postalCode)) {
    throw new CalculationError('property-tax', 'Code postal invalide (4 chiffres requis)')
  }

  // 1. Calculer le RC indexé
  const rcResult = calculateCadastralIncome({
    baseCadastralIncome: input.baseCadastralIncome,
    fiscalYear: input.fiscalYear,
  })

  // 2. Taux régional
  const regionalRate = REGIONAL_PROPERTY_TAX_RATES[input.region]
  if (regionalRate === undefined) {
    throw new CalculationError('property-tax', `Taux régional inconnu pour "${input.region}"`)
  }

  // 3. Centimes province
  const province = getProvinceByPostalCode(input.postalCode)
  const provincialCentimes = PROVINCIAL_CENTIMES[province] ?? 0

  // 4. Centimes commune
  const municipalCentimes =
    MUNICIPAL_CENTIMES[input.postalCode] ??
    DEFAULT_MUNICIPAL_CENTIMES[input.region] ??
    2000

  // 5. Calcul
  const regionalTax = round2(rcResult.indexedIncome * (regionalRate / 100))
  const provincialTax = round2(regionalTax * (provincialCentimes / 100))
  const municipalTax = round2(regionalTax * (municipalCentimes / 100))
  const totalTax = round2(regionalTax + provincialTax + municipalTax)

  return {
    totalTax,
    regionalTax,
    provincialTax,
    municipalTax,
    indexedCadastralIncome: rcResult.indexedIncome,
    indexCoefficient: rcResult.indexCoefficient,
    regionalRate,
    provincialCentimes,
    municipalCentimes,
    municipality: getMunicipalityName(input.postalCode),
    fiscalYear: input.fiscalYear,
    disclaimer:
      'Ce calcul est indicatif et ne constitue pas un avis fiscal. ' +
      'Les centimes additionnels peuvent varier. ' +
      'Consultez votre avertissement-extrait de rôle pour le montant exact.',
  }
}

/**
 * Résout le nom de la commune (sélection des principales)
 */
function getMunicipalityName(postalCode: string): string | undefined {
  const NAMES: Record<string, string> = {
    '1000': 'Bruxelles-Ville', '1050': 'Ixelles', '1060': 'Saint-Gilles',
    '1070': 'Anderlecht', '1080': 'Molenbeek', '1030': 'Schaerbeek',
    '1040': 'Etterbeek', '1150': 'Woluwe-Saint-Pierre', '1160': 'Auderghem',
    '1170': 'Watermael-Boitsfort', '1180': 'Uccle', '1190': 'Forest',
    '1200': 'Woluwe-Saint-Lambert', '1210': 'Saint-Josse',
    '4000': 'Liège', '5000': 'Namur', '6000': 'Charleroi', '7000': 'Mons',
    '1300': 'Wavre', '1340': 'Ottignies-LLN',
    '2000': 'Anvers', '9000': 'Gand', '8000': 'Bruges',
    '3000': 'Louvain', '2800': 'Malines', '3500': 'Hasselt',
  }
  return NAMES[postalCode]
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
