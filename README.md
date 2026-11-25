<<<<<<< HEAD
# Flux — protótipo acadêmico (PWA)

Simulação de **envio, recebimento e histórico de transferências internacionais**, com países/moedas, taxas e câmbio **fictícios**, identificação por contato / código de usuário / QR Code simulado e comprovantes fictícios.

> **Nenhum dinheiro real é movimentado.** Não há APIs, bancos, gateways nem backend. Todos os dados (nomes, códigos, taxas, saldo, comprovantes) são inventados e ficam só no `localStorage` do navegador.

Stack: TypeScript + React + Vite + React Router, CSS responsivo, `vite-plugin-pwa`, Vitest + React Testing Library, Playwright.

## Como executar (VS Code)

Requisitos: Node.js 20+ (testado com 22).

```bash
npm install
npm run dev          # http://localhost:5173
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run build` | type-check + build de produção (gera `dist/`, manifesto e service worker) |
| `npm run preview` | serve o build em http://localhost:4173 (use para testar a PWA/instalação) |
| `npm test` | testes unitários e de componentes (Vitest) |
| `npm run e2e` | testes de navegador (Playwright; faz build e sobe o preview sozinho) |

Se o Playwright não tiver o Chromium instalado, rode `npx playwright install chromium` ou aponte um existente: `PLAYWRIGHT_CHROMIUM_PATH=/caminho/chromium npm run e2e`.

A PWA só é instalável/offline a partir do build (`npm run build && npm run preview`), não no `npm run dev`.

## Fluxos (mapeados ao esboço)

Início (saldo, contatos, ações) → **Destinatário** → **Valor** (países, moedas, ⇄, prévia de taxas) → **Revisão** → **Forma de pagamento** (Google Pay *simulado*) → **Detalhes** com estado em tempo real → **Comprovante** (ver, imprimir/PDF, baixar .txt). Também: **Receber** (meu código + QR, simular recebimento), **Histórico** (filtros por tipo e situação), **Ajuda**.

Estados: Pendente → Processada → Concluída (ou **Falha simulada**, opcional em “Opções de demonstração”). Operações novas progridem em ~2,5 s + ~4 s.

## Estrutura

```
src/data/     países, moedas (taxas fictícias), contatos — listas configuráveis
src/domain/   regras puras e testáveis: cotação/tarifas, parsing de valores, destinatário, ciclo de estados, saldo, comprovante
src/store/    estado React + persistência localStorage + rascunho do envio
src/pages/    telas;  src/components/  layout e peças comuns
e2e/          testes Playwright
```

Para ampliar a cobertura edite `src/data/countries.ts` e `src/data/currencies.ts`. Tarifas e limites: `src/domain/quote.ts`.

## Decisões adotadas (itens não essenciais)

- **Idioma:** pt-BR. Moeda de casa do usuário demo: BRL.
- **Esboço × requisitos:** “Recipient Bank details (nome, conta, endereço)” virou **Destinatário** com *código de usuário* e país, para não pedir dados bancários (RF05). “Pay/Send” do esboço viram **Ler QR** e **Histórico**; “Contact Help” vira **Contato e ajuda** (sem suporte real).
- **País/moeda de destino:** começam pelos do destinatário e podem ser alterados; origem e destino precisam ser países diferentes.
- **Câmbio:** uma conversão direta `moeda destino / moeda origem` a partir de taxas fictícias por USD. Tarifa: 1% + equivalente a US$ 1,50, paga *além* do valor enviado. Limites: US$ 5 a US$ 5.000 (equivalente).
- **Saldo:** só varia com envios pagos com “Saldo demonstrativo” e recebimentos concluídos.
- **QR Code:** QR real gerado localmente (biblioteca `qrcode`) com o conteúdo `flux-demo://usuario/CÓDIGO`; a “leitura” é simulada (sem câmera).
- **Comprovante:** impressão/PDF via diálogo do navegador e download em `.txt`.
- **Roteamento:** `BrowserRouter` (em hospedagem estática, configure fallback para `index.html`).
- **Alvos de build:** `es2020, chrome87, safari14, firefox78` (`vite.config.ts`).

## Limitações conhecidas

- Liquidação em 4 horas (RN02) e parcerias em 9 países (RN03) são objetivos conceituais, citados na Ajuda; não implementados.
- Dados locais: não são sincronizados nem oficiais; limpar o navegador apaga o histórico.
- Testes automatizados rodaram apenas em **Chromium** (desktop e emulação Pixel 7). Safari/iOS, Samsung Internet e dispositivos reais **não foram testados**; teste-os manualmente antes de afirmar compatibilidade. A acessibilidade foi cuidada (rótulos, foco, teclado, `aria-live`), mas sem auditoria com leitor de tela.
=======
# Flux
>>>>>>> 97b178175c75a979e214ec98d479f044e39274a4
