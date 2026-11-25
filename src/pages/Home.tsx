import { Link, useNavigate } from 'react-router-dom'
import { CONTACTS } from '../data/contacts'
import { formatMoney } from '../domain/money'
import { Avatar, TransferList } from '../components/ui'
import { useSendDraft } from '../store/SendDraft'
import { useTransfers } from '../store/TransfersProvider'

export function Home() {
  const { balanceMinor, transfers } = useTransfers()
  const { chooseRecipient, reset } = useSendDraft()
  const navigate = useNavigate()

  return (
    <>
      <header className="topbar">
        <h1 className="sr-only">Início</h1>
        <Link to="/ajuda" className="help-link">Contato e ajuda</Link>
        <span className="me" aria-hidden="true"><Avatar name="Voce Demo" size={36} /></span>
      </header>

      <section className="hero" aria-label="Saldo">
        <p>Saldo demonstrativo</p>
        <strong className="balance">{formatMoney(balanceMinor, 'BRL')}</strong>
        <small>Valor fictício — não é dinheiro real</small>
      </section>

      <section aria-labelledby="contacts-h">
        <h2 id="contacts-h">Contatos</h2>
        <ul className="contacts">
          {CONTACTS.map((c) => (
            <li key={c.userCode}>
              <button type="button" onClick={() => { reset(); chooseRecipient(c); navigate('/enviar/valor') }} aria-label={`Enviar para ${c.name}`}>
                <Avatar name={c.name} size={52} />
                <span>{c.name.split(' ')[0]}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Ações">
        <ul className="actions-grid">
          <li><Link to="/enviar" onClick={reset}><b>Enviar</b><small>Transferência internacional</small></Link></li>
          <li><Link to="/receber"><b>Receber</b><small>Meu código e QR</small></Link></li>
          <li><Link to="/enviar" onClick={reset} state={{ tab: 'qr' }}><b>Ler QR</b><small>Identificar por QR simulado</small></Link></li>
          <li><Link to="/transferencias"><b>Histórico</b><small>Enviadas e recebidas</small></Link></li>
        </ul>
      </section>

      <section aria-labelledby="recent-h">
        <h2 id="recent-h">Últimas movimentações</h2>
        <TransferList transfers={transfers.slice(0, 3)} empty="Nenhuma movimentação ainda." />
        <p><Link to="/transferencias">Ver todas</Link></p>
      </section>
    </>
  )
}
