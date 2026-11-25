import { describe, expect, it } from 'vitest'
import { qrPayload, parseRecipientInput, resolveRecipient } from './recipient'

describe('identificação do destinatário', () => {
  it('normaliza código digitado em minúsculas e com espaços', () => {
    expect(parseRecipientInput('  flx-ua4821 ')).toBe('FLX-UA4821')
  })
  it('lê o conteúdo de um QR demonstrativo', () => {
    expect(parseRecipientInput(qrPayload('FLX-UA4821'))).toBe('FLX-UA4821')
  })
  it('resolve códigos do diretório fictício', () => {
    const r = resolveRecipient('FLX-UA4821')
    expect(r.ok && r.party.name).toBe('Oleksandr Gulenko')
  })
  it('resolve usuários fora dos contatos pelo código/QR', () => {
    expect(resolveRecipient(qrPayload('FLX-GB6203')).ok).toBe(true)
  })
  it('explica erros: vazio, formato inválido, desconhecido e próprio código', () => {
    expect(resolveRecipient('')).toMatchObject({ ok: false })
    expect(resolveRecipient('123')).toMatchObject({ ok: false, error: expect.stringMatching(/inválido/) })
    expect(resolveRecipient('FLX-ZZ9999')).toMatchObject({ ok: false, error: expect.stringMatching(/não encontrado/) })
    expect(resolveRecipient('FLX-ME0001')).toMatchObject({ ok: false, error: expect.stringMatching(/próprio/) })
  })
  it('não aceita dados bancários como identificação', () => {
    expect(resolveRecipient('0001-1234567-8')).toMatchObject({ ok: false })
  })
})
