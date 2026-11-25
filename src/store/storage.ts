import type { Transfer } from '../domain/types'

export const STORAGE_KEY = 'flux.prototype.v1.transfers'

function isTransfer(x: unknown): x is Transfer {
  const t = x as Transfer
  return !!t && typeof t.id === 'string' && typeof t.reference === 'string' && (t.direction === 'sent' || t.direction === 'received') && typeof t.sendMinor === 'number'
}

/** Lê os registros fictícios do navegador. Retorna null se não houver nada (ou se o storage falhar). */
export function loadTransfers(): Transfer[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isTransfer) : null
  } catch {
    return null
  }
}

export function saveTransfers(transfers: Transfer[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transfers))
  } catch {
    /* storage indisponível (modo privado etc.): o app continua funcionando só em memória */
  }
}
