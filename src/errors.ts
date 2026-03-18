/**
 * PropTax Engine — Error Hierarchy
 * Replaces @saas/core AppError with local base class
 */

export class PropTaxError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
    }
  }
}

export class InvalidRegionError extends PropTaxError {
  constructor(region: string) {
    super(
      `Région invalide : "${region}". Valeurs acceptées : wallonie, flandre, bruxelles`,
      400,
      'INVALID_REGION',
    )
  }
}

export class MissingReferenceDataError extends PropTaxError {
  constructor(dataType: string, key: string) {
    super(
      `Données de référence manquantes : ${dataType} pour "${key}"`,
      500,
      'MISSING_REFERENCE_DATA',
    )
  }
}

export class FiscalYearNotSupportedError extends PropTaxError {
  constructor(year: number, supportedRange: { min: number; max: number }) {
    super(
      `Année fiscale ${year} non supportée. Plage disponible : ${supportedRange.min}-${supportedRange.max}`,
      400,
      'FISCAL_YEAR_NOT_SUPPORTED',
    )
  }
}

export class CalculationError extends PropTaxError {
  constructor(calculator: string, reason: string) {
    super(
      `Erreur de calcul (${calculator}) : ${reason}`,
      422,
      'CALCULATION_ERROR',
    )
  }
}
