import type { Party } from '../domain/types'

/** Usuário "dono" do protótipo (fictício). */
export const ME: Party = { name: 'Você (conta demo)', userCode: 'FLX-ME0001', country: 'BR' }
export const INITIAL_BALANCE_BRL_MINOR = 250000 // R$ 2.500,00 demonstrativos

/** Contatos fictícios (aparecem na tela inicial e na seleção de destinatário). Nomes e códigos inventados. */
export const CONTACTS: Party[] = [
  { name: 'Oleksandr Gulenko', userCode: 'FLX-UA4821', country: 'UA' },
  { name: 'Maria Silva', userCode: 'FLX-BR7310', country: 'BR' },
  { name: 'John Carter', userCode: 'FLX-US2095', country: 'US' },
  { name: 'Anna Kowalska', userCode: 'FLX-PL5568', country: 'PL' },
  { name: 'Hiro Tanaka', userCode: 'FLX-JP9042', country: 'JP' },
  { name: 'Sofía Fernández', userCode: 'FLX-AR1187', country: 'AR' },
]

/** Outros usuários fictícios, localizáveis só pelo código (ou QR) — não são contatos. */
export const EXTRA_DIRECTORY: Party[] = [
  { name: 'Emma Wilson', userCode: 'FLX-GB6203', country: 'GB' },
  { name: 'Lucas Becker', userCode: 'FLX-DE3374', country: 'DE' },
  { name: 'Inês Carvalho', userCode: 'FLX-PT8815', country: 'PT' },
]

export const DIRECTORY: Party[] = [...CONTACTS, ...EXTRA_DIRECTORY]
