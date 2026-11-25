import { Navigate, useNavigate } from 'react-router-dom'
import { COUNTRIES, getCountry } from '../data/countries'
import { CURRENCIES, getCurrency } from '../data/currencies'
import { parseAmountInput } from '../domain/money'
import { getQuote, validateAmount } from '../domain/quote'
import { CostBreakdown, PartyLine, Stepper } from '../components/ui'
import { useSendDraft } from '../store/SendDraft'

export function SendAmount() {
  const { draft, update } = useSendDraft()
  const navigate = useNavigate()
  if (!draft.recipient) return <Navigate to="/enviar" replace />

  const { originCurrency: from, destinationCurrency: to } = draft
  const minor = parseAmountInput(draft.amountText, from)
  const touched = draft.amountText.trim() !== ''
  const sameCountry = draft.originCountry === draft.destinationCountry
  const amountError = touched ? validateAmount(minor, from) : null
  const valid = touched && !amountError && !sameCountry
  const quote = valid && minor !== null ? getQuote(from, to, minor) : null

  return (
    <>
      <h1>Quanto você quer enviar?</h1>
      <Stepper current={2} />
      <p className="lead"><PartyLine party={draft.recipient} /></p>

      <form className="card form" onSubmit={(e) => { e.preventDefault(); if (valid) navigate('/enviar/revisao') }} noValidate>
        <fieldset>
          <legend>De onde você envia</legend>
          <div className="grid2">
            <div>
              <label htmlFor="oc">País de origem</label>
              <select id="oc" value={draft.originCountry} onChange={(e) => update({ originCountry: e.target.value, originCurrency: getCountry(e.target.value).currency })}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ocur">Moeda de origem</label>
              <select id="ocur" value={from} onChange={(e) => update({ originCurrency: e.target.value })}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        <div className="swap">
          <button type="button" className="btn secondary small" onClick={() => update({ originCurrency: to, destinationCurrency: from })} aria-label={`Inverter moedas: ${from} e ${to}`}>
            {from} ⇄ {to}
          </button>
        </div>

        <fieldset>
          <legend>Para onde vai</legend>
          <div className="grid2">
            <div>
              <label htmlFor="dc">País de destino</label>
              <select id="dc" value={draft.destinationCountry} onChange={(e) => update({ destinationCountry: e.target.value, destinationCurrency: getCountry(e.target.value).currency })}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="dcur">Moeda de destino</label>
              <select id="dcur" value={to} onChange={(e) => update({ destinationCurrency: e.target.value })}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
          </div>
        </fieldset>
        {sameCountry && <p className="error" role="alert">Escolha países de origem e destino diferentes.</p>}
        {draft.destinationCountry === 'UA' && (
          <p className="hint">A Ucrânia aparece como exemplo demonstrativo de cobertura. Isso não indica disponibilidade real de envio nem ignora regras legais.</p>
        )}

        <label htmlFor="amount">Valor a enviar ({from})</label>
        <input
          id="amount"
          inputMode="decimal"
          autoComplete="off"
          placeholder={getCurrency(from).decimals ? '0,00' : '0'}
          value={draft.amountText}
          onChange={(e) => update({ amountText: e.target.value })}
          aria-invalid={amountError ? true : undefined}
          aria-describedby="amount-error"
        />
        <p id="amount-error" className="error" role="alert">{amountError}</p>

        <div aria-live="polite">
          {quote ? <CostBreakdown quote={quote} from={from} to={to} heading="Prévia do cálculo" /> : <p className="hint">Digite um valor para ver tarifas e quanto a pessoa deve receber.</p>}
        </div>

        <div className="actions">
          <button type="button" className="btn ghost" onClick={() => navigate('/enviar')}>Voltar</button>
          <button type="submit" className="btn primary" disabled={!valid}>Revisar</button>
        </div>
      </form>
    </>
  )
}
