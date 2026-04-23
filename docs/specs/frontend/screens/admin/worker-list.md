# Funcionários (Worker) — Listagem

## 1. Objetivo
- Exibir todos os funcionários de cada tenant com paginação e filtro por tenant.
- Perfil: administradores e gestores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/workers` | Lista workers paginados |
| `DELETE` | `/api/v1/workers/{id}` | Remove worker |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20), `tenantId` (opcional). Ordenação: `id` ASC.
- Response `200`: `PageResponse<WorkerResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID / Code | Long / UUID | `WorkerResponse.id`, `.code` |
| Person ID | Long | `WorkerResponse.personId` |
| User ID | Long (nullable) | `WorkerResponse.userId` |
| Tenant ID | Long | `WorkerResponse.tenantId` |
| Ativo | Boolean | `WorkerResponse.active` |
| Criado em | OffsetDateTime | `WorkerResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Filtrar por tenant**: select ou input de `tenantId`.
- **Paginar**: próxima/anterior, seletor de tamanho.
- **Novo**: botão "Novo" → `/workers/new`.
- **Editar**: clique na linha → `/workers/:id/edit`.
- **Excluir**: botão com confirmação → `DELETE` → recarrega lista.
- **Ver detalhe**: links para Person e User vinculados.

## 5. Regras de negócio

- `personId` é obrigatório — um worker sempre referencia uma Person.
- `userId` é opcional — nem todo funcionário tem acesso ao sistema.
- `active = false` desativa sem excluir.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhum funcionário encontrado." com botão "Cadastrar funcionário".
- **Sucesso**: tabela paginada.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Funcionários".
- "Novo" → `/workers/new`.
- Editar → `/workers/:id/edit`.
- Links para `/persons/:personId` e `/users/:userId`.
- Após exclusão: permanece na listagem.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/workers?page=0&size=20`.
- [ ] Filtro por `tenantId` funciona.
- [ ] Exclusão com confirmação.
- [ ] Links para Person e User funcionam.

## 9. Observações técnicas para front

- Resolver `personId` para nome: exibir `fullName` (física) ou `corporateName` (jurídica).
- Resolver `userId` para email se disponível.
- Badge ativo/inativo.
- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Paginação server-side.
