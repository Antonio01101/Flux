import { ME, INITIAL_BALANCE_BRL_MINOR, CONTACTS } from '../data/contacts'
import { getCountry } from '../data/countries'
import { convertMinor } from './money'
import { getQuote } from './quote'
import type { Party, PaymentMethod, Transfer, TransferStatus } from './types'

/** Tempos da simulação (ms). O "tempo real" de uma remessa não é simulado fielmente. */
export const PROCESS_DELAY_MS = 2500
export const COMPLETE_DELAY_MS = 4000
export const FAILURE_REASON = 'Falha simulada escolhida nas opções de demonstração. Nenhum valor foi debitado.'

export const STATUS_LABEL: Record<TransferStatus, string> = {
  pending: 'Pendente',
  processed: 'Processada',
  completed: 'Concluída',
  failed: 'Falha simulada',
}

export const STATUS_HELP: Record<TransferStatus, string> = {
  pending: 'A operação simulada foi registrada e aguarda o início do processamento.',
  processed: 'A operação simulada foi processada e está sendo finalizada.',
  completed: 'A operação simulada foi concluída. Nenhum dinheiro real foi movimentado.',
  failed: 'A operação simulada falhou. Nenhum valor foi debitado.',
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  balance: 'Saldo demonstrativo',
  pix: 'Pix (simulado)',
  googlepay: 'Google Pay (simulado)',
}

let seq = 0
function newId(now: number): string {
  seq += 1
  return `t_${now.toString(36)}_${seq.toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function newReference(now: number, id: string): string {
  const d = new Date(now)
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const tail = id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase().padStart(6, '0')
  return `FLX-${ymd}-${tail}`
}

export interface NewSentInput {
  recipient: Party
  originCountry: string
  destinationCountry: string
  originCurrency: string
  destinationCurrency: string
  sendMinor: number
  paymentMethod: PaymentMethod
  simulateFailure?: boolean
}

export function createSentTransfer(input: NewSentInput, now: number = Date.now()): Transfer {
  const q = getQuote(input.originCurrency, input.destinationCurrency, input.sendMinor)
  const id = newId(now)
  return {
    id,
    reference: newReference(now, id),
    direction: 'sent',
    status: 'pending',
    counterparty: input.recipient,
    originCountry: input.originCountry,
    destinationCountry: input.destinationCountry,
    originCurrency: input.originCurrency,
    destinationCurrency: input.destinationCurrency,
    sendMinor: q.sendMinor,
    feeMinor: q.feeMinor,
    totalMinor: q.totalMinor,
    receiveMinor: q.receiveMinor,
    rate: q.rate,
    paymentMethod: input.paymentMethod,
    simulateFailure: !!input.simulateFailure,
    createdAt: now,
  }
}

/** Gera uma transferência recebida de demonstração (remetente fictício → usuário, em BRL). */
export function createReceivedTransfer(sender: Party, sendMinor: number, originCurrency: string, now: number = Date.now()): Transfer {
  const destinationCurrency = getCountry(ME.country).currency
  const q = getQuote(originCurrency, destinationCurrency, sendMinor)
  const id = newId(now)
  return {
    id,
    reference: newReference(now, id),
    direction: 'received',
    status: 'pending',
    counterparty: sender,
    originCountry: sender.country,
    destinationCountry: ME.country,
    originCurrency,
    destinationCurrency,
    sendMinor: q.sendMinor,
    feeMinor: q.feeMinor,
    totalMinor: q.totalMinor,
    receiveMinor: q.receiveMinor,
    rate: q.rate,
    createdAt: now,
  }
}

/**
 * Avança o estado conforme o tempo decorrido: pendente → processada → concluída (ou falha simulada).
 * Função pura: devolve o MESMO objeto se nada mudou.
 */
export function advanceTransfer(t: Transfer, now: number): Transfer {
  if (t.status === 'pending' && now - t.createdAt >= PROCESS_DELAY_MS) {
    const at = t.createdAt + PROCESS_DELAY_MS
    if (t.simulateFailure) {
      return { ...t, status: 'failed', failedAt: at, failureReason: FAILURE_REASON }
    }
    return advanceTransfer({ ...t, status: 'processed', processedAt: at }, now)
  }
  if (t.status === 'processed' && t.processedAt !== undefined && now - t.processedAt >= COMPLETE_DELAY_MS) {
    return { ...t, status: 'completed', completedAt: t.processedAt + COMPLETE_DELAY_MS }
  }
  return t
}

/**
 * Saldo demonstrativo em BRL:
 *  - enviadas pagas com "saldo" (exceto falhas) debitam o total;
 *  - recebidas só creditam quando concluídas.
 */
export function computeBalance(transfers: Transfer[]): number {
  const home = getCountry(ME.country).currency
  let balance = INITIAL_BALANCE_BRL_MINOR
  for (const t of transfers) {
    if (t.direction === 'sent' && t.paymentMethod === 'balance' && t.status !== 'failed') {
      balance -= convertMinor(t.totalMinor, t.originCurrency, home)
    } else if (t.direction === 'received' && t.status === 'completed') {
      balance += convertMinor(t.receiveMinor, t.destinationCurrency, home)
    }
  }
  return balance
}

export function balanceCovers(transfers: Transfer[], totalMinor: number, originCurrency: string): boolean {
  const home = getCountry(ME.country).currency
  return computeBalance(transfers) >= convertMinor(totalMinor, originCurrency, home)
}

/** Linha do tempo exibida nos detalhes — derivada dos campos da transferência. */
export function timeline(t: Transfer): { label: string; at: number }[] {
  const rows = [{ label: t.direction === 'sent' ? 'Operação criada' : 'Operação recebida (simulada)', at: t.createdAt }]
  if (t.processedAt) rows.push({ label: 'Processada', at: t.processedAt })
  if (t.completedAt) rows.push({ label: 'Concluída', at: t.completedAt })
  if (t.failedAt) rows.push({ label: 'Falha simulada', at: t.failedAt })
  return rows
}

/** Dados de exemplo para o primeiro uso (relativos ao momento atual). */
export function buildSeed(now: number = Date.now()): Transfer[] {
  const DAY = 86_400_000
  const find = (code: string) => CONTACTS.find((c) => c.userCode === code)!
  const sent = (recipient: Party, dest: string, destCur: string, minor: number, ago: number, status: TransferStatus, pm: PaymentMethod): Transfer => {
    const t = createSentTransfer(
      { recipient, originCountry: 'BR', destinationCountry: dest, originCurrency: 'BRL', destinationCurrency: destCur, sendMinor: minor, paymentMethod: pm },
      now - ago,
    )
    return finish(t, status)
  }
  const received = (sender: Party, cur: string, minor: number, ago: number, status: TransferStatus): Transfer =>
    finish(createReceivedTransfer(sender, minor, cur, now - ago), status)

  return [
    sent(find('FLX-UA4821'), 'UA', 'UAH', 18000, 6 * DAY, 'completed', 'googlepay'),
    sent(find('FLX-US2095'), 'US', 'USD', 50000, 3 * DAY, 'completed', 'balance'),
    sent(find('FLX-PL5568'), 'PL', 'PLN', 30000, 1 * DAY, 'failed', 'pix'),
    received(find('FLX-JP9042'), 'JPY', 15000, 4 * DAY, 'completed'),
    received(find('FLX-US2095'), 'USD', 8000, 2 * DAY, 'completed'),
  ].sort((a, b) => b.createdAt - a.createdAt)
}

function finish(t: Transfer, status: TransferStatus): Transfer {
  const p = t.createdAt + PROCESS_DELAY_MS
  if (status === 'failed') return { ...t, status, simulateFailure: true, failedAt: p, failureReason: FAILURE_REASON }
  if (status === 'completed') return { ...t, status, processedAt: p, completedAt: p + COMPLETE_DELAY_MS }
  return t
}
