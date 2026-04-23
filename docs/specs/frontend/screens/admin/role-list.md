# Perfis (Roles) — Listagem

## 1. Objetivo
- Exibir todos os perfis de acesso (roles) do sistema com paginação.
- Perfil: super-administradores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/roles` | Lista roles paginadas |
| `DELETE` | `/api/v1/roles/{id}` | Remove role |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20). Ordenação: `name` ASC. **Sem filtro por `tenantId`** — roles são globais.
- Response `200`: `PageResponse<RoleResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID | Long | `RoleResponse.id` |
| Nome | String | `RoleResponse.name` |
| Descrição | String (nullable) | `RoleResponse.description` |
| Ativo | Boolean | `RoleResponse.active` |
| Criado em | OffsetDateTime | `RoleResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Paginar**: próxima/anterior, seletor de tamanho.
- **Novo**: botão "Novo" → `/admin/roles/new`.
- **Editar**: clique na linha → `/admin/roles/:id/edit`.
- **Excluir**: botão com confirmação → `DELETE` → recarrega lista.

## 5. Regras de negócio

- Roles são globais (sem `tenantId`).
- Não há endpoint de vinculação Role <> User nesta versão — o perfil é apenas cadastrado, não atribuído.
- Não há endpoint de vinculação Role <> Permission nesta versão.
- `active = false` desativa sem excluir.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhum perfil encontrado." com botão "Criar perfil".
- **Sucesso**: tabela paginada.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Acesso" > "Perfis".
- "Novo" → `/admin/roles/new`.
- Editar → `/admin/roles/:id/edit`.
- Após exclusão: permanece na listagem.
- Link para permissões → `/admin/permissions`.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/roles?page=0&size=20`.
- [ ] Paginação funciona corretamente.
- [ ] Exclusão com confirmação.

## 9. Observações técnicas para front

- Badge ativo/inativo.
- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Paginação server-side.
