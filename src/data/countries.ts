import type { Country } from '../domain/types'

/**
 * Países ficticiamente suportados. Estar nesta lista NÃO significa que exista
 * disponibilidade real de transferência. Edite o arquivo para ampliar a lista.
 */
export const COUNTRIES: Country[] = [
  { code: 'BR', name: 'Brasil', currency: 'BRL' },
  { code: 'UA', name: 'Ucrânia', currency: 'UAH' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD' },
  { code: 'PT', name: 'Portugal', currency: 'EUR' },
  { code: 'DE', name: 'Alemanha', currency: 'EUR' },
  { code: 'GB', name: 'Reino Unido', currency: 'GBP' },
  { code: 'PL', name: 'Polônia', currency: 'PLN' },
  { code: 'AR', name: 'Argentina', currency: 'ARS' },
  { code: 'CA', name: 'Canadá', currency: 'CAD' },
  { code: 'MX', name: 'México', currency: 'MXN' },
  { code: 'JP', name: 'Japão', currency: 'JPY' },
]

export function getCountry(code: string): Country {
  const c = COUNTRIES.find((x) => x.code === code)
  if (!c) throw new Error(`País não suportado no protótipo: ${code}`)
  return c
}
