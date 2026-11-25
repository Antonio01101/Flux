import { Link, useParams } from 'react-router-dom'
import { RECEIPT_DISCLAIMER, buildReceiptRows, receiptToText } from '../domain/receipt'
import { useTransfers } from '../store/TransfersProvider'

export function Receipt() {
  const { id } = useParams()
  const { getTransfer } = useTransfers()
  const t = id ? getTransfer(id) : undefined

  if (!t) {
    return (
      <>
        <h1>Comprovante não encontrado</h1>
        <Link className="btn secondary" to="/transferencias">Ir ao histórico</Link>
      </>
    )
  }

  const download = () => {
    const blob = new Blob([receiptToText(t)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comprovante-ficticio-${t.reference}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <h1 className="no-print">Comprovante fictício</h1>
      <article className="receipt" aria-label="Comprovante fictício">
        <div className="watermark" aria-hidden="true">FICTÍCIO</div>
        <header>
          <strong className="brand-inline">Flux</strong>
          <span>Protótipo acadêmico</span>
        </header>
        <p className="disclaimer">{RECEIPT_DISCLAIMER}</p>
        <dl>
          {buildReceiptRows(t).map((r) => (
            <div key={r.label}><dt>{r.label}</dt><dd>{r.value}</dd></div>
          ))}
        </dl>
      </article>
      <div className="actions no-print">
        <Link className="btn ghost" to={`/transferencias/${t.id}`}>Voltar aos detalhes</Link>
        <button type="button" className="btn secondary" onClick={download}>Baixar (.txt)</button>
        <button type="button" className="btn primary" onClick={() => window.print()}>Imprimir / salvar PDF</button>
      </div>
    </>
  )
}
