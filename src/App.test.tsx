import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes, Providers } from './App'

function setup(path = '/') {
  const user = userEvent.setup({ delay: null })
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <Providers>
        <AppRoutes />
      </Providers>
    </MemoryRouter>,
  )
  return { user, ...utils }
}
const mainList = () => within(screen.getByRole('main')).getByRole('list')
const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms) })
const norm = (el: HTMLElement) => (el.textContent ?? '').replace(/\s/g, ' ')

beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: false }); vi.setSystemTime(new Date('2026-10-22T12:00:00')) })
afterEach(() => { vi.useRealTimers() })

async function sendUntilPayment(user: ReturnType<typeof userEvent.setup>, amount = '180') {
  await user.click(screen.getByRole('button', { name: /Oleksandr Gulenko/ }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.type(screen.getByLabelText(/Valor a enviar/), amount)
  await user.click(screen.getByRole('button', { name: 'Revisar' }))
  await user.click(screen.getByRole('button', { name: /Continuar para pagamento/ }))
}

describe('fluxo de envio completo', () => {
  it('destinatário → valor (com prévia de taxas) → revisão → pagamento → detalhes → comprovante', async () => {
    const { user } = setup('/enviar')
    expect(screen.getByRole('heading', { name: /Para quem/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Oleksandr Gulenko/ }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    // valor: países/moedas, taxas e valor estimado antes de confirmar
    expect(screen.getByLabelText('País de destino')).toHaveValue('UA')
    expect(screen.getByLabelText('Moeda de destino')).toHaveValue('UAH')
    expect(screen.getByRole('button', { name: 'Revisar' })).toBeDisabled()
    await user.type(screen.getByLabelText(/Valor a enviar/), '180')
    const preview = screen.getByRole('region', { name: 'Prévia do cálculo' })
    expect(norm(preview)).toContain('Tarifa simulada')
    expect(norm(preview)).toContain('9,30')
    expect(norm(preview)).toContain('1.440,00')
    expect(norm(preview)).toMatch(/fictício/)

    await user.click(screen.getByRole('button', { name: 'Revisar' }))
    const review = screen.getByRole('region', { name: 'Resumo da operação' })
    expect(norm(review)).toContain('180,00')
    expect(norm(review)).toContain('Oleksandr Gulenko')
    expect(screen.getByText(/Nada será cobrado de verdade/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Continuar para pagamento/ }))
    expect(screen.getByRole('radio', { name: /Google Pay \(simulado\)/ })).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Confirmar transferência simulada' }))

    // detalhes: estado compreensível e progressão
    expect(screen.getByRole('status')).toHaveTextContent(/Nenhum dinheiro real foi movimentado/)
    expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0)
    advance(3000)
    expect(screen.getAllByText('Processada').length).toBeGreaterThan(0)
    advance(5000)
    expect(screen.getAllByText('Concluída').length).toBeGreaterThan(0)

    // comprovante coerente com a operação
    await user.click(screen.getByRole('link', { name: /Ver comprovante fictício/ }))
    const receipt = screen.getByRole('article', { name: 'Comprovante fictício' })
    expect(norm(receipt)).toMatch(/COMPROVANTE FICTÍCIO/)
    expect(norm(receipt)).toContain('Concluída')
    expect(norm(receipt)).toContain('Oleksandr Gulenko')
    expect(norm(receipt)).toContain('1.440,00')
    expect(screen.getByRole('button', { name: /Baixar/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Imprimir/ })).toBeInTheDocument()
  })

  it('falha simulada opcional leva ao estado "Falha simulada" sem débito', async () => {
    const { user } = setup('/enviar')
    await sendUntilPayment(user)
    await user.click(screen.getByText('Opções de demonstração'))
    await user.click(screen.getByLabelText(/Simular falha/))
    await user.click(screen.getByRole('radio', { name: /Saldo demonstrativo/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar transferência simulada' }))
    advance(3000)
    expect(screen.getAllByText('Falha simulada').length).toBeGreaterThan(0)
    expect(screen.getByText(/Nenhum valor foi debitado/, { selector: 'em' })).toBeInTheDocument()
  })

  it('valida o valor e bloqueia países iguais', async () => {
    const { user } = setup('/enviar')
    await user.click(screen.getByRole('button', { name: /Maria Silva/ })) // Brasil → Brasil
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.type(screen.getByLabelText(/Valor a enviar/), '180')
    expect(screen.getByText(/países de origem e destino diferentes/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revisar' })).toBeDisabled()
    await user.selectOptions(screen.getByLabelText('País de destino'), 'US')
    expect(screen.getByRole('button', { name: 'Revisar' })).toBeEnabled()
    await user.clear(screen.getByLabelText(/Valor a enviar/))
    await user.type(screen.getByLabelText(/Valor a enviar/), '1')
    expect(screen.getByText(/valor mínimo/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revisar' })).toBeDisabled()
  })

  it('telas protegidas redirecionam quando faltam etapas anteriores', () => {
    setup('/enviar/pagamento')
    expect(screen.getByRole('heading', { name: /Para quem/ })).toBeInTheDocument()
  })
})

describe('identificação do destinatário sem dados bancários', () => {
  it('por código de usuário', async () => {
    const { user } = setup('/enviar')
    await user.click(screen.getByRole('button', { name: 'Código de usuário' }))
    await user.type(screen.getByLabelText('Código de usuário', { selector: 'input' }), 'flx-gb6203')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(screen.getByText('Destinatário escolhido').closest('section')).toHaveTextContent('Emma Wilson')
  })

  it('mostra erro para código inválido', async () => {
    const { user } = setup('/enviar')
    await user.click(screen.getByRole('button', { name: 'Código de usuário' }))
    await user.type(screen.getByLabelText('Código de usuário', { selector: 'input' }), '0001-123456')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Código inválido/)
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('por QR Code simulado', async () => {
    const { user } = setup('/enviar')
    await user.click(screen.getByRole('button', { name: 'QR Code' }))
    await user.click(screen.getAllByRole('button', { name: 'Simular leitura' })[0])
    expect(screen.getByText('Destinatário escolhido').closest('section')).toHaveTextContent('Oleksandr Gulenko')
    expect(screen.getByText(/não garante privacidade nem segurança/)).toBeInTheDocument()
  })
})

describe('receber e histórico', () => {
  it('histórico mostra enviadas e recebidas com estados e filtros', async () => {
    const { user } = setup('/transferencias')
    expect(within(mainList()).getAllByRole('link').length).toBe(5)
    expect(screen.getAllByText('Falha simulada').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Recebidas' }))
    expect(within(mainList()).getAllByRole('link').length).toBe(2)
    await user.click(screen.getByRole('button', { name: 'Todas' }))
    await user.selectOptions(screen.getByLabelText('Filtrar por situação'), 'failed')
    expect(within(mainList()).getAllByRole('link').length).toBe(1)
  })

  it('simular recebimento cria registro recebido consistente e atualiza o saldo', async () => {
    const { user } = setup('/receber')
    expect(screen.getByText('FLX-ME0001')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /QR Code de demonstração do código FLX-ME0001/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Simular recebimento/ }))
    expect(screen.getByRole('heading', { name: 'Transferência recebida' })).toBeInTheDocument()
    expect(screen.getByText(/nenhum valor real foi encaminhado/)).toBeInTheDocument()
    advance(8000)
    expect(screen.getAllByText('Concluída').length).toBeGreaterThan(0)
  })

  it('persiste o histórico no navegador (localStorage) entre sessões', async () => {
    const first = setup('/enviar')
    await sendUntilPayment(first.user)
    await first.user.click(screen.getByRole('button', { name: 'Confirmar transferência simulada' }))
    first.unmount()
    setup('/transferencias')
    expect(within(mainList()).getAllByRole('link').length).toBe(6)
  })
})

describe('avisos de simulação', () => {
  it('banner de protótipo/ficção aparece em todas as telas principais', () => {
    for (const path of ['/', '/enviar', '/receber', '/transferencias', '/ajuda']) {
      const { unmount } = setup(path)
      expect(screen.getByText(/nenhum dinheiro real é movimentado/)).toBeInTheDocument()
      unmount()
    }
  })

  it('ajuda deixa claro que Ucrânia/cobertura são demonstrativas e que 4h/9 países são conceituais', () => {
    setup('/ajuda')
    expect(screen.getByText(/não indica disponibilidade real/)).toBeInTheDocument()
    expect(screen.getByText(/objetivos conceituais/)).toBeInTheDocument()
  })

  it('tela inicial mostra saldo fictício e contatos', () => {
    setup('/')
    expect(screen.getByText(/Valor fictício/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar para Oleksandr/ })).toBeInTheDocument()
  })
})
