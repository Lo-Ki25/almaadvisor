import { describe, it, expect } from 'vitest'
import { cn, formatDate } from '@/lib/utils'

describe('Utilities', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
      expect(cn('class1', null, 'class2')).toBe('class1 class2')
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
      expect(cn('base', { conditional: true })).toBe('base conditional')
      expect(cn('base', { conditional: false })).toBe('base')
    })

    it('should handle tailwind conflicts', () => {
      // Test basic tailwind merge functionality
      expect(cn('p-4', 'p-8')).toBe('p-8')
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
      expect(cn('text-lg', 'text-sm')).toBe('text-sm')
    })
  })

  describe('formatDate', () => {
    it('should format dates in French locale', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date)
      
      // Should contain French month name
      expect(formatted).toMatch(/janv|janvier/i)
      expect(formatted).toMatch(/2024/)
      expect(formatted).toMatch(/15/)
    })

    it('should handle different date formats', () => {
      // Test with string date
      const stringDate = formatDate('2024-01-15')
      expect(stringDate).toMatch(/janv|janvier/i)
      
      // Test with timestamp
      const timestampDate = formatDate(1705312200000) // 2024-01-15
      expect(timestampDate).toMatch(/janv|janvier/i)
    })

    it('should be consistent for same dates', () => {
      const date1 = new Date('2024-01-15T10:30:00Z')
      const date2 = new Date('2024-01-15T15:45:00Z')
      
      // Should format to same date string regardless of time
      expect(formatDate(date1)).toBe(formatDate(date2))
    })

    it('should handle edge cases', () => {
      const now = new Date()
      expect(formatDate(now)).toBeTruthy()
      
      // Test with very old date
      const oldDate = new Date('1990-01-01')
      expect(formatDate(oldDate)).toMatch(/1990/)
      
      // Test with future date
      const futureDate = new Date('2030-12-31')
      expect(formatDate(futureDate)).toMatch(/2030/)
    })
  })
})
