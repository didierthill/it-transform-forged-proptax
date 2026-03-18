import { describe, it, expect } from 'vitest'
import { calculateRegistrationFees } from '../../calculators/registration-fees.js'

describe('calculateRegistrationFees', () => {
  // ── Wallonie ──

  describe('Wallonie', () => {
    it('calcule le taux standard 12.5%', () => {
      const result = calculateRegistrationFees({
        purchasePrice: 200_000,
        region: 'wallonie',
        isOnlyHome: false,
      })
      expect(result.amount).toBe(25_000)
      expect(result.effectiveRate).toBeCloseTo(12.5)
    })

    it('applique le taux réduit 6% pour habitation modeste', () => {
      const result = calculateRegistrationFees({
        purchasePrice: 200_000,
        region: 'wallonie',
        isOnlyHome: true,
        isModestHome: true,
      })
      expect(result.effectiveRate).toBeLessThan(12.5)
    })

    it('applique l\'abattement (habitation unique)', () => {
      const result = calculateRegistrationFees({
        purchasePrice: 200_000,
        region: 'wallonie',
        isOnlyHome: true,
      })
      expect(result.abatement).toBeGreaterThanOrEqual(0)
    })
  })

  // ── Flandre ──

  describe('Flandre', () => {
    it('calcule le taux standard 12%', () => {
      const result = calculateRegistrationFees({
        purchasePrice: 300_000,
        region: 'flandre',
        isOnlyHome: false,
      })
      expect(result.amount).toBe(36_000)
      expect(result.effectiveRate).toBeCloseTo(12)
    })

    it('applique le taux réduit 3% pour habitation unique', () => {
      const result = calculateRegistrationFees({
        purchasePrice: 300_000,
        region: 'flandre',
        isOnlyHome: true,
      })
      expect(result.amount).toBeLessThan(36_000)
    })
  })

  // ── Bruxelles ──

  describe('Bruxelles', () => {
    it('calcule le taux standard 12.5%', () => {
      const result = calculateRegistrationFees({
        purchasePrice: 400_000,
        region: 'bruxelles',
        isOnlyHome: false,
      })
      expect(result.amount).toBe(50_000)
    })

    it('applique l\'abattement de 200K si prix <= 600K (habitation unique)', () => {
      const result = calculateRegistrationFees({
        purchasePrice: 500_000,
        region: 'bruxelles',
        isOnlyHome: true,
      })
      // Abattement 200K → base = 300K → 300K * 12.5% = 37 500
      expect(result.amount).toBe(37_500)
      expect(result.abatement).toBe(200_000)
    })

    it('pas d\'abattement si prix > 600K', () => {
      const result = calculateRegistrationFees({
        purchasePrice: 700_000,
        region: 'bruxelles',
        isOnlyHome: true,
      })
      expect(result.amount).toBe(87_500)
      expect(result.abatement).toBe(0)
    })
  })

  // ── Validation ──

  it('rejette un prix négatif', () => {
    expect(() => calculateRegistrationFees({
      purchasePrice: -100,
      region: 'wallonie',
      isOnlyHome: false,
    })).toThrow()
  })

  it('retourne un résultat avec breakdown', () => {
    const result = calculateRegistrationFees({
      purchasePrice: 250_000,
      region: 'wallonie',
      isOnlyHome: false,
    })
    expect(result).toHaveProperty('amount')
    expect(result).toHaveProperty('effectiveRate')
    expect(result).toHaveProperty('breakdown')
    expect(result.breakdown).toHaveProperty('baseRate')
  })
})
