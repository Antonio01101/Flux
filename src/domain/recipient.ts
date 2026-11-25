import { DIRECTORY, ME } from '../data/contacts'
import type { Party } from './types'

export const USER_CODE_REGEX = /^FLX-[A-Z0-9]{6}$/
const QR_PREFIX = 'flux-demo://usuario/'

/** Conteúdo que o QR Code demonstrativo de um usuário carrega. */
export function qrPayload(userCode: string): string {
  return `${QR_PREFIX}${userCode}`
}

/** Aceita um código de usuário ("flx-ua4821") ou o conteúdo de um QR demonstrativo. Retorna o código normalizado ou null. */
export function parseRecipientInput(input: string): string | null {
  let s = input.trim()
  if (s.toLowerCase().startsWith(QR_PREFIX)) s = s.slice(QR_PREFIX.length)
  s = s.replace(/\s/g, '').toUpperCase()
  return USER_CODE_REGEX.test(s) ? s : null
}

export type ResolveResult = { ok: true; party: Party } | { ok: false; error: string }

export function resolveRecipient(input: string, directory: Party[] = DIRECTORY): ResolveResult {
  if (input.trim() === '') return { ok: false, error: 'Digite um código de usuário, por exemplo FLX-UA4821.' }
  const code = parseRecipientInput(input)
  if (!code) return { ok: false, error: 'Código inválido. Ele começa com FLX- e tem 6 letras ou números (ex.: FLX-UA4821).' }
  if (code === ME.userCode) return { ok: false, error: 'Este é o seu próprio código. Escolha outra pessoa.' }
  const party = directory.find((p) => p.userCode === code)
  if (!party) return { ok: false, error: 'Código não encontrado no diretório de demonstração.' }
  return { ok: true, party }
}
