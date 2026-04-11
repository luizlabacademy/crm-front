# Tenants — Cadastro e Edição

## 1. Objetivo
- Criar ou editar uma empresa/cliente da plataforma (tenant).
- Perfil: super-administradores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/tenants` | Cria tenant (201) |
| `PUT` | `/api/v1/tenants/{id}` | Atualiza tenant (200) |
| `GET` | `/api/v1/tenants/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/tenants` | Lista tenants para seletor de tenant pai |

- Requer `Authorization: Bearer <token>`.
- Request body (`TenantRequest`): `parentTenantId?`, `name`, `category`, `active`.
- Response `201`/`200`: `TenantResponse` completo.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Nome | input text | Sim | Não vazio |
| Categoria | input text | Sim | Não vazio |
| Tenant pai | select/autocomplete (Long) | Não | ID válido de outro tenant |
| Ativo | toggle | Não | Default: true |

## 4. Ações do usuário

- **Preencher formulário** → validação em tempo real.
- **Salvar**: botão "Salvar" → `POST` (novo) ou `PUT` (edição).
  - Sucesso: toast + redirect para `/tenants`.
  - Erro: mensagem inline ou toast global.
- **Cancelar**: botão "Cancelar" → volta para `/tenants` sem salvar.
- **Modo edição**: carrega dados via `GET /api/v1/tenants/{id}`.

## 5. Regras de negócio

- `name` e `category` são obrigatórios.
- `parentTenantId` permite hierarquia de tenants; é opcional.
- `category` é texto livre — pendente de definição de valores padronizados.
- Evitar selecionar o próprio tenant como pai — validação client-side.
- `PUT` substitui todos os campos.

## 6. Estados da interface

- **Carregando dados (edição)**: skeleton no formulário.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Tenant salvo com sucesso." + redirect.
- **Erro de validação (400)**: mensagens inline.
- **Não encontrado (404)**: mensagem "Tenant não encontrado." com botão de voltar.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/tenants/new`.
- Origem (edição): botão editar na listagem → `/tenants/:id/edit`.
- Após salvar: `/tenants`.
- Cancelar: `/tenants`.

## 8. Critérios de aceite

- [ ] Given: `name` vazio → botão "Salvar" desabilitado.
- [ ] Given: `category` vazio → botão "Salvar" desabilitado.
- [ ] Given: `parentTenantId` = próprio tenant → erro de validação client-side.
- [ ] Given: `parentTenantId` não selecionado → enviado como `null`.
- [ ] Given: formulário válido (novo) → `POST` chamado com body correto.
- [ ] Given: edição → `GET` carrega e preenche; `PUT` atualiza e redireciona.

## 9. Observações técnicas para front

- Seletor de `parentTenantId`: autocomplete carregando de `GET /api/v1/tenants`, excluindo o tenant sendo editado da lista.
- No modo de criação, pré-preencher `active = true`.
