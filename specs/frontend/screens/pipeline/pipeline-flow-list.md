# Funis de Vendas (PipelineFlow) — Listagem

## 1. Objetivo
- Exibir todos os funis de vendas com paginação e filtro por tenant.
- Perfil: gestores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/pipeline-flows` | Lista funis paginados |
| `DELETE` | `/api/v1/pipeline-flows/{id}` | Remove funil |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20), `tenantId` (opcional). Ordenação: `name` ASC.
- Response `200`: `PageResponse<PipelineFlowResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID | Long | `PipelineFlowResponse.id` |
| Código | String | `PipelineFlowResponse.code` |
| Nome | String | `PipelineFlowResponse.name` |
| Qtd. etapas | Number (derivado) | `PipelineFlowResponse.steps.size` |
| Ativo | Boolean | `PipelineFlowResponse.active` |
| Criado em | OffsetDateTime | `PipelineFlowResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Filtrar por tenant**: select ou input de `tenantId`.
- **Paginar**: próxima/anterior, seletor de tamanho.
- **Novo**: botão "Novo" → `/pipeline-flows/new`.
- **Editar**: clique na linha → `/pipeline-flows/:id/edit`.
- **Excluir**: botão com confirmação → `DELETE` → recarrega lista.

## 5. Regras de negócio

- Leads referenciando o funil podem ser impactados pela exclusão — pendente de definição.
- `active = false` desativa sem excluir.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhum funil cadastrado." com botão "Criar funil".
- **Sucesso**: tabela paginada.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Funis de Vendas".
- "Novo" → `/pipeline-flows/new`.
- Editar → `/pipeline-flows/:id/edit`.
- Após exclusão: permanece na listagem.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/pipeline-flows?page=0&size=20`.
- [ ] Filtro por `tenantId` funciona.
- [ ] Exclusão com confirmação.
- [ ] Quantidade de etapas exibida corretamente.

## 9. Observações técnicas para front

- Badge ativo/inativo.
- Exibir quantidade de steps como número na tabela.
- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Paginação server-side.
