import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { getCountry } from '../data/countries'
import { formatMoney, formatRate } from '../domain/money'
import { STATUS_LABEL } from '../domain/transfer'
import type { Party, Quote, Transfer, TransferStatus } from '../domain/types'

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name
    .replace(/\(.*\)/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials}
    </span>
  )
}

const STATUS_ICON: Record<TransferStatus, string> = { pending: '◔', processed: '◑', completed: '✓', failed: '✕' }

export function StatusBadge({ status }: { status: TransferStatus }) {
  return (
    <span className={`badge badge-${status}`}>
      <span aria-hidden="true">{STATUS_ICON[status]}</span> {STATUS_LABEL[status]}
    </span>
  )
}

const STEPS = ['Destinatário', 'Valor', 'Revisão', 'Pagamento']

export function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="stepper" aria-label="Etapas do envio">
      {STEPS.map((label, i) => {
        const n = i + 1
        const state = n < current ? 'done' : n === current ? 'current' : 'todo'
        return (
          <li key={label} className={`step step-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="step-n">{n}</span>
            <span className="step-label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function PartyLine({ party }: { party: Party }) {
  return (
    <span className="party">
      <Avatar name={party.name} />
      <span>
        <strong>{party.name}</strong>
        <small>{party.userCode} · {getCountry(party.country).name}</small>
      </span>
    </span>
  )
}

export function CostBreakdown({ quote, from, to, heading = 'Quanto vai custar' }: { quote: Quote; from: string; to: string; heading?: string }) {
  return (
    <section className="card cost" aria-label={heading}>
      <h2>{heading}</h2>
      <dl>
        <div><dt>Valor enviado</dt><dd>{formatMoney(quote.sendMinor, from)}</dd></div>
        <div><dt>Tarifa simulada</dt><dd>{formatMoney(quote.feeMinor, from)}</dd></div>
        <div className="total"><dt>Total a pagar</dt><dd>{formatMoney(quote.totalMinor, from)}</dd></div>
        <div><dt>Câmbio fictício</dt><dd>1 {from} = {formatRate(quote.rate)} {to}</dd></div>
        <div className="receive"><dt>Valor estimado a receber</dt><dd>{formatMoney(quote.receiveMinor, to)}</dd></div>
      </dl>
      <p className="hint">Câmbio e tarifas são demonstrativos (inventados). A conversão é feita direto de {from} para {to}.</p>
    </section>
  )
}

export function QrCode({ value, size = 200, label }: { value: string; size?: number; label: string }) {
  const { n, d } = useMemo(() => {
    const m = QRCode.create(value, { errorCorrectionLevel: 'M' }).modules
    const q = 2
    let path = ''
    for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.get(r, c)) path += `M${c + q} ${r + q}h1v1h-1z`
    return { n: m.size + q * 2, d: path }
  }, [value])
  return (
    <svg className="qr" viewBox={`0 0 ${n} ${n}`} width={size} height={size} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      <path d={d} fill="#12231f" />
    </svg>
  )
}

const dateFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })
export const formatDate = (ms: number) => dateFmt.format(ms)

export function TransferList({ transfers, empty }: { transfers: Transfer[]; empty: ReactNode }) {
  if (transfers.length === 0) return <p className="empty">{empty}</p>
  return (
    <ul className="tlist">
      {transfers.map((t) => {
        const sent = t.direction === 'sent'
        return (
          <li key={t.id}>
            <Link to={`/transferencias/${t.id}`} className="trow">
              <Avatar name={t.counterparty.name} />
              <span className="trow-main">
                <strong>{sent ? 'Para' : 'De'} {t.counterparty.name}</strong>
                <small>{sent ? 'Enviada' : 'Recebida'} · {formatDate(t.createdAt)}</small>
              </span>
              <span className="trow-amount">
                <strong className={sent ? 'out' : 'in'}>
                  {sent ? '−' : '+'}
                  {formatMoney(sent ? t.totalMinor : t.receiveMinor, sent ? t.originCurrency : t.destinationCurrency)}
                </strong>
                <StatusBadge status={t.status} />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
