import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

export function SimBanner() {
  return (
    <div className="sim-banner" role="note">
      <strong>Protótipo acadêmico</strong> · operações fictícias · nenhum dinheiro real é movimentado
    </div>
  )
}

const NAV = [
  { to: '/', label: 'Início', end: true, icon: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { to: '/enviar', label: 'Enviar', end: false, icon: 'M3 11l18-8-8 18-2-8z' },
  { to: '/receber', label: 'Receber', end: false, icon: 'M12 3v12m0 0l-5-5m5 5l5-5M4 19h16' },
  { to: '/transferencias', label: 'Histórico', end: false, icon: 'M12 7v5l3 2M21 12a9 9 0 1 1-3-6.7M21 4v5h-5' },
  { to: '/ajuda', label: 'Ajuda', end: false, icon: 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z' },
]

export function Layout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const first = useRef(true)

  // A cada troca de tela (não no carregamento inicial): volta ao topo e move o foco ao conteúdo.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="app">
      <a className="skip-link" href="#main">Ir para o conteúdo</a>
      <SimBanner />
      <div className="shell">
        <nav className="nav" aria-label="Principal">
          <div className="brand" aria-hidden="true">
            <span className="brand-mark">F</span> Flux
          </div>
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={n.icon} />
                  </svg>
                  <span>{n.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main" ref={mainRef} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
