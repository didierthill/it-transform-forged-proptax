import { describe, it, expect } from 'vitest'
import { calculateIndexation } from '../../calculators/indexation.js'

describe('calculateIndexation', () => {
  it('calcule l\'indexation du loyer correctement', () => {
    const result = calculateIndexation({
      baseRent: 800,
      startIndex: 110.5,
      newIndex: 115.2,
      leaseStartDate: new Date('2022-01-01'),
      calculationDate: new Date('2023-01-01'),
    })
    expect(result.indexedRent).toBeGreaterThan(800)
    expect(result.difference).toBeGreaterThan(0)
    expect(result.percentageIncrease).toBeGreaterThan(0)
    expect(result.formula).toContain('800')
  })

  it('retourne le même loyer si les indices sont identiques', () => {
    const result = calculateIndexation({
      baseRent: 1000,
      startIndex: 110,
      newIndex: 110,
      leaseStartDate: new Date('2023-01-01'),
      calculationDate: new Date('2024-01-01'),
    })
    expect(result.indexedRent).toBe(1000)
    expect(result.difference).toBe(0)
  })

  it('rejette un loyer négatif', () => {
    expect(() => calculateIndexation({
      baseRent: -500,
      startIndex: 110,
      newIndex: 115,
      leaseStartDate: new Date('2022-01-01'),
      calculationDate: new Date('2023-01-01'),
    })).toThrow()
  })

  it('rejette une date de calcul antérieure au début du bail', () => {
    expect(() => calculateIndexation({
      baseRent: 800,
      startIndex: 110,
      newIndex: 115,
      leaseStartDate: new Date('2023-06-01'),
      calculationDate: new Date('2022-01-01'),
    })).toThrow()
  })

  it('rejette un indice de départ négatif', () => {
    expect(() => calculateIndexation({
      baseRent: 800,
      startIndex: -10,
      newIndex: 115,
      leaseStartDate: new Date('2022-01-01'),
      calculationDate: new Date('2023-01-01'),
    })).toThrow()
  })

  it('retourne la formule de calcul', () => {
    const result = calculateIndexation({
      baseRent: 800,
      startIndex: 110,
      newIndex: 115,
      leaseStartDate: new Date('2022-06-01'),
      calculationDate: new Date('2023-06-01'),
    })
    expect(result.formula).toContain('110')
    expect(result.formula).toContain('115')
  })
})
