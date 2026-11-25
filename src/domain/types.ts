export interface Currency {
  code: string
  name: string
  /** casas decimais usadas nos valores (JPY = 0) */
  decimals: number
  /** taxa FICTÍCIA: quantas unidades desta moeda valem 1 USD na simulação */
  perUsd: number
}

export interface Country {
  code: string
  name: string
  /** moeda padrão do país (o usuário pode escolher outra moeda suportada) */
  currency: string
}

export interface Party {
  name: string
  userCode: string
  country: string
}

export type TransferStatus = 'pending' | 'processed' | 'completed' | 'failed'
export type Direction = 'sent' | 'received'
export type PaymentMethod = 'balance' | 'pix' | 'googlepay'

/** Valores monetários ficam em unidades menores (inteiros) para evitar erros de ponto flutuante. */
export interface Transfer {
  id: string
  reference: string
  direction: Direction
  status: TransferStatus
  /** destinatário (enviadas) ou remetente (recebidas) */
  counterparty: Party
  originCountry: string
  destinationCountry: string
  originCurrency: string
  destinationCurrency: string
  sendMinor: number
  feeMinor: number
  /** sendMinor + feeMinor, na moeda de origem */
  totalMinor: number
  receiveMinor: number
  rate: number
  /** só para enviadas */
  paymentMethod?: PaymentMethod
  simulateFailure?: boolean
  createdAt: number
  processedAt?: number
  completedAt?: number
  failedAt?: number
  failureReason?: string
}

export interface Quote {
  rate: number
  sendMinor: number
  feeMinor: number
  totalMinor: number
  receiveMinor: number
}
