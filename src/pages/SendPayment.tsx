import { useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { parseAmountInput, formatMoney } from '../domain/money'
import { getQuote, validateAmount } from '../domain/quote'
import { PAYMENT_LABEL, balanceCovers, createSentTransfer } from '../domain/transfer'
import type { PaymentMethod } from '../domain/types'
import { Stepper } from '../components/ui'
import { useSendDraft } from '../store/SendDraft'
import { useTransfers } from '../store/TransfersProvider'

const OPTIONS: { id: PaymentMethod; hint: string }[] = [
  { id: 'googlepay', hint: 'Simulação local. O Google Pay não é acionado e nenhum cartão é lido.' },
  { id: 'pix', hint: 'Simulação local. Nenhuma chave Pix é solicitada e nenhum pagamento é feito.' },
  { id: 'balance', hint: 'Usa o saldo fictício do protótipo.' },
]

export function SendPayment() {
  const { draft, update, reset } = useSendDraft()
  const { transfers, balanceMinor, addTransfer } = useTransfers()
  const navigate = useNavigate()
  const done = useRef(false)
  const { recipient, originCurrency: from, destinationCurrency: to } = draft
  const minor = parseAmountInput(draft.amountText, from)

  if (done.current) return null
  if (!recipient) return <Navigate to="/enviar" replace />
  if (validateAmount(minor, from) || minor === null || draft.originCountry === draft.destinationCountry) return <Navigate to="/enviar/valor" replace />

  const quote = getQuote(from, to, minor)
  const covers = balanceCovers(transfers, quote.totalMinor, from)
  const blocked = draft.paymentMethod === 'balance' && !covers

  const confirm = () => {
    if (blocked) return
    const t = createSentTransfer({
      recipient,
      originCountry: draft.originCountry,
      destinationCountry: draft.destinationCountry,
      originCurrency: from,
      destinationCurrency: to,
      sendMinor: minor,
      paymentMethod: draft.paymentMethod,
      simulateFailure: draft.simulateFailure,
    })
    done.current = true
    addTransfer(t)
    navigate(`/transferencias/${t.id}`, { replace: true, state: { created: true } })
    reset()
  }

  return (
    <>
      <h1>Forma de pagamento</h1>
      <Stepper current={4} />
      <p className="lead">
        Confirme como você “pagaria” <strong>{formatMoney(quote.totalMinor, from)}</strong>. Tudo aqui é simulado.
      </p>

      <fieldset className="card radios">
        <legend>Escolha uma forma de pagamento simulada</legend>
        {OPTIONS.map((o) => (
          <label key={o.id} className={draft.paymentMethod === o.id ? 'radio on' : 'radio'}>
            <input type="radio" name="pm" value={o.id} checked={draft.paymentMethod === o.id} onChange={() => update({ paymentMethod: o.id })} />
            <span>
              <strong>{PAYMENT_LABEL[o.id]}</strong>
              <small>
                {o.id === 'balance' ? `Disponível: ${formatMoney(balanceMinor, 'BRL')}. ` : ''}
                {o.hint}
              </small>
            </span>
          </label>
        ))}
      </fieldset>
      {blocked && <p className="error" role="alert">Saldo demonstrativo insuficiente. Escolha outra forma de pagamento simulada.</p>}

      <details className="card demo-opts">
        <summary>Opções de demonstração</summary>
        <label className="check">
          <input type="checkbox" checked={draft.simulateFailure} onChange={(e) => update({ simulateFailure: e.target.checked })} />
          Simular falha nesta transferência (para ver o estado de erro)
        </label>
      </details>

      <p className="notice">Ao confirmar, será criada apenas uma operação fictícia neste navegador. Não há cobrança, banco ou serviço externo envolvido.</p>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => navigate('/enviar/revisao')}>Voltar</button>
        <button type="button" className="btn primary" disabled={blocked} onClick={confirm}>Confirmar transferência simulada</button>
      </div>
    </>
  )
}
