# Backend Implementation Guide — Settings SaaS Plans API

## 1. Objetivo

Guiar implementacao backend para atender o frontend com API de Planos SaaS, garantindo:
- contrato consistente com specs do frontend;
- multi-tenancy obrigatoria por `tenant_id` do token;
- persistencia transacional de plano + beneficios;
- padrao global de respostas e erros.

Documentos relacionados:
- `specs/frontend/api/settings-saas-plans.md`
- `specs/frontend/api-error-response-guidelines.md`

## 2. Escopo funcional

Implementar CRUD de planos em endpoint unico:
- `/settings/saas/plans`

Regras obrigatorias:
- beneficios nao possuem CRUD independente;
- `POST` e `PUT` recebem plano + lista completa de beneficios;
- toda operacao deve respeitar tenant do usuario autenticado.

## 3. Modelo de dados

### 3.1 Tabelas
- `settings_saas_plan`
  - `id`, `tenant_id`, `name`, `description`, `category`, `created_at`, `updated_at`
- `settings_saas_plan_benefits`
  - `id`, `plan_id`, `description`, `created_at`, `updated_at`

### 3.2 Enum
- `PlanCategory`
  - `PROFESSIONAL_AUTONOMOUS`
  - `BUSINESS`

### 3.3 Constraints recomendadas
- FK `plan_id -> settings_saas_plan.id` com `ON DELETE CASCADE`.
- Indice por `tenant_id` em `settings_saas_plan`.
- Opcional: unique (`tenant_id`, `name`) para evitar nome duplicado no mesmo tenant.

## 4. Contrato da API

## 4.1 Endpoints

| Metodo | Rota | Objetivo |
|--------|------|----------|
| `GET` | `/settings/saas/plans` | Listar planos do tenant |
| `GET` | `/settings/saas/plans/{id}` | Detalhar plano do tenant |
| `POST` | `/settings/saas/plans` | Criar plano + beneficios |
| `PUT` | `/settings/saas/plans/{id}` | Atualizar plano + beneficios |
| `DELETE` | `/settings/saas/plans/{id}` | Excluir plano |

### 4.2 Query params (listagem)
- `name` (opcional): filtro parcial por nome (case-insensitive)
- `category` (opcional): filtro por enum

### 4.3 Request DTO (POST/PUT)

```json
{
  "name": "Essencial",
  "description": "Plano para autonomos",
  "category": "PROFESSIONAL_AUTONOMOUS",
  "benefits": [
    { "description": "Atendimento prioritario" },
    { "description": "Relatorios mensais" }
  ]
}
```

### 4.4 Response DTO (200/201)

```json
{
  "id": 123,
  "tenant_id": 1,
  "name": "Essencial",
  "description": "Plano para autonomos",
  "category": "PROFESSIONAL_AUTONOMOUS",
  "benefits": [
    { "id": 1, "description": "Atendimento prioritario" },
    { "id": 2, "description": "Relatorios mensais" }
  ],
  "created_at": "2026-04-22T12:00:00Z",
  "updated_at": "2026-04-22T12:00:00Z"
}
```

## 5. Regras de validacao

- `name`: obrigatorio, `trim`, max 255.
- `category`: obrigatorio e valido no enum.
- `benefits`: obrigatorio e com no minimo 1 item.
- `benefits[].description`: obrigatorio, `trim`, nao vazio.
- payload nao deve aceitar `tenant_id` do cliente.

Erros de validacao devem retornar `400` com `errors[]` por campo, conforme padrao global.

## 6. Multi-tenancy e autorizacao

## 6.1 Fonte da verdade do tenant
- extrair `tenant_id` exclusivamente do token autenticado (claims/contexto de seguranca).

## 6.2 Regras por endpoint
- `GET /settings/saas/plans`: aplicar `WHERE tenant_id = :tokenTenantId`.
- `GET /{id}`: buscar por `id` + `tenant_id`.
- `PUT /{id}`: validar posse por tenant antes de atualizar.
- `DELETE /{id}`: validar posse por tenant antes de excluir.

## 6.3 Acesso cruzado
- recurso de outro tenant: retornar `403` ou `404` conforme politica interna; manter consistencia em todos endpoints.

## 7. Transacao e consistencia

`POST` e `PUT` devem ser atomicos.

### 7.1 Fluxo sugerido para POST
1. inserir plano com `tenant_id` do token;
2. inserir todos beneficios vinculados ao `plan_id` criado;
3. commit;
4. retornar recurso completo.

### 7.2 Fluxo sugerido para PUT (replace strategy)
1. validar existencia do plano por `id` + `tenant_id`;
2. atualizar dados do plano;
3. deletar beneficios atuais do plano;
4. inserir nova lista de beneficios do payload;
5. commit;
6. retornar recurso completo.

Se qualquer etapa falhar, rollback total.

## 8. Padrao de erros e respostas

Obrigatorio seguir `specs/frontend/api-error-response-guidelines.md`.

### 8.1 Matriz minima por endpoint
- `GET list`: `200`, `401`, `403`, `5xx`
- `GET detail`: `200`, `401`, `403|404`, `5xx`
- `POST`: `201`, `400`, `401`, `403`, `409`, `422`, `5xx`
- `PUT`: `200`, `400`, `401`, `403|404`, `409`, `422`, `5xx`
- `DELETE`: `204`, `401`, `403|404`, `5xx`

### 8.2 Envelope de erro (exemplo)

```json
{
  "timestamp": "2026-04-22T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Erro de validacao",
  "path": "/settings/saas/plans",
  "requestId": "8f8b4b8a-4b40-4f37-ae56-3f6058be6ec0",
  "errors": [
    { "field": "name", "message": "Nome e obrigatorio", "code": "NotBlank" }
  ]
}
```

## 9. Contrato para o frontend (o que nao pode quebrar)

- Sempre retornar `benefits[]` no response de plano (list e detail).
- Campos de categoria devem manter os valores do enum definidos.
- Nao exigir chamadas separadas para beneficios.
- Respeitar semantica HTTP (201 no create, 204 no delete).
- Nao mudar nomes de campos sem alinhar spec (`tenant_id`, `created_at`, etc.).

## 10. Plano de implementacao (ordem recomendada)

1. Aplicar migration das tabelas e enum.
2. Criar entidades/DAO/repository para planos e beneficios.
3. Criar servico de dominio com transacoes (`createPlan`, `updatePlan`, `deletePlan`, `getPlan`, `listPlans`).
4. Implementar controllers/handlers das 5 rotas.
5. Conectar autenticacao para leitura de `tenant_id` do token.
6. Padronizar tratamento de excecoes para envelope global de erro.
7. Publicar contrato em OpenAPI/Swagger.
8. Criar seeds de exemplo para `tenant_id = 1`.

## 11. Testes minimos obrigatorios (backend)

## 11.1 Unitarios (service)
- cria plano com beneficios e retorna estrutura completa;
- update substitui lista de beneficios;
- rollback em falha de insercao de beneficio;
- bloqueia operacao com tenant divergente.

## 11.2 Integracao (API)
- `POST` happy path retorna `201`.
- `GET list` retorna apenas dados do tenant autenticado.
- `GET detail` fora do tenant responde `403|404` conforme politica.
- `PUT` atualiza plano e beneficios em uma chamada.
- `DELETE` retorna `204` e remove beneficios em cascata.
- validacoes retornam `400` com `errors[]` por campo.

## 12. Criterios de aceite

- [ ] Frontend consegue listar, criar, editar e excluir planos sem endpoint extra de beneficios.
- [ ] Todos os endpoints filtram por tenant do token.
- [ ] Persistencia de plano + beneficios e transacional.
- [ ] Erros e respostas seguem padrao global.
- [ ] Seed de tenant 1 permite substituir mocks da pagina `/plans`.
