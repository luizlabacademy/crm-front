# Fluxo — Agendamento de Atendimentos

> **ID do fluxo:** FE-FLOW-004
> **Telas envolvidas:** Appointment (list, form), Schedule (list, form), Customer (details)

---

## 1. Visão geral

O sistema de agendamento do CRM utiliza três entidades:

- **Appointment**: o evento em si (data, hora, status, descrição).
- **Schedule**: o vínculo entre **Tenant**, **Customer** e **Appointment** — define "qual cliente será atendido neste agendamento por qual tenant".
- **Customer**: o cliente que será atendido.

O fluxo exige dois passos obrigatórios: criar o Appointment e criar o Schedule que o vincula ao Customer.

```
┌──────────┐                    ┌─────────────┐
│ Customer  │                    │ Appointment  │
└─────┬────┘                    └──────┬──────┘
      │                                │
      │         ┌──────────┐           │
      └────────►│ Schedule  │◄─────────┘
                │(vínculo)  │
                └──────────┘
```

---

## 2. Endpoints envolvidos

### Appointment

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/appointments` | Criar agendamento |
| `GET` | `/api/v1/appointments` | Listar agendamentos (paginado) |
| `GET` | `/api/v1/appointments/{id}` | Detalhe |
| `PUT` | `/api/v1/appointments/{id}` | Atualizar |
| `DELETE` | `/api/v1/appointments/{id}` | Excluir |

### Schedule

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/schedules` | Criar vínculo tenant/customer/appointment |
| `GET` | `/api/v1/schedules` | Listar schedules (paginado) |
| `GET` | `/api/v1/schedules/{id}` | Detalhe |
| `PUT` | `/api/v1/schedules/{id}` | Atualizar |
| `DELETE` | `/api/v1/schedules/{id}` | Excluir |

### Customer (referência)

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/customers` | Listar para seletor |
| `GET` | `/api/v1/customers/{id}` | Detalhe do cliente |

---

## 3. Etapas do fluxo

### Etapa 1 — Criar Appointment

1. Usuário navega para `/appointments/new`.
2. Preenche o formulário:
   - **Título/Descrição** (obrigatório): descrição do atendimento.
   - **Data e hora início** (`startDate`): `OffsetDateTime` — picker de data + hora.
   - **Data e hora fim** (`endDate`): `OffsetDateTime` — picker de data + hora.
   - **Status**: valor inicial (ex.: "agendado", "confirmado").
   - **Observações** (`notes`): texto livre.
3. `POST /api/v1/appointments` → retorna `id` do appointment criado.
4. **Não redireciona ainda** — precisa vincular ao customer via Schedule.

### Etapa 2 — Criar Schedule (vincular Customer)

1. Após criar o Appointment, o frontend automaticamente abre o formulário de Schedule (inline ou modal).
2. Preenche:
   - **Appointment**: pré-selecionado com o appointment recém-criado.
   - **Customer** (obrigatório): seletor com busca → `GET /api/v1/customers`.
   - **Tenant**: usa o tenant do contexto do usuário autenticado.
   - **Observações** adicionais.
3. `POST /api/v1/schedules` com `{ appointmentId, customerId, tenantId }`.
4. Redireciona para `/schedules` (listagem) ou `/appointments` conforme contexto.

### Etapa 3 — Visualizar agenda

1. `/schedules` exibe a lista de schedules com dados do appointment e customer resolvidos.
2. Cada linha mostra: data/hora do appointment, nome do customer, status, ações.
3. Possibilidade futura: visualização em calendário (não disponível na API, seria client-side).

### Etapa 4 — Atualizar/Cancelar

**Atualizar agendamento:**
1. `/appointments/:id/edit` → `PUT /api/v1/appointments/{id}` (altera data, hora, status).
2. Schedule permanece inalterado (o vínculo não muda).

**Cancelar agendamento:**
1. `PUT /api/v1/appointments/{id}` com `status: "cancelado"`.
2. Opcionalmente, `DELETE /api/v1/schedules/{id}` se quiser desvincular.

**Reagendar para outro customer:**
1. `DELETE /api/v1/schedules/{id}` (remove vínculo antigo).
2. `POST /api/v1/schedules` com novo `customerId` (cria novo vínculo).

---

## 4. Fluxo alternativo — Agendar a partir do Customer

1. Usuário está em `/customers/:id` (detalhe do customer).
2. Clica "Novo Agendamento".
3. Navega para `/appointments/new?customerId={id}`.
4. Cria o Appointment normalmente.
5. O Schedule é criado automaticamente com o `customerId` pré-preenchido do query param.
6. Fluxo completo em uma única jornada.

---

## 5. Regras de negócio

| Regra | Detalhe |
|-------|---------|
| Appointment sem `tenantId` | Appointment é genérico; o vínculo com tenant é feito via Schedule |
| Appointment sem `customerId` | O vínculo com customer também é via Schedule |
| Schedule é obrigatório | Um Appointment sem Schedule não aparece na agenda de nenhum customer/tenant |
| Um Appointment, múltiplos Schedules | Mesmo appointment pode ser vinculado a múltiplos customers (atendimento em grupo) |
| Datas em `OffsetDateTime` | Usar picker com timezone; enviar em ISO 8601 (ex.: `2026-04-15T14:00:00-03:00`) |
| Soft delete | `active: false` em ambos os recursos para desativação |
| Status não enumerado | Valores de status de Appointment não estão definidos como enum na API |

---

## 6. Diagrama do fluxo completo

```
┌─────────────────┐
│ /appointments/new│
│ (cria appointment)│
└────────┬────────┘
         │ POST /appointments → id
         ▼
┌─────────────────┐
│ /schedules/new   │ (inline ou modal)
│ appointmentId=id │
│ customerId=?     │
└────────┬────────┘
         │ POST /schedules
         ▼
┌─────────────────┐
│ /schedules       │ (listagem)
│ ou /appointments │
└─────────────────┘
```

### Fluxo a partir do Customer:

```
/customers/:id
       │
       ├──► "Novo Agendamento"
       ▼
/appointments/new?customerId=:id
       │
       ▼ POST /appointments
       │
       ▼ POST /schedules (customerId pré-preenchido)
       │
       ▼ redirect → /schedules ou /customers/:id
```

---

## 7. UX do formulário unificado (recomendação)

Para simplificar a experiência, o frontend pode unificar a criação de Appointment + Schedule em um **único formulário**:

```
┌─────────────────────────────────────────┐
│ Novo Agendamento                         │
├─────────────────────────────────────────┤
│ Cliente:     [Seletor de Customer ▼]     │
│ Título:      [________________________]  │
│ Data início: [📅 15/04/2026] [🕐 14:00] │
│ Data fim:    [📅 15/04/2026] [🕐 15:00] │
│ Status:      [Agendado ▼]               │
│ Observações: [________________________]  │
│                                          │
│              [Cancelar] [Salvar]          │
└─────────────────────────────────────────┘
```

**Ao clicar "Salvar":**
1. `POST /api/v1/appointments` → obtém `appointmentId`.
2. `POST /api/v1/schedules` com `{ appointmentId, customerId, tenantId }`.
3. Se o passo 2 falha, exibir erro mas **não reverter** o appointment (não há transação distribuída).

---

## 8. Critérios de aceite do fluxo

- [ ] **Given** usuário em `/appointments/new`, **When** preenche dados e salva, **Then** `POST /api/v1/appointments` é chamado.
- [ ] **Given** appointment criado, **When** fluxo continua, **Then** formulário de Schedule é apresentado com `appointmentId` pré-preenchido.
- [ ] **Given** schedule sendo criado, **When** seleciona customer e salva, **Then** `POST /api/v1/schedules` é chamado com `appointmentId`, `customerId`, `tenantId`.
- [ ] **Given** fluxo completo, **When** ambos requests succedem, **Then** redireciona para listagem de schedules.
- [ ] **Given** usuário em `/customers/:id`, **When** clica "Novo Agendamento", **Then** navega para formulário com `customerId` pré-preenchido.
- [ ] **Given** schedule existente, **When** clica "Editar" no appointment, **Then** navega para `/appointments/:id/edit`.
- [ ] **Given** schedule existente, **When** clica "Cancelar", **Then** appointment é atualizado com status "cancelado".
- [ ] **Given** formulário unificado, **When** POST /schedules falha após appointment criado, **Then** exibe erro sem esconder o appointment já criado.

---

## 9. Lacunas conhecidas

| # | Lacuna | Impacto | Mitigação |
|---|--------|---------|-----------|
| 1 | Appointment sem `tenantId` | Listagem de appointments mostra todos os tenants | Filtrar via Schedules do tenant logado |
| 2 | Appointment sem `customerId` | Não é possível listar appointments por customer diretamente | Intermediar via Schedule |
| 3 | Status sem enum | Front define valores manualmente | Constantes locais: `AGENDADO`, `CONFIRMADO`, `REALIZADO`, `CANCELADO` |
| 4 | Sem validação de conflito de horário | Backend não verifica sobreposição de appointments | Validação visual no front (se implementar calendário) |
| 5 | Dois requests para um agendamento | UX complexa: appointment + schedule separados | Formulário unificado que faz os 2 requests sequenciais |

---

## Referências

- Appointment: [`appointment-list.md`](../screens/appointments/appointment-list.md), [`appointment-form.md`](../screens/appointments/appointment-form.md)
- Schedule: [`schedule-list.md`](../screens/schedule/schedule-list.md), [`schedule-form.md`](../screens/schedule/schedule-form.md)
- Customer: [`customer-details.md`](../screens/customers/customer-details.md)
