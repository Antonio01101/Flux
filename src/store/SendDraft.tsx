import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { getCountry } from '../data/countries'
import { ME } from '../data/contacts'
import type { Party, PaymentMethod } from '../domain/types'

export interface Draft {
  recipient: Party | null
  originCountry: string
  destinationCountry: string
  originCurrency: string
  destinationCurrency: string
  amountText: string
  paymentMethod: PaymentMethod
  simulateFailure: boolean
}

export function emptyDraft(): Draft {
  return {
    recipient: null,
    originCountry: ME.country,
    destinationCountry: 'UA',
    originCurrency: getCountry(ME.country).currency,
    destinationCurrency: getCountry('UA').currency,
    amountText: '',
    paymentMethod: 'googlepay',
    simulateFailure: false,
  }
}

interface Value {
  draft: Draft
  update: (patch: Partial<Draft>) => void
  /** Define o destinatário e ajusta país/moeda de destino para os dele (o usuário pode mudar depois). */
  chooseRecipient: (p: Party) => void
  reset: () => void
}

const Ctx = createContext<Value | null>(null)

export function SendDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const value = useMemo<Value>(
    () => ({
      draft,
      update: (patch) => setDraft((d) => ({ ...d, ...patch })),
      chooseRecipient: (p) =>
        setDraft((d) => ({ ...d, recipient: p, destinationCountry: p.country, destinationCurrency: getCountry(p.country).currency })),
      reset: () => setDraft(emptyDraft()),
    }),
    [draft],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSendDraft(): Value {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSendDraft precisa estar dentro de <SendDraftProvider>')
  return v
}
