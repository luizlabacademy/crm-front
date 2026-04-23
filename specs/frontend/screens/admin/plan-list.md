# Planos — Listagem

## 1. Objetivo
- Exibir os planos SaaS do tenant autenticado na area de Configuracoes.
- Permitir filtragem por nome e categoria.
- Permitir acesso rapido para criacao e edicao.

## 2. Endpoints envolvidos

| Metodo | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/settings/saas/plans` | Lista planos do tenant |

- Requer `Authorization: Bearer <token>`.
- Filtros opcionais: `name`, `category`.
- Response `200`: lista de `PlanResponse` com `benefits[]` embutido.
- Erros e respostas devem seguir `specs/frontend/api-error-response-guidelines.md`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| Nome | String | `PlanResponse.name` |
| Categoria | Enum | `PlanResponse.category` |
| Descricao | String | `PlanResponse.description` |
| Quantidade de beneficios | Number | `PlanResponse.benefits.length` |

## 4. Acoes do usuario

- **Listar**: carregar ao entrar na rota `/settings/plans`.
- **Filtrar por nome**: aplicar debounce de 300ms.
- **Filtrar por categoria**: aplicar imediatamente apos selecao.
- **Novo plano**: botao "Novo plano" -> `/settings/plans/new`.
- **Editar plano**: acao por linha -> `/settings/plans/:id/edit`.

## 5. Regras de negocio

- Somente planos do tenant autenticado devem ser exibidos.
- Categoria deve usar enum `PlanCategory`:
  - `PROFESSIONAL_AUTONOMOUS`
  - `BUSINESS`
- A coluna de descricao deve mostrar resumo (truncate com tooltip opcional).

## 6. Estados da interface

- **Carregando**: skeleton na listagem.
- **Vazio**: "Nenhum plano encontrado." com CTA "Criar plano".
- **Sucesso**: tabela/lista com filtros ativos.
- **Erro de rede / 5xx**: toast + opcao de tentar novamente.
- **Nao autenticado (401)**: redirect para `/login`.
- **Sem permissao (403)**: toast "Sem permissao".

## 7. Navegacao e fluxo

- Origem: menu `Configuracoes > Planos`.
- Novo: `/settings/plans/new`.
- Edicao: `/settings/plans/:id/edit`.

## 8. Criterios de aceite

- [ ] Ao acessar a tela, dispara `GET /settings/saas/plans`.
- [ ] Filtro por nome envia `name` na query.
- [ ] Filtro por categoria envia `category` na query.
- [ ] Quantidade de beneficios exibida corretamente por linha.
- [ ] Botao "Novo plano" navega para formulario.

## 9. Observacoes tecnicas para front

- Implementar hook `usePlans` em `src/features/plans/api/usePlans.ts`.
- `queryKey` sugerido: `['plans', { name, category }]`.
- Incluir labels pt-BR para enum de categoria.
