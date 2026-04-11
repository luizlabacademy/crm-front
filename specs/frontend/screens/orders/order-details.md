# Pedidos — Detalhe

## 1. Objetivo
- Exibir todos os dados de um pedido, incluindo itens, valores e metadados.
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/orders/{id}` | Carrega pedido completo |
| `DELETE` | `/api/v1/orders/{id}` | Remove pedido |

- Requer `Authorization: Bearer <token>`.
- Response: `OrderResponse` com `items: List<OrderItemResponse>`.

## 3. Campos e dados da tela

**Cabeçalho:**

| Campo | Origem |
|-------|--------|
| Code (UUID) | `OrderResponse.code` |
| Status | `OrderResponse.status` |
| Cliente ID | `OrderResponse.customerId` |
| Responsável (userId) | `OrderResponse.userId` |
| Moeda | `OrderResponse.currencyCode` |
| Notas | `OrderResponse.notes` |
| Criado em | `OrderResponse.createdAt` |

**Tabela de itens:**

| Campo | Origem |
|-------|--------|
| Item ID | `OrderItemResponse.itemId` |
| Quantidade | `OrderItemResponse.quantity` |
| Preço unitário | `OrderItemResponse.unitPriceCents` |
| Total do item | `OrderItemResponse.totalPriceCents` |

**Rodapé financeiro:**

| Campo | Origem |
|-------|--------|
| Subtotal | `OrderResponse.subtotalCents` |
| Desconto | `OrderResponse.discountCents` |
| Total | `OrderResponse.totalCents` |

## 4. Ações do usuário

- **Visualizar**: modo leitura.
- **Editar**: → `/orders/:id/edit`.
- **Excluir**: confirmação → `DELETE` → `/orders`.

## 5. Regras de negócio

- Todos os valores em centavos; exibir formatados como moeda.
- `items` pode ser lista vazia.
- Links para cliente (`/customers/:customerId`) e usuário (`/users/:userId`).

## 6. Estados da interface

- **Carregando**: skeleton.
- **Sucesso**: dados exibidos.
- **Não encontrado (404)**: mensagem + botão voltar.
- **Não autenticado (401)**: redirect.

## 7. Navegação e fluxo

- Origem: listagem de pedidos.
- "Editar" → `/orders/:id/edit`.
- Após exclusão → `/orders`.

## 8. Critérios de aceite

- [ ] `GET /api/v1/orders/{id}` chamado ao entrar.
- [ ] Tabela de itens exibida (mesmo que vazia).
- [ ] Valores formatados como moeda BRL.
- [ ] Exclusão com confirmação redireciona para listagem.

## 9. Observações técnicas para front

- Formatar centavos para moeda conforme `currencyCode`.
- Linha de totais com destaque visual (negrito ou separador).
- Badge de status com cor.
