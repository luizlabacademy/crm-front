# Usuários — Listagem

## 1. Objetivo
- Exibir todos os usuários do sistema CRM com paginação e filtro por tenant.
- Perfil: administradores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/users` | Lista usuários paginados |
| `DELETE` | `/api/v1/users/{id}` | Remove usuário |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20), `tenantId` (opcional). Ordenação: `id` ASC.
- Response `200`: `PageResponse<UserResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID | Long | `UserResponse.id` |
| E-mail | String | `UserResponse.email` |
| Tenant ID | Long | `UserResponse.tenantId` |
| Person ID | Long (nullable) | `UserResponse.personId` |
| Ativo | Boolean | `UserResponse.active` |
| Criado em | OffsetDateTime | `UserResponse.createdAt` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Filtrar por tenant**: select ou input de `tenantId`.
- **Paginar**: próxima/anterior, seletor de tamanho.
- **Novo**: botão "Novo" → `/users/new`.
- **Editar**: clique na linha → `/users/:id/edit`.
- **Excluir**: botão com confirmação → `DELETE` → recarrega lista.

## 5. Regras de negócio

- O usuário `admin@saas.com` (criado pelo `AdminSeeder`) não deve ser excluído pela interface — desabilitar botão ou exibir alert.
- `passwordHash` nunca é retornado no response — não exibir na tabela.
- `active = false` desativa sem excluir.
- `email` é único no sistema.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhum usuário encontrado." com botão "Criar usuário".
- **Sucesso**: tabela paginada.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Usuários" (admin).
- "Novo" → `/users/new`.
- Editar → `/users/:id/edit`.
- Link para `/persons/:personId` quando `personId` preenchido.
- Após exclusão: permanece na listagem.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/users?page=0&size=20`.
- [ ] Filtro por `tenantId` funciona.
- [ ] Coluna `passwordHash` nunca exibida.
- [ ] Usuário admin não pode ser excluído.
- [ ] Exclusão com confirmação.

## 9. Observações técnicas para front

- Badge ativo/inativo.
- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Resolver `personId` para nome da pessoa se disponível.
- Paginação server-side.
