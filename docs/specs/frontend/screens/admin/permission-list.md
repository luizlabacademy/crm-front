# Permissões (Permissions) — Listagem e Cadastro

## 1. Objetivo
- Gerenciar as permissões do sistema para controle de acesso. Listagem paginada + formulário de criação/edição.
- Perfil: super-administradores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/permissions` | Lista permissions paginadas |
| `GET` | `/api/v1/permissions/{id}` | Detalhe |
| `POST` | `/api/v1/permissions` | Cria permission (201) |
| `PUT` | `/api/v1/permissions/{id}` | Atualiza permission (200) |
| `DELETE` | `/api/v1/permissions/{id}` | Remove permission |

- Requer `Authorization: Bearer <token>`.
- Parâmetros listagem: `page` (0), `size` (20). Ordenação: `code` ASC. **Sem filtro por `tenantId`** — permissões são globais.
- Request body (`PermissionRequest`): `code`, `description?`, `active`.
- Response: `PermissionResponse` com `id`, `code`, `description`, `active`, `createdAt`.

## 3. Campos e dados da tela

### Listagem

| Campo | Tipo | Origem |
|-------|------|--------|
| ID | Long | `PermissionResponse.id` |
| Código | String | `PermissionResponse.code` |
| Descrição | String (nullable) | `PermissionResponse.description` |
| Ativo | Boolean | `PermissionResponse.active` |
| Criado em | OffsetDateTime | `PermissionResponse.createdAt` |

### Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Código | input text | Sim | Não vazio; uppercase; convenção `RESOURCE_ACTION` (ex.: `CUSTOMER_READ`) |
| Descrição | textarea | Não | — |
| Ativo | toggle | Não | Default: true |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Paginar**: próxima/anterior, seletor de tamanho.
- **Novo**: botão "Novo" → abre formulário (modal ou inline).
- **Editar**: clique na linha → abre formulário com dados preenchidos.
- **Excluir**: botão com confirmação → `DELETE` → recarrega lista.
- **Salvar**: `POST` (novo) ou `PUT` (edição) → toast + recarrega lista.
- **Cancelar**: fecha formulário sem salvar.

## 5. Regras de negócio

- Permissões são globais (sem `tenantId`).
- `code` deve ser único e seguir convenção `RESOURCE_ACTION` — pendente de definição formal no backend.
- Não há endpoint de vinculação Role <> Permission nesta versão — a permissão é cadastrada mas não vinculada a perfis pela API.
- `active = false` desativa sem excluir.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhuma permissão encontrada." com botão "Criar permissão".
- **Sucesso**: tabela paginada.
- **Salvando**: spinner no botão do formulário.
- **Erro de validação (400)**: mensagens inline.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Acesso" > "Permissões".
- Formulário pode ser modal (CRUD simples) ou rota dedicada.
- Link para perfis → `/admin/roles`.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/permissions?page=0&size=20`.
- [ ] Paginação funciona corretamente.
- [ ] `code` obrigatório e convertido para uppercase automaticamente.
- [ ] Exclusão com confirmação.
- [ ] Formulário de criação e edição funciona (modal ou página).

## 9. Observações técnicas para front

- `code` de permission em uppercase automático no input (`toUpperCase()` no `onChange`).
- Badge ativo/inativo na listagem.
- CRUD simples — formulário pode ser modal para evitar navegação extra.
- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Paginação server-side.
