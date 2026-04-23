# API Integration Guidelines

## 1. Objetivo

Documentar a integração entre o front-end e o backend CRM: autenticação, convenções de request/response, matriz tela × endpoint e lacunas identificadas na API.

Documentos relacionados:
- `frontend-guidelines.md` — convenções gerais (seção 8: API e HTTP)
- `tech-stack.md` — axios, TanStack Query
- `api-error-response-guidelines.md` — contrato global de respostas e erros

---

## 2. Informações do backend

| Item | Valor |
|------|-------|
| Base URL (Staging) | `http://luizlab.com:8080` |
| Base URL (local) | `http://localhost:8080` |
| OpenAPI docs | `GET http://luizlab.com:8080/v3/api-docs` |
| Swagger UI | `/swagger-ui/index.html` |
| Health check | `GET /health/live` → `{"status":"UP"}` |

---

## 3. Autenticação

- **Endpoint**: `POST /api/v1/auth/token`
  - Senha para teste em `Staging`:
```JSON
{
  "email": "admin@saas.com",
  "password": "123456"
}
```
- **Request body**: `{ "email": "string", "password": "string" }`
- **Response 200**: `{ "token": "string" }` (JWT)
- Todos os demais endpoints exigem header `Authorization: Bearer <token>`.
- Endpoints públicos (sem token): `/api/v1/auth/**`, Swagger, actuator, health.
- **Sem endpoint de refresh token** — ao expirar, o usuário deve autenticar novamente.
- **Sem endpoint de logout** — invalidação é client-side (remover token da memória).
- **TTL do JWT não documentado** na API — implementar detecção de 401 para redirect.

---

## 4. Convenções de request/response

### IDs
- Todos os `id` são `int64` (Long).
- `code` (UUID) é gerado pelo backend — nunca enviar no request de criação.

### Paginação (server-side)
- Query params: `page` (0-based), `size` (default 20).
- Response: `PageResponse<T>` com `content[]`, `page`, `size`, `totalElements`, `totalPages`.
- Exceções (não paginados): `GET /api/v1/states/country/{id}`, `GET /api/v1/cities/state/{id}`, `GET /api/v1/leads/{id}/messages`.

### Valores monetários
- Sempre em **centavos** (`int64`): `totalCents`, `subtotalCents`, `discountCents`, `unitPriceCents`, `totalPriceCents`, `estimatedValueCents`.
- Frontend: exibir como `R$ X.XXX,XX` e converter input decimal → centavos antes de enviar (`Math.round(value * 100)`).

### Datas
- Formato: ISO 8601 com timezone (`OffsetDateTime`).
- Frontend: `input[type=datetime-local]` → converter para `OffsetDateTime` com offset do usuário.
- Exibição: `dd/MM/yyyy HH:mm` no fuso local.

### Campos booleanos
- Na API: `active`, `primary`, `terminal` (sem prefixo `is`).
- No domínio Kotlin: `isActive`, `isPrimary`, `isTerminal`.
- O frontend deve usar os nomes da API (JSON).

### Soft delete
- Campo `active` (boolean) presente na maioria dos recursos.
- `active = false` desativa sem excluir. `DELETE` é exclusão definitiva.

### Erros e respostas padronizadas
- Seguir o padrão global em `api-error-response-guidelines.md`.
- Toda nova API deve explicitar `200/201/204` e `400/401/403/404/5xx`.
- Erros de validação devem retornar lista por campo (`errors[]`) para mapeamento inline no frontend.

### Senha
- Campo `passwordHash` no `UserRequest` — o frontend deve enviar a senha em **plain text** nesse campo; o backend gera o hash BCrypt.
- A senha nunca é retornada no `UserResponse`.

---

## 5. Recursos read-only

Estes recursos não possuem endpoints de criação/edição/exclusão. São gerenciados exclusivamente via SQL seed:

| Recurso | Endpoints |
|---------|-----------|
| Country | `GET /api/v1/countries`, `GET /api/v1/countries/{id}` |
| State | `GET /api/v1/states`, `GET /api/v1/states/{id}`, `GET /api/v1/states/country/{countryId}` |
| City | `GET /api/v1/cities`, `GET /api/v1/cities/{id}`, `GET /api/v1/cities/state/{stateId}` |
| UnitOfMeasure | `GET /api/v1/units-of-measure`, `GET /api/v1/units-of-measure/{id}` |

---

## 6. Matriz Tela x Endpoint

### Autenticação e Dashboard

| Tela | Endpoints |
|------|-----------|
| Login | `POST /api/v1/auth/token` |
| Dashboard | Sem endpoints de agregação — dados computados client-side a partir dos endpoints de listagem existentes |

### Clientes

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/customers`, `DELETE /api/v1/customers/{id}` |
| Cadastro/Edição | `POST /api/v1/customers`, `PUT /api/v1/customers/{id}`, `GET /api/v1/customers/{id}`, `GET /api/v1/tenants`, `GET /api/v1/persons` |
| Detalhe | `GET /api/v1/customers/{id}`, `DELETE /api/v1/customers/{id}` |

### Leads

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/leads`, `DELETE /api/v1/leads/{id}` |
| Cadastro/Edição | `POST /api/v1/leads`, `PUT /api/v1/leads/{id}`, `GET /api/v1/leads/{id}`, `GET /api/v1/pipeline-flows`, `GET /api/v1/customers` |
| Detalhe | `GET /api/v1/leads/{id}`, `GET /api/v1/leads/{id}/messages`, `POST /api/v1/leads/{id}/messages`, `DELETE /api/v1/leads/{id}` |

### Pedidos

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/orders`, `DELETE /api/v1/orders/{id}` |
| Cadastro/Edição | `POST /api/v1/orders`, `PUT /api/v1/orders/{id}`, `GET /api/v1/orders/{id}`, `GET /api/v1/customers`, `GET /api/v1/items`, `GET /api/v1/users` |
| Detalhe | `GET /api/v1/orders/{id}`, `DELETE /api/v1/orders/{id}` |

### Agendamentos

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/appointments`, `DELETE /api/v1/appointments/{id}` |
| Cadastro/Edição | `POST /api/v1/appointments`, `PUT /api/v1/appointments/{id}`, `GET /api/v1/appointments/{id}` |

### Schedules

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/schedules`, `DELETE /api/v1/schedules/{id}` |
| Cadastro/Edição | `POST /api/v1/schedules`, `PUT /api/v1/schedules/{id}`, `GET /api/v1/schedules/{id}`, `GET /api/v1/appointments`, `GET /api/v1/customers` |

### Pessoas

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/persons`, `DELETE /api/v1/persons/{id}` |
| Cadastro/Edição | `POST /api/v1/persons`, `PUT /api/v1/persons/{id}`, `GET /api/v1/persons/{id}` |

### Endereços

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/addresses`, `DELETE /api/v1/addresses/{id}` |
| Cadastro/Edição | `POST /api/v1/addresses`, `PUT /api/v1/addresses/{id}`, `GET /api/v1/addresses/{id}`, `GET /api/v1/countries`, `GET /api/v1/states/country/{id}`, `GET /api/v1/cities/state/{id}` |

### Catálogo — Itens

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/items`, `DELETE /api/v1/items/{id}` |
| Cadastro/Edição | `POST /api/v1/items`, `PUT /api/v1/items/{id}`, `GET /api/v1/items/{id}`, `GET /api/v1/item-categories` |

### Catálogo — Categorias

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/item-categories`, `DELETE /api/v1/item-categories/{id}` |
| Cadastro/Edição | `POST /api/v1/item-categories`, `PUT /api/v1/item-categories/{id}`, `GET /api/v1/item-categories/{id}` |

### Catálogo — Unidades de Medida

| Tela | Endpoints |
|------|-----------|
| Consulta (read-only) | `GET /api/v1/units-of-measure`, `GET /api/v1/units-of-measure/{id}` |

### Pipeline

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/pipeline-flows`, `DELETE /api/v1/pipeline-flows/{id}` |
| Cadastro/Edição | `POST /api/v1/pipeline-flows`, `PUT /api/v1/pipeline-flows/{id}`, `GET /api/v1/pipeline-flows/{id}` |

### Administração — Usuários

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/users`, `DELETE /api/v1/users/{id}` |
| Cadastro/Edição | `POST /api/v1/users`, `PUT /api/v1/users/{id}`, `GET /api/v1/users/{id}`, `GET /api/v1/persons` |

### Administração — Tenants

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/tenants`, `DELETE /api/v1/tenants/{id}` |
| Cadastro/Edição | `POST /api/v1/tenants`, `PUT /api/v1/tenants/{id}`, `GET /api/v1/tenants/{id}` |

### Administração — Workers

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/workers`, `DELETE /api/v1/workers/{id}` |
| Cadastro/Edição | `POST /api/v1/workers`, `PUT /api/v1/workers/{id}`, `GET /api/v1/workers/{id}`, `GET /api/v1/persons`, `GET /api/v1/users` |

### Administração — Roles

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/roles`, `DELETE /api/v1/roles/{id}` |
| Cadastro/Edição | `POST /api/v1/roles`, `PUT /api/v1/roles/{id}`, `GET /api/v1/roles/{id}` |

### Administração — Permissions

| Tela | Endpoints |
|------|-----------|
| Listagem | `GET /api/v1/permissions`, `DELETE /api/v1/permissions/{id}` |
| Cadastro/Edição | `POST /api/v1/permissions`, `PUT /api/v1/permissions/{id}`, `GET /api/v1/permissions/{id}` |

### Dados Geográficos

| Tela | Endpoints |
|------|-----------|
| Consulta (componente) | `GET /api/v1/countries`, `GET /api/v1/states/country/{id}`, `GET /api/v1/cities/state/{id}` |

---

## 7. Lacunas identificadas na API

| # | Lacuna | Impacto no front |
|---|--------|-----------------|
| 1 | **Sem refresh token nem logout** | Usuário redirecionado para login ao expirar JWT. Sem invalidação server-side. |
| 2 | **TTL do JWT não documentado** | Impossível implementar refresh proativo; depender de detecção de 401. |
| 3 | **`passwordHash` no `UserRequest`** | Frontend envia plain text; nome do campo é misleading. |
| 4 | **Sem filtro `customerId` em Lead, Order, Schedule** | Detalhe do cliente não consegue listar leads/pedidos/schedules associados sem paginação client-side. |
| 5 | **Valores de `status` (Lead, Order, Appointment) sem enum** | Selects dependem de definição manual hardcoded no front. |
| 6 | **`stepType` de PipelineFlowStep sem enum** | Select de tipo de etapa incompleto. |
| 7 | **Sem endpoint Role <> User** | Não é possível atribuir papel a usuário pela API. |
| 8 | **Sem endpoint Role <> Permission** | Modelo de permissões incompleto. |
| 9 | **`Address` sem `tenantId`** | Listagem global pode expor dados de outros tenants. |
| 10 | **`Appointment` sem `tenantId`** | Filtro por tenant requer intermediário via Schedule. |
| 11 | **`UnitOfMeasure` read-only** | Sem tela de administração; gerenciado só via SQL seed. |
| 12 | **`Contact.type` sem enum** | Select de tipo de contato depende de definição manual. |
| 13 | **Sem endpoints de agregação/analytics** | Dashboard depende de múltiplas chamadas e computação client-side. |

---

## 8. Padrão de integração recomendado

### Hook por recurso

```typescript
// src/features/customers/api/useCustomers.ts
export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => api.get<PageResponse<CustomerResponse>>('/api/v1/customers', { params }),
  })
}
```

### Mutation com invalidação

```typescript
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomerRequest) => api.post('/api/v1/customers', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}
```

### Tratamento de erros centralizado

```typescript
// src/lib/api/client.ts
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```
