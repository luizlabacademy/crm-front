# Funis de Vendas (PipelineFlow) — Cadastro e Edição

## 1. Objetivo
- Criar ou editar um funil de vendas com suas etapas (steps).
- Perfil: gestores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/pipeline-flows` | Cria funil (201) |
| `PUT` | `/api/v1/pipeline-flows/{id}` | Atualiza funil e steps (200) |
| `GET` | `/api/v1/pipeline-flows/{id}` | Carrega dados com steps para edição |
| `GET` | `/api/v1/tenants` | Lista tenants para seleção |

- Requer `Authorization: Bearer <token>`.
- Request body (`PipelineFlowRequest`): `tenantId`, `code`, `name`, `description?`, `active`, `steps[]`.
- `PipelineFlowStepRequest`: `stepOrder`, `code`, `name`, `description?`, `stepType`, `terminal`.
- Response `201`/`200`: `PipelineFlowResponse` completo com steps.

## 3. Campos e dados da tela

### Dados do funil

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Tenant | select (Long) | Sim | Deve existir |
| Código | input text | Sim | Único por tenant — pendente de validação backend |
| Nome | input text | Sim | Não vazio |
| Descrição | textarea | Não | — |
| Ativo | toggle | Não | Default: true |

### Etapas (lista dinâmica, ordenável)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Ordem | input numérico | Sim | Inteiro >= 1; único dentro do funil |
| Código | input text | Sim | Não vazio |
| Nome | input text | Sim | Não vazio |
| Descrição | textarea | Não | — |
| Tipo | select (String) | Sim | Ex.: STANDARD, WIN, LOSS — pendente de definição |
| Terminal | toggle | Não | Default: false |

## 4. Ações do usuário

- **Preencher dados do funil** → validação em tempo real.
- **Adicionar etapa**: botão "+" adiciona linha de step.
- **Remover etapa**: ícone "x" na linha.
- **Reordenar etapas**: drag-and-drop ou botões cima/baixo.
- **Salvar**: botão "Salvar" → `POST` (novo) ou `PUT` (edição).
  - Sucesso: toast + redirect para `/pipeline-flows`.
  - Erro: mensagem inline ou toast global.
- **Cancelar**: volta para `/pipeline-flows` sem salvar.
- **Modo edição**: carrega dados + steps via `GET /api/v1/pipeline-flows/{id}`.

## 5. Regras de negócio

- `steps` são enviados junto com o funil (no mesmo body); não há endpoint separado para etapas.
- `terminal = true` indica etapa final (ganho ou perdido).
- A ordem das etapas é definida por `stepOrder`; o front deve garantir unicidade.
- Leads referenciando o funil precisam ter o status atualizado se as etapas mudarem — pendente de definição.
- `PUT` substitui o funil completo com todas as etapas.

## 6. Estados da interface

- **Carregando dados (edição)**: skeleton no formulário.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Funil salvo com sucesso." + redirect.
- **Erro de validação (400)**: mensagens inline.
- **Não encontrado (404)**: mensagem "Funil não encontrado." com botão de voltar.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/pipeline-flows/new`.
- Origem (edição): botão editar na listagem → `/pipeline-flows/:id/edit`.
- Após salvar: `/pipeline-flows`.
- Cancelar: `/pipeline-flows`.

## 8. Critérios de aceite

- [ ] Given: `code`, `name` ou `tenantId` vazios → botão "Salvar" desabilitado.
- [ ] Given: etapas podem ser reordenadas por drag-and-drop ou botões.
- [ ] Given: ao menos uma etapa com `terminal = true` — pendente de definição se obrigatório.
- [ ] Given: `PUT` envia funil completo com todas as etapas.
- [ ] Given: edição → steps carregados e exibidos na lista dinâmica.

## 9. Observações técnicas para front

- Lista de etapas com drag-and-drop (ex.: `dnd-kit`) ou botões para reordenação.
- `stepOrder` recalculado automaticamente ao reordenar.
- `stepType`: select com valores fixos quando definidos.
- Badge "Terminal" destaca etapas finais.
- Schema Zod com array de steps validando `stepOrder` único.
