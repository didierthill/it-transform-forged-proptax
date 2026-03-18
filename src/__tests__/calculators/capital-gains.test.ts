import { describe, it, expect } from 'vitest'
import { calculateCapitalGains } from '../../calculators/capital-gains.js'

describe('calculateCapitalGains', () => {
  it('exonère la résidence principale', () => {
    const result = calculateCapitalGains({
      purchasePrice: 200_000,
      salePrice: 350_000,
      purchaseDate: new Date('2020-01-01'),
      saleDate: new Date('2022-06-01'),
      isPrimaryResidence: true,
      acquisitionCosts: 0,
      renovationCosts: 0,
    })
    expect(result.isExempt).toBe(true)
    expect(result.estimatedTax).toBe(0)
    expect(result.exemptionReason).toContain('Résidence principale')
  })

  it('exonère un bien bâti détenu > 5 ans', () => {
    const result = calculateCapitalGains({
      purchasePrice: 200_000,
      salePrice: 350_000,
      purchaseDate: new Date('2015-01-01'),
      saleDate: new Date('2024-06-01'),
      isPrimaryResidence: false,
      acquisitionCosts: 0,
      renovationCosts: 0,
    })
    expect(result.isExempt).toBe(true)
    expect(result.estimatedTax).toBe(0)
  })

  it('taxe à 16.5% si < 5 ans (spéculatif)', () => {
    const result = calculateCapitalGains({
      purchasePrice: 200_000,
      salePrice: 350_000,
      purchaseDate: new Date('2022-01-01'),
      saleDate: new Date('2024-06-01'),
      isPrimaryResidence: false,
      acquisitionCosts: 0,
      renovationCosts: 0,
    })
    expect(result.isExempt).toBe(false)
    expect(result.taxRate).toBe(16.5)
    expect(result.estimatedTax).toBeGreaterThan(0)
  })

  it('applique le forfait 25% sur les frais d\'acquisition', () => {
    const result = calculateCapitalGains({
      purchasePrice: 200_000,
      salePrice: 350_000,
      purchaseDate: new Date('2022-01-01'),
      saleDate: new Date('2024-06-01'),
      isPrimaryResidence: false,
      acquisitionCosts: 10_000, // < 25% de 200K = 50K → forfait appliqué
      renovationCosts: 0,
    })
    expect(result.breakdown.acquisitionCostsForfait).toBe(50_000)
  })

  it('calcule la plus-value brute correctement', () => {
    const result = calculateCapitalGains({
      purchasePrice: 200_000,
      salePrice: 350_000,
      purchaseDate: new Date('2022-01-01'),
      saleDate: new Date('2024-06-01'),
      isPrimaryResidence: false,
      acquisitionCosts: 0,
      renovationCosts: 0,
    })
    expect(result.grossGain).toBe(150_000)
  })

  it('rejette une date de vente antérieure à l\'achat', () => {
    expect(() => calculateCapitalGains({
      purchasePrice: 200_000,
      salePrice: 350_000,
      purchaseDate: new Date('2024-01-01'),
      saleDate: new Date('2022-01-01'),
      isPrimaryResidence: false,
      acquisitionCosts: 0,
      renovationCosts: 0,
    })).toThrow()
  })

  it('rejette un prix négatif', () => {
    expect(() => calculateCapitalGains({
      purchasePrice: -100,
      salePrice: 350_000,
      purchaseDate: new Date('2022-01-01'),
      saleDate: new Date('2024-06-01'),
      isPrimaryResidence: false,
      acquisitionCosts: 0,
      renovationCosts: 0,
    })).toThrow()
  })
})
