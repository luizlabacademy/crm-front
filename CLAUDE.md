# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Spec-Driven Development

⚠️ **This project follows Spec-Driven Development (SDD).** Specifications in `docs/specs/frontend/` define the intended behavior, architecture, and UI patterns **before** implementation.

**Always consult specs when:**

- Implementing a new feature or screen
- Deciding on component structure or naming
- Designing API integration or data flow
- Handling UI states, validation, or error messages
- Planning refactors or shared component extraction
- Uncertain about conventions or patterns

Specs are the source of truth. Code should follow specs, not the reverse.

## Specs Documentation

Key reference docs in `docs/specs/frontend/`:

- **[architecture.md](./docs/specs/frontend/architecture.md)** — modular feature-based structure, state management (server vs client), error handling, UI layering
- **[frontend-guidelines.md](./docs/specs/frontend/frontend-guidelines.md)** — code conventions, component patterns, naming, validation, security, i18n (pt-BR)
- **[api-integration-guidelines.md](./docs/specs/frontend/api-integration-guidelines.md)** — backend URLs, auth, request/response contracts, paging, monetary values, read-only resources, API gaps
- **[mock-guidelines.md](./docs/specs/frontend/mock-guidelines.md)** — when and how to use mocks, file naming, JSON structure, REST conventions
- **[ui-guidelines.md](./docs/specs/frontend/ui-guidelines.md)** — UI states (loading, empty, success, error, 401, 403), form structure, labels, feedback
- **[cdd-refactoring-plan.md](./docs/specs/frontend/cdd-refactoring-plan.md)** — shared component extraction roadmap (4 waves), test setup, naming rules
- **[README.md](./docs/specs/frontend/README.md)** — overview, scope (delivery SMBs), screen index, flows

**Also check `docs/specs/frontend/screens/` for detailed specs of individual pages (login, customers, leads, orders, etc.)**

### When to Consult Specs

| Situation                         | Check                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| Implementing a new screen         | `docs/specs/frontend/screens/<domain>/` + `architecture.md` + `ui-guidelines.md`                   |
| Adding a component                | `cdd-refactoring-plan.md` (is it already extracted?) + `frontend-guidelines.md`                    |
| Integrating with API              | `api-integration-guidelines.md` (contracts, gaps, auth) + `mock-guidelines.md` (when to use mocks) |
| Form validation or error handling | `frontend-guidelines.md` (seção 7) + `ui-guidelines.md` (seção 4)                                  |
| Styling or UI states              | `ui-guidelines.md` (principles, standard structure, required states)                               |
| Database/domain logic             | `README.md` (flows, scope)                                                                         |
| Refactoring or cleanup            | `cdd-refactoring-plan.md` (waves, governing rules)                                                 |
| Using mocks or client-side data   | `mock-guidelines.md` (when/how to mock, file structure, naming)                                    |

## API vs Mocks Decision

**Rule:** Use the live API when available; use mocks only for endpoints that don't exist yet.

1. **Check the live API first**: https://api-crm.luizlab.com/v3/api-docs
2. If the endpoint exists and meets feature requirements → implement a TanStack Query hook with Axios
3. If the endpoint doesn't exist → create a mock in `/src/mocks/` following `mock-guidelines.md`

When implementing:

- Live API: define a TanStack Query hook in `features/<feature>/api/`, never call Axios directly from components
- Mocks: still consume via TanStack Query hooks; the hook returns mock data when the real endpoint is unavailable
- Once the backend provides the endpoint, replace the mock with live API calls — components should not change

For detailed mock structure, naming, and conventions, see **[mock-guidelines.md](./docs/specs/frontend/mock-guidelines.md)**.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Type-check then build: tsc -b && vite build
npm run lint         # ESLint
npm run test         # Vitest (watch mode)
npm run test:ui      # Vitest with browser UI
npm run test:coverage
```

Run a single test file:

```bash
npx vitest run src/path/to/file.test.tsx
```

## Architecture

**Stack**: React 19, React Router 7, Vite, TypeScript, Tailwind CSS 4, TanStack Query, Zustand, React Hook Form + Zod, Axios, Base UI.

### Folder layout

```
src/
  app/          # Shell: providers, router, layouts, guards, global config
  features/     # Domain modules (customers, leads, orders, catalog, admin, marketing, expenses, …)
    <feature>/
      api/      # TanStack Query hooks + Axios calls
      components/
      pages/
      types/
  components/
    shared/     # Reusable primitives (Table, Button, FormField, Modal, …)
    ui/         # Base UI library wrappers (Shadcn/CVA pattern)
  lib/
    api/        # Axios client + interceptors
    auth/       # Zustand auth store
    hooks/      # Shared hooks
    utils/      # Formatting, helpers
  mocks/        # Mock API responses (for endpoints not yet in live API)
```

### API layer

- Axios instance lives in `src/lib/api/client.ts` with `VITE_API_BASE_URL`.
- Request interceptor injects `Authorization: Bearer <token>` automatically.
- Response interceptor handles errors globally: 401 → logout + redirect, 403 → permission toast, 5xx → error toast.
- Each feature exposes TanStack Query hooks from its own `api/` folder — never call Axios directly from components.

### Auth

- Zustand store (`useAuthStore`) holds the JWT and expiry timestamp.
- Auto-logout fires **1 minute before** token expiry with a warning toast.
- `AuthGuard` wraps all protected routes; failed auth redirects preserve the original location.

### Routing

- All page components are **lazy-loaded** via `.then(m => ({ default: m.PageName }))`.
- Three layout types: `PublicLayout`, `AppLayout` (main shell), `AuthenticatedFullscreenLayout` (chat/boards — requests fullscreen on mount).
- CRUD URL convention: `/resource/new`, `/resource/:id`, `/resource/:id/edit`.

### State

- **Server state**: TanStack Query with 5-minute stale time and 1 retry by default.
- **Client state**: Zustand only for auth; everything else stays in component state or React Query cache.

### Styling

- Tailwind CSS 4 with `tailwind-merge` + `clsx` for conditional classes.
- Variant styling via `class-variance-authority` (CVA).
- Toast notifications via **Sonner** (top-right, rich colors).

### Forms

- All forms use **React Hook Form** + **Zod** resolver. Define the schema first, derive the TypeScript type from it with `z.infer<>`.

### Language

UI text is in **Portuguese** (Brazilian). Keep new strings in pt-BR.

### Key API Conventions

From backend:

- Monetary values: always in **centavos** (`int64`). Frontend converts: `Math.round(value * 100)` before POST/PUT.
- Dates: ISO 8601 with timezone. Frontend: `input[type=datetime-local]` → convert to `OffsetDateTime`.
- Soft delete: `active` field (boolean) disables without deleting; `DELETE` is permanent.
- Passwords: send as plain text in `passwordHash` field; backend hashes with BCrypt.
- No refresh token or logout endpoint — 401 → redirect to login.
- Pagination: query params `page` (0-based), `size`. Response: `PageResponse<T>` with `content[]`, `totalElements`, `totalPages`.

### Required UI States

Every page must handle: **loading**, **empty**, **success**, **error**, **401 (unauthorized)**, **403 (forbidden)**.

### CDD Wave 1: Shared Components

Primitives to extract (see `docs/specs/frontend/cdd-refactoring-plan.md` for full plan):

- `SkeletonRow` — 8+ list pages
- `ActiveBadge` — 9+ list/detail pages
- `StatusBadge` — leads, orders, boards (generic, domain-specific color maps live in feature types)
- `TablePagination` — 8 list pages

Composite (Wave 2):

- `ConfirmDeleteModal`
- `PageHeader`
- `EmptyState`

### TypeScript & Naming

- **Strict mode** — no `any`, use `unknown` + narrowing.
- **Interfaces** for API contracts (request/response), **types** for internal composition.
- **Enums** only for backend-defined fixed values; prefer `const` objects with `as const` otherwise.
- **Files**: PascalCase for components (`CustomerForm.tsx`), camelCase for hooks/utils/schemas.
- **Import order**: React → external libs → `@/lib` → `@/components` → `@/features` → relative.

### Validation & Forms

- RHF + Zod: define schema first, derive type with `z.infer<typeof schema>`.
- Schema mirrors backend DTO.
- Validation modes: `onChange` for critical fields, `onBlur` for others.
- Error messages in pt-BR.
- Monetary input: apply mask → convert to centavos before sending.
- Document fields (CPF/CNPJ): visual mask → send digits only.

### Known API Gaps

Documented in `docs/specs/frontend/api-integration-guidelines.md#7`:

1. **No refresh token** — implement preemptive logout 1min before expiry with warning toast.
2. **JWT TTL not documented** — detect 401 and redirect.
3. **No filter `customerId` in Lead/Order/Schedule** — customer detail pages can't list related records via API.
4. **Status enums missing** — hardcode Lead/Order/Appointment status options in frontend.
5. **No Role ↔ User, Role ↔ Permission endpoints** — RBAC incomplete server-side.
6. **`Address` and `Appointment` have no `tenantId`** — data isolation risk.
7. **No aggregation/analytics endpoints** — dashboard computed client-side from multiple calls.

Work around these when implementing. Flag if a gap blocks critical functionality.

---

## Final Rule: Specs First

Before writing code, ask:

- **Is there a spec for this?** If yes, read it first. It defines the expected behavior, UI structure, and acceptance criteria.
- **Is my implementation aligned with the spec?** If unclear, re-read the relevant spec sections.
- **Does the spec have a gap or conflict?** Flag it and work around it explicitly.

Specs evolve, but the principle is constant: **specs are the contract; code follows specs, not the reverse.**

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
