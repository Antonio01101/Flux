import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Help } from './pages/Help'
import { History } from './pages/History'
import { Home } from './pages/Home'
import { Receipt } from './pages/Receipt'
import { Receive } from './pages/Receive'
import { SendAmount } from './pages/SendAmount'
import { SendPayment } from './pages/SendPayment'
import { SendRecipient } from './pages/SendRecipient'
import { SendReview } from './pages/SendReview'
import { TransferDetail } from './pages/TransferDetail'
import { SendDraftProvider } from './store/SendDraft'
import { TransfersProvider } from './store/TransfersProvider'

function NotFound() {
  return (
    <>
      <h1>Página não encontrada</h1>
      <Link className="btn secondary" to="/">Voltar ao início</Link>
    </>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="enviar" element={<SendRecipient />} />
        <Route path="enviar/valor" element={<SendAmount />} />
        <Route path="enviar/revisao" element={<SendReview />} />
        <Route path="enviar/pagamento" element={<SendPayment />} />
        <Route path="receber" element={<Receive />} />
        <Route path="transferencias" element={<History />} />
        <Route path="transferencias/:id" element={<TransferDetail />} />
        <Route path="transferencias/:id/comprovante" element={<Receipt />} />
        <Route path="ajuda" element={<Help />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TransfersProvider>
      <SendDraftProvider>{children}</SendDraftProvider>
    </TransfersProvider>
  )
}
