# Schedules (Agendamentos de Cliente) — Cadastro e Edição

## 1. Objetivo
- Criar ou editar um vínculo entre tenant, cliente e appointment (Schedule).
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/schedules` | Cria schedule (201) |
| `PUT` | `/api/v1/schedules/{id}` | Atualiza schedule (200) |
| `GET` | `/api/v1/schedules/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/appointments` | Lista appointments para seleção |
| `GET` | `/api/v1/customers` | Lista clientes para seleção |
| `GET` | `/api/v1/tenants` | Lista tenants para seleção |

- Requer `Authorization: Bearer <token>`.
- Request body (`ScheduleRequest`): `tenantId`, `customerId`, `appointmentId`, `description?`, `active`.
- Response `201`/`200`: `ScheduleResponse` completo.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Origem | Validações |
|-------|------|-------------|--------|-----------|
| Tenant | select (Long) | Sim | `ScheduleRequest.tenantId` | Deve existir na lista de tenants |
| Cliente | autocomplete (Long) | Sim | `ScheduleRequest.customerId` | Deve existir na lista de customers |
| Agendamento | select/autocomplete (Long) | Sim | `ScheduleRequest.appointmentId` | Deve existir na lista de appointments |
| Descrição | textarea | Não | `ScheduleRequest.description` | — |
| Ativo | toggle | Não | `ScheduleRequest.active` | Default: true |

## 4. Ações do usuário

- **Preencher formulário** → validação em tempo real.
- **Salvar**: botão "Salvar" → `POST` (novo) ou `PUT` (edição).
  - Sucesso: toast + redirect para `/schedules`.
  - Erro: mensagem inline ou toast global.
- **Cancelar**: botão "Cancelar" → volta para `/schedules` sem salvar.
- **Modo edição**: ao entrar em `/schedules/:id/edit`, carrega dados via `GET /api/v1/schedules/{id}`.

## 5. Regras de negócio

- `tenantId`, `customerId` e `appointmentId` são obrigatórios.
- Um appointment pode ser vinculado a múltiplos clientes/tenants via schedules diferentes.
- `PUT` substitui todos os campos (não é PATCH).
- `active = false` desativa sem excluir.

## 6. Estados da interface

- **Carregando dados (edição)**: skeleton no formulário.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Schedule salvo com sucesso." + redirect.
- **Erro de validação (400)**: mensagens nos campos correspondentes.
- **Não encontrado (404)**: mensagem "Schedule não encontrado." com botão de voltar.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/schedules/new`.
- Origem (edição): botão editar na listagem → `/schedules/:id/edit`.
- Após salvar: `/schedules`.
- Cancelar: `/schedules`.

## 8. Critérios de aceite

- [ ] Given: campos obrigatórios vazios → botão "Salvar" desabilitado.
- [ ] Given: formulário válido (novo) → `POST /api/v1/schedules` chamado com body correto.
- [ ] Given: edição → `GET /api/v1/schedules/{id}` carrega e preenche o formulário.
- [ ] Given: edição com sucesso → `PUT /api/v1/schedules/{id}` atualiza e redireciona.
- [ ] Given: `description` vazia → enviada como `null`.

## 9. Observações técnicas para front

- Seletor de `customerId`: autocomplete exibindo `fullName`, carregado via `GET /api/v1/customers`.
- Seletor de `appointmentId`: exibir data/hora (`scheduledAt`) como label, carregado via `GET /api/v1/appointments`.
- Seletor de `tenantId`: pré-preencher com tenant do usuário logado se disponível.
- No modo de criação, pré-preencher `active = true`.
