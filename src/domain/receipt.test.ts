import { describe, expect, it } from 'vitest'
import { CONTACTS } from '../data/contacts'
import { RECEIPT_DISCLAIMER, buildReceiptRows, receiptToText } from './receipt'
import { advanceTransfer, createReceivedTransfer, createSentTransfer } from './transfer'
import { formatMoney } from './money'

const T0 = 1_700_000_000_000
const sent = createSentTransfer(
  { recipient: CONTACTS[0], originCountry: 'BR', destinationCountry: 'UA', originCurrency: 'BRL', destinationCurrency: 'UAH', sendMinor: 18000, paymentMethod: 'googlepay' },
  T0,
)

describe('comprovante fictício', () => {
  it('traz aviso de que é fictício e sem valor real', () => {
    const text = receiptToText(sent)
    expect(text).toContain(RECEIPT_DISCLAIMER)
    expect(RECEIPT_DISCLAIMER).toMatch(/FICTÍCIO/)
    expect(RECEIPT_DISCLAIMER).toMatch(/Nenhum dinheiro real/)
  })

  it('é coerente com a transferência (referência, valores, situação)', () => {
    const rows = Object.fromEntries(buildReceiptRows(sent).map((r) => [r.label, r.value]))
    expect(rows['Referência']).toBe(sent.reference)
    expect(rows['Situação']).toBe('Pendente')
    expect(rows['Valor enviado']).toBe(formatMoney(sent.sendMinor, 'BRL'))
    expect(rows['Valor estimado a receber']).toBe(formatMoney(sent.receiveMinor, 'UAH'))
    expect(rows['Destinatário']).toContain('Oleksandr Gulenko')
  })

  it('acompanha a mudança de estado e o motivo da falha', () => {
    const done = advanceTransfer(sent, T0 + 60_000)
    expect(buildReceiptRows(done).find((r) => r.label === 'Situação')?.value).toBe('Concluída')
    const failed = advanceTransfer({ ...sent, simulateFailure: true }, T0 + 60_000)
    const labels = buildReceiptRows(failed).map((r) => r.label)
    expect(labels).toContain('Motivo')
  })

  it('recebidas usam "Remetente" e "Valor recebido"', () => {
    const r = createReceivedTransfer(CONTACTS[2], 5000, 'USD', T0)
    const labels = buildReceiptRows(r).map((x) => x.label)
    expect(labels).toContain('Remetente')
    expect(labels).toContain('Valor recebido')
  })

  it('não contém campos bancários', () => {
    const text = receiptToText(sent).toLowerCase()
    for (const word of ['conta bancária', 'agência', 'iban', 'cpf', 'senha']) expect(text).not.toContain(word)
  })
})
