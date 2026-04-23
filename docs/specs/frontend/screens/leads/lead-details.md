# Leads — Detalhe e Mensagens

## 1. Objetivo
- Exibir os dados completos de um lead e o histórico de mensagens trocadas no canal, permitindo o envio de novas mensagens.
- Perfil: gestores e vendedores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/leads/{id}` | Carrega dados do lead |
| `GET` | `/api/v1/leads/{leadId}/messages` | Lista mensagens do lead |
| `POST` | `/api/v1/leads/{leadId}/messages` | Envia nova mensagem |
| `DELETE` | `/api/v1/leads/{id}` | Remove o lead |

- Requer `Authorization: Bearer <token>`.
- `LeadMessageRequest`: `message`, `channel?`, `createdByUserId?`.
- `LeadMessageResponse`: `id`, `leadId`, `message`, `channel?`, `createdByUserId?`, `createdAt`.

## 3. Campos e dados da tela

**Seção Lead:**

| Campo | Tipo | Origem |
|-------|------|--------|
| Status | String | `LeadResponse.status` |
| Funil | Long | `LeadResponse.flowId` |
| Cliente | Long (nullable) | `LeadResponse.customerId` |
| Fonte | String | `LeadResponse.source` |
| Valor estimado | Long (cents) | `LeadResponse.estimatedValueCents` |
| Notas | String | `LeadResponse.notes` |
| Criado em | OffsetDateTime | `LeadResponse.createdAt` |

**Seção Mensagens:**

| Campo | Tipo | Origem |
|-------|------|--------|
| Mensagem | String | `LeadMessageResponse.message` |
| Canal | String (nullable) | `LeadMessageResponse.channel` |
| Criado por | Long (nullable) | `LeadMessageResponse.createdByUserId` |
| Data | OffsetDateTime | `LeadMessageResponse.createdAt` |

**Formulário nova mensagem:**

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Mensagem | textarea | Sim | Não vazio |
| Canal | input text / select | Não | Texto livre |

## 4. Ações do usuário

- **Visualizar dados do lead**: seção superior em modo leitura.
- **Editar lead**: botão "Editar" → `/leads/:id/edit`.
- **Excluir lead**: confirmação → `DELETE`.
- **Carregar histórico de mensagens**: lista em ordem cronológica.
- **Enviar mensagem**: preencher textarea + "Enviar" → `POST /api/v1/leads/{leadId}/messages` → mensagem aparece na lista.
- **Atualizar mensagens**: botão de refresh ou polling (pendente de definição).

## 5. Regras de negócio

- `LeadMessage` não possui endpoint de exclusão ou edição — o histórico é imutável.
- `createdByUserId` deve ser preenchido com o ID do usuário logado ao enviar mensagem.
- `channel` representa o canal de comunicação (ex.: WhatsApp, email, telefone).

## 6. Estados da interface

- **Carregando lead**: skeleton.
- **Carregando mensagens**: spinner na lista.
- **Lista vazia de mensagens**: "Nenhuma mensagem registrada."
- **Enviando mensagem**: botão com spinner, textarea desabilitada.
- **Sucesso envio**: mensagem aparece no final da lista, textarea limpa.
- **Erro envio**: toast de erro.
- **Não encontrado (404)**: mensagem de erro com botão voltar.

## 7. Navegação e fluxo

- Origem: listagem de leads.
- "Editar" → `/leads/:id/edit`.
- Após exclusão → `/leads`.
- Link para cliente → `/customers/:customerId`.

## 8. Critérios de aceite

- [ ] `GET /api/v1/leads/{id}` e `GET /api/v1/leads/{id}/messages` chamados ao entrar.
- [ ] Lista de mensagens em ordem cronológica ascendente.
- [ ] Envio de mensagem vazia bloqueado.
- [ ] Após envio bem-sucedido, lista atualizada sem recarregar a página.
- [ ] `createdByUserId` preenchido automaticamente com o ID do usuário autenticado.

## 9. Observações técnicas para front

- Área de mensagens similar a um chat: mensagens mais recentes no final, scroll automático ao receber nova mensagem.
- `estimatedValueCents` formatado como moeda BRL.
- `channel` pode ser um select com opções pré-definidas (WhatsApp, Email, Telefone, Outros) ou texto livre — Pendente de definição.
- Não há WebSocket nesta versão; polling opcional a cada 30s para atualizar mensagens.
- `createdByUserId`: injetar automaticamente do contexto de autenticação (JWT payload contém `userId`).
