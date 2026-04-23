# Frontend x Backend Needs Matrix

## 1. Objetivo

Consolidar tudo que o frontend precisa do backend, por dominio, para orientar implementacao e priorizacao de APIs.

Fontes:
- `specs/frontend/api-integration-guidelines.md`
- `specs/frontend/api-error-response-guidelines.md`
- `specs/frontend/README.md`
- `specs/frontend/screens/**/*.md`

## 1.1 Referencia de telas e descoberta de novas telas

- Base principal de consulta de telas: `specs/frontend/README.md`.
- Fonte complementar obrigatoria: `specs/frontend/screens/**/*.md`.
- Se houver divergencia entre README e arquivos reais de tela, prevalece a estrutura real em `screens/`.
- Para detectar telas nao indexadas no README, comparar lista do README com o glob de `screens/**/*.md`.

## 2. Regras transversais obrigatorias

- Todos os endpoints autenticados devem aceitar `Authorization: Bearer <token>`.
- Todas as respostas e erros devem seguir padrao global (`api-error-response-guidelines`).
- Multi-tenancy deve ser aplicado conforme o dominio.
- Front deve conseguir tratar estados: loading, empty, success, error, 401, 403.

## 3. Dominios e necessidades de API

### 3.1 Autenticacao e Dashboard

| Tela/Fluxo | Necessidade backend |
|------------|---------------------|
| Login | `POST /api/v1/auth/token` (JWT) |
| Dashboard | Endpoints de agregacao (ideal) ou dados de listagem suficientes para computo client-side |

### 3.2 Clientes

| Tela | Endpoints esperados |
|------|----------------------|
| Listagem | `GET /api/v1/customers`, `DELETE /api/v1/customers/{id}` |
| Form | `POST /api/v1/customers`, `PUT /api/v1/customers/{id}`, `GET /api/v1/customers/{id}`, `GET /api/v1/tenants`, `GET /api/v1/persons` |
| Detalhe | `GET /api/v1/customers/{id}`, `DELETE /api/v1/customers/{id}` |

### 3.3 Leads

| Tela | Endpoints esperados |
|------|----------------------|
| Listagem | `GET /api/v1/leads`, `DELETE /api/v1/leads/{id}` |
| Form | `POST /api/v1/leads`, `PUT /api/v1/leads/{id}`, `GET /api/v1/leads/{id}`, `GET /api/v1/pipeline-flows`, `GET /api/v1/customers` |
| Detalhe | `GET /api/v1/leads/{id}`, `GET /api/v1/leads/{id}/messages`, `POST /api/v1/leads/{id}/messages`, `DELETE /api/v1/leads/{id}` |

### 3.4 Pedidos

| Tela | Endpoints esperados |
|------|----------------------|
| Listagem | `GET /api/v1/orders`, `DELETE /api/v1/orders/{id}` |
| Form | `POST /api/v1/orders`, `PUT /api/v1/orders/{id}`, `GET /api/v1/orders/{id}`, `GET /api/v1/customers`, `GET /api/v1/items`, `GET /api/v1/users` |
| Detalhe | `GET /api/v1/orders/{id}`, `DELETE /api/v1/orders/{id}` |

### 3.5 Agendamentos e Schedules

| Tela | Endpoints esperados |
|------|----------------------|
| Appointments list/form | `GET /api/v1/appointments`, `GET /api/v1/appointments/{id}`, `POST /api/v1/appointments`, `PUT /api/v1/appointments/{id}`, `DELETE /api/v1/appointments/{id}` |
| Schedules list/form | `GET /api/v1/schedules`, `GET /api/v1/schedules/{id}`, `POST /api/v1/schedules`, `PUT /api/v1/schedules/{id}`, `DELETE /api/v1/schedules/{id}`, `GET /api/v1/appointments`, `GET /api/v1/customers` |

### 3.6 Pessoas e Enderecos

| Tela | Endpoints esperados |
|------|----------------------|
| Persons list/form | `GET /api/v1/persons`, `GET /api/v1/persons/{id}`, `POST /api/v1/persons`, `PUT /api/v1/persons/{id}`, `DELETE /api/v1/persons/{id}` |
| Addresses list/form | `GET /api/v1/addresses`, `GET /api/v1/addresses/{id}`, `POST /api/v1/addresses`, `PUT /api/v1/addresses/{id}`, `DELETE /api/v1/addresses/{id}`, `GET /api/v1/countries`, `GET /api/v1/states/country/{id}`, `GET /api/v1/cities/state/{id}` |

### 3.7 Catalogo

| Tela | Endpoints esperados |
|------|----------------------|
| Itens | `GET /api/v1/items`, `GET /api/v1/items/{id}`, `POST /api/v1/items`, `PUT /api/v1/items/{id}`, `DELETE /api/v1/items/{id}`, `GET /api/v1/item-categories` |
| Categorias | `GET /api/v1/item-categories`, `GET /api/v1/item-categories/{id}`, `POST /api/v1/item-categories`, `PUT /api/v1/item-categories/{id}`, `DELETE /api/v1/item-categories/{id}` |
| Unidade de medida (read-only) | `GET /api/v1/units-of-measure`, `GET /api/v1/units-of-measure/{id}` |

### 3.8 Pipeline

| Tela | Endpoints esperados |
|------|----------------------|
| Pipeline list/form | `GET /api/v1/pipeline-flows`, `GET /api/v1/pipeline-flows/{id}`, `POST /api/v1/pipeline-flows`, `PUT /api/v1/pipeline-flows/{id}`, `DELETE /api/v1/pipeline-flows/{id}` |

### 3.9 Administracao

| Tela | Endpoints esperados |
|------|----------------------|
| Users | `GET /api/v1/users`, `GET /api/v1/users/{id}`, `POST /api/v1/users`, `PUT /api/v1/users/{id}`, `DELETE /api/v1/users/{id}`, `GET /api/v1/persons` |
| Tenants | `GET /api/v1/tenants`, `GET /api/v1/tenants/{id}`, `POST /api/v1/tenants`, `PUT /api/v1/tenants/{id}`, `DELETE /api/v1/tenants/{id}` |
| Workers | `GET /api/v1/workers`, `GET /api/v1/workers/{id}`, `POST /api/v1/workers`, `PUT /api/v1/workers/{id}`, `DELETE /api/v1/workers/{id}`, `GET /api/v1/persons`, `GET /api/v1/users` |
| Roles | `GET /api/v1/roles`, `GET /api/v1/roles/{id}`, `POST /api/v1/roles`, `PUT /api/v1/roles/{id}`, `DELETE /api/v1/roles/{id}` |
| Permissions | `GET /api/v1/permissions`, `GET /api/v1/permissions/{id}`, `POST /api/v1/permissions`, `PUT /api/v1/permissions/{id}`, `DELETE /api/v1/permissions/{id}` |

### 3.10 Planos SaaS (novo)

| Tela | Endpoints esperados |
|------|----------------------|
| Settings > Planos (list/form) | `GET /settings/saas/plans`, `GET /settings/saas/plans/{id}`, `POST /settings/saas/plans`, `PUT /settings/saas/plans/{id}`, `DELETE /settings/saas/plans/{id}` |
| `/plans` (pricing) | `GET /settings/saas/plans` (dados reais, com filtro de tenant) |

## 4. Lacunas backend a acompanhar (alto impacto no frontend)

Conforme `api-integration-guidelines.md`, pontos criticos:
- sem refresh token / logout server-side;
- TTL JWT nao documentado;
- enums ausentes em alguns dominos (`status`, `stepType`, etc.);
- relacoes Role-User e Role-Permission sem endpoint dedicado;
- ausencia de filtros por `customerId` em alguns recursos;
- recursos com possiveis riscos multi-tenant quando nao ha `tenantId` claro.

## 5. Como usar esta matriz

1. Escolher o dominio priorizado pelo front.
2. Criar arquivo de implementacao backend detalhado em `specs/backend/<feature>-api-implementation.md`.
3. Garantir padrao global de erros/respostas.
4. Atualizar `specs/backend/README.md` com novo documento.
