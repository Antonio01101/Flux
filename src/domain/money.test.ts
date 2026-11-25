import { describe, expect, it } from 'vitest'
import { convertMinor, formatMoney, parseAmountInput, toMinor } from './money'

const norm = (s: string) => s.replace(/\s/g, ' ')

describe('parseAmountInput', () => {
  it.each([
    ['180', 'BRL', 18000],
    ['180,50', 'BRL', 18050],
    ['1.234,56', 'BRL', 123456],
    ['10.5', 'BRL', 1050],
    ['1.234.567', 'BRL', 123456700],
    ['R$ 99,9', 'BRL', 9990],
    ['0,05', 'BRL', 5],
    ['1.500', 'JPY', 1500],
    ['2500', 'JPY', 2500],
  ])('lê "%s" (%s) como %i', (text, cur, expected) => {
    expect(parseAmountInput(text, cur)).toBe(expected)
  })

  it.each([['', 'BRL'], ['abc', 'BRL'], ['1,234,5', 'BRL'], ['10,999', 'BRL'], ['1,5', 'JPY'], ['-5', 'BRL']])('rejeita "%s"', (text, cur) => {
    expect(parseAmountInput(text, cur)).toBeNull()
  })
})

describe('formatação e conversão', () => {
  it('formata valores em pt-BR', () => {
    expect(norm(formatMoney(18000, 'BRL'))).toBe('R$ 180,00')
    expect(norm(formatMoney(1500, 'JPY'))).toContain('1.500')
  })
  it('toMinor respeita as casas decimais da moeda', () => {
    expect(toMinor(1.5, 'USD')).toBe(150)
    expect(toMinor(1500, 'JPY')).toBe(1500)
  })
  it('convertMinor usa a taxa direta fictícia', () => {
    expect(convertMinor(18000, 'BRL', 'UAH')).toBe(144000) // R$ 180 = ₴ 1.440
    expect(convertMinor(500, 'USD', 'USD')).toBe(500)
  })
})
