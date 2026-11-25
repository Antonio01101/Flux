import type { Currency } from '../domain/types'

/**
 * Moedas ficticiamente suportadas. As taxas (perUsd) são DEMONSTRATIVAS e inventadas:
 * não refletem nenhum mercado real. Edite este arquivo para ampliar/alterar a lista.
 */
export const CURRENCIES: Currency[] = [
  { code: 'BRL', name: 'Real brasileiro', decimals: 2, perUsd: 5.0 },
  { code: 'UAH', name: 'Hryvnia ucraniana', decimals: 2, perUsd: 40.0 },
  { code: 'USD', name: 'Dólar americano', decimals: 2, perUsd: 1.0 },
  { code: 'EUR', name: 'Euro', decimals: 2, perUsd: 0.9 },
  { code: 'GBP', name: 'Libra esterlina', decimals: 2, perUsd: 0.78 },
  { code: 'PLN', name: 'Zloty polonês', decimals: 2, perUsd: 4.0 },
  { code: 'ARS', name: 'Peso argentino', decimals: 2, perUsd: 1000.0 },
  { code: 'CAD', name: 'Dólar canadense', decimals: 2, perUsd: 1.35 },
  { code: 'MXN', name: 'Peso mexicano', decimals: 2, perUsd: 18.0 },
  { code: 'JPY', name: 'Iene japonês', decimals: 0, perUsd: 150.0 },
]

export function getCurrency(code: string): Currency {
  const c = CURRENCIES.find((x) => x.code === code)
  if (!c) throw new Error(`Moeda não suportada no protótipo: ${code}`)
  return c
}
