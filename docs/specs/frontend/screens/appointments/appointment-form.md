# Agendamentos — Cadastro e Edição

## 1. Objetivo
- Criar ou editar um agendamento (appointment).
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/appointments` | Cria agendamento (201) |
| `PUT` | `/api/v1/appointments/{id}` | Atualiza agendamento (200) |
| `GET` | `/api/v1/appointments/{id}` | Carrega dados para edição |

- Requer `Authorization: Bearer <token>`.
- Request body (`AppointmentRequest`): `status`, `scheduledAt`, `startedAt?`, `finishedAt?`, `totalCents?`, `notes?`.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Status | select (String) | Não | Default: `SCHEDULED` |
| Agendado para | datetime-local | Sim | Data futura ou presente; não vazio |
| Iniciado em | datetime-local | Não | Deve ser ≥ `scheduledAt` se informado |
| Finalizado em | datetime-local | Não | Deve ser ≥ `startedAt` se informado |
| Total (R$) | input numérico | Não | ≥ 0 |
| Notas | textarea | Não | — |

## 4. Ações do usuário

- **Preencher e salvar**: `POST` (novo) ou `PUT` (edição).
- **Cancelar**: volta para `/appointments`.
- **Modo edição**: preenche campos com dados do `GET`.

## 5. Regras de negócio

- `scheduledAt` é o único campo obrigatório além de `status`.
- `startedAt` e `finishedAt` indicam o ciclo de vida do atendimento; só devem ser preenchidos quando o evento ocorrer.
- `totalCents` registra o valor cobrado ao finalizar.
- Um `Appointment` em si não tem `tenantId` — a vinculação ao tenant ocorre pelo `Schedule`.
- `PUT` substitui todos os campos.

## 6. Estados da interface

- **Carregando (edição)**: skeleton.
- **Salvando**: spinner no botão.
- **Sucesso**: toast + redirect `/appointments/:id`.
- **Erro de validação**: mensagens inline.
- **Não autenticado (401)**: redirect.

## 7. Navegação e fluxo

- Origem: listagem de agendamentos.
- Após salvar: `/appointments/:id`.
- Cancelar: `/appointments`.

## 8. Critérios de aceite

- [ ] Sem `scheduledAt` → "Salvar" desabilitado.
- [ ] `finishedAt` < `startedAt` → erro de validação inline.
- [ ] Edição carrega todos os campos.
- [ ] `totalCents` aceita entrada decimal e converte para centavos.

## 9. Observações técnicas para front

- Campos de data/hora: `input[type=datetime-local]`, enviar como ISO 8601 com offset (`OffsetDateTime`).
- Converter o valor do `input` (horário local) para `OffsetDateTime` com o offset do usuário antes de enviar.
- `totalCents`: input decimal → `Math.round(value * 100)`.
- Status: select com opções `SCHEDULED`, `IN_PROGRESS`, `DONE`, `CANCELLED` — Pendente de definição completa.
