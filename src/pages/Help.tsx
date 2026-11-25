import { COUNTRIES } from '../data/countries'
import { CURRENCIES } from '../data/currencies'
import { FEE_FIXED_USD, FEE_PERCENT, MAX_USD, MIN_USD } from '../domain/quote'
import { formatRate } from '../domain/money'
import { getRate } from '../domain/quote'
import { useSendDraft } from '../store/SendDraft'
import { useTransfers } from '../store/TransfersProvider'

export function Help() {
  const { resetDemoData } = useTransfers()
  const { reset } = useSendDraft()
  return (
    <>
      <h1>Contato e ajuda</h1>
      <section className="card">
        <h2>O que é o Flux?</h2>
        <p>Flux é um <strong>protótipo acadêmico</strong> que simula o envio e o recebimento de dinheiro entre países. Todos os nomes, códigos, taxas, saldos e comprovantes são fictícios.</p>
        <ul>
          <li>Nenhum dinheiro real é movimentado, recebido ou guardado.</li>
          <li>Nenhum banco, gateway, API ou serviço financeiro externo é usado.</li>
          <li>Os registros ficam apenas neste navegador e não são oficiais nem sincronizados.</li>
          <li>Não há canal de suporte real: este protótipo não tem atendimento.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Perguntas frequentes</h2>
        <details><summary>Preciso informar dados bancários?</summary><p>Não. O destinatário é identificado por contato fictício, código de usuário ou QR Code de demonstração. Nunca peça nem digite dados bancários reais, documentos ou senhas.</p></details>
        <details><summary>Selecionar um país garante que o envio é possível?</summary><p>Não. A lista de países é demonstrativa. A Ucrânia aparece como exemplo da intenção de ampliar a cobertura representada na interface; isso não indica disponibilidade real, nem contorna sanções, controles cambiais ou restrições legais.</p></details>
        <details><summary>E a liquidação “em até 4 horas” e as parcerias em 9 países?</summary><p>São objetivos conceituais do projeto Flux. Este protótipo não os implementa nem comprova: a simulação termina em segundos e não há integrações.</p></details>
        <details><summary>O QR Code protege meus dados?</summary><p>Não automaticamente. Aqui ele só representa o código do usuário.</p></details>
      </section>

      <section className="card">
        <h2>Tarifas e limites (fictícios)</h2>
        <p>Tarifa simulada: {FEE_PERCENT * 100}% do valor + equivalente a US$ {FEE_FIXED_USD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Limite por operação: de US$ {MIN_USD} a US$ {MAX_USD.toLocaleString('pt-BR')} (equivalente).</p>
        <div className="table-wrap">
          <table>
            <caption>Moedas de demonstração e taxa fictícia por 1 BRL</caption>
            <thead><tr><th scope="col">Moeda</th><th scope="col">Nome</th><th scope="col">1 BRL =</th></tr></thead>
            <tbody>
              {CURRENCIES.map((c) => (
                <tr key={c.code}><th scope="row">{c.code}</th><td>{c.name}</td><td>{formatRate(getRate('BRL', c.code))} {c.code}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">Países de demonstração: {COUNTRIES.map((c) => c.name).join(', ')}.</p>
      </section>

      <section className="card">
        <h2>Dados de demonstração</h2>
        <p>Volta o histórico e o saldo ao estado inicial de exemplo.</p>
        <button type="button" className="btn secondary" onClick={() => { if (window.confirm('Restaurar os dados de demonstração? O histórico atual será apagado deste navegador.')) { resetDemoData(); reset() } }}>
          Restaurar dados de demonstração
        </button>
      </section>
    </>
  )
}
