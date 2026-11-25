import { Navigate, useNavigate } from 'react-router-dom'
import { getCountry } from '../data/countries'
import { formatMoney, parseAmountInput } from '../domain/money'
import { getQuote, validateAmount } from '../domain/quote'
import { CostBreakdown, PartyLine, Stepper } from '../components/ui'
import { useSendDraft } from '../store/SendDraft'

export function SendReview() {
  const { draft } = useSendDraft()
  const navigate = useNavigate()
  const { recipient, originCurrency: from, destinationCurrency: to } = draft
  const minor = parseAmountInput(draft.amountText, from)
  if (!recipient) return <Navigate to="/enviar" replace />
  if (validateAmount(minor, from) || minor === null || draft.originCountry === draft.destinationCountry) return <Navigate to="/enviar/valor" replace />
  const quote = getQuote(from, to, minor)

  return (
    <>
      <h1>Revise antes de confirmar</h1>
      <Stepper current={3} />
      <section className="card review" aria-label="Resumo da operação">
        <p className="big">
          Você está enviando <strong>{formatMoney(minor, from)}</strong> ({from} → {to}) para
        </p>
        <PartyLine party={recipient} />
        <dl className="kv">
          <div><dt>País de origem</dt><dd>{getCountry(draft.originCountry).name}</dd></div>
          <div><dt>País de destino</dt><dd>{getCountry(draft.destinationCountry).name}</dd></div>
        </dl>
      </section>
      <CostBreakdown quote={quote} from={from} to={to} />
      <p className="notice">Nada será cobrado de verdade. Na simulação, o processamento leva poucos segundos. A meta de “até 4 horas” do conceito Flux não é implementada nem comprovada neste protótipo.</p>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => navigate('/enviar/valor')}>Editar</button>
        <button type="button" className="btn primary" onClick={() => navigate('/enviar/pagamento')}>Continuar para pagamento</button>
      </div>
    </>
  )
}
