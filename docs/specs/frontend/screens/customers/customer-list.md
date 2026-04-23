# Clientes — Listagem

## 1. Objetivo
- Exibir todos os clientes cadastrados no CRM, com suporte a paginação e filtro por tenant.
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/customers` | Lista clientes paginados |
| `DELETE` | `/api/v1/customers/{id}` | Remove um cliente |

- Requer `Authorization: Bearer <token>`.
- Parâmetros de query: `page` (default 0), `size` (default 20), `tenantId` (opcional).
- Ordenação fixa por `fullName` ASC.
- Response `200`: `PageResponse<CustomerResponse>` com campos: `content[]`, `page`, `size`, `totalElements`, `totalPages`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID | Long | `CustomerResponse.id` |
| Nome completo | String | `CustomerResponse.fullName` |
| E-mail | String (nullable) | `CustomerResponse.email` |
| Telefone | String (nullable) | `CustomerResponse.phone` |
| Documento | String (nullable) | `CustomerResponse.document` |
| Ativo | Boolean | `CustomerResponse.isActive` |
| Tenant ID | Long | `CustomerResponse.tenantId` |
| Criado em | OffsetDateTime | `CustomerResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega automaticamente ao entrar na tela, page=0, size=20.
- **Filtrar por tenant**: dropdown ou input de `tenantId` que dispara nova requisição.
- **Paginar**: controles de próxima/anterior página e seletor de tamanho (20/50/100).
- **Novo cliente**: botão "Novo" → navega para `/customers/new`.
- **Editar**: clique na linha ou botão de edição → navega para `/customers/:id/edit`.
- **Excluir**: botão de exclusão com confirmação modal → `DELETE /api/v1/customers/{id}` → recarrega a lista.
- **Ver detalhe**: clique no nome ou ícone de visualização → navega para `/customers/:id`.

## 5. Regras de negócio

- Clientes são sempre vinculados a um `tenantId`; o filtro por tenant é relevante para operadores que gerenciam múltiplos tenants.
- Um cliente pode ou não estar vinculado a uma `Person` (`personId` nullable).
- O campo `isActive` permite inativar sem excluir; a exclusão via `DELETE` é definitiva.
- Ordenação por `fullName` não é configurável pelo usuário nesta versão.

## 6. Estados da interface

- **Carregando**: skeleton ou spinner na tabela.
- **Vazio**: mensagem "Nenhum cliente encontrado." com botão "Cadastrar primeiro cliente".
- **Sucesso**: tabela populada com paginação.
- **Erro de rede / 5xx**: toast de erro com opção de retentar.
- **Não autenticado (401)**: redireciona para `/login`.
- **Sem permissão (403)**: mensagem "Você não tem permissão para acessar este recurso."

## 7. Navegação e fluxo

- Origem: menu lateral "Clientes" ou `/dashboard`.
- Botão "Novo" → `/customers/new`.
- Clique na linha / ícone editar → `/customers/:id/edit`.
- Ícone visualizar → `/customers/:id`.
- Após exclusão: permanece na listagem, lista recarregada.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/customers?page=0&size=20`.
- [ ] Ao informar `tenantId`, dispara `GET /api/v1/customers?tenantId=X&page=0&size=20`.
- [ ] Paginação avança e retrocede corretamente.
- [ ] Ao confirmar exclusão, dispara `DELETE` e a linha some da lista.
- [ ] Ao cancelar exclusão, nada acontece.
- [ ] Token ausente → redireciona para `/login`.

## 9. Observações técnicas para front

- Debounce de 300ms para o filtro de `tenantId` se for um input de texto.
- Exibir `isActive` como badge colorido (verde/cinza).
- Formatar `createdAt` para `dd/MM/yyyy HH:mm` no fuso do usuário.
- `document` pode ser CPF ou CNPJ; aplicar máscara conforme tamanho (11 dígitos → CPF, 14 → CNPJ).
- Paginação server-side — não carregar todos os registros de uma vez.
- Cache: invalidar após criação/edição/exclusão.
