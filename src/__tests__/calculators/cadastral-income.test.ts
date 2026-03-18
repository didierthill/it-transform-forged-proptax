import { describe, it, expect } from 'vitest'
import { calculateCadastralIncome } from '../../calculators/cadastral-income.js'

describe('calculateCadastralIncome', () => {
  it('calcule le RC indexé pour 2024', () => {
    const result = calculateCadastralIncome({
      baseCadastralIncome: 1500,
      fiscalYear: 2024,
    })
    expect(result.indexedIncome).toBeGreaterThan(1500)
    expect(result.indexCoefficient).toBeGreaterThan(1)
    expect(result.baseCadastralIncome).toBe(1500)
    expect(result.fiscalYear).toBe(2024)
  })

  it('calcule le RC indexé pour 2025', () => {
    const result = calculateCadastralIncome({
      baseCadastralIncome: 1000,
      fiscalYear: 2025,
    })
    expect(result.indexedIncome).toBeGreaterThan(1000)
    expect(result.source).toContain('2025')
  })

  it('rejette un RC de base négatif', () => {
    expect(() => calculateCadastralIncome({
      baseCadastralIncome: -500,
      fiscalYear: 2024,
    })).toThrow('positif')
  })

  it('rejette une année non supportée', () => {
    expect(() => calculateCadastralIncome({
      baseCadastralIncome: 1500,
      fiscalYear: 2000,
    })).toThrow('non supportée')
  })

  it('retourne la source SPF Finances', () => {
    const result = calculateCadastralIncome({
      baseCadastralIncome: 1500,
      fiscalYear: 2024,
    })
    expect(result.source).toContain('SPF Finances')
  })
})
