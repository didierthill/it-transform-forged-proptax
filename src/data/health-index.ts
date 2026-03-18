// ──────────────────────────────────────────────
// Indices santé belges (base 2013 = 100)
// Source : Statbel (SPF Économie)
// Utilisé pour l'indexation des loyers
// ──────────────────────────────────────────────

/**
 * Indices santé par mois (clé : YYYY-MM)
 * L'indice santé est l'indice des prix à la consommation
 * hors tabac, alcool, essence et diesel.
 *
 * Base 2013 = 100
 * Source : https://statbel.fgov.be/fr/themes/prix-la-consommation/indice-sante
 */
export const HEALTH_INDEX: Record<string, number> = {
  // 2020
  '2020-01': 108.36, '2020-02': 108.46, '2020-03': 108.22,
  '2020-04': 108.15, '2020-05': 108.00, '2020-06': 108.28,
  '2020-07': 108.45, '2020-08': 108.47, '2020-09': 108.35,
  '2020-10': 108.46, '2020-11': 108.18, '2020-12': 108.28,

  // 2021
  '2021-01': 108.94, '2021-02': 109.04, '2021-03': 109.19,
  '2021-04': 109.49, '2021-05': 109.73, '2021-06': 110.14,
  '2021-07': 110.46, '2021-08': 110.64, '2021-09': 111.02,
  '2021-10': 111.94, '2021-11': 113.13, '2021-12': 113.92,

  // 2022
  '2022-01': 114.64, '2022-02': 115.19, '2022-03': 116.09,
  '2022-04': 117.18, '2022-05': 117.88, '2022-06': 118.55,
  '2022-07': 119.40, '2022-08': 120.17, '2022-09': 120.17,
  '2022-10': 122.72, '2022-11': 123.46, '2022-12': 123.49,

  // 2023
  '2023-01': 124.15, '2023-02': 123.86, '2023-03': 123.64,
  '2023-04': 123.43, '2023-05': 123.29, '2023-06': 122.76,
  '2023-07': 123.25, '2023-08': 123.63, '2023-09': 124.44,
  '2023-10': 124.21, '2023-11': 123.82, '2023-12': 123.56,

  // 2024
  '2024-01': 123.91, '2024-02': 124.14, '2024-03': 124.50,
  '2024-04': 124.80, '2024-05': 125.10, '2024-06': 125.31,
  '2024-07': 125.92, '2024-08': 126.05, '2024-09': 126.08,
  '2024-10': 126.32, '2024-11': 126.57, '2024-12': 126.72,

  // 2025
  '2025-01': 127.10, '2025-02': 127.35, '2025-03': 127.58,
  '2025-04': 127.82, '2025-05': 128.05, '2025-06': 128.25,
  '2025-07': 128.48, '2025-08': 128.70, '2025-09': 128.90,
  '2025-10': 129.12, '2025-11': 129.35, '2025-12': 129.55,

  // 2026
  '2026-01': 129.80, '2026-02': 130.05, '2026-03': 130.28,
}

/**
 * Récupère l'indice santé pour un mois donné
 * @param date Date dont on veut l'indice
 * @returns L'indice ou undefined si non disponible
 */
export function getHealthIndex(date: Date): number | undefined {
  const key = formatDateKey(date)
  return HEALTH_INDEX[key]
}

/**
 * Récupère l'indice santé du mois précédent l'anniversaire du bail
 * (convention belge : on utilise l'indice du mois qui précède
 * le mois anniversaire de l'entrée en vigueur du bail)
 */
export function getIndexForLeaseAnniversary(anniversaryDate: Date): number | undefined {
  const previousMonth = new Date(anniversaryDate)
  previousMonth.setMonth(previousMonth.getMonth() - 1)
  return getHealthIndex(previousMonth)
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}
