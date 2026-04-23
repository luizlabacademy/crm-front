# Pedidos — Cadastro e Edição

## 1. Objetivo
- Criar ou editar um pedido, incluindo a composição de itens, valores e status.
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/orders` | Cria pedido (201) |
| `PUT` | `/api/v1/orders/{id}` | Atualiza pedido (200) |
| `GET` | `/api/v1/orders/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/customers` | Busca clientes |
| `GET` | `/api/v1/items` | Busca itens do catálogo |
| `GET` | `/api/v1/users` | Busca usuários responsáveis |

- Requer `Authorization: Bearer <token>`.
- Request body (`OrderRequest`): `tenantId`, `customerId`, `userId`, `status`, `subtotalCents`, `discountCents`, `totalCents`, `currencyCode`, `notes?`, `items[]`.
- `OrderItemRequest`: `itemId`, `quantity`, `unitPriceCents`, `totalPriceCents`.

## 3. Campos e dados da tela

**Cabeçalho do pedido:**

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Tenant | select (Long) | Sim | Deve existir |
| Cliente | autocomplete (Long) | Sim | Deve existir |
| Responsável | select (Long) | Sim | Usuário válido |
| Status | select (String) | Não | Default: `DRAFT` |
| Desconto | input numérico (R$) | Não | ≥ 0 |
| Moeda | input text | Não | Default: `BRL` |
| Notas | textarea | Não | — |

**Itens do pedido (lista dinâmica):**

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Item | autocomplete (Long) | Sim | Deve existir no catálogo |
| Quantidade | input numérico | Sim | ≥ 1 |
| Preço unitário (R$) | input numérico | Sim | > 0 |
| Total do item | calculado | — | `quantity × unitPriceCents` |

**Rodapé calculado (somente leitura):**
- Subtotal = soma dos `totalPriceCents` dos itens.
- Total = Subtotal − Desconto.

## 4. Ações do usuário

- **Adicionar item**: botão "+" abre seletor de item → adiciona linha na tabela de itens.
- **Remover item**: ícone "×" na linha.
- **Alterar quantidade ou preço**: recalcula totais automaticamente.
- **Salvar**: `POST` ou `PUT`.
- **Cancelar**: volta para `/orders`.

## 5. Regras de negócio

- O cálculo de `subtotalCents`, `discountCents` e `totalCents` é responsabilidade do front — o backend aceita os valores enviados sem recalcular.
- `PUT` substitui o pedido inteiro incluindo a lista de itens.
- `currencyCode` padrão `BRL`.
- Status possíveis além de `DRAFT`: Pendente de definição.

## 6. Estados da interface

- **Carregando (edição)**: skeleton.
- **Salvando**: spinner no botão.
- **Sucesso**: toast + redirect para `/orders/:id`.
- **Erro de validação**: mensagens inline.
- **Não autenticado**: redirect.

## 7. Navegação e fluxo

- Origem: listagem de pedidos.
- Após salvar: `/orders/:id`.
- Cancelar: `/orders`.

## 8. Critérios de aceite

- [ ] Sem `customerId` ou `userId` → "Salvar" desabilitado.
- [ ] Adição de item recalcula subtotal e total automaticamente.
- [ ] Remoção de item recalcula totais.
- [ ] Desconto não pode ser maior que o subtotal.
- [ ] `POST` enviado com corpo completo incluindo `items[]`.

## 9. Observações técnicas para front

- Todos os valores exibidos em R$ com 2 casas decimais; armazenar e enviar em centavos.
- Input de preço: usar `input[type=number]` com `step=0.01`, converter para centavos ao salvar.
- Tabela de itens com linha de adição inline ou modal de seleção.
- Autocomplete de item com debounce, buscando de `GET /api/v1/items?tenantId=X`.
- Recalcular totais em cada mudança de quantidade ou preço.
