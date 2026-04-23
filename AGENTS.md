High-signal notes for OpenCode agents working on crm-front

Only include facts an agent would likely miss. Keep it short — read CLAUDE.md and docs/specs/ when in doubt.

Commands

- Dev server: `npm run dev` (alias `npm start`).
- Build: `npm run build` — runs `tsc -b` then `vite build` (typecheck first is required).
- Lint: `npm run lint` (ESLint config at project root).
- Tests: `npm run test` (vitest). Run a single file with `npx vitest run src/path/to/file.test.tsx`.
- Seed real API data: `npm run seed` (calls `node scripts/seed.mjs`). Environment variables used: `API_BASE_URL` (defaults to https://api-crm.luizlab.com), `SEED_EMAIL`, `SEED_PASSWORD`, `MIN_ROWS`.

Environment and API base URL

- The app reads VITE_API_BASE_URL from .env. In DEV the file must define it — `src/lib/api/client.ts` throws if it's missing in dev.
- .env in the repo contains `VITE_API_BASE_URL=https://api-crm.luizlab.com/` — keep this when running locally if you expect API calls to work.

API & networking conventions (don’t guess)

- Axios instance: `src/lib/api/client.ts`. Always use the provided `api` client or TanStack Query hooks under `features/*/api/` — do not call axios/fetch directly from components.
- Request interceptor injects `Authorization: Bearer <token>` using `useAuthStore` state.
- Response interceptor handles 401 (auto-logout and redirect to `/login?expired=true`), 403 (permission toast) and 5xx (server error toast). Tests/code expecting different behavior must mock the client.

Auth behavior

- Auth store: `src/lib/auth/authStore.ts` (Zustand). Token is persisted under localStorage key `crm_token` and is cleared if expired.
- The store decodes JWT `exp` and sets two timers: a warning toast 1 minute before expiry and an automatic logout at expiry. Tests or seed scripts that depend on long-lived tokens may be affected.

Specs-first policy (must-follow)

- This repo follows Spec-Driven Development. Read `docs/specs/frontend/` (architecture, api-integration-guidelines, ui-guidelines, mock-guidelines) before changing feature behavior, naming, or API contracts. CLAUDE.md documents this; treat specs as the source of truth.

Mocks vs live API

- Rule: Prefer live API when endpoint exists. If backend endpoint is missing, add a mock under `src/mocks/` and consume it via a TanStack Query hook in `features/*/api/`. See `docs/specs/frontend/mock-guidelines.md` for naming/structure.

Language and formatting

- UI copy is pt-BR. New user-visible strings should be Portuguese (Brazil).

TypeScript / build quirks

- Build requires typecheck: `npm run build` runs `tsc -b` first. Don't assume `vite build` alone is sufficient.
- Path alias `@` maps to `./src` via vite/tsconfig — imports use `@/...`.

Where tests run (Vitest)

- Vitest uses `jsdom` and `./src/test/setup.ts` for global setup (see vitest.config.ts). Mock browser APIs accordingly.

Repository safety and opencode policy

- opencode.json is present and restricts some bash/git commands: potentially-destructive git commands and `gh` require asking. Follow those rules (the agent will be prompted by the platform).

When you edit code

- Make minimal changes. Prefer small, local edits over sweeping refactors. Follow naming and import order conventions in CLAUDE.md.
- If changing API contracts or mocks, update `docs/specs/frontend/` or mention the spec gap in PR description.

Quick file_reference

- Axios client: `src/lib/api/client.ts`
- Auth store: `src/lib/auth/authStore.ts`
- Guards/router entry: `src/app/router/index.tsx` and `src/app/guards/auth-guard.tsx`
- Mocks: `src/mocks/`
- Specs: `docs/specs/frontend/`
- Seed script: `scripts/seed.mjs`

If unsure

- Re-check `docs/specs/frontend/` and `CLAUDE.md` — they contain project conventions and the few non-obvious rules an agent must obey.

## OpenCode — Regra obrigatória de validação e Git

Esta regra deve ser aplicada obrigatoriamente em:

- CLAUDE.md
- AGENTS.md

Aplica-se a qualquer agente executando tarefas no repositório.

---

## Validação local obrigatória por alteração

A cada alteração solicitada, execute validação local antes de concluir a tarefa.

### Regra de produtividade

Não rode a suíte completa por padrão. Priorize apenas a área impactada pela mudança.

### O que deve ser validado

Para cada alteração, executar somente o necessário da área afetada, como:

- teste unitário do componente, hook, service, util ou módulo alterado;
- teste da página/feature relacionada;
- build local quando a alteração puder afetar integração, tipagem, imports, rotas, bundling ou estrutura da aplicação;
- validação manual local do fluxo principal da tela/feature alterada.

### Escopo da execução

Preferir sempre:

- testes do arquivo alterado;
- testes da feature alterada;
- testes diretamente relacionados ao fluxo impactado.

Evitar por padrão:

- rodar todos os testes do projeto;
- rodar validações amplas sem necessidade;
- executar processos demorados fora do escopo da mudança.

### Critério

A validação deve ser proporcional ao impacto:

- mudança pequena: testar somente arquivos/fluxos diretamente afetados;
- mudança média: testar a feature/módulo afetado;
- mudança maior: testar área afetada + build local.

### Entrega

Ao finalizar, informar objetivamente:

- o que foi validado;
- quais comandos foram executados;
- se a validação passou ou se ficou alguma pendência.

Se não for possível executar algo localmente, declarar isso explicitamente e informar o motivo.

---

## Controle de versionamento (Git)

Regra obrigatória para agentes OpenCode:

- Não realizar `commit`, `push`, `merge` ou `PR` sem solicitação explícita.
- Alterações devem permanecer apenas no workspace local até instrução do usuário.
- Se necessário, apenas sugerir mensagem de commit (não executar).
- Aguardar autorização explícita para qualquer operação de versionamento.
- Em operações potencialmente destrutivas (`reset`, `rebase`, `force push`), sempre aguardar confirmação explícita.
