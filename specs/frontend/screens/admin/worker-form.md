# Funcionários (Worker) — Cadastro e Edição

## 1. Objetivo
- Criar ou editar um funcionário vinculado a uma Person e opcionalmente a um User do sistema.
- Perfil: administradores e gestores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/workers` | Cria worker (201) |
| `PUT` | `/api/v1/workers/{id}` | Atualiza worker (200) |
| `GET` | `/api/v1/workers/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/persons` | Lista pessoas para seleção |
| `GET` | `/api/v1/users` | Lista usuários para seleção |
| `GET` | `/api/v1/tenants` | Lista tenants para seleção |

- Requer `Authorization: Bearer <token>`.
- Request body (`WorkerRequest`): `tenantId`, `personId`, `userId?`, `active`.
- Response `201`/`200`: `WorkerResponse` completo.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Tenant | select (Long) | Sim | Deve existir |
| Pessoa | autocomplete (Long) | Sim | Deve existir em persons |
| Usuário do sistema | autocomplete (Long) | Não | ID válido de User |
| Ativo | toggle | Não | Default: true |

## 4. Ações do usuário

- **Preencher formulário** → validação em tempo real.
- **Salvar**: botão "Salvar" → `POST` (novo) ou `PUT` (edição).
  - Sucesso: toast + redirect para `/workers`.
  - Erro: mensagem inline ou toast global.
- **Cancelar**: botão "Cancelar" → volta para `/workers` sem salvar.
- **Modo edição**: carrega dados via `GET /api/v1/workers/{id}`.

## 5. Regras de negócio

- `personId` é obrigatório — um worker deve sempre referenciar uma Person.
- `userId` é opcional — nem todo funcionário tem acesso ao sistema.
- `active = false` desativa sem excluir.
- `PUT` substitui todos os campos.

## 6. Estados da interface

- **Carregando dados (edição)**: skeleton no formulário.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Funcionário salvo com sucesso." + redirect.
- **Erro de validação (400)**: mensagens inline.
- **Não encontrado (404)**: mensagem "Funcionário não encontrado." com botão de voltar.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/workers/new`.
- Origem (edição): botão editar na listagem → `/workers/:id/edit`.
- Após salvar: `/workers`.
- Cancelar: `/workers`.
- Links para `/persons/:personId` e `/users/:userId`.

## 8. Critérios de aceite

- [ ] Given: `personId` não selecionado → botão "Salvar" desabilitado.
- [ ] Given: `tenantId` não selecionado → botão "Salvar" desabilitado.
- [ ] Given: `userId` não selecionado → enviado como `null`.
- [ ] Given: formulário válido (novo) → `POST` chamado com body correto.
- [ ] Given: edição → `GET` carrega e preenche; `PUT` atualiza e redireciona.

## 9. Observações técnicas para front

- Autocomplete de `personId`: exibir `fullName` (física) ou `corporateName` (jurídica).
- Autocomplete de `userId`: exibir `email`.
- Seletor de `tenantId`: pré-preencher com tenant do usuário logado.
- No modo de criação, pré-preencher `active = true`.
