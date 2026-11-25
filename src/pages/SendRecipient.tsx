import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CONTACTS, DIRECTORY } from '../data/contacts'
import { qrPayload, resolveRecipient } from '../domain/recipient'
import type { Party } from '../domain/types'
import { PartyLine, QrCode, Stepper } from '../components/ui'
import { useSendDraft } from '../store/SendDraft'

type Mode = 'contacts' | 'code' | 'qr'

export function SendRecipient() {
  const { draft, chooseRecipient } = useSendDraft()
  const navigate = useNavigate()
  const location = useLocation() as { state: { tab?: Mode } | null }
  const [mode, setMode] = useState<Mode>(location.state?.tab ?? 'contacts')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pasted, setPasted] = useState('')
  const selected = draft.recipient

  const lookup = (value: string) => {
    const r = resolveRecipient(value)
    if (r.ok) {
      chooseRecipient(r.party)
      setError(null)
    } else {
      setError(r.error)
    }
  }

  const tabs: { id: Mode; label: string }[] = [
    { id: 'contacts', label: 'Contatos' },
    { id: 'code', label: 'Código de usuário' },
    { id: 'qr', label: 'QR Code' },
  ]

  return (
    <>
      <h1>Para quem você quer enviar?</h1>
      <Stepper current={1} />
      <p className="lead">Escolha um contato fictício, digite um código de usuário ou use um QR Code de demonstração. Não pedimos dados bancários, documentos nem senhas.</p>

      <div className="tabs" role="group" aria-label="Como identificar o destinatário">
        {tabs.map((t) => (
          <button key={t.id} type="button" className={mode === t.id ? 'tab on' : 'tab'} aria-pressed={mode === t.id} onClick={() => { setMode(t.id); setError(null) }}>
            {t.label}
          </button>
        ))}
      </div>

      {mode === 'contacts' && (
        <ul className="plist">
          {CONTACTS.map((c) => (
            <li key={c.userCode}>
              <button type="button" className={selected?.userCode === c.userCode ? 'pick on' : 'pick'} aria-pressed={selected?.userCode === c.userCode} onClick={() => chooseRecipient(c)}>
                <PartyLine party={c} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {mode === 'code' && (
        <form className="card" onSubmit={(e) => { e.preventDefault(); lookup(code) }}>
          <label htmlFor="code">Código de usuário</label>
          <div className="inline">
            <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="FLX-UA4821" autoComplete="off" autoCapitalize="characters" aria-describedby="code-help code-error" aria-invalid={error ? true : undefined} />
            <button type="submit" className="btn secondary">Buscar</button>
          </div>
          <p id="code-help" className="hint">Códigos de demonstração: {DIRECTORY.slice(0, 3).map((p) => p.userCode).join(', ')}…</p>
        </form>
      )}

      {mode === 'qr' && (
        <section className="card">
          <h2>Ler QR Code (simulado)</h2>
          <p className="hint">Nenhuma câmera é usada. Escolha um QR de demonstração abaixo ou cole o conteúdo de um QR. O QR Code só representa o código do usuário: ele não garante privacidade nem segurança.</p>
          <ul className="qrlist">
            {DIRECTORY.slice(0, 4).map((p) => (
              <li key={p.userCode}>
                <QrCode value={qrPayload(p.userCode)} size={96} label={`QR Code de demonstração de ${p.name}`} />
                <span>{p.name}</span>
                <button type="button" className="btn secondary small" onClick={() => lookup(qrPayload(p.userCode))}>Simular leitura</button>
              </li>
            ))}
          </ul>
          <label htmlFor="qrtext">Ou cole o conteúdo do QR</label>
          <div className="inline">
            <input id="qrtext" value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="flux-demo://usuario/FLX-UA4821" autoComplete="off" aria-describedby="code-error" aria-invalid={error ? true : undefined} />
            <button type="button" className="btn secondary" onClick={() => lookup(pasted)}>Usar</button>
          </div>
        </section>
      )}

      <p id="code-error" className="error" role="alert">{error}</p>

      {selected && (
        <section className="card selected" aria-live="polite">
          <h2>Destinatário escolhido</h2>
          <PartyLine party={selected as Party} />
        </section>
      )}

      <div className="actions">
        <button type="button" className="btn primary" disabled={!selected} onClick={() => navigate('/enviar/valor')}>
          Continuar
        </button>
      </div>
    </>
  )
}
