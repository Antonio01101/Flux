import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CONTACTS, ME } from '../data/contacts'
import { getCountry } from '../data/countries'
import { convertMinor } from '../domain/money'
import { advanceTransfer, buildSeed, computeBalance, createReceivedTransfer } from '../domain/transfer'
import type { Transfer } from '../domain/types'
import { loadTransfers, saveTransfers } from './storage'

interface TransfersContextValue {
  transfers: Transfer[]
  balanceMinor: number
  addTransfer: (t: Transfer) => void
  getTransfer: (id: string) => Transfer | undefined
  /** Cria uma transferência recebida de demonstração. */
  simulateIncoming: () => Transfer
  resetDemoData: () => void
}

const Ctx = createContext<TransfersContextValue | null>(null)

/** Valores de demonstração, em dólares fictícios (convertidos para a moeda do remetente). */
const DEMO_AMOUNTS_USD = [25, 60, 15, 90, 40]

export function TransfersProvider({ children, tickMs = 500 }: { children: ReactNode; tickMs?: number }) {
  const [transfers, setTransfers] = useState<Transfer[]>(() => {
    const stored = loadTransfers()
    const base = stored ?? buildSeed()
    // Ao reabrir o app, atualiza o que já deveria ter avançado.
    const now = Date.now()
    return base.map((t) => advanceTransfer(t, now))
  })
  const counter = useRef(0)

  useEffect(() => {
    saveTransfers(transfers)
  }, [transfers])

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      setTransfers((prev) => {
        let changed = false
        const next = prev.map((t) => {
          const n = advanceTransfer(t, now)
          if (n !== t) changed = true
          return n
        })
        return changed ? next : prev
      })
    }, tickMs)
    return () => clearInterval(id)
  }, [tickMs])

  const addTransfer = useCallback((t: Transfer) => setTransfers((prev) => [t, ...prev]), [])

  const simulateIncoming = useCallback(() => {
    const senders = CONTACTS.filter((c) => c.country !== ME.country)
    const sender = senders[counter.current % senders.length]
    const usd = DEMO_AMOUNTS_USD[counter.current % DEMO_AMOUNTS_USD.length]
    counter.current += 1
    const currency = getCountry(sender.country).currency
    const t = createReceivedTransfer(sender, convertMinor(usd * 100, 'USD', currency), currency)
    setTransfers((prev) => [t, ...prev])
    return t
  }, [])

  const resetDemoData = useCallback(() => setTransfers(buildSeed()), [])

  const value = useMemo<TransfersContextValue>(
    () => ({
      transfers,
      balanceMinor: computeBalance(transfers),
      addTransfer,
      getTransfer: (id: string) => transfers.find((t) => t.id === id),
      simulateIncoming,
      resetDemoData,
    }),
    [transfers, addTransfer, simulateIncoming, resetDemoData],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTransfers(): TransfersContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTransfers precisa estar dentro de <TransfersProvider>')
  return v
}
