import { getCurrency } from '../data/currencies'

export function toMinor(major: number, currency: string): number {
  const { decimals } = getCurrency(currency)
  return Math.round(major * 10 ** decimals)
}

export function fromMinor(minor: number, currency: string): number {
  const { decimals } = getCurrency(currency)
  return minor / 10 ** decimals
}

export function formatMoney(minor: number, currency: string): string {
  const { decimals } = getCurrency(currency)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(minor / 10 ** decimals)
}

/** Formata um número de taxa (ex.: 8,000000). */
export function formatRate(rate: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6, minimumFractionDigits: 2 }).format(rate)
}

/**
 * Lê o que o usuário digitou como valor (padrão pt-BR: vírgula decimal, ponto de milhar).
 * Também aceita "10.5". Retorna unidades menores ou null se inválido.
 */
export function parseAmountInput(text: string, currency: string): number | null {
  const { decimals } = getCurrency(currency)
  let s = text.replace(/\s/g, '').replace(/^[A-Za-z$€£¥R]+/, '')
  if (s === '') return null
  if (!/^[\d.,]+$/.test(s)) return null

  let intPart: string
  let fracPart = ''
  if (s.includes(',')) {
    const parts = s.split(',')
    if (parts.length !== 2) return null
    intPart = parts[0].replace(/\./g, '')
    fracPart = parts[1]
  } else if (s.includes('.')) {
    const parts = s.split('.')
    const last = parts[parts.length - 1]
    if (parts.length === 2 && last.length > 0 && last.length <= decimals) {
      intPart = parts[0]
      fracPart = last
    } else if (parts.slice(1).every((p) => p.length === 3)) {
      intPart = parts.join('') // milhares: 1.234.567
    } else {
      return null
    }
  } else {
    intPart = s
  }
  if (intPart === '') intPart = '0'
  if (!/^\d+$/.test(intPart) || (fracPart !== '' && !/^\d+$/.test(fracPart))) return null
  if (fracPart.length > decimals) return null
  const minor = Number(intPart) * 10 ** decimals + Number((fracPart + '0'.repeat(decimals)).slice(0, decimals) || 0)
  return Number.isSafeInteger(minor) ? minor : null
}

/** Converte unidades menores entre moedas usando a taxa fictícia direta. */
export function convertMinor(minor: number, from: string, to: string): number {
  if (from === to) return minor
  const f = getCurrency(from)
  const t = getCurrency(to)
  const rate = t.perUsd / f.perUsd
  return Math.round((minor / 10 ** f.decimals) * rate * 10 ** t.decimals)
}
