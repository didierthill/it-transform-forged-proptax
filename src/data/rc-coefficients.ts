// ──────────────────────────────────────────────
// Coefficients d'indexation du Revenu Cadastral
// Source : SPF Finances — Arrêté Royal annuel
// Le coefficient indexe le RC de 1975 à l'année courante
// ──────────────────────────────────────────────

/**
 * Coefficients d'indexation RC par année fiscale (exercice d'imposition)
 * Le RC de base date de 1975. Le coefficient corrige l'inflation.
 * Source : SPF Finances — publié chaque année au Moniteur belge.
 */
export const RC_INDEX_COEFFICIENTS: Record<number, number> = {
  2020: 1.8492,
  2021: 1.8630,
  2022: 1.9084,
  2023: 2.0915,
  2024: 2.0915,
  2025: 2.1763,
  2026: 2.2073,
}

/**
 * Taux régionaux de base du précompte immobilier (%)
 * Appliqué sur le RC indexé
 */
export const REGIONAL_PROPERTY_TAX_RATES: Record<string, number> = {
  wallonie: 1.25,
  flandre: 2.5,    // NB: en Flandre c'est 3.97% OV (onroerende voorheffing) mais simplifié ici
  bruxelles: 2.25, // anciennement 1.25%, ajusté
}

/**
 * Centimes additionnels provinciaux (moyennes, varient par province)
 * Source : Provinces belges — budgets annuels
 * Exprimé en centimes additionnels (ex: 1500 = 1500 centimes = 15x le taux régional)
 */
export const PROVINCIAL_CENTIMES: Record<string, number> = {
  // Wallonie
  'brabant-wallon': 1200,
  'hainaut': 2600,
  'liege': 2200,
  'luxembourg': 2200,
  'namur': 2100,
  // Flandre
  'anvers': 391,
  'limbourg': 400,
  'flandre-orientale': 411,
  'flandre-occidentale': 450,
  'brabant-flamand': 380,
  // Bruxelles (pas de province)
  'bruxelles': 0,
}

/**
 * Exemples de centimes additionnels communaux (sélection)
 * En réalité il y a 581 communes — on stocke les principales
 * Les autres retournent une valeur par défaut régionale
 */
export const MUNICIPAL_CENTIMES: Record<string, number> = {
  // Bruxelles (19 communes)
  '1000': 2970, // Bruxelles-Ville
  '1050': 3150, // Ixelles
  '1060': 3150, // Saint-Gilles
  '1070': 2870, // Anderlecht
  '1080': 3000, // Molenbeek
  '1082': 3050, // Berchem-Sainte-Agathe
  '1083': 2950, // Ganshoren
  '1090': 3000, // Jette
  '1030': 3200, // Schaerbeek
  '1040': 2750, // Etterbeek
  '1140': 2850, // Evere
  '1150': 2500, // Woluwe-Saint-Pierre
  '1160': 2700, // Auderghem
  '1170': 2550, // Watermael-Boitsfort
  '1180': 2650, // Uccle
  '1190': 3100, // Forest
  '1200': 2650, // Woluwe-Saint-Lambert
  '1210': 3350, // Saint-Josse

  // Wallonie (grandes villes)
  '4000': 2800, // Liège
  '5000': 2550, // Namur
  '6000': 2950, // Charleroi
  '7000': 2800, // Mons
  '7040': 2800, // Quévy
  '1300': 2100, // Wavre
  '1340': 2150, // Ottignies-LLN
  '5100': 2450, // Jambes/Namur
  '4020': 2600, // Liège (Wandre)
  '6040': 2750, // Jumet/Charleroi

  // Flandre (grandes villes)
  '2000': 1520, // Anvers
  '9000': 1580, // Gand
  '8000': 1620, // Bruges
  '3000': 1490, // Louvain
  '2800': 1450, // Malines
  '3500': 1550, // Hasselt
}

/**
 * Centimes communaux par défaut si la commune n'est pas dans la liste
 */
export const DEFAULT_MUNICIPAL_CENTIMES: Record<string, number> = {
  wallonie: 2600,
  flandre: 1500,
  bruxelles: 2900,
}

/**
 * Province associée à un code postal (simplification — premières lettres)
 */
export function getProvinceByPostalCode(postalCode: string): string {
  const code = parseInt(postalCode, 10)

  // Bruxelles
  if (code >= 1000 && code <= 1299) return 'bruxelles'

  // Brabant wallon
  if (code >= 1300 && code <= 1499) return 'brabant-wallon'

  // Brabant flamand
  if (code >= 1500 && code <= 1999) return 'brabant-flamand'
  if (code >= 3000 && code <= 3499) return 'brabant-flamand'

  // Anvers
  if (code >= 2000 && code <= 2999) return 'anvers'

  // Limbourg
  if (code >= 3500 && code <= 3999) return 'limbourg'

  // Liège
  if (code >= 4000 && code <= 4999) return 'liege'

  // Namur
  if (code >= 5000 && code <= 5999) return 'namur'

  // Hainaut
  if (code >= 6000 && code <= 6599) return 'hainaut'
  if (code >= 7000 && code <= 7999) return 'hainaut'

  // Luxembourg
  if (code >= 6600 && code <= 6999) return 'luxembourg'

  // Flandre occidentale
  if (code >= 8000 && code <= 8999) return 'flandre-occidentale'

  // Flandre orientale
  if (code >= 9000 && code <= 9999) return 'flandre-orientale'

  return 'bruxelles' // fallback
}
