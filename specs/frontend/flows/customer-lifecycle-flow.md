# Fluxo — Ciclo de Vida do Cliente

> **ID do fluxo:** FE-FLOW-002
> **Telas envolvidas:** Person, Customer, Lead, Order, Appointment, Schedule, Address

---

## 1. Visão geral

O ciclo de vida do cliente no CRM começa com o cadastro de uma **Person** (pessoa física), que pode então ser vinculada como **Customer** (cliente do tenant). A partir daí, o cliente pode ter **Leads** (oportunidades), **Orders** (pedidos), **Appointments** (agendamentos) e **Addresses** (endereços).

```
┌──────────┐     vincula      ┌───────────┐
│  Person   │ ──────────────► │  Customer  │
│ (pessoa)  │                 │ (cliente)  │
└──────────┘                  └─────┬──────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────────┐
              │   Lead    │   │  Order   │   │ Appointment  │
              │(oportun.) │   │ (pedido) │   │(agendamento) │
              └──────────┘   └──────────┘   └──────┬───────┘
                                                    │
                                                    ▼
                                              ┌──────────┐
                                              │ Schedule  │
                                              │ (vínculo) │
                                              └──────────┘
```

---

## 2. Endpoints por etapa

### 2.1. Cadastro de Person

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/persons` | Criar pessoa |
| `GET` | `/api/v1/persons` | Listar pessoas (para seletor) |
| `GET` | `/api/v1/persons/{id}` | Detalhe da pessoa |
| `PUT` | `/api/v1/persons/{id}` | Atualizar pessoa |

**Campos obrigatórios:** `tenantId`, `firstName`, `lastName`.
**Campos opcionais:** `document`, `email`, `phone`, `birthDate`, `contacts[]`.

### 2.2. Cadastro de Customer

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/customers` | Criar cliente vinculando a Person + Tenant |
| `GET` | `/api/v1/customers` | Listar clientes |
| `GET` | `/api/v1/customers/{id}` | Detalhe do cliente |
| `PUT` | `/api/v1/customers/{id}` | Atualizar cliente |

**Campos obrigatórios:** `tenantId`, `personId`.
**Campos opcionais:** `active`, `notes`.

### 2.3. Operações vinculadas ao Customer

| Recurso | Endpoints | Vínculo |
|---------|-----------|---------|
| Lead | `POST/GET/PUT/DELETE /api/v1/leads` | `customerId` no body |
| Order | `POST/GET/PUT/DELETE /api/v1/orders` | `customerId` no body |
| Appointment | `POST/GET/PUT/DELETE /api/v1/appointments` | Sem `customerId` direto — via Schedule |
| Schedule | `POST/GET/PUT/DELETE /api/v1/schedules` | `customerId` + `appointmentId` no body |
| Address | `POST/GET/PUT/DELETE /api/v1/addresses` | `personId` no body (da Person vinculada) |

---

## 3. Etapas do fluxo

### Etapa 1 — Pré-requisito: Person existe

**Cenário A: Person já existe**
1. No formulário de Customer, o campo `personId` é um seletor com busca.
2. `GET /api/v1/persons?tenantId={id}` para popular o seletor.
3. Usuário seleciona a pessoa existente.

**Cenário B: Person precisa ser criada**
1. No formulário de Customer, botão "Nova pessoa" abre modal/drawer.
2. Preenche formulário de Person inline → `POST /api/v1/persons`.
3. Retorna o `id` criado e preenche automaticamente o seletor de `personId`.

### Etapa 2 — Criar Customer

1. Usuário navega para `/customers/new`.
2. Seleciona/cria Person (etapa 1).
3. Seleciona Tenant (se admin multi-tenant) ou usa tenant do contexto.
4. Preenche campos opcionais (notes).
5. `POST /api/v1/customers` → resposta com `id` do novo Customer.
6. Redireciona para `/customers/{id}` (detalhe).

### Etapa 3 — Enriquecer o Customer

A partir do detalhe do Customer, o usuário pode:

| Ação | Navegação | Resultado |
|------|-----------|-----------|
| Criar Lead | `/leads/new?customerId={id}` | Lead vinculado ao customer |
| Criar Pedido | `/orders/new?customerId={id}` | Pedido vinculado ao customer |
| Agendar | `/appointments/new` → depois `/schedules/new?customerId={id}` | Schedule vinculando customer e appointment |
| Adicionar endereço | `/addresses/new?personId={person.id}` | Endereço vinculado à Person do customer |

### Etapa 4 — Acompanhamento contínuo

1. **Leads:** acompanhar funil (pipeline steps), trocar mensagens, converter em pedido.
2. **Pedidos:** acompanhar status, gerenciar itens.
3. **Agendamentos:** visualizar calendário de atendimentos via Schedules.
4. **Desativação:** setar `active: false` no Customer (soft delete) via `PUT /api/v1/customers/{id}`.

---

## 4. Regras de negócio

| Regra | Detalhe |
|-------|---------|
| Person obrigatória | Customer não pode ser criado sem `personId` válido |
| Tenant obrigatório | Customer pertence a um tenant; `tenantId` é obrigatório |
| Unicidade | Uma Person pode ser Customer de múltiplos tenants (multi-tenant) |
| Soft delete | `active: false` desativa o Customer sem excluir dados vinculados |
| Cascata de consulta | Não há sub-recursos (`/customers/{id}/leads`) — filtragem por `customerId` nos endpoints de listagem |
| Endereços via Person | Endereços são vinculados à Person, não ao Customer diretamente |

---

## 5. Diagrama de estados do Customer

```
                ┌───────────────┐
                │   INEXISTENTE  │
                └───────┬───────┘
                        │ POST /customers
                        ▼
                ┌───────────────┐
           ┌───►│     ATIVO      │◄───┐
           │    └───────┬───────┘     │
           │            │             │
           │   PUT (active: false)    │
           │            │             │
           │            ▼             │
           │    ┌───────────────┐     │
           │    │   INATIVO      │    │
           │    └───────┬───────┘    │
           │            │             │
           │   PUT (active: true)     │
           └────────────┘─────────────┘
                        │
                  DELETE /customers/{id}
                        ▼
                ┌───────────────┐
                │    EXCLUÍDO    │
                └───────────────┘
```

---

## 6. Cenários de navegação

### 6.1. Fluxo completo novo cliente

```
/persons/new → preenche → salva
       │
       ▼
/customers/new → seleciona person → salva
       │
       ▼
/customers/:id → detalhe
       │
       ├──► /leads/new?customerId=:id
       ├──► /orders/new?customerId=:id
       └──► /schedules/new?customerId=:id
```

### 6.2. Tela de detalhe como hub

A tela `/customers/:id` funciona como hub central mostrando:
- Dados do customer e da person vinculada
- Seção de leads recentes (últimos 5)
- Seção de pedidos recentes (últimos 5)
- Seção de agendamentos futuros
- Links rápidos para criar novo lead/pedido/agendamento

> **Nota:** A API não possui sub-recursos. O front deve fazer `GET /api/v1/leads?tenantId={tid}` e filtrar client-side por `customerId`, ou paginar com filtros se disponíveis.

---

## 7. Critérios de aceite do fluxo

- [ ] **Given** nenhuma Person existe, **When** usuário tenta criar Customer, **Then** pode criar Person inline via modal sem sair do formulário.
- [ ] **Given** Person selecionada, **When** submete formulário de Customer, **Then** `POST /api/v1/customers` é chamado com `personId` e `tenantId`.
- [ ] **Given** Customer criado, **When** redireciona para detalhe, **Then** exibe dados do customer + person + seções de leads/orders/appointments.
- [ ] **Given** Customer ativo, **When** clica "Desativar", **Then** `PUT /api/v1/customers/{id}` com `active: false` e badge muda para "Inativo".
- [ ] **Given** detalhe do Customer, **When** clica "Novo Lead", **Then** navega para `/leads/new` com `customerId` pré-preenchido.
- [ ] **Given** detalhe do Customer, **When** clica "Novo Pedido", **Then** navega para `/orders/new` com `customerId` pré-preenchido.

---

## 8. Lacunas conhecidas

| # | Lacuna | Impacto | Mitigação |
|---|--------|---------|-----------|
| 1 | Sem sub-recursos `/customers/{id}/leads` | Filtragem ineficiente | Filtrar client-side ou usar paginação com sort |
| 2 | Sem filtro `customerId` em Appointments | Agendamentos não filtráveis por cliente diretamente | Intermediar via Schedule (`GET /schedules?customerId=`) |
| 3 | Address vinculado a Person, não Customer | Endereços compartilhados entre tenants se Person é customer em múltiplos | Documentar comportamento para o usuário |

---

## Referências

- Specs de tela: [`customer-list.md`](../screens/customers/customer-list.md), [`customer-form.md`](../screens/customers/customer-form.md), [`customer-details.md`](../screens/customers/customer-details.md)
- Person: [`person-list.md`](../screens/people/person-list.md), [`person-form.md`](../screens/people/person-form.md)
- Lead: [`lead-list.md`](../screens/leads/lead-list.md), [`lead-form.md`](../screens/leads/lead-form.md)
- Order: [`order-list.md`](../screens/orders/order-list.md), [`order-form.md`](../screens/orders/order-form.md)
