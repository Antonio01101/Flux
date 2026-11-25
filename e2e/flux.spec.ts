import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.goto('/')
})

test('fluxo completo: contato → valor → revisão → pagamento → conclusão → comprovante', async ({ page }) => {
  await expect(page.getByText(/nenhum dinheiro real é movimentado/)).toBeVisible()
  await expect(page.getByText('Saldo demonstrativo')).toBeVisible()

  await page.getByRole('button', { name: 'Enviar para Oleksandr' }).click()
  await expect(page.getByRole('heading', { name: 'Quanto você quer enviar?' })).toBeVisible()
  await page.getByLabel(/Valor a enviar/).fill('180')
  const preview = page.getByRole('region', { name: 'Prévia do cálculo' })
  await expect(preview).toContainText('1.440,00')
  await expect(preview).toContainText('Tarifa simulada')
  await page.getByRole('button', { name: 'Revisar' }).click()

  await expect(page.getByRole('region', { name: 'Resumo da operação' })).toContainText('Oleksandr Gulenko')
  await page.getByRole('button', { name: /Continuar para pagamento/ }).click()
  await page.getByRole('radio', { name: /Google Pay/ }).check()
  await page.getByRole('button', { name: 'Confirmar transferência simulada' }).click()

  await expect(page.getByRole('status').first()).toContainText('Nenhum dinheiro real')
  await expect(page.getByText('Pendente').first()).toBeVisible()
  await expect(page.getByText('Concluída').first()).toBeVisible({ timeout: 15_000 })

  await page.getByRole('link', { name: /Ver comprovante fictício/ }).click()
  const receipt = page.getByRole('article', { name: 'Comprovante fictício' })
  await expect(receipt).toContainText('COMPROVANTE FICTÍCIO')
  await expect(receipt).toContainText('Concluída')
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Baixar/ }).click()])
  expect(download.suggestedFilename()).toMatch(/^comprovante-ficticio-FLX-\d{8}-[A-Z0-9]{6}\.txt$/)

  // histórico mostra a nova operação (enviadas e recebidas)
  await page.getByRole('link', { name: 'Histórico', exact: true }).first().click()
  await expect(page.getByText('Para Oleksandr Gulenko').first()).toBeVisible()
  await page.getByRole('button', { name: 'Recebidas' }).click()
  await expect(page.getByText(/^De /).first()).toBeVisible()
})

test('identificação por código e QR simulado; receber', async ({ page }) => {
  await page.goto('/enviar')
  await page.getByRole('button', { name: 'Código de usuário' }).click()
  await page.getByLabel('Código de usuário', { exact: true }).fill('FLX-ZZ0000')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'não encontrado' })).toBeVisible()
  await page.getByLabel('Código de usuário', { exact: true }).fill('flx-gb6203')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.getByText('Destinatário escolhido')).toBeVisible()

  await page.goto('/receber')
  await expect(page.getByRole('img', { name: /QR Code de demonstração/ })).toBeVisible()
  await page.getByRole('button', { name: /Simular recebimento/ }).click()
  await expect(page.getByRole('heading', { name: 'Transferência recebida' })).toBeVisible()
  await expect(page.getByText('Concluída').first()).toBeVisible({ timeout: 15_000 })
})

test('sem rolagem horizontal e navegação por teclado funciona', async ({ page }) => {
  for (const path of ['/', '/enviar', '/enviar/valor', '/receber', '/transferencias', '/ajuda']) {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, `rolagem horizontal em ${path}`).toBeLessThanOrEqual(1)
  }
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Ir para o conteúdo' })).toBeFocused()
})

test('PWA: manifesto válido e service worker registrado; funciona offline após o 1º carregamento', async ({ page, context }) => {
  const res = await page.request.get('/manifest.webmanifest')
  const m = await res.json()
  expect(m).toMatchObject({ short_name: 'Flux', display: 'standalone', lang: 'pt-BR' })
  expect(m.icons.length).toBeGreaterThanOrEqual(3)
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload() // garante controle pelo SW
  await context.setOffline(true)
  await page.goto('/ajuda')
  await expect(page.getByRole('heading', { name: 'Contato e ajuda' })).toBeVisible()
  await context.setOffline(false)
})
