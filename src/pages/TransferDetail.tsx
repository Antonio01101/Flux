import { Link, useLocation, useParams } from 'react-router-dom'
import { getCountry } from '../data/countries'
import { formatMoney, formatRate } from '../domain/money'
import { PAYMENT_LABEL, STATUS_HELP, timeline } from '../domain/transfer'
import { PartyLine, StatusBadge, formatDate } from '../components/ui'
import { useTransfers } from '../store/TransfersProvider'

export function TransferDetail() {
  const { id } = useParams()
  const { getTransfer } = useTransfers()
  const { state } = useLocation() as { state: { created?: boolean } | null }
  const t = id ? getTransfer(id) : undefined

  if (!t) {
    return (
      <>
        <h1>Transferência não encontrada</h1>
        <p>Esse registro não existe neste navegador (os dados fictícios ficam só aqui).</p>
        <Link className="btn secondary" to="/transferencias">Ir ao histórico</Link>
      </>
    )
  }
  const sent = t.direction === 'sent'

  return (
    <>
      <h1>{sent ? 'Transferência enviada' : 'Transferência recebida'}</h1>
      {state?.created && (
        <p className="notice ok" role="status">Operação simulada criada. Nenhum dinheiro real foi movimentado.</p>
      )}

      <section className={`card status status-${t.status}`} aria-live="polite">
        <StatusBadge status={t.status} />
        <p>{STATUS_HELP[t.status]}</p>
        {t.status === 'failed' && t.failureReason && <p><em>{t.failureReason}</em></p>}
        <ol className="timeline">
          {timeline(t).map((e) => (
            <li key={e.label}><strong>{e.label}</strong> <small>{formatDate(e.at)}</small></li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2>{sent ? 'Destinatário' : 'Remetente'}</h2>
        <PartyLine party={t.counterparty} />
        <dl className="kv">
          <div><dt>Referência</dt><dd>{t.reference}</dd></div>
          <div><dt>Origem → destino</dt><dd>{getCountry(t.originCountry).name} → {getCountry(t.destinationCountry).name}</dd></div>
          <div><dt>{sent ? 'Valor enviado' : 'Valor enviado pelo remetente'}</dt><dd>{formatMoney(t.sendMinor, t.originCurrency)}</dd></div>
          <div><dt>Tarifa simulada</dt><dd>{formatMoney(t.feeMinor, t.originCurrency)}</dd></div>
          <div><dt>Total pago</dt><dd>{formatMoney(t.totalMinor, t.originCurrency)}</dd></div>
          <div><dt>Câmbio fictício</dt><dd>1 {t.originCurrency} = {formatRate(t.rate)} {t.destinationCurrency}</dd></div>
          <div className="receive"><dt>{sent ? 'Valor estimado a receber' : 'Valor recebido'}</dt><dd>{formatMoney(t.receiveMinor, t.destinationCurrency)}</dd></div>
          {sent && t.paymentMethod && <div><dt>Forma de pagamento</dt><dd>{PAYMENT_LABEL[t.paymentMethod]}</dd></div>}
        </dl>
        {!sent && <p className="hint">Recebimento simulado: nenhuma ação adicional é necessária e nenhum valor real foi encaminhado.</p>}
      </section>

      <div className="actions">
        <Link className="btn ghost" to="/transferencias">Histórico</Link>
        <Link className="btn primary" to={`/transferencias/${t.id}/comprovante`}>Ver comprovante fictício</Link>
      </div>
    </>
  )
}
