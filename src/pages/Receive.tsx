import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ME } from '../data/contacts'
import { qrPayload } from '../domain/recipient'
import { QrCode, TransferList } from '../components/ui'
import { useTransfers } from '../store/TransfersProvider'

export function Receive() {
  const { transfers, simulateIncoming } = useTransfers()
  const navigate = useNavigate()
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null)
  const received = transfers.filter((t) => t.direction === 'received')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ME.userCode)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
  }

  return (
    <>
      <h1>Receber</h1>
      <p className="lead">Compartilhe seu código ou QR Code de demonstração. Ninguém precisa saber dados bancários.</p>

      <section className="card receive-card">
        <QrCode value={qrPayload(ME.userCode)} size={168} label={`QR Code de demonstração do código ${ME.userCode}`} />
        <div>
          <p className="hint">Seu código de usuário (fictício)</p>
          <p className="code">{ME.userCode}</p>
          <button type="button" className="btn secondary small" onClick={copy}>Copiar código</button>
          <p role="status" className="hint">
            {copied === 'ok' && 'Código copiado.'}
            {copied === 'fail' && 'Não foi possível copiar automaticamente. Selecione e copie o código acima.'}
          </p>
          <p className="hint">O QR Code apenas representa o código. Ele não garante privacidade nem segurança.</p>
        </div>
      </section>

      <section className="card">
        <h2>Simular um recebimento</h2>
        <p className="hint">Cria uma transferência recebida fictícia de um remetente de demonstração. Ação apenas simulada: nenhum valor real é encaminhado.</p>
        <button type="button" className="btn primary" onClick={() => { const t = simulateIncoming(); navigate(`/transferencias/${t.id}`) }}>
          Simular recebimento de demonstração
        </button>
      </section>

      <h2>Transferências recebidas</h2>
      <TransferList transfers={received} empty="Você ainda não recebeu nenhuma transferência." />
    </>
  )
}
