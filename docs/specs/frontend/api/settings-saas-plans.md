# API — Settings SaaS Plans

## 1. Objetivo

Definir o contrato de API para CRUD de planos SaaS com beneficios embutidos, respeitando multi-tenancy por `tenant_id` do token.

Documentos relacionados:
- `specs/frontend/api-integration-guidelines.md`
- `specs/frontend/api-error-response-guidelines.md`

## 2. Base path

- `/settings/saas/plans`

## 3. Modelagem de dados (resumo)

### 3.1 Tabela `settings_saas_plan`
- `id`
- `tenant_id`
- `name`
- `description`
- `category`
- `created_at`
- `updated_at`

### 3.2 Tabela `settings_saas_plan_benefits`
- `id`
- `plan_id`
- `description`
- `created_at`
- `updated_at`

### 3.3 Enum `PlanCategory`
- `PROFESSIONAL_AUTONOMOUS`
- `BUSINESS`

## 4. Endpoints

| Metodo | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/settings/saas/plans` | Lista planos do tenant (com beneficios) |
| `GET` | `/settings/saas/plans/{id}` | Obtem plano por id |
| `POST` | `/settings/saas/plans` | Cria plano com beneficios |
| `PUT` | `/settings/saas/plans/{id}` | Atualiza plano e beneficios |
| `DELETE` | `/settings/saas/plans/{id}` | Exclui plano |

Regras:
- Nao criar endpoint separado para beneficios.
- `POST`/`PUT` recebem e persistem plano + beneficios juntos.
- `PUT` aplica estrategia de substituicao da lista de beneficios dentro de transacao.

## 5. Payloads

### 5.1 Request (POST/PUT)

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

### 5.2 Response (200/201)

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

## 6. Validacoes

- `name`: obrigatorio, trim, max 255.
- `category`: obrigatorio, deve existir no enum.
- `benefits`: obrigatorio, minimo 1 item.
- `benefits[].description`: obrigatorio, trim.
- `tenant_id`: proibido no payload do cliente.

## 7. Erros e respostas esperadas

Padrao global obrigatorio:
- `specs/frontend/api-error-response-guidelines.md`

Status minimos por endpoint:
- `GET` list/detalhe: `200`, `401`, `403`, `404`, `5xx`
- `POST`: `201`, `400`, `401`, `403`, `409`, `422`, `5xx`
- `PUT`: `200`, `400`, `401`, `403`, `404`, `409`, `422`, `5xx`
- `DELETE`: `204`, `401`, `403`, `404`, `5xx`

Formato de erro:
- Deve seguir envelope padrao com `status`, `message`, `path` e `errors[]` (quando validacao).

## 8. Multi-tenancy e seguranca

- Derivar `tenant_id` do token autenticado.
- Toda query deve aplicar filtro por tenant.
- Nao permitir leitura/alteracao de plano fora do tenant autenticado.

## 9. Consistencia transacional

- Criacao e edicao devem ocorrer em transacao unica (plano + beneficios).
- Em falha parcial, executar rollback total.

## 10. Criterios de aceite

- [ ] API persiste plano e beneficios em operacao atomica.
- [ ] API retorna plano com lista completa de beneficios.
- [ ] Nao existe CRUD independente de beneficios.
- [ ] Multi-tenancy bloqueia acesso cruzado entre tenants.
- [ ] Erros e respostas respeitam padrao global.
