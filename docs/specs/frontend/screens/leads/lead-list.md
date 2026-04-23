# Leads — Listagem

## 1. Objetivo
- Exibir todos os leads (oportunidades de negócio) do CRM, com suporte a paginação e filtro por tenant.
- Perfil: gestores e vendedores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/leads` | Lista leads paginados |
| `DELETE` | `/api/v1/leads/{id}` | Remove um lead |

- Requer `Authorization: Bearer <token>`.
- Parâmetros de query: `page` (default 0), `size` (default 20), `tenantId` (opcional).
- Ordenação fixa por `id` DESC (mais recentes primeiro).
- Response `200`: `PageResponse<LeadResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID | Long | `LeadResponse.id` |
| Status | String | `LeadResponse.status` |
| Fonte | String (nullable) | `LeadResponse.source` |
| Valor estimado | Long (cents) | `LeadResponse.estimatedValueCents` |
| Cliente ID | Long (nullable) | `LeadResponse.customerId` |
| Funil (flowId) | Long | `LeadResponse.flowId` |
| Notas | String (nullable) | `LeadResponse.notes` |
| Criado em | OffsetDateTime | `LeadResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar na tela.
- **Filtrar por tenant**: seletor de `tenantId`.
- **Paginar**: controles de paginação.
- **Novo lead**: botão "Novo" → `/leads/new`.
- **Editar**: botão ou clique na linha → `/leads/:id/edit`.
- **Excluir**: confirmação modal → `DELETE /api/v1/leads/{id}`.
- **Ver detalhe / mensagens**: ícone de chat → `/leads/:id`.

## 5. Regras de negócio

- O `status` do lead pode ser: `NEW` (padrão) e outros valores controlados pelo `PipelineFlow`.
- Um lead é sempre vinculado a um `flowId` (funil de vendas).
- `customerId` é opcional — um lead pode existir antes de um cliente ser identificado.
- `estimatedValueCents` é armazenado em centavos; exibir formatado como moeda.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhum lead encontrado."
- **Sucesso**: tabela com paginação.
- **Erro de rede / 5xx**: toast de erro com retry.
- **Não autenticado (401)**: redirect para `/login`.

## 7. Navegação e fluxo

- Origem: menu "Leads" ou `/dashboard`.
- "Novo" → `/leads/new`.
- Editar → `/leads/:id/edit`.
- Detalhe → `/leads/:id`.

## 8. Critérios de aceite

- [ ] `GET /api/v1/leads?page=0&size=20` é chamado ao entrar.
- [ ] Filtro por `tenantId` recarrega a lista.
- [ ] `estimatedValueCents` exibido como valor monetário (ex.: R$ 1.500,00).
- [ ] Exclusão com confirmação remove o item da lista.

## 9. Observações técnicas para front

- Converter `estimatedValueCents` → valor monetário: `value / 100` formatado com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Badge de status com cores por valor (ex.: `NEW` = azul, outros conforme pipeline).
- Ordenação server-side por `id` DESC — não implementar ordenação client-side.
- Coluna "Funil" deve exibir o nome do flow (requer chamada adicional a `GET /api/v1/pipeline-flows/{id}` ou mapeamento em cache).
