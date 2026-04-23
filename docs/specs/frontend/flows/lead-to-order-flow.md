# Fluxo — Conversão de Lead em Pedido

> **ID do fluxo:** FE-FLOW-003
> **Telas envolvidas:** Lead (list, form, details), PipelineFlow, Order (form), Customer (details)

---

## 1. Visão geral

Um **Lead** representa uma oportunidade de negócio vinculada a um **Customer** e a um **PipelineFlow** (funil de vendas). O lead progride por **PipelineFlowSteps** até atingir um step **terminal**, momento em que pode ser convertido em **Order** (pedido).

```
┌──────────┐   cria lead    ┌──────────┐   progride steps    ┌───────────────┐
│ Customer  │ ─────────────► │   Lead   │ ──────────────────► │ Step Terminal  │
└──────────┘                 └──────────┘                     └───────┬───────┘
                                  │                                   │
                                  │ mensagens                         │ converter
                                  ▼                                   ▼
                             ┌──────────┐                       ┌──────────┐
                             │ Messages │                       │  Order   │
                             └──────────┘                       └──────────┘
```

---

## 2. Endpoints envolvidos

### Lead

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/leads` | Criar lead |
| `GET` | `/api/v1/leads` | Listar leads (paginado) |
| `GET` | `/api/v1/leads/{id}` | Detalhe do lead |
| `PUT` | `/api/v1/leads/{id}` | Atualizar lead (status, step, dados) |
| `DELETE` | `/api/v1/leads/{id}` | Excluir lead |

### Mensagens do Lead

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/leads/{leadId}/messages` | Listar mensagens (array simples, sem paginação) |
| `POST` | `/api/v1/leads/{leadId}/messages` | Enviar mensagem |

### PipelineFlow (referência)

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/pipeline-flows` | Listar funis disponíveis |
| `GET` | `/api/v1/pipeline-flows/{id}` | Detalhe do funil com steps |

### Order (destino da conversão)

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/orders` | Criar pedido a partir do lead |

---

## 3. Etapas do fluxo

### Etapa 1 — Criar Lead

1. Usuário navega para `/leads/new` (ou clica "Novo Lead" no detalhe do Customer).
2. Preenche o formulário:
   - **Customer** (obrigatório): seletor com busca → `GET /api/v1/customers`.
   - **PipelineFlow** (obrigatório): seletor → `GET /api/v1/pipeline-flows`.
   - **Título** (obrigatório): nome/descrição curta da oportunidade.
   - **Valor estimado** (`estimatedValueCents`): valor em centavos.
   - **Status**: valor inicial (ex.: "novo", "aberto").
3. `POST /api/v1/leads` com os dados preenchidos.
4. Redireciona para `/leads/{id}` (detalhe).

### Etapa 2 — Acompanhar o Lead (Pipeline)

1. No detalhe do lead (`/leads/:id`), exibir:
   - Dados do lead (título, customer, valor estimado, status).
   - **Barra de progresso do pipeline**: visualização dos steps do PipelineFlow com indicador do step atual.
   - **Histórico de mensagens**: lista de mensagens trocadas.
2. Para **avançar o step**:
   - Botão "Avançar etapa" ou drag-and-drop na barra de pipeline.
   - `PUT /api/v1/leads/{id}` atualizando o campo de step/status.
3. Para **trocar mensagens**:
   - `GET /api/v1/leads/{id}/messages` para carregar histórico.
   - Input de texto + botão enviar → `POST /api/v1/leads/{id}/messages`.
   - Mensagens retornam como array simples (sem paginação) — carregar todas de uma vez.

### Etapa 3 — Atingir Step Terminal

1. Quando o lead atinge um step onde `terminal: true`:
   - Exibir indicador visual de "Oportunidade finalizada".
   - Habilitar botão **"Converter em Pedido"**.
2. Steps terminais podem representar:
   - **Ganho** (won) — lead convertido com sucesso.
   - **Perdido** (lost) — oportunidade não concretizada.
3. O frontend deve distinguir o tipo (se disponível no campo `stepType`) para decidir se oferece conversão ou apenas fecha.

### Etapa 4 — Converter em Pedido

1. Usuário clica "Converter em Pedido" no lead terminal com status de ganho.
2. O frontend abre o formulário de novo pedido (`/orders/new`) **pré-preenchido** com:
   - `customerId`: do lead.
   - `tenantId`: do lead.
   - Referência ao lead nos notes/observações (não há campo `leadId` no Order).
3. Usuário completa os dados do pedido:
   - Adiciona itens (`items[]` com `itemId`, `quantity`, `unitPriceCents`).
   - Define status, datas, observações.
4. `POST /api/v1/orders` para criar o pedido.
5. Opcionalmente, `PUT /api/v1/leads/{id}` para atualizar status do lead para "convertido" ou similar.
6. Redireciona para `/orders/{id}` (detalhe do pedido).

---

## 4. Regras de negócio

| Regra | Detalhe |
|-------|---------|
| PipelineFlow obrigatório | Lead deve estar vinculado a um funil com steps definidos |
| Customer obrigatório | Lead pertence a um customer específico |
| Steps são sequenciais | A progressão segue a ordem definida no PipelineFlow |
| Step terminal é final | Após atingir step terminal, o lead não deve retroceder (regra de UX, não de API) |
| Conversão é manual | Não há endpoint automático de conversão lead→order; o front cria o pedido separadamente |
| Sem campo `leadId` em Order | A referência lead→pedido deve ser registrada nos `notes` ou em campo customizado |
| Mensagens sem paginação | `GET /leads/{id}/messages` retorna array completo — considerar performance com muitas mensagens |
| Valores em centavos | `estimatedValueCents` (lead) e `totalCents`/`unitPriceCents` (order) são `int64` em centavos |

---

## 5. Diagrama de estados do Lead

```
                ┌───────────────┐
                │     NOVO       │
                └───────┬───────┘
                        │ avança step
                        ▼
                ┌───────────────┐
                │  EM PROGRESSO  │ ◄──── pode retroceder (UX permite)
                └───────┬───────┘
                        │ avança até terminal
                        ▼
              ┌─────────────────────┐
              │   STEP TERMINAL      │
              └────┬──────────┬─────┘
                   │          │
            terminal=won   terminal=lost
                   │          │
                   ▼          ▼
            ┌──────────┐ ┌──────────┐
            │ CONVERTIDO│ │  PERDIDO  │
            │(→ Order)  │ │ (fechado) │
            └──────────┘ └──────────┘
```

---

## 6. Cenários de navegação

### 6.1. Fluxo completo: Lead → Pedido

```
/customers/:id          → detalhe do customer
       │
       ├──► "Novo Lead"
       ▼
/leads/new?customerId=:id  → formulário com customer pré-selecionado
       │
       ▼ POST /leads
/leads/:leadId             → detalhe com pipeline + mensagens
       │
       ├──► avança steps via PUT
       ├──► troca mensagens via POST/GET messages
       │
       ▼ step terminal (won)
       │
       ├──► "Converter em Pedido"
       ▼
/orders/new?customerId=:cid  → formulário pré-preenchido
       │
       ▼ POST /orders
/orders/:orderId           → detalhe do pedido
```

### 6.2. Lead perdido (sem conversão)

```
/leads/:leadId  → step terminal (lost)
       │
       ▼
       Exibe "Oportunidade perdida"
       Sem botão de conversão
       Lead fica como registro histórico
```

---

## 7. Interface do pipeline (barra de progresso)

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Prospecção│Qualificação│Proposta │Negociação│Fechamento│
│    ✓     │    ✓      │  ●      │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘
                        ▲ step atual

● = step atual (destacado)
✓ = steps concluídos (cor de sucesso)
  = steps futuros (cinza)
```

- Cada step vem de `GET /api/v1/pipeline-flows/{id}` → `steps[]`.
- O step atual do lead é determinado pelo campo de step no lead (definição exata depende do DTO).
- Click em um step futuro → `PUT /api/v1/leads/{id}` para avançar.

---

## 8. Critérios de aceite do fluxo

- [ ] **Given** usuário em `/leads/new`, **When** seleciona customer e pipeline flow, **Then** formulário permite criar lead com `POST /api/v1/leads`.
- [ ] **Given** lead criado, **When** redireciona para detalhe, **Then** exibe barra de pipeline com step atual destacado.
- [ ] **Given** lead em step não-terminal, **When** clica "Avançar etapa", **Then** `PUT /api/v1/leads/{id}` é chamado e barra de pipeline atualiza.
- [ ] **Given** lead no detalhe, **When** envia mensagem, **Then** `POST /api/v1/leads/{id}/messages` é chamado e mensagem aparece no histórico.
- [ ] **Given** lead atinge step terminal (won), **When** renderiza detalhe, **Then** botão "Converter em Pedido" fica visível e habilitado.
- [ ] **Given** lead atinge step terminal (lost), **When** renderiza detalhe, **Then** exibe "Oportunidade perdida" sem botão de conversão.
- [ ] **Given** clique em "Converter em Pedido", **When** navega para `/orders/new`, **Then** `customerId` e `tenantId` estão pré-preenchidos.
- [ ] **Given** pedido criado a partir de lead, **When** salvo, **Then** lead pode ser atualizado para status "convertido".

---

## 9. Lacunas conhecidas

| # | Lacuna | Impacto | Mitigação |
|---|--------|---------|-----------|
| 1 | Sem campo `leadId` em Order | Rastreabilidade lead→pedido não automática | Registrar referência nos `notes` do pedido |
| 2 | `stepType` sem enum definida | Front não sabe distinguir won/lost/custom | Definir constantes no front até backend enumerar |
| 3 | Status do lead sem enum | Valores de status dependem de definição manual | Usar constantes locais (`NOVO`, `EM_PROGRESSO`, `CONVERTIDO`, `PERDIDO`) |
| 4 | Mensagens sem paginação | Performance pode degradar com muitas mensagens | Virtualização de lista no front |
| 5 | Sem endpoint de conversão automática | Conversão requer 2+ requests manuais | Orquestrar no front com feedback de loading |

---

## Referências

- Lead: [`lead-list.md`](../screens/leads/lead-list.md), [`lead-form.md`](../screens/leads/lead-form.md), [`lead-details.md`](../screens/leads/lead-details.md)
- Order: [`order-list.md`](../screens/orders/order-list.md), [`order-form.md`](../screens/orders/order-form.md)
- Pipeline: [`pipeline-flow-list.md`](../screens/pipeline/pipeline-flow-list.md), [`pipeline-flow-form.md`](../screens/pipeline/pipeline-flow-form.md)
- Customer: [`customer-details.md`](../screens/customers/customer-details.md)
