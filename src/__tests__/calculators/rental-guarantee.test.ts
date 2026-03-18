import { describe, it, expect } from 'vitest'
import { calculateRentalGuarantee } from '../../calculators/rental-guarantee.js'

describe('calculateRentalGuarantee', () => {
  it('max 2 mois pour compte bancaire bloqué', () => {
    const result = calculateRentalGuarantee({
      monthlyRent: 800,
      guaranteeType: 'bank_account',
    })
    expect(result.maxMonths).toBe(2)
    expect(result.maxAmount).toBe(1600)
  })

  it('max 3 mois pour garantie bancaire', () => {
    const result = calculateRentalGuarantee({
      monthlyRent: 800,
      guaranteeType: 'bank_guarantee',
    })
    expect(result.maxMonths).toBe(3)
    expect(result.maxAmount).toBe(2400)
  })

  it('max 3 mois pour garantie CPAS', () => {
    const result = calculateRentalGuarantee({
      monthlyRent: 800,
      guaranteeType: 'cpas_guarantee',
    })
    expect(result.maxMonths).toBe(3)
    expect(result.maxAmount).toBe(2400)
  })

  it('rejette un loyer négatif', () => {
    expect(() => calculateRentalGuarantee({
      monthlyRent: -500,
      guaranteeType: 'bank_account',
    })).toThrow('positif')
  })

  it('retourne la base légale Art. 10', () => {
    const result = calculateRentalGuarantee({
      monthlyRent: 800,
      guaranteeType: 'bank_account',
    })
    expect(result.legalBasis).toContain('Art. 10')
  })

  it('retourne des notes explicatives', () => {
    const result = calculateRentalGuarantee({
      monthlyRent: 800,
      guaranteeType: 'bank_account',
    })
    expect(result.notes.length).toBeGreaterThan(0)
    expect(result.notes.some(n => n.includes('restitué'))).toBe(true)
  })
})
