import { describe, expect, it } from 'vitest'
import { CONTACTS } from '../data/contacts'
import {
  COMPLETE_DELAY_MS, PROCESS_DELAY_MS, advanceTransfer, balanceCovers, buildSeed, computeBalance, createReceivedTransfer, createSentTransfer,
} from './transfer'
import type { NewSentInput } from './transfer'

const oleksandr = CONTACTS[0]
const base: NewSentInput = {
  recipient: oleksandr, originCountry: 'BR', destinationCountry: 'UA', originCurrency: 'BRL', destinationCurrency: 'UAH', sendMinor: 18000, paymentMethod: 'balance',
}
const T0 = 1_700_000_000_000

describe('ciclo de vida da transferência simulada', () => {
  it('cria operação pendente com valores da cotação', () => {
    const t = createSentTransfer(base, T0)
    expect(t).toMatchObject({ direction: 'sent', status: 'pending', totalMinor: 18930, receiveMinor: 144000 })
    expect(t.reference).toMatch(/^FLX-\d{8}-[A-Z0-9]{6}$/)
  })

  it('avança pendente → processada → concluída conforme o tempo', () => {
    const t = createSentTransfer(base, T0)
    expect(advanceTransfer(t, T0 + 100)).toBe(t) // nada muda: mesma referência
    const p = advanceTransfer(t, T0 + PROCESS_DELAY_MS)
    expect(p.status).toBe('processed')
    expect(advanceTransfer(p, T0 + PROCESS_DELAY_MS + 100)).toBe(p)
    const c = advanceTransfer(p, T0 + PROCESS_DELAY_MS + COMPLETE_DELAY_MS)
    expect(c.status).toBe('completed')
    expect(c.completedAt).toBe(T0 + PROCESS_DELAY_MS + COMPLETE_DELAY_MS)
  })

  it('reabrir muito depois leva direto ao estado final', () => {
    expect(advanceTransfer(createSentTransfer(base, T0), T0 + 60_000).status).toBe('completed')
  })

  it('falha simulada termina em "failed" com motivo e não passa por concluída', () => {
    const t = createSentTransfer({ ...base, simulateFailure: true }, T0)
    const f = advanceTransfer(t, T0 + 60_000)
    expect(f.status).toBe('failed')
    expect(f.failureReason).toMatch(/Nenhum valor foi debitado/)
    expect(advanceTransfer(f, T0 + 120_000)).toBe(f)
  })
})

describe('saldo demonstrativo', () => {
  it('debita enviadas pagas com saldo; falhas e outros métodos não debitam', () => {
    const initial = computeBalance([])
    const paid = createSentTransfer(base, T0)
    expect(computeBalance([paid])).toBe(initial - 18930)
    const viaPix = createSentTransfer({ ...base, paymentMethod: 'pix' }, T0)
    expect(computeBalance([viaPix])).toBe(initial)
    const failed = advanceTransfer(createSentTransfer({ ...base, simulateFailure: true }, T0), T0 + 5000)
    expect(computeBalance([failed])).toBe(initial)
  })

  it('recebidas só creditam quando concluídas', () => {
    const initial = computeBalance([])
    const r = createReceivedTransfer(CONTACTS[2], 5000, 'USD', T0) // US$ 50 → R$ 250 (menos tarifa não se aplica ao destinatário)
    expect(computeBalance([r])).toBe(initial)
    const done = advanceTransfer(r, T0 + 60_000)
    expect(computeBalance([done])).toBe(initial + r.receiveMinor)
  })

  it('balanceCovers detecta saldo insuficiente', () => {
    expect(balanceCovers([], 18930, 'BRL')).toBe(true)
    expect(balanceCovers([], 99_999_99, 'BRL')).toBe(false)
  })
})

describe('dados de demonstração', () => {
  it('seed tem enviadas e recebidas em estados distintos e coerentes', () => {
    const seed = buildSeed(T0)
    expect(seed.some((t) => t.direction === 'sent')).toBe(true)
    expect(seed.some((t) => t.direction === 'received')).toBe(true)
    expect(new Set(seed.map((t) => t.status)).has('failed')).toBe(true)
    for (const t of seed) expect(t.totalMinor).toBe(t.sendMinor + t.feeMinor)
    expect(new Set(seed.map((t) => t.id)).size).toBe(seed.length)
  })
})
