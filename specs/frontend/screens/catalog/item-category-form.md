# Categorias de Itens — Cadastro e Edição

## 1. Objetivo
- Criar ou editar uma categoria do catálogo de produtos/serviços.
- Perfil: gestores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/item-categories` | Cria categoria (201) |
| `PUT` | `/api/v1/item-categories/{id}` | Atualiza categoria (200) |
| `GET` | `/api/v1/item-categories/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/tenants` | Lista tenants para seleção |

- Requer `Authorization: Bearer <token>`.
- Request body (`ItemCategoryRequest`): `tenantId`, `name`.
- Response `201`/`200`: `ItemCategoryResponse` completo.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Tenant | select (Long) | Sim | Deve existir |
| Nome | input text | Sim | Não vazio |

## 4. Ações do usuário

- **Preencher formulário** → validação em tempo real.
- **Salvar**: botão "Salvar" → `POST` (novo) ou `PUT` (edição).
  - Sucesso: toast + redirect para `/catalog/categories`.
  - Erro: mensagem inline ou toast global.
- **Cancelar**: botão "Cancelar" → volta para `/catalog/categories` sem salvar.
- **Modo edição**: carrega dados via `GET /api/v1/item-categories/{id}`.

## 5. Regras de negócio

- `name` e `tenantId` são obrigatórios.
- Categoria não tem campo `active` — não há toggle de ativação.
- Itens referenciando a categoria ficam com `categoryId = null` se excluída.
- `PUT` substitui todos os campos.

## 6. Estados da interface

- **Carregando dados (edição)**: skeleton no formulário.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Categoria salva com sucesso." + redirect.
- **Erro de validação (400)**: mensagens inline.
- **Não encontrado (404)**: mensagem "Categoria não encontrada." com botão de voltar.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/catalog/categories/new`.
- Origem (edição): botão editar na listagem → `/catalog/categories/:id/edit`.
- Após salvar: `/catalog/categories`.
- Cancelar: `/catalog/categories`.

## 8. Critérios de aceite

- [ ] Given: `name` vazio → botão "Salvar" desabilitado.
- [ ] Given: `tenantId` não selecionado → botão "Salvar" desabilitado.
- [ ] Given: formulário válido (novo) → `POST` chamado com body correto.
- [ ] Given: edição → `GET` carrega e preenche; `PUT` atualiza e redireciona.

## 9. Observações técnicas para front

- CRUD simples; formulário pode ser modal ou página dedicada.
- Seletor de `tenantId`: pré-preencher com tenant do usuário logado.
