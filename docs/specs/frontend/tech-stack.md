# Tech Stack

## 1. Purpose

Listar as tecnologias adotadas no front-end do CRM e o motivo de cada
escolha.

Relacionados: - `architecture.md` - `frontend-guidelines.md` -
`ui-guidelines.md`

------------------------------------------------------------------------

## 2. Core

-   **React + TypeScript**
    -   Base da aplicação SPA com tipagem estática.
-   **Vite**
    -   Dev server e build rápidos, configuração simples.

------------------------------------------------------------------------

## 3. Routing

-   **React Router**
    -   Roteamento declarativo por páginas, suporte a guards e lazy
        loading.

------------------------------------------------------------------------

## 4. Server State

-   **@tanstack/react-query**
    -   Fetch, cache, invalidação, estados de loading/erro e mutations.

------------------------------------------------------------------------

## 5. Client State

-   **Zustand**
    -   Estado global leve (preferências de UI, sessão mínima, filtros
        locais).

------------------------------------------------------------------------

## 6. Forms & Validation

-   **react-hook-form**
    -   Performance e ergonomia para formulários.
-   **zod**
    -   Schemas tipados e validação consistente.
-   **@hookform/resolvers**
    -   Integração RHF + Zod.

------------------------------------------------------------------------

## 7. UI

-   **Tailwind CSS**
    -   Estilização utilitária, rápida e consistente.
-   **shadcn/ui**
    -   Base de componentes componíveis (sobre Radix).
-   **Radix UI**
    -   Primitives acessíveis.
-   **lucide-react**
    -   Ícones.

------------------------------------------------------------------------

## 8. Utilities

-   **axios**
    -   Client HTTP com interceptors.
-   **date-fns**
    -   Manipulação de datas.
-   **clsx / tailwind-merge**
    -   Composição de classes.
-   **class-variance-authority**
    -   Variantes de componentes.

------------------------------------------------------------------------

## 9. Feedback & UX

-   **sonner**
    -   Toasts.
-   **react-error-boundary**
    -   Isolamento de erros de UI.
-   **framer-motion** (opcional)
    -   Animações leves.

------------------------------------------------------------------------

## 10. Testing

-   **vitest**
    -   Testes unitários e de componentes (integrado ao Vite).
-   **@testing-library/react**
    -   Testes focados no comportamento.
-   **@playwright/test**
    -   E2E.

------------------------------------------------------------------------

## 11. Tooling

-   **ESLint + Prettier**
    -   Qualidade e padronização de código.
-   **pnpm**
    -   Gerenciador de pacotes performático.

------------------------------------------------------------------------

## 12. Conventions

-   Preferir **TanStack Query** para dados remotos.
-   Usar **Zustand** apenas para estado de UI/sessão leve.
-   Formularios via **RHF + Zod**.
-   UI seguindo `ui-guidelines.md`.
-   Organização por **feature** conforme `architecture.md`.

------------------------------------------------------------------------

## 13. Trade-offs

-   **shadcn/ui**
    -   -   Flexível e moderno
    -   -   Exige disciplina de design system
-   **Zustand**
    -   -   Simples
    -   -   Pode desorganizar se mal utilizado
-   **Vite**
    -   -   DX e build rápidos
    -   -   Ecossistema menor que frameworks full-stack

------------------------------------------------------------------------

## 14. Final Rule

Escolher tecnologias que maximizem: - simplicidade - velocidade de
desenvolvimento - consistência - capacidade de evolução
