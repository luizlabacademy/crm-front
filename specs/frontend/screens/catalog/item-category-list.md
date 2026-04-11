# Categorias de Itens — Listagem

## 1. Objetivo
- Exibir todas as categorias do catálogo de produtos/serviços com paginação e filtro por tenant.
- Perfil: gestores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/item-categories` | Lista categorias paginadas |
| `DELETE` | `/api/v1/item-categories/{id}` | Remove categoria |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20), `tenantId` (opcional). Ordenação: `name` ASC.
- Response `200`: `PageResponse<ItemCategoryResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID | Long | `ItemCategoryResponse.id` |
| Nome | String | `ItemCategoryResponse.name` |
| Tenant ID | Long | `ItemCategoryResponse.tenantId` |
| Criado em | OffsetDateTime | `ItemCategoryResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Filtrar por tenant**: select ou input de `tenantId`.
- **Paginar**: próxima/anterior, seletor de tamanho.
- **Novo**: botão "Novo" → `/catalog/categories/new`.
- **Editar**: clique na linha → `/catalog/categories/:id/edit`.
- **Excluir**: botão com confirmação → `DELETE` → recarrega lista.

## 5. Regras de negócio

- Categoria não tem campo `active` no modelo — exclusão é definitiva.
- Itens referenciando a categoria ficam com `categoryId = null` se a categoria for excluída — pendente de validação no backend.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhuma categoria cadastrada." com botão "Criar categoria".
- **Sucesso**: tabela paginada.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Catálogo" > "Categorias".
- "Novo" → `/catalog/categories/new`.
- Editar → `/catalog/categories/:id/edit`.
- Link itens da categoria → `/catalog/items?categoryId=X`.
- Após exclusão: permanece na listagem.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/item-categories?page=0&size=20`.
- [ ] Filtro por `tenantId` funciona.
- [ ] Exclusão com confirmação.

## 9. Observações técnicas para front

- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Paginação server-side.
