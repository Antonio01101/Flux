import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// O Testing Library só reconhece timers falsos do Jest; este shim o faz funcionar com vi.useFakeTimers().
;(globalThis as unknown as { jest: unknown }).jest = { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) }

// jsdom não implementa scrollTo.
window.scrollTo = () => {}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
