# Endereços — Listagem

## 1. Objetivo
- Exibir todos os endereços cadastrados na plataforma com paginação.
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/addresses` | Lista endereços paginados |
| `DELETE` | `/api/v1/addresses/{id}` | Remove endereço |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20). Ordenação: `id` ASC.
- **Sem filtro por `tenantId`** — endpoint não aceita esse parâmetro.
- Response `200`: `PageResponse<AddressResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID | Long | `AddressResponse.id` |
| Logradouro | String | `AddressResponse.street` |
| Número | String (nullable) | `AddressResponse.number` |
| Bairro | String | `AddressResponse.neighborhood` |
| Cidade ID | Long | `AddressResponse.cityId` |
| CEP | String | `AddressResponse.postalCode` |
| Ativo | Boolean | `AddressResponse.active` |
| Criado em | OffsetDateTime | `AddressResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Paginar**: próxima/anterior, seletor de tamanho.
- **Novo**: botão "Novo" → `/addresses/new`.
- **Editar**: clique na linha → `/addresses/:id/edit`.
- **Excluir**: botão com confirmação → `DELETE` → recarrega lista.

## 5. Regras de negócio

- `Address` não tem `tenantId` — é uma entidade independente referenciada por outras.
- A listagem global pode expor endereços de outros tenants (lacuna da API).
- `active = false` desativa sem excluir.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhum endereço cadastrado." com botão "Cadastrar endereço".
- **Sucesso**: tabela paginada.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Endereços" ou via formulário de Customer/Worker.
- "Novo" → `/addresses/new`.
- Editar → `/addresses/:id/edit`.
- Após exclusão: permanece na listagem.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/addresses?page=0&size=20`.
- [ ] Paginação funciona corretamente.
- [ ] CEP exibido com máscara `XXXXX-XXX`.
- [ ] Exclusão com confirmação.

## 9. Observações técnicas para front

- Resolver `cityId` para nome da cidade se disponível (chamada auxiliar ou cache).
- CEP com máscara `XXXXX-XXX` na exibição.
- Badge ativo/inativo.
- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Paginação server-side.
