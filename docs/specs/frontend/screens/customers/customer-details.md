# Clientes — Detalhe

## 1. Objetivo
- Exibir todos os dados de um cliente específico, incluindo informações relacionadas a leads, pedidos e agendamentos.
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/customers/{id}` | Carrega dados do cliente |
| `GET` | `/api/v1/leads?tenantId=X` | Leads do tenant (filtrar por customerId no front) |
| `GET` | `/api/v1/orders?tenantId=X` | Pedidos do tenant (filtrar por customerId no front) |
| `GET` | `/api/v1/schedules?tenantId=X` | Agendamentos do tenant (filtrar por customerId no front) |

- Requer `Authorization: Bearer <token>`.
- Response `200`: `CustomerResponse`.
- Response `404`: cliente não encontrado.

> **Nota:** Não existe endpoint dedicado `GET /api/v1/customers/{id}/leads` etc. A filtragem por `customerId` deve ser feita no front sobre os dados retornados, ou via parâmetros de query quando disponíveis.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID / Code | Long / UUID | `CustomerResponse.id`, `.code` |
| Nome completo | String | `CustomerResponse.fullName` |
| E-mail | String | `CustomerResponse.email` |
| Telefone | String | `CustomerResponse.phone` |
| Documento | String | `CustomerResponse.document` |
| Ativo | Boolean | `CustomerResponse.isActive` |
| Tenant ID | Long | `CustomerResponse.tenantId` |
| Person ID | Long | `CustomerResponse.personId` |
| Criado em | OffsetDateTime | `CustomerResponse.createdAt` |
| Atualizado em | OffsetDateTime | `CustomerResponse.updatedAt` |

## 4. Ações do usuário

- **Visualizar**: dados exibidos em modo leitura.
- **Editar**: botão "Editar" → navega para `/customers/:id/edit`.
- **Excluir**: botão "Excluir" com confirmação → `DELETE /api/v1/customers/{id}` → redireciona para listagem.
- **Ver Person vinculada**: link para `/persons/:personId` se `personId` não for nulo.
- **Ver Leads**: aba ou seção com lista resumida de leads do cliente.
- **Ver Pedidos**: aba ou seção com lista resumida de pedidos.
- **Ver Agendamentos**: aba ou seção com agendamentos via Schedules.

## 5. Regras de negócio

- O detalhe é somente leitura — edição ocorre em tela separada.
- Se `personId` estiver preenchido, exibir link de navegação para a Person.
- Leads, Orders e Schedules relacionados ao cliente são carregados por consultas independentes filtradas por `customerId`.

## 6. Estados da interface

- **Carregando**: skeleton na área de dados principais.
- **Sucesso**: dados exibidos.
- **Não encontrado (404)**: mensagem "Cliente não encontrado." com botão voltar.
- **Não autenticado (401)**: redireciona para `/login`.

## 7. Navegação e fluxo

- Origem: listagem de clientes ou resultado de busca.
- Botão "Editar" → `/customers/:id/edit`.
- Após exclusão → `/customers`.
- Link Person → `/persons/:personId`.
- Link Lead → `/leads/:id`.
- Link Order → `/orders/:id`.

## 8. Critérios de aceite

- [ ] `GET /api/v1/customers/{id}` é chamado ao entrar na rota.
- [ ] Dados são exibidos corretamente.
- [ ] 404 exibe mensagem amigável.
- [ ] Botão "Editar" navega para o formulário pré-preenchido.
- [ ] Exclusão com confirmação dispara `DELETE` e redireciona.

## 9. Observações técnicas para front

- Formatar `createdAt` / `updatedAt` como `dd/MM/yyyy HH:mm`.
- Formatar `document` com máscara CPF/CNPJ conforme tamanho.
- Badge de status ativo/inativo.
- Tabs ou accordion para seções de leads, pedidos e agendamentos — carregamento lazy ao abrir cada aba.
