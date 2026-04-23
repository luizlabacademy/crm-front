# Tenants — Listagem

## 1. Objetivo
- Exibir todas as empresas/clientes da plataforma (multi-tenant) com paginação.
- Perfil: super-administradores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/tenants` | Lista tenants paginados |
| `DELETE` | `/api/v1/tenants/{id}` | Remove tenant |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20). Ordenação: `name` ASC.
- Response `200`: `PageResponse<TenantResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID / Code | Long / UUID | `TenantResponse.id`, `.code` |
| Nome | String | `TenantResponse.name` |
| Categoria | String | `TenantResponse.category` |
| Tenant pai | Long (nullable) | `TenantResponse.parentTenantId` |
| Ativo | Boolean | `TenantResponse.active` |
| Criado em | OffsetDateTime | `TenantResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Paginar**: próxima/anterior, seletor de tamanho.
- **Novo**: botão "Novo" → `/tenants/new`.
- **Editar**: clique na linha → `/tenants/:id/edit`.
- **Excluir**: botão com confirmação → `DELETE` → recarrega lista.
- **Ver tenant pai**: link na coluna → `/tenants/:parentTenantId/edit`.

## 5. Regras de negócio

- `parentTenantId` permite hierarquia de tenants.
- `TenantId = 1` é o tenant do `AdminSeeder` — evitar exclusão pela UI (desabilitar botão ou alert).
- `active = false` desativa sem excluir.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhum tenant encontrado." com botão "Criar tenant".
- **Sucesso**: tabela paginada.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu admin "Tenants".
- "Novo" → `/tenants/new`.
- Editar → `/tenants/:id/edit`.
- Link tenant pai → `/tenants/:parentTenantId/edit`.
- Após exclusão: permanece na listagem.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/tenants?page=0&size=20`.
- [ ] Paginação funciona corretamente.
- [ ] Tenant com `id=1` não pode ser excluído (botão desabilitado ou alert).
- [ ] Exclusão com confirmação.

## 9. Observações técnicas para front

- Badge ativo/inativo.
- Exibir `parentTenantId` resolvido como nome se disponível.
- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Paginação server-side.
