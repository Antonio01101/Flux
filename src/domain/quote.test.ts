import { describe, expect, it } from 'vitest'
import { MAX_USD, getQuote, getRate, validateAmount } from './quote'

describe('cotação demonstrativa', () => {
  it('BRL → UAH usa conversão direta única', () => {
    expect(getRate('BRL', 'UAH')).toBeCloseTo(8, 10)
  })

  it('calcula tarifa, total e valor a receber (180 BRL → UAH)', () => {
    const q = getQuote('BRL', 'UAH', 18000)
    expect(q.feeMinor).toBe(930) // 1% de 180 = 1,80 + US$ 1,50 (R$ 7,50)
    expect(q.totalMinor).toBe(18930)
    expect(q.receiveMinor).toBe(144000) // ₴ 1.440,00
  })

  it('mesma moeda mantém taxa 1', () => {
    const q = getQuote('EUR', 'EUR', 10000)
    expect(q.rate).toBe(1)
    expect(q.receiveMinor).toBe(10000)
  })

  it('JPY não tem casas decimais', () => {
    const q = getQuote('BRL', 'JPY', 10000) // R$ 100 → ¥ 3.000
    expect(q.receiveMinor).toBe(3000)
  })
})

describe('validateAmount', () => {
  it('rejeita nulo, zero, abaixo do mínimo e acima do máximo', () => {
    expect(validateAmount(null, 'BRL')).toMatch(/válido/)
    expect(validateAmount(0, 'BRL')).toMatch(/maior que zero/)
    expect(validateAmount(1000, 'BRL')).toMatch(/mínimo/) // R$ 10 = US$ 2
    expect(validateAmount(MAX_USD * 5 * 100 + 100, 'BRL')).toMatch(/máximo/)
  })
  it('aceita valores dentro dos limites', () => {
    expect(validateAmount(18000, 'BRL')).toBeNull()
  })
})
