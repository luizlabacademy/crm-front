# Perfis (Roles) — Cadastro e Edição

## 1. Objetivo
- Criar ou editar um perfil de acesso (role) do sistema.
- Perfil: super-administradores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/roles` | Cria role (201) |
| `PUT` | `/api/v1/roles/{id}` | Atualiza role (200) |
| `GET` | `/api/v1/roles/{id}` | Carrega dados para edição |

- Requer `Authorization: Bearer <token>`.
- Request body (`RoleRequest`): `name`, `description?`, `active`.
- Response `201`/`200`: `RoleResponse` completo.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Nome | input text | Sim | Não vazio |
| Descrição | textarea | Não | — |
| Ativo | toggle | Não | Default: true |

## 4. Ações do usuário

- **Preencher formulário** → validação em tempo real.
- **Salvar**: botão "Salvar" → `POST` (novo) ou `PUT` (edição).
  - Sucesso: toast + redirect para `/admin/roles`.
  - Erro: mensagem inline ou toast global.
- **Cancelar**: botão "Cancelar" → volta para `/admin/roles` sem salvar.
- **Modo edição**: carrega dados via `GET /api/v1/roles/{id}`.

## 5. Regras de negócio

- Roles são globais (sem `tenantId`).
- `name` é obrigatório.
- Não há endpoint de vinculação Role <> Permission nesta versão — o perfil é cadastrado mas não vinculado a permissões pela API.
- `PUT` substitui todos os campos.

## 6. Estados da interface

- **Carregando dados (edição)**: skeleton no formulário.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Perfil salvo com sucesso." + redirect.
- **Erro de validação (400)**: mensagens inline.
- **Não encontrado (404)**: mensagem "Perfil não encontrado." com botão de voltar.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/admin/roles/new`.
- Origem (edição): botão editar na listagem → `/admin/roles/:id/edit`.
- Após salvar: `/admin/roles`.
- Cancelar: `/admin/roles`.

## 8. Critérios de aceite

- [ ] Given: `name` vazio → botão "Salvar" desabilitado.
- [ ] Given: formulário válido (novo) → `POST` chamado com body correto.
- [ ] Given: edição → `GET` carrega e preenche; `PUT` atualiza e redireciona.

## 9. Observações técnicas para front

- CRUD simples; formulário pode ser modal ou página dedicada.
- No modo de criação, pré-preencher `active = true`.
