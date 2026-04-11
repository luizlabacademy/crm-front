# Pedidos — Listagem

## 1. Objetivo
- Exibir todos os pedidos do CRM com suporte a paginação e filtro por tenant.
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/orders` | Lista pedidos paginados |
| `DELETE` | `/api/v1/orders/{id}` | Remove pedido |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20), `tenantId` (opcional).
- Ordenação: `id` DESC.
- Response: `PageResponse<OrderResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID / Code | Long / UUID | `OrderResponse.id`, `.code` |
| Cliente | Long | `OrderResponse.customerId` |
| Usuário responsável | Long | `OrderResponse.userId` |
| Status | String | `OrderResponse.status` |
| Subtotal | Long (cents) | `OrderResponse.subtotalCents` |
| Desconto | Long (cents) | `OrderResponse.discountCents` |
| Total | Long (cents) | `OrderResponse.totalCents` |
| Moeda | String | `OrderResponse.currencyCode` |
| Qtd. itens | Int | `OrderResponse.items.size` |
| Criado em | OffsetDateTime | `OrderResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar.
- **Filtrar por tenant**: seletor `tenantId`.
- **Paginar**.
- **Novo pedido**: "Novo" → `/orders/new`.
- **Editar**: → `/orders/:id/edit`.
- **Excluir**: confirmação → `DELETE`.
- **Ver detalhe**: → `/orders/:id`.

## 5. Regras de negócio

- Status possíveis: `DRAFT` (padrão) e outros — Pendente de definição completa pelo domínio.
- Valores em centavos; exibir formatados como moeda BRL.
- `totalCents` = `subtotalCents` - `discountCents`; o cálculo é responsabilidade do requisitante no `PUT`/`POST`.
- Um pedido deve ter `customerId` e `userId` válidos.

## 6. Estados da interface

- **Carregando**: skeleton.
- **Vazio**: "Nenhum pedido encontrado."
- **Sucesso**: tabela com paginação.
- **Erro**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Pedidos".
- "Novo" → `/orders/new`.
- Linha/editar → `/orders/:id/edit`.
- Ícone detalhe → `/orders/:id`.

## 8. Critérios de aceite

- [ ] Listagem carrega ao entrar na rota.
- [ ] Valores monetários formatados corretamente.
- [ ] Filtro por `tenantId` recarrega lista.
- [ ] Exclusão com confirmação remove da lista.

## 9. Observações técnicas para front

- Formatar centavos: `(value / 100).toLocaleString('pt-BR', { style: 'currency', currency: currencyCode })`.
- Badge de status com cores.
- Coluna "Itens" exibe contagem de `items.length`.
