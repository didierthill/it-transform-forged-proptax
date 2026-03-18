import { describe, it, expect } from 'vitest'
import { calculateNoticePeriod } from '../../calculators/notice-period.js'

describe('calculateNoticePeriod', () => {
  // ── Bail 9 ans — Locataire ──

  describe('Bail 9 ans — Locataire', () => {
    it('préavis de 3 mois + indemnité 3 mois si < 1 an', () => {
      const result = calculateNoticePeriod({
        leaseType: 'standard_9yr',
        initiator: 'tenant',
        leaseStartDate: new Date('2024-01-01'),
        noticeDate: new Date('2024-06-01'),
        contractDuration: 108,
      })
      expect(result.noticePeriodMonths).toBe(3)
      expect(result.compensationMonths).toBe(3)
    })

    it('indemnité 2 mois si 1-2 ans', () => {
      const result = calculateNoticePeriod({
        leaseType: 'standard_9yr',
        initiator: 'tenant',
        leaseStartDate: new Date('2023-01-01'),
        noticeDate: new Date('2024-06-01'),
        contractDuration: 108,
      })
      expect(result.compensationMonths).toBe(2)
    })

    it('indemnité 1 mois si 2-3 ans', () => {
      const result = calculateNoticePeriod({
        leaseType: 'standard_9yr',
        initiator: 'tenant',
        leaseStartDate: new Date('2022-01-01'),
        noticeDate: new Date('2024-06-01'),
        contractDuration: 108,
      })
      expect(result.compensationMonths).toBe(1)
    })

    it('pas d\'indemnité après 3 ans', () => {
      const result = calculateNoticePeriod({
        leaseType: 'standard_9yr',
        initiator: 'tenant',
        leaseStartDate: new Date('2020-01-01'),
        noticeDate: new Date('2024-06-01'),
        contractDuration: 108,
      })
      expect(result.compensationMonths).toBe(0)
    })
  })

  // ── Bail 9 ans — Propriétaire ──

  describe('Bail 9 ans — Propriétaire', () => {
    it('préavis de 6 mois', () => {
      const result = calculateNoticePeriod({
        leaseType: 'standard_9yr',
        initiator: 'landlord',
        leaseStartDate: new Date('2020-01-01'),
        noticeDate: new Date('2024-01-01'),
        contractDuration: 108,
        landlordReason: 'personal_use',
      })
      expect(result.noticePeriodMonths).toBe(6)
    })

    it('indemnité 9 mois sans motif (1er triennat)', () => {
      const result = calculateNoticePeriod({
        leaseType: 'standard_9yr',
        initiator: 'landlord',
        leaseStartDate: new Date('2023-01-01'),
        noticeDate: new Date('2024-06-01'),
        contractDuration: 108,
        landlordReason: 'no_reason',
      })
      expect(result.compensationMonths).toBe(9)
    })

    it('pas d\'indemnité pour usage personnel', () => {
      const result = calculateNoticePeriod({
        leaseType: 'standard_9yr',
        initiator: 'landlord',
        leaseStartDate: new Date('2020-01-01'),
        noticeDate: new Date('2024-01-01'),
        contractDuration: 108,
        landlordReason: 'personal_use',
      })
      expect(result.compensationMonths).toBe(0)
    })
  })

  // ── Bail courte durée ──

  describe('Bail courte durée', () => {
    it('pas de résiliation anticipée standard', () => {
      const result = calculateNoticePeriod({
        leaseType: 'short_term',
        initiator: 'tenant',
        leaseStartDate: new Date('2024-01-01'),
        noticeDate: new Date('2024-06-01'),
        contractDuration: 12,
      })
      expect(result.noticePeriodMonths).toBe(0)
    })

    it('signale si durée > 36 mois', () => {
      const result = calculateNoticePeriod({
        leaseType: 'short_term',
        initiator: 'tenant',
        leaseStartDate: new Date('2024-01-01'),
        noticeDate: new Date('2024-06-01'),
        contractDuration: 48,
      })
      expect(result.notes.some(n => n.includes('3 ans'))).toBe(true)
    })
  })

  // ── Bail étudiant ──

  describe('Bail étudiant', () => {
    it('2 mois de préavis pour l\'étudiant', () => {
      const result = calculateNoticePeriod({
        leaseType: 'student',
        initiator: 'tenant',
        leaseStartDate: new Date('2024-09-01'),
        noticeDate: new Date('2025-01-01'),
        contractDuration: 12,
      })
      expect(result.noticePeriodMonths).toBe(2)
    })

    it('le bailleur ne peut pas résilier', () => {
      const result = calculateNoticePeriod({
        leaseType: 'student',
        initiator: 'landlord',
        leaseStartDate: new Date('2024-09-01'),
        noticeDate: new Date('2025-01-01'),
        contractDuration: 12,
      })
      expect(result.noticePeriodMonths).toBe(0)
    })
  })

  // ── Validation ──

  it('rejette une date de préavis antérieure au bail', () => {
    expect(() => calculateNoticePeriod({
      leaseType: 'standard_9yr',
      initiator: 'tenant',
      leaseStartDate: new Date('2024-06-01'),
      noticeDate: new Date('2024-01-01'),
      contractDuration: 108,
    })).toThrow()
  })
})
