# Planos Publicos — Pricing Table

## 1. Objetivo
- Substituir a pagina mockada `/plans` por dados reais de planos.
- Exibir nome, descricao, beneficios e categoria de cada plano.

## 2. Endpoints envolvidos

| Metodo | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/settings/saas/plans` | Lista planos para exibicao no pricing |

- Quando autenticado, filtrar por tenant do token.
- Erros e respostas devem seguir `specs/frontend/api-error-response-guidelines.md`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| Nome | String | `PlanResponse.name` |
| Descricao | String | `PlanResponse.description` |
| Beneficios | String[] | `PlanResponse.benefits[].description` |
| Categoria | Enum | `PlanResponse.category` |

## 4. Acoes do usuario

- **Visualizar planos**: cards/tabela de comparacao.
- **Selecionar plano** (se CTA existir): encaminhar para fluxo de assinatura/contato definido no produto.

## 5. Regras de negocio

- A pagina deve usar dados reais da API e nao dados mockados.
- Multi-tenancy obrigatoria: nao exibir planos de outro tenant.
- Fallback para usuario nao autenticado deve ser definido e documentado no produto.

## 6. Estados da interface

- **Carregando**: skeleton dos cards.
- **Vazio**: "Nenhum plano disponivel".
- **Sucesso**: cards com beneficios.
- **Erro de rede / 5xx**: estado de erro com opcao de recarregar.
- **Nao autenticado (401)**: seguir regra de produto para pagina publica.

## 7. Navegacao e fluxo

- Rota direta: `/plans`.
- Origem: menu/site publico.

## 8. Criterios de aceite

- [ ] A pagina nao usa mais fonte de dados mockada.
- [ ] Beneficios sao exibidos por plano.
- [ ] Em tenant sem planos, exibe estado vazio.
- [ ] Respeita layout responsivo (desktop e mobile).

## 9. Observacoes tecnicas para front

- Reaproveitar `usePlans` ou criar `usePublicPlans` em `src/features/plans/api/`.
- Garantir coerencia visual com componentes existentes da pagina `/plans`.
