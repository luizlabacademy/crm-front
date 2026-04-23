# Leads — Cadastro e Edição

## 1. Objetivo
- Criar um novo lead ou editar um lead existente, incluindo vinculação a funil, cliente e definição de status.
- Perfil: gestores e vendedores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/leads` | Cria novo lead (201) |
| `PUT` | `/api/v1/leads/{id}` | Atualiza lead (200) |
| `GET` | `/api/v1/leads/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/pipeline-flows` | Lista funis disponíveis |
| `GET` | `/api/v1/customers` | Busca clientes para vincular |

- Requer `Authorization: Bearer <token>`.
- Request body (`LeadRequest`): `tenantId`, `flowId`, `customerId?`, `status`, `source?`, `estimatedValueCents?`, `notes?`.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Origem | Validações |
|-------|------|-------------|--------|-----------|
| Tenant | select (Long) | Sim | `LeadRequest.tenantId` | Deve existir |
| Funil | select (Long) | Sim | `LeadRequest.flowId` | Deve existir em pipeline-flows |
| Cliente | autocomplete (Long) | Não | `LeadRequest.customerId` | ID válido, se informado |
| Status | select (String) | Não | `LeadRequest.status` | Default: `NEW` |
| Fonte | input text | Não | `LeadRequest.source` | Texto livre |
| Valor estimado | input numérico | Não | `LeadRequest.estimatedValueCents` | Inteiro positivo (em centavos internamente) |
| Notas | textarea | Não | `LeadRequest.notes` | Texto livre |

## 4. Ações do usuário

- **Preencher formulário** → validação em tempo real.
- **Salvar**: `POST` (novo) ou `PUT` (edição) → redireciona para `/leads/:id`.
- **Cancelar**: volta para `/leads`.
- **Modo edição**: carrega dados via `GET /api/v1/leads/{id}`.

## 5. Regras de negócio

- `tenantId` e `flowId` são obrigatórios.
- O campo `status` representa a etapa atual do lead no funil; os valores possíveis devem ser derivados das etapas do `PipelineFlow` selecionado (campo `code` dos `steps`).
- `estimatedValueCents` deve ser exibido como valor monetário (R$) e convertido para centavos antes de enviar.
- `PUT` é substituição total — campos opcionais não informados serão nulos.

## 6. Estados da interface

- **Carregando (edição)**: skeleton no formulário.
- **Salvando**: spinner no botão.
- **Sucesso**: toast + redirect.
- **Erro de validação**: mensagens inline.
- **Não encontrado (404)**: mensagem de erro.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem.
- Origem (edição): botão editar na listagem ou detalhe.
- Após salvar: `/leads/:id`.
- Cancelar: `/leads`.

## 8. Critérios de aceite

- [ ] Sem `flowId` → botão "Salvar" desabilitado.
- [ ] `estimatedValueCents` aceita entrada monetária e converte corretamente para centavos.
- [ ] Seleção de funil carrega etapas disponíveis para o campo "Status".
- [ ] Edição pré-preenche todos os campos.
- [ ] `PUT` envia todos os campos, mesmo os não alterados.

## 9. Observações técnicas para front

- Input de valor monetário: exibir em R$, armazenar internamente em centavos (`Math.round(valor * 100)`).
- Seletor de `flowId`: exibir nome do funil, carregar de `GET /api/v1/pipeline-flows?tenantId=X`.
- Ao selecionar o funil, preencher opções de `status` com os `steps[].code` ou `steps[].name`.
- Autocomplete de `customerId` com debounce de 300ms sobre `GET /api/v1/customers`.
