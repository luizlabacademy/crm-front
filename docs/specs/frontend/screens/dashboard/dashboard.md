# Dashboard — Tela Inicial

> **ID da tela:** FE-SCREEN-011
> **Rota:** `/dashboard`

---

## 1. Objetivo

Tela inicial do CRM após login. Exibe visão consolidada de indicadores-chave do negócio e atividades recentes. Serve como ponto de partida para navegação rápida aos módulos mais usados.

Perfil: qualquer usuário autenticado. Dados filtrados pelo `tenantId` do usuário logado.

---

## 2. Endpoints envolvidos

A API **não possui endpoints de agregação/analytics**. Todos os dados do dashboard são construídos a partir de endpoints de listagem existentes com filtros e computação client-side.

| Método | Rota | Finalidade no Dashboard |
|--------|------|------------------------|
| `GET` | `/api/v1/orders` | Pedidos para cálculo de faturamento e listagem recente |
| `GET` | `/api/v1/leads` | Leads para contadores e atividade recente |
| `GET` | `/api/v1/leads/{leadId}/messages` | Mensagens recentes (por lead) |
| `GET` | `/api/v1/appointments` | Agendamentos futuros |
| `GET` | `/api/v1/customers` | Contagem de clientes ativos |

Todas as requisições incluem `Authorization: Bearer <token>` e filtro por `tenantId` quando disponível.

---

## 3. Campos e dados da tela

### 3.1. Widgets de indicadores (KPIs)

| Widget | Dados | Cálculo | Fonte |
|--------|-------|---------|-------|
| **Faturamento do dia** | Soma de `totalCents` dos pedidos com status "fechado/concluído" e `createdAt` = hoje | Client-side: filtra por data e soma | `GET /orders` |
| **Faturamento do mês** | Soma de `totalCents` dos pedidos do mês corrente | Client-side: filtra por mês/ano | `GET /orders` |
| **Faturamento do ano** | Soma de `totalCents` dos pedidos do ano corrente | Client-side: filtra por ano | `GET /orders` |
| **Novos pedidos (mês)** | Contagem de pedidos criados no mês | `content.length` com filtro de data | `GET /orders` |
| **Pedidos pendentes** | Contagem de pedidos com status "pendente" | Filtro por status | `GET /orders` |
| **Pedidos fechados (mês)** | Contagem de pedidos com status "fechado" no mês | Filtro por status + data | `GET /orders` |
| **Novas mensagens (mês)** | Contagem de mensagens de leads do mês | Soma de mensagens com filtro de data | `GET /leads/{id}/messages` por lead ativo |
| **Atendimentos em curso** | Contagem de leads com status ativo/em progresso | Filtro por status | `GET /leads` |
| **Atendimentos concluídos (mês)** | Contagem de leads finalizados no mês | Filtro por status + data | `GET /leads` |

**Observações:**
- Todos os valores monetários são exibidos em **reais** (dividir `cents` por 100, formatar com `Intl.NumberFormat`).
- Cada widget tem botão **mostrar/ocultar valor** (ícone de olho) — valor oculto exibe `R$ •••••`.
- Estado de visibilidade persiste em `localStorage`.

### 3.2. Lista de últimas mensagens

| Coluna | Campo | Descrição |
|--------|-------|-----------|
| Avatar | Inicial do nome do customer | Círculo colorido com letra |
| Nome | Customer name (via lead → customer) | Nome do cliente |
| Prévia | `content` (truncado 80 chars) | Prévia da mensagem |
| Data/hora | `createdAt` | Tempo relativo ("há 5 min", "ontem") |

- Exibe as **10 últimas mensagens** de todos os leads ativos.
- Click na linha navega para `/leads/:leadId` (detalhe com mensagens).

### 3.3. Lista de últimos pedidos

| Coluna | Campo | Descrição |
|--------|-------|-----------|
| # | `id` ou `code` | Identificador do pedido |
| Cliente | Customer name | Nome do cliente |
| Valor | `totalCents` | Formatado como moeda |
| Status | `status` | Badge colorido |
| Data | `createdAt` | Formato `dd/MM/yyyy` |

- Exibe os **10 últimos pedidos** criados.
- Click na linha navega para `/orders/:id`.

---

## 4. Ações do usuário

| Ação | Descrição |
|------|-----------|
| Visualizar KPIs | Indicadores carregam automaticamente ao abrir a tela |
| Mostrar/ocultar valor | Click no ícone de olho em cada widget alterna visibilidade |
| Ver mensagem | Click na mensagem navega para detalhe do lead |
| Ver pedido | Click no pedido navega para detalhe do pedido |
| Navegar para módulos | Sidebar/header com links para Customers, Leads, Orders, etc. |
| Atualizar dados | Botão de refresh manual ou pull-to-refresh |

---

## 5. Regras de negócio

| Regra | Detalhe |
|-------|---------|
| Dados por tenant | Todos os endpoints filtrados pelo `tenantId` do usuário logado |
| Valores em centavos | `totalCents` convertido para reais no front (`/ 100`) |
| Status não enumerados | Valores de status de Order e Lead dependem de constantes definidas no front |
| Sem agregação server-side | Todos os cálculos feitos client-side — pode ser lento com muitos registros |
| Mensagens por lead | Para obter mensagens, é necessário iterar sobre leads ativos — considerar limitar a N leads mais recentes |
| Período fixo | Widgets de "mês" usam o mês calendário corrente; "ano" usa o ano corrente |

---

## 6. Estados da interface

| Estado | Comportamento |
|--------|--------------|
| **Carregando** | Skeleton em cada widget e nas listas enquanto requisições estão em flight |
| **Dados carregados** | Widgets exibem valores, listas populadas |
| **Erro parcial** | Se um endpoint falha, o widget correspondente exibe "Erro ao carregar" com botão retry; demais widgets funcionam normalmente |
| **Erro total** | Toast "Erro ao carregar dashboard. Verifique sua conexão." com botão "Tentar novamente" |
| **Sem dados** | Widgets exibem `R$ 0,00` ou `0`; listas exibem "Nenhum registro encontrado." |
| **Valor oculto** | Widget exibe `R$ •••••` no lugar do valor real |

---

## 7. Navegação e fluxo

| Origem | Ação | Destino |
|--------|------|---------|
| Login (após autenticação) | Redirect automático | `/dashboard` |
| Qualquer tela | Menu lateral "Dashboard" | `/dashboard` |
| Widget de pedidos | Click | Possível filtro futuro em `/orders` |
| Linha de mensagem | Click | `/leads/:leadId` |
| Linha de pedido | Click | `/orders/:orderId` |

---

## 8. Critérios de aceite

- [ ] **Given** usuário autenticado, **When** acessa `/dashboard`, **Then** os 9 widgets de KPI são exibidos com valores calculados.
- [ ] **Given** dashboard carregado, **When** existem pedidos no mês, **Then** "Faturamento do mês" exibe soma de `totalCents / 100` formatada como moeda BRL.
- [ ] **Given** widget de faturamento, **When** clica no ícone de olho, **Then** valor alterna entre visível e oculto (`R$ •••••`).
- [ ] **Given** preferência de visibilidade salva, **When** recarrega a página, **Then** estado de mostrar/ocultar é restaurado do `localStorage`.
- [ ] **Given** dashboard carregado, **When** existem mensagens recentes, **Then** lista de últimas mensagens exibe até 10 itens com avatar, nome, prévia e data relativa.
- [ ] **Given** linha de mensagem, **When** clica, **Then** navega para `/leads/:leadId`.
- [ ] **Given** dashboard carregado, **When** existem pedidos, **Then** lista de últimos pedidos exibe até 10 itens com código, cliente, valor, status e data.
- [ ] **Given** linha de pedido, **When** clica, **Then** navega para `/orders/:orderId`.
- [ ] **Given** erro em um endpoint, **When** widget falha, **Then** exibe mensagem de erro com retry, sem afetar os demais widgets.
- [ ] **Given** nenhum dado disponível, **When** dashboard carrega, **Then** widgets exibem `R$ 0,00` ou `0` e listas exibem estado vazio.

---

## 9. Observações técnicas para front

### Performance

- **Problema:** a API não possui endpoints de agregação. Calcular faturamento do ano pode exigir buscar todos os pedidos do ano.
- **Mitigação 1:** usar paginação com `size=1` apenas para obter `totalElements`, e `sort=createdAt,desc` para últimos registros.
- **Mitigação 2:** cachear resultados de KPI por 5 minutos (`staleTime: 5 * 60 * 1000`).
- **Mitigação 3:** para faturamento, buscar pedidos com `sort=createdAt,desc&size=100` e somar os do período relevante. Aceitar imprecisão se houver mais de 100 pedidos no período (documentar limitação).

### Mensagens

- Mensagens de lead (`GET /leads/{id}/messages`) retornam array simples sem paginação.
- Para o dashboard, buscar os 5 leads mais recentes com status ativo e pegar mensagens de cada um.
- Limitar a no máximo 5 chamadas paralelas de mensagens para não sobrecarregar a API.

### Formatação

- Moeda: `new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)`.
- Data relativa: usar `Intl.RelativeTimeFormat` ou lib como `date-fns/formatDistanceToNow`.
- Data absoluta: `dd/MM/yyyy HH:mm` via `Intl.DateTimeFormat` ou `date-fns`.

### Estrutura de dados sugerida

```tsx
interface DashboardKpi {
  revenueToday: number;      // centavos
  revenueMonth: number;      // centavos
  revenueYear: number;       // centavos
  newOrdersMonth: number;    // contagem
  pendingOrders: number;     // contagem
  closedOrdersMonth: number; // contagem
  newMessagesMonth: number;  // contagem
  activeLeads: number;       // contagem
  closedLeadsMonth: number;  // contagem
}

interface DashboardData {
  kpis: DashboardKpi;
  recentMessages: LeadMessage[];  // últimas 10
  recentOrders: OrderSummary[];   // últimos 10
}
```

### Requisições paralelas

Ao montar o dashboard, disparar todas as requisições em paralelo:

```tsx
const [orders, leads, appointments] = await Promise.all([
  api.get('/orders', { params: { tenantId, sort: 'createdAt,desc', size: 100 } }),
  api.get('/leads', { params: { tenantId, sort: 'createdAt,desc', size: 50 } }),
  api.get('/appointments', { params: { sort: 'startDate,desc', size: 10 } }),
]);
```

Processar client-side para calcular KPIs e montar listas.
