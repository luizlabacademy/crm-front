# Frontend Guidelines

## 1. Objetivo

Estabelecer as convenções de governança, padrões de código e fluxo de trabalho para o desenvolvimento do front-end do CRM.

Documentos relacionados:
- `tech-stack.md` — tecnologias adotadas
- `architecture.md` — estrutura de diretórios e separação de camadas
- `ui-guidelines.md` — padrões visuais e componentes

---

## 2. Linguagem e tipagem

- **TypeScript strict** (`"strict": true` no `tsconfig.json`).
- Proibido `any` — usar `unknown` quando o tipo não é conhecido e fazer narrowing.
- Interfaces para contratos de API (request/response). Types para composição interna.
- Enums apenas quando o backend define valores fixos; caso contrário, `const` objects com `as const`.

---

## 3. Organização por feature

Cada domínio do CRM é uma feature isolada em `src/features/<domain>/`:

```
src/features/customers/
  api/            # hooks de react-query (useCustomers, useCreateCustomer, etc.)
  components/     # componentes específicos do domínio
  pages/          # páginas (CustomerListPage, CustomerFormPage, CustomerDetailsPage)
  schemas/        # schemas Zod de validação
  types/          # tipos/interfaces do domínio
  index.ts        # barrel export
```

**Regras:**
- Uma feature não importa de outra feature diretamente. Compartilhar via `src/components/shared/` ou `src/lib/`.
- Componentes usados por 2+ features vão para `src/components/shared/`.
- Hooks de API genéricos (interceptors, auth) ficam em `src/lib/api/`.

---

## 4. Nomenclatura

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Arquivos de componente | PascalCase | `CustomerList.tsx` |
| Arquivos de hook | camelCase com `use` | `useCustomers.ts` |
| Arquivos de schema | camelCase | `customerSchema.ts` |
| Arquivos de tipos | camelCase | `customerTypes.ts` |
| Pastas | kebab-case | `pipeline-flows/` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Variáveis e funções | camelCase | `formatCurrency()` |
| Componentes React | PascalCase | `<CustomerForm />` |
| Rotas URL | kebab-case | `/pipeline-flows/:id/edit` |

---

## 5. Componentes

- **Componentes funcionais** com arrow functions.
- Props tipadas com interface dedicada (`interface CustomerListProps { ... }`).
- Destructuring de props no parâmetro da função.
- Evitar `React.FC` — usar tipagem explícita do retorno apenas quando necessário.
- Um componente por arquivo. Exceção: componentes auxiliares pequenos e privados (não exportados).
- `forwardRef` quando o componente precisa expor uma ref do DOM.

---

## 6. Estado

### Server state (dados da API)
- **TanStack Query** para todo fetch, cache e mutation.
- `queryKey` padronizado: `['customers', { page, size, tenantId }]`.
- `staleTime` padrão: 30 segundos para dados mutáveis, `Infinity` para dados read-only (geo, UoM).
- Invalidação de cache após mutations com `queryClient.invalidateQueries`.

### Client state (UI/sessão)
- **Zustand** apenas para: tema, sidebar aberta/fechada, tenant selecionado, filtros persistentes.
- Nunca duplicar dados de API em store Zustand.

### Form state
- **react-hook-form** gerencia o estado de formulários.
- Não sincronizar form state com Zustand ou React Query.

---

## 7. Formulários e validação

- Schema Zod espelhando o request DTO do backend.
- `@hookform/resolvers/zod` como resolver.
- Validação em tempo real (modo `onChange` para campos críticos, `onBlur` para os demais).
- Mensagens de erro em pt-BR.
- Campos monetários: input em reais com máscara → converter para centavos antes de enviar (`Math.round(value * 100)`).
- Campos de data: `input[type=datetime-local]` → converter para ISO 8601 com offset antes de enviar.
- Campos de documento (CPF/CNPJ): aplicar máscara visual, enviar somente dígitos.

---

## 8. API e HTTP

- Client HTTP: **axios** com instância centralizada em `src/lib/api/client.ts`.
- Base URL: configurável via variável de ambiente `VITE_API_BASE_URL`.
- Interceptor de request: injeta `Authorization: Bearer <token>` automaticamente.
- Interceptor de response:
  - `401` → limpa sessão, redireciona para `/login`.
  - `403` → toast "Sem permissão".
  - `5xx` → toast genérico "Erro no servidor".
- Tipos de request/response gerados ou mantidos manualmente em `types/`.
- Paginação: padrão `PageResponse<T>` com `content[]`, `page`, `size`, `totalElements`, `totalPages`.

---

## 9. Tratamento de erros

- Toda tela deve prever 6 estados: loading, empty, success, error, 401, 403.
- `react-error-boundary` para capturar erros de renderização.
- Toasts via **sonner** para feedback de ações (sucesso, erro de mutation).
- Erros de validação do backend (400) mapeados para mensagens inline nos campos.

---

## 10. Testes

### Unitários e de componentes (vitest + @testing-library/react)
- Testar: lógica de transformação, schemas Zod, hooks customizados, estados de componentes.
- Não testar: detalhes de implementação, estilos.
- Naming: `describe('CustomerForm')` → `it('should disable submit when fullName is empty')`.

### E2E (Playwright)
- Cobrir fluxos críticos: login → dashboard, CRUD de customer, conversão lead → order.
- Rodar contra ambiente Docker local (`docker compose up -d`).

---

## 11. Code style e linting

- **ESLint** com regras de React, TypeScript e import sorting.
- **Prettier** para formatação automática.
- Import order: React → libs externas → `@/lib` → `@/components` → `@/features` → relativos.
- Path alias: `@/` aponta para `src/`.
- Proibido: `console.log` em código commitado (usar ESLint rule `no-console: warn`).
- Commits: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).

---

## 12. Performance

- **Lazy loading** de rotas com `React.lazy` + `Suspense`.
- Imagens otimizadas (WebP quando possível).
- Paginação server-side em todas as listagens — nunca carregar todos os registros.
- Debounce de 300ms em filtros de texto.
- Memoização com `useMemo`/`useCallback` apenas quando houver problema mensurável de performance.

---

## 13. Acessibilidade

- Seguir WCAG 2.1 nível AA.
- Componentes Radix UI já fornecem a11y; não sobrescrever `role` ou `aria-*` sem motivo.
- Toda ação destrutiva (excluir) exige diálogo de confirmação focável.
- Navegação por teclado funcional em tabelas, modais e formulários.
- Labels associados a inputs via `htmlFor`.

---

## 14. Internacionalização

- Todos os textos da UI em **pt-BR** nesta primeira versão.
- Datas formatadas como `dd/MM/yyyy HH:mm` no fuso do usuário.
- Valores monetários formatados como `R$ 1.234,56` (BRL).
- Documentos: CPF `XXX.XXX.XXX-XX`, CNPJ `XX.XXX.XXX/XXXX-XX`.
- Telefone: `(XX) XXXXX-XXXX`.

---

## 15. Segurança

- Token JWT armazenado em memória (variável Zustand) ou `httpOnly cookie` — nunca em `localStorage`.
- Não expor `passwordHash` em nenhuma tela.
- Sanitizar inputs de texto antes de renderizar (`dangerouslySetInnerHTML` proibido).
- CSP headers configurados no servidor de deploy.

---

## 16. Versionamento e deploy

- Branch principal: `master`.
- Feature branches: `feat/<nome>`, `fix/<nome>`.
- PR obrigatório com review antes de merge.
- CI: lint → testes → build → deploy.
- Build de produção: `pnpm build` (Vite).
