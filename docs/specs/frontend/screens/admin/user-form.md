# Usuários — Cadastro e Edição

## 1. Objetivo
- Criar ou editar um usuário do sistema CRM vinculado a um tenant.
- Perfil: administradores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/users` | Cria usuário (201) |
| `PUT` | `/api/v1/users/{id}` | Atualiza usuário (200) |
| `GET` | `/api/v1/users/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/persons` | Pessoas para vinculação opcional |
| `GET` | `/api/v1/tenants` | Lista tenants para seleção |

- Requer `Authorization: Bearer <token>`.
- Request body (`UserRequest`): `tenantId`, `personId?`, `email`, `passwordHash`, `active`.
- Response `201`/`200`: `UserResponse` completo (sem `passwordHash`).

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Tenant | select (Long) | Sim | Deve existir |
| Pessoa | autocomplete (Long) | Não | ID válido de Person |
| E-mail | input email | Sim | Formato e-mail válido; único |
| Senha | input password | Sim (novo) / Não (edição) | Mínimo 8 caracteres |
| Confirmar senha | input password | Sim (se senha preenchida) | Igual ao campo senha |
| Ativo | toggle | Não | Default: true |

## 4. Ações do usuário

- **Preencher formulário** → validação em tempo real.
- **Salvar**: botão "Salvar" → `POST` (novo) ou `PUT` (edição).
  - Sucesso: toast + redirect para `/users`.
  - Erro: mensagem inline ou toast global.
- **Cancelar**: botão "Cancelar" → volta para `/users` sem salvar.
- **Modo edição**: carrega dados via `GET /api/v1/users/{id}`. Campo senha vazio (opcional na edição).

## 5. Regras de negócio

- O campo do DTO se chama `passwordHash`, mas o frontend deve enviar a senha em **plain text** — o backend gera o hash BCrypt.
- Na edição, a senha é opcional: se vazio, não enviar ou enviar string vazia — **pendente de definição** de como o backend trata `passwordHash` vazio no `PUT`.
- A senha nunca é retornada na `UserResponse`.
- `email` deve ser único no sistema.
- O `AdminSeeder` garante `admin@saas.com`; este usuário não deve ser editado/excluído pela interface.

## 6. Estados da interface

- **Carregando dados (edição)**: skeleton no formulário.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Usuário salvo com sucesso." + redirect.
- **Erro de validação (400)**: mensagens inline (ex.: email duplicado).
- **Não encontrado (404)**: mensagem "Usuário não encontrado." com botão de voltar.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/users/new`.
- Origem (edição): botão editar na listagem → `/users/:id/edit`.
- Após salvar: `/users`.
- Cancelar: `/users`.
- Link para `/persons/:personId`.

## 8. Critérios de aceite

- [ ] Given: `email` vazio → botão "Salvar" desabilitado.
- [ ] Given: `tenantId` não selecionado → botão "Salvar" desabilitado.
- [ ] Given: senha < 8 caracteres → erro inline.
- [ ] Given: confirmação de senha diferente → erro inline.
- [ ] Given: modo criação → senha obrigatória.
- [ ] Given: modo edição → senha opcional (campo vazio não envia).
- [ ] Given: `passwordHash` nunca exibido na interface.

## 9. Observações técnicas para front

- Campo senha com toggle de visibilidade.
- `autocomplete="new-password"` no campo de senha para criação.
- Seletor de `personId`: autocomplete exibindo nome da pessoa.
- Seletor de `tenantId`: pré-preencher com tenant do usuário logado se disponível.
- Não exibir campo `passwordHash` em nenhuma situação.
- Enviar senha como plain text no campo `passwordHash` do request body.
