# Schedules (Agendamentos de Cliente) — Listagem

## 1. Objetivo
- Exibir todos os vínculos entre tenant, cliente e appointment (Schedules) com paginação e filtro por tenant.
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/schedules` | Lista schedules paginados |
| `DELETE` | `/api/v1/schedules/{id}` | Remove schedule |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20), `tenantId` (opcional).
- Ordenação: `id` DESC.
- Response `200`: `PageResponse<ScheduleResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID / Code | Long / UUID | `ScheduleResponse.id`, `.code` |
| Tenant ID | Long | `ScheduleResponse.tenantId` |
| Cliente ID | Long | `ScheduleResponse.customerId` |
| Appointment ID | Long | `ScheduleResponse.appointmentId` |
| Descrição | String (nullable) | `ScheduleResponse.description` |
| Ativo | Boolean | `ScheduleResponse.active` |
| Criado em | OffsetDateTime | `ScheduleResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Filtrar por tenant**: select ou input de `tenantId`.
- **Paginar**: próxima/anterior, seletor de tamanho (20/50/100).
- **Novo**: botão "Novo" → `/schedules/new`.
- **Editar**: clique na linha → `/schedules/:id/edit`.
- **Excluir**: botão com confirmação → `DELETE /api/v1/schedules/{id}` → recarrega lista.

## 5. Regras de negócio

- `Schedule` liga `Tenant` + `Customer` + `Appointment`.
- Um mesmo `appointmentId` pode estar em múltiplos schedules (diferentes clientes/tenants).
- `active = false` não exclui o vínculo — apenas desativa.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhum agendamento de cliente encontrado." com botão "Criar schedule".
- **Sucesso**: tabela com paginação.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Agendamentos de Clientes" ou via detalhe do cliente.
- "Novo" → `/schedules/new`.
- Editar → `/schedules/:id/edit`.
- Após exclusão: permanece na listagem, lista recarregada.
- Link appointment → `/appointments/:appointmentId`.
- Link customer → `/customers/:customerId`.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/schedules?page=0&size=20`.
- [ ] Filtro por `tenantId` dispara nova requisição filtrada.
- [ ] Paginação funciona corretamente.
- [ ] Exclusão com confirmação → `DELETE` → linha removida.
- [ ] Token ausente → redirect `/login`.

## 9. Observações técnicas para front

- Exibir `customerId` resolvido como nome (`fullName`) se disponível via join ou chamada auxiliar.
- Exibir `appointmentId` resolvido como data/hora (`scheduledAt`).
- Badge ativo/inativo.
- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Paginação server-side.
- Cache: invalidar após criação/edição/exclusão.
