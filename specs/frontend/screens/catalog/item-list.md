# Catálogo de Itens — Listagem

## 1. Objetivo
- Exibir todos os produtos e serviços do catálogo com paginação e filtro por tenant.
- Perfil: gestores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/items` | Lista itens paginados |
| `DELETE` | `/api/v1/items/{id}` | Remove item |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20), `tenantId` (opcional). Ordenação: `name` ASC.
- Response `200`: `PageResponse<ItemResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID / Code | Long / UUID | `ItemResponse.id`, `.code` |
| Nome | String | `ItemResponse.name` |
| Tipo | String | `ItemResponse.type` |
| SKU | String (nullable) | `ItemResponse.sku` |
| Categoria ID | Long (nullable) | `ItemResponse.categoryId` |
| Ativo | Boolean | `ItemResponse.active` |
| Criado em | OffsetDateTime | `ItemResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Filtrar por tenant**: select ou input de `tenantId`.
- **Paginar**: próxima/anterior, seletor de tamanho.
- **Novo**: botão "Novo" → `/catalog/items/new`.
- **Editar**: clique na linha → `/catalog/items/:id/edit`.
- **Excluir**: botão com confirmação → `DELETE` → recarrega lista.

## 5. Regras de negócio

- `type` diferencia produto de serviço — valores exatos pendentes de definição.
- Itens são referenciados em `OrderItem`; exclusão deve alertar se existirem pedidos com o item — pendente de validação no backend.
- `active = false` desativa sem excluir.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhum item no catálogo." com botão "Cadastrar item".
- **Sucesso**: tabela paginada.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Catálogo" ou submenu "Itens".
- "Novo" → `/catalog/items/new`.
- Editar → `/catalog/items/:id/edit`.
- Link categoria → `/catalog/categories` (filtrado).
- Após exclusão: permanece na listagem.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/items?page=0&size=20`.
- [ ] Filtro por `tenantId` funciona.
- [ ] Exclusão com confirmação.
- [ ] `type` exibido como badge ou label.

## 9. Observações técnicas para front

- Resolver `categoryId` para nome da categoria se disponível.
- Badge ativo/inativo.
- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Paginação server-side.
