import { describe, it, expect } from 'vitest'
import { calculatePropertyTax } from '../../calculators/property-tax.js'

describe('calculatePropertyTax', () => {
  it('calcule le précompte pour Bruxelles', () => {
    const result = calculatePropertyTax({
      baseCadastralIncome: 1500,
      fiscalYear: 2024,
      region: 'bruxelles',
      postalCode: '1000',
    })
    expect(result.totalTax).toBeGreaterThan(0)
    expect(result.regionalTax).toBeGreaterThan(0)
    expect(result.provincialTax).toBeGreaterThanOrEqual(0)
    expect(result.municipalTax).toBeGreaterThan(0)
    expect(result.municipality).toBe('Bruxelles-Ville')
  })

  it('calcule le précompte pour la Wallonie', () => {
    const result = calculatePropertyTax({
      baseCadastralIncome: 1500,
      fiscalYear: 2024,
      region: 'wallonie',
      postalCode: '5000',
    })
    expect(result.totalTax).toBeGreaterThan(0)
    expect(result.municipality).toBe('Namur')
  })

  it('calcule le précompte pour la Flandre', () => {
    const result = calculatePropertyTax({
      baseCadastralIncome: 1500,
      fiscalYear: 2024,
      region: 'flandre',
      postalCode: '9000',
    })
    expect(result.totalTax).toBeGreaterThan(0)
    expect(result.municipality).toBe('Gand')
  })

  it('le total = régional + provincial + communal', () => {
    const result = calculatePropertyTax({
      baseCadastralIncome: 1500,
      fiscalYear: 2024,
      region: 'bruxelles',
      postalCode: '1050',
    })
    const sum = result.regionalTax + result.provincialTax + result.municipalTax
    expect(Math.abs(result.totalTax - sum)).toBeLessThan(0.01)
  })

  it('rejette un code postal invalide', () => {
    expect(() => calculatePropertyTax({
      baseCadastralIncome: 1500,
      fiscalYear: 2024,
      region: 'bruxelles',
      postalCode: '99',
    })).toThrow('Code postal')
  })

  it('retourne le disclaimer', () => {
    const result = calculatePropertyTax({
      baseCadastralIncome: 1500,
      fiscalYear: 2024,
      region: 'bruxelles',
      postalCode: '1000',
    })
    expect(result.disclaimer).toContain('indicatif')
  })

  it('retourne les centimes et taux', () => {
    const result = calculatePropertyTax({
      baseCadastralIncome: 1500,
      fiscalYear: 2024,
      region: 'bruxelles',
      postalCode: '1000',
    })
    expect(result.provincialCentimes).toBeGreaterThanOrEqual(0)
    expect(result.municipalCentimes).toBeGreaterThan(0)
    expect(result.regionalRate).toBeGreaterThan(0)
    expect(result.indexCoefficient).toBeGreaterThan(1)
  })
})
