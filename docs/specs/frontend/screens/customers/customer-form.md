# Clientes — Cadastro e Edição

## 1. Objetivo
- Criar um novo cliente ou editar os dados de um cliente existente.
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/customers` | Cria novo cliente (201 Created) |
| `PUT` | `/api/v1/customers/{id}` | Atualiza cliente existente (200 OK) |
| `GET` | `/api/v1/customers/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/persons` | Busca pessoas para vincular (personId) |
| `GET` | `/api/v1/tenants` | Lista tenants para o seletor de tenantId |

- Requer `Authorization: Bearer <token>`.
- Request body (`CustomerRequest`): `tenantId`, `personId?`, `fullName`, `email?`, `phone?`, `document?`, `isActive`.
- Response `201`/`200`: `CustomerResponse` completo.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Origem | Validações |
|-------|------|-------------|--------|-----------|
| Tenant | select (Long) | Sim | `CustomerRequest.tenantId` | Deve existir na lista de tenants |
| Person | select/autocomplete (Long) | Não | `CustomerRequest.personId` | ID válido de Person, se informado |
| Nome completo | input text | Sim | `CustomerRequest.fullName` | Não vazio; máx. Pendente de definição |
| E-mail | input email | Não | `CustomerRequest.email` | Formato e-mail válido |
| Telefone | input text | Não | `CustomerRequest.phone` | Máscara de telefone |
| Documento | input text | Não | `CustomerRequest.document` | CPF (11 dígitos) ou CNPJ (14 dígitos) |
| Ativo | toggle/checkbox | Não | `CustomerRequest.isActive` | Default: true |

## 4. Ações do usuário

- **Preencher formulário** → validação em tempo real.
- **Salvar**: botão "Salvar" → dispara `POST` (novo) ou `PUT` (edição).
  - Sucesso: redireciona para `/customers/:id` ou lista.
  - Erro: exibe mensagem de erro no campo ou toast global.
- **Cancelar**: botão "Cancelar" → volta para a listagem sem salvar.
- **Modo edição**: ao entrar em `/customers/:id/edit`, carrega dados via `GET /api/v1/customers/{id}` e preenche o formulário.

## 5. Regras de negócio

- `tenantId` é obrigatório; sem ele o registro não pode ser criado.
- `personId` é opcional; se informado, vincula o cliente a uma `Person` existente (física ou jurídica).
- `document` pode representar CPF ou CNPJ — não há distinção explícita no campo, mas o front deve validar o formato conforme o número de dígitos.
- Na edição, o `PUT` substitui todos os campos (não é PATCH); campos opcionais não informados serão nulos.
- `isActive = false` não exclui o registro — apenas o inativa.

## 6. Estados da interface

- **Carregando dados (edição)**: skeleton no formulário enquanto `GET` está em andamento.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Cliente salvo com sucesso." + redirecionamento.
- **Erro de validação (400)**: exibir mensagens nos campos correspondentes.
- **Não encontrado (404)** (edição): mensagem "Cliente não encontrado." com botão de voltar.
- **Não autenticado (401)**: redireciona para `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/customers/new`.
- Origem (edição): botão editar na listagem ou detalhe → `/customers/:id/edit`.
- Após salvar: `/customers/:id` (detalhe) ou `/customers` (listagem).
- Cancelar: `/customers`.

## 8. Critérios de aceite

- [ ] Given: `fullName` vazio → botão "Salvar" desabilitado.
- [ ] Given: e-mail com formato inválido → mensagem de erro inline.
- [ ] Given: formulário válido (novo) → `POST /api/v1/customers` chamado com body correto.
- [ ] Given: edição → `GET /api/v1/customers/{id}` carrega e preenche o formulário.
- [ ] Given: edição com sucesso → `PUT /api/v1/customers/{id}` atualiza e redireciona.
- [ ] Given: `personId` selecionado → valor enviado no body; se não selecionado, enviado como `null`.

## 9. Observações técnicas para front

- Seletor de `tenantId`: carregar com `GET /api/v1/tenants` (paginação, exibir nome).
- Seletor de `personId`: autocomplete com busca por nome, carregado via `GET /api/v1/persons`.
- Aplicar máscara de telefone `(XX) XXXXX-XXXX`.
- Aplicar máscara de CPF `XXX.XXX.XXX-XX` ou CNPJ `XX.XXX.XXX/XXXX-XX` conforme tamanho digitado.
- Remover formatação antes de enviar ao backend (enviar somente dígitos).
- No modo de criação, pré-preencher `tenantId` com o tenant do usuário logado se disponível no contexto.
