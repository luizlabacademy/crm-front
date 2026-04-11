# Agendamentos — Listagem

## 1. Objetivo
- Exibir todos os agendamentos do CRM com paginação.
- Perfil: gestores, atendentes e workers autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/appointments` | Lista agendamentos paginados |
| `DELETE` | `/api/v1/appointments/{id}` | Remove agendamento |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20).
- Ordenação: `scheduledAt` DESC.
- **Sem filtro por `tenantId`** — endpoint não aceita esse parâmetro.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID / Code | Long / UUID | `AppointmentResponse.id`, `.code` |
| Status | String | `AppointmentResponse.status` |
| Agendado para | OffsetDateTime | `AppointmentResponse.scheduledAt` |
| Iniciado em | OffsetDateTime (nullable) | `AppointmentResponse.startedAt` |
| Finalizado em | OffsetDateTime (nullable) | `AppointmentResponse.finishedAt` |
| Total | Long (nullable, cents) | `AppointmentResponse.totalCents` |
| Notas | String (nullable) | `AppointmentResponse.notes` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar.
- **Paginar**.
- **Novo**: "Novo" → `/appointments/new`.
- **Editar**: → `/appointments/:id/edit`.
- **Excluir**: confirmação → `DELETE`.
- **Ver detalhe**: → `/appointments/:id`.

## 5. Regras de negócio

- Status possíveis: `SCHEDULED` (padrão). Outros valores — Pendente de definição.
- Um `Appointment` sem tenant próprio é vinculado ao tenant por meio do `Schedule` (entidade separada).
- `totalCents` é opcional — preenchido quando o atendimento é finalizado.

## 6. Estados da interface

- **Carregando**: skeleton.
- **Vazio**: "Nenhum agendamento encontrado."
- **Sucesso**: tabela paginada.
- **Erro**: toast com retry.
- **Não autenticado (401)**: redirect.

## 7. Navegação e fluxo

- Origem: menu "Agendamentos".
- "Novo" → `/appointments/new`.
- Editar → `/appointments/:id/edit`.
- Detalhe → `/appointments/:id`.

## 8. Critérios de aceite

- [ ] Listagem carrega com `page=0&size=20`.
- [ ] `scheduledAt` formatado como data/hora local.
- [ ] Status exibido como badge.
- [ ] Exclusão com confirmação.

## 9. Observações técnicas para front

- Formatar `scheduledAt`, `startedAt`, `finishedAt` como `dd/MM/yyyy HH:mm`.
- `totalCents` formatado como moeda BRL quando não nulo.
- Considerar visão de calendário como alternativa à tabela — Pendente de definição.
