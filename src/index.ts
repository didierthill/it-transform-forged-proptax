// ──────────────────────────────────────────────
// PropTax Engine — Public API
// Moteur de calcul fiscal immobilier belge
// ──────────────────────────────────────────────

// ── Calculators ──

export { calculateRegistrationFees } from './calculators/registration-fees.js'
export { calculateIndexation } from './calculators/indexation.js'
export { calculateNoticePeriod } from './calculators/notice-period.js'
export { calculateCapitalGains } from './calculators/capital-gains.js'
export { calculateCadastralIncome } from './calculators/cadastral-income.js'
export { calculateRentalGuarantee } from './calculators/rental-guarantee.js'
export { calculatePropertyTax } from './calculators/property-tax.js'

// ── Types ──

export type {
  BelgianRegion,
  RegistrationFeesInput,
  RegistrationFeesResult,
  RegistrationFeesBreakdown,
  IndexationInput,
  IndexationResult,
  LeaseType,
  NoticeInitiator,
  NoticePeriodInput,
  NoticePeriodResult,
  CapitalGainsInput,
  CapitalGainsResult,
  CapitalGainsBreakdown,
  CadastralIncomeInput,
  CadastralIncomeResult,
  GuaranteeType,
  RentalGuaranteeInput,
  RentalGuaranteeResult,
  PropertyTaxInput,
  PropertyTaxResult,
} from './types.js'

// ── Zod Schemas ──

export {
  belgianRegionSchema,
  registrationFeesInputSchema,
  indexationInputSchema,
  noticePeriodInputSchema,
  capitalGainsInputSchema,
  cadastralIncomeInputSchema,
  rentalGuaranteeInputSchema,
  propertyTaxInputSchema,
} from './types.js'

// ── Errors ──

export {
  PropTaxError,
  InvalidRegionError,
  MissingReferenceDataError,
  FiscalYearNotSupportedError,
  CalculationError,
} from './errors.js'

// ── Reference Data ──

export { RC_INDEX_COEFFICIENTS } from './data/rc-coefficients.js'
export { HEALTH_INDEX, getHealthIndex, getIndexForLeaseAnniversary } from './data/health-index.js'
export { REGISTRATION_RATES } from './data/registration-rates.js'
