import { useState } from 'react'
import { STATUS_LABEL } from '../domain/transfer'
import type { Direction, TransferStatus } from '../domain/types'
import { TransferList } from '../components/ui'
import { useTransfers } from '../store/TransfersProvider'

export function History() {
  const { transfers } = useTransfers()
  const [dir, setDir] = useState<Direction | 'all'>('all')
  const [status, setStatus] = useState<TransferStatus | 'all'>('all')

  const list = transfers.filter((t) => (dir === 'all' || t.direction === dir) && (status === 'all' || t.status === status))
  const tabs: { id: Direction | 'all'; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'sent', label: 'Enviadas' },
    { id: 'received', label: 'Recebidas' },
  ]

  return (
    <>
      <h1>Histórico</h1>
      <p className="lead">Registros fictícios guardados só neste navegador.</p>
      <div className="filters">
        <div className="tabs" role="group" aria-label="Tipo de movimentação">
          {tabs.map((t) => (
            <button key={t.id} type="button" className={dir === t.id ? 'tab on' : 'tab'} aria-pressed={dir === t.id} onClick={() => setDir(t.id)}>{t.label}</button>
          ))}
        </div>
        <div>
          <label htmlFor="st" className="sr-only">Filtrar por situação</label>
          <select id="st" value={status} onChange={(e) => setStatus(e.target.value as TransferStatus | 'all')}>
            <option value="all">Todas as situações</option>
            {(Object.keys(STATUS_LABEL) as TransferStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
      </div>
      <TransferList transfers={list} empty="Nenhuma movimentação encontrada com esses filtros." />
    </>
  )
}
