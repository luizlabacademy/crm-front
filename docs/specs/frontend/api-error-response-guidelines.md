# API Error and Response Guidelines

## 1. Objetivo

Padronizar os contratos de sucesso e erro entre frontend e backend para todas as APIs do CRM, evitando variações por endpoint.

Documentos relacionados:
- `api-integration-guidelines.md`
- `frontend-guidelines.md` (seção 8 e seção 9)

---

## 2. Regras globais obrigatórias

- Toda especificação nova de API deve incluir seção de respostas de sucesso e erro.
- Se não existir padrão global para um contexto novo, a spec da feature deve criar o padrão e referenciá-lo.
- O frontend deve tratar, no mínimo: `400`, `401`, `403`, `404`, `409`, `422`, `5xx`.
- Sempre incluir `requestId` no payload de erro quando disponibilizado pelo backend.

---

## 3. Envelope de sucesso

### 3.1 Recursos únicos
- `GET /resource/{id}`, `POST`, `PUT` retornam o objeto do recurso.

### 3.2 Listagens
- Quando paginado, usar `PageResponse<T>`:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

- Quando não paginado, retornar array simples (`T[]`) e documentar explicitamente a exceção.

### 3.3 DELETE
- Preferencial: `204 No Content`.

---

## 4. Envelope de erro

Formato padrão:

```json
{
  "timestamp": "2026-04-22T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Erro de validação",
  "path": "/api/v1/resource",
  "requestId": "8f8b4b8a-4b40-4f37-ae56-3f6058be6ec0",
  "errors": [
    {
      "field": "name",
      "message": "Nome e obrigatorio",
      "code": "NotBlank"
    }
  ]
}
```

Campos mínimos exigidos para frontend:
- `status`
- `message`
- `path`
- `errors[]` para validação de campos (quando aplicavel)

---

## 5. Matriz de status HTTP

| Status | Uso padrao | Comportamento frontend |
|--------|------------|------------------------|
| `200` | Consulta/atualizacao com body | Renderiza sucesso |
| `201` | Criacao com body | Toast de sucesso + refresh/invalidate |
| `204` | Exclusao sem body | Toast de sucesso + refresh/invalidate |
| `400` | Erro de validacao/sintaxe | Mapear `errors[]` em campos e toast resumo |
| `401` | Sem token/token invalido | Limpar sessao e redirecionar `/login` |
| `403` | Sem permissao | Toast "Sem permissao" |
| `404` | Recurso nao encontrado | Estado "nao encontrado" |
| `409` | Conflito de regra/duplicidade | Exibir mensagem de conflito |
| `422` | Regra de negocio nao atendida | Exibir mensagem de negocio |
| `5xx` | Erro interno/infra | Toast generico e opcao de retry |

---

## 6. Regras de multi-tenancy para respostas

- Nunca expor dados de outro tenant em respostas de sucesso.
- Em recurso inexistente ou fora do tenant, seguir padrao definido na API da feature (`404` ou `403`) e manter consistencia interna.
- Nao retornar detalhes sensiveis que permitam enumeracao de tenant.

---

## 7. Checklist para specs de API

- [ ] Endpoint documenta sucesso (`200/201/204`).
- [ ] Endpoint documenta erros (`400/401/403/404/5xx` e opcionais `409/422`).
- [ ] Formato de erro segue este documento.
- [ ] Comportamento de multi-tenancy esta explicito.
- [ ] Frontend state mapping (loading/empty/success/error/401/403) esta coberto.
