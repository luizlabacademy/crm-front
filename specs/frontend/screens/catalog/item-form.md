# Catálogo de Itens — Cadastro e Edição

## 1. Objetivo
- Criar ou editar um produto ou serviço do catálogo.
- Perfil: gestores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/items` | Cria item (201) |
| `PUT` | `/api/v1/items/{id}` | Atualiza item (200) |
| `GET` | `/api/v1/items/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/item-categories` | Lista categorias para seleção |
| `GET` | `/api/v1/tenants` | Lista tenants para seleção |

- Requer `Authorization: Bearer <token>`.
- Request body (`ItemRequest`): `tenantId`, `categoryId?`, `type`, `name`, `sku?`, `active`.
- Response `201`/`200`: `ItemResponse` completo.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Tenant | select (Long) | Sim | Deve existir |
| Categoria | select (Long) | Não | ID válido de ItemCategory |
| Tipo | select (String) | Sim | Ex.: PRODUCT, SERVICE — pendente de definição |
| Nome | input text | Sim | Não vazio |
| SKU | input text | Não | Texto livre |
| Ativo | toggle | Não | Default: true |

## 4. Ações do usuário

- **Preencher formulário** → validação em tempo real.
- **Salvar**: botão "Salvar" → `POST` (novo) ou `PUT` (edição).
  - Sucesso: toast + redirect para `/catalog/items`.
  - Erro: mensagem inline ou toast global.
- **Cancelar**: botão "Cancelar" → volta para `/catalog/items` sem salvar.
- **Modo edição**: carrega dados via `GET /api/v1/items/{id}`.

## 5. Regras de negócio

- `type` diferencia produto de serviço — valores exatos pendentes de definição no backend.
- `categoryId` é opcional; permite agrupar itens por categoria.
- Itens são referenciados em `OrderItem`; exclusão pode impactar pedidos existentes.
- `PUT` substitui todos os campos.

## 6. Estados da interface

- **Carregando dados (edição)**: skeleton no formulário.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Item salvo com sucesso." + redirect.
- **Erro de validação (400)**: mensagens inline.
- **Não encontrado (404)**: mensagem "Item não encontrado." com botão de voltar.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/catalog/items/new`.
- Origem (edição): botão editar na listagem → `/catalog/items/:id/edit`.
- Após salvar: `/catalog/items`.
- Cancelar: `/catalog/items`.

## 8. Critérios de aceite

- [ ] Given: `name` vazio → botão "Salvar" desabilitado.
- [ ] Given: `type` não selecionado → botão "Salvar" desabilitado.
- [ ] Given: `tenantId` não selecionado → botão "Salvar" desabilitado.
- [ ] Given: `categoryId` não selecionado → enviado como `null`.
- [ ] Given: formulário válido (novo) → `POST` chamado com body correto.
- [ ] Given: edição → `GET` carrega e preenche; `PUT` atualiza e redireciona.

## 9. Observações técnicas para front

- Seletor de `categoryId`: carregar de `GET /api/v1/item-categories?tenantId=X`.
- Campo `type`: select com opções fixas quando definidas no backend.
- Seletor de `tenantId`: pré-preencher com tenant do usuário logado.
- No modo de criação, pré-preencher `active = true`.
