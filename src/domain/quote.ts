import { getCurrency } from '../data/currencies'
import { convertMinor, toMinor } from './money'
import type { Quote } from './types'

/** Tarifas FICTÍCIAS: 1% do valor + tarifa fixa equivalente a US$ 1,50. */
export const FEE_PERCENT = 0.01
export const FEE_FIXED_USD = 1.5
/** Limites demonstrativos por transferência, em equivalente USD. */
export const MIN_USD = 5
export const MAX_USD = 5000

/** Taxa direta (uma única conversão, sem moedas intermediárias visíveis ao usuário — RN01). */
export function getRate(from: string, to: string): number {
  return getCurrency(to).perUsd / getCurrency(from).perUsd
}

export function getQuote(from: string, to: string, sendMinor: number): Quote {
  const f = getCurrency(from)
  const t = getCurrency(to)
  const rate = getRate(from, to)
  const sendMajor = sendMinor / 10 ** f.decimals
  const feeMajor = sendMajor * FEE_PERCENT + FEE_FIXED_USD * f.perUsd
  const feeMinor = Math.round(feeMajor * 10 ** f.decimals)
  const receiveMinor = Math.round(sendMajor * rate * 10 ** t.decimals)
  return { rate, sendMinor, feeMinor, totalMinor: sendMinor + feeMinor, receiveMinor }
}

/** Retorna mensagem de erro (pt-BR) ou null se o valor for válido. */
export function validateAmount(sendMinor: number | null, from: string): string | null {
  if (sendMinor === null) return 'Digite um valor válido, por exemplo 180,00.'
  if (sendMinor <= 0) return 'O valor precisa ser maior que zero.'
  const usd = convertMinor(sendMinor, from, 'USD') / 100
  if (usd < MIN_USD) return `O valor mínimo na simulação é o equivalente a US$ ${MIN_USD}.`
  if (usd > MAX_USD) return `O valor máximo na simulação é o equivalente a US$ ${MAX_USD.toLocaleString('pt-BR')}.`
  return null
}

export const minUsdMinor = (): number => toMinor(MIN_USD, 'USD')
