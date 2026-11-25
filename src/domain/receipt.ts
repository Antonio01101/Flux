import { getCountry } from '../data/countries'
import { formatMoney, formatRate } from './money'
import { PAYMENT_LABEL, STATUS_LABEL, timeline } from './transfer'
import type { Transfer } from './types'

export const RECEIPT_DISCLAIMER =
  'COMPROVANTE FICTÍCIO — gerado por um protótipo acadêmico. Sem valor financeiro ou legal. Nenhum dinheiro real foi movimentado.'

export interface ReceiptRow {
  label: string
  value: string
}

const dt = (ms: number) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(ms)

/** Fonte única dos dados do comprovante: usada na tela e no arquivo baixado (coerência com o histórico). */
export function buildReceiptRows(t: Transfer): ReceiptRow[] {
  const sent = t.direction === 'sent'
  const rows: ReceiptRow[] = [
    { label: 'Referência', value: t.reference },
    { label: 'Tipo', value: sent ? 'Transferência enviada' : 'Transferência recebida' },
    { label: 'Situação', value: STATUS_LABEL[t.status] },
    { label: 'Data de criação', value: dt(t.createdAt) },
    { label: sent ? 'Destinatário' : 'Remetente', value: `${t.counterparty.name} (${t.counterparty.userCode})` },
    { label: 'País de origem', value: getCountry(t.originCountry).name },
    { label: 'País de destino', value: getCountry(t.destinationCountry).name },
    { label: 'Valor enviado', value: formatMoney(t.sendMinor, t.originCurrency) },
    { label: 'Tarifa simulada', value: formatMoney(t.feeMinor, t.originCurrency) },
    { label: 'Total pago', value: formatMoney(t.totalMinor, t.originCurrency) },
    { label: 'Câmbio fictício', value: `1 ${t.originCurrency} = ${formatRate(t.rate)} ${t.destinationCurrency}` },
    { label: sent ? 'Valor estimado a receber' : 'Valor recebido', value: formatMoney(t.receiveMinor, t.destinationCurrency) },
  ]
  if (sent && t.paymentMethod) rows.push({ label: 'Forma de pagamento', value: PAYMENT_LABEL[t.paymentMethod] })
  for (const e of timeline(t).slice(1)) rows.push({ label: e.label, value: dt(e.at) })
  if (t.status === 'failed' && t.failureReason) rows.push({ label: 'Motivo', value: t.failureReason })
  return rows
}

export function receiptToText(t: Transfer): string {
  const rows = buildReceiptRows(t)
  const width = Math.max(...rows.map((r) => r.label.length))
  return [
    'FLUX — PROTÓTIPO ACADÊMICO',
    RECEIPT_DISCLAIMER,
    '',
    ...rows.map((r) => `${r.label.padEnd(width)} : ${r.value}`),
    '',
    'Valores e taxas de câmbio são demonstrativos e inventados.',
  ].join('\n')
}
