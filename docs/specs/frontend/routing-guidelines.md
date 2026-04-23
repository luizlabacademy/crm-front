# Routing Guidelines

## 1. Objetivo

Mapa completo de rotas do front-end do CRM, padrões de URL e regras de navegação.

Documentos relacionados:
- `architecture.md` — estrutura de diretórios
- `frontend-guidelines.md` — convenções gerais

---

## 2. Convenções de rotas

- URLs em **kebab-case** (ex.: `/pipeline-flows`, `/item-categories`).
- Padrão CRUD: `/<resource>` (lista), `/<resource>/new` (criar), `/<resource>/:id` (detalhe), `/<resource>/:id/edit` (editar).
- Parâmetros dinâmicos: `:id` (sempre `int64`).
- Query params para filtros: `?tenantId=X&page=0&size=20`.
- Todas as rotas (exceto `/login`) exigem autenticação — guard de rota redireciona para `/login` se não houver token válido.

---

## 3. Mapa completo de rotas

### Públicas (sem autenticação)

| Rota | Spec | Descrição |
|------|------|-----------|
| `/login` | [screens/auth/login.md](./screens/auth/login.md) | Tela de login |

### Dashboard

| Rota | Spec | Descrição |
|------|------|-----------|
| `/dashboard` | [screens/dashboard/dashboard.md](./screens/dashboard/dashboard.md) | Tela inicial pós-login |

### Clientes

| Rota | Spec | Descrição |
|------|------|-----------|
| `/customers` | [screens/customers/customer-list.md](./screens/customers/customer-list.md) | Listagem |
| `/customers/new` | [screens/customers/customer-form.md](./screens/customers/customer-form.md) | Cadastro |
| `/customers/:id` | [screens/customers/customer-details.md](./screens/customers/customer-details.md) | Detalhe |
| `/customers/:id/edit` | [screens/customers/customer-form.md](./screens/customers/customer-form.md) | Edição |

### Leads

| Rota | Spec | Descrição |
|------|------|-----------|
| `/leads` | [screens/leads/lead-list.md](./screens/leads/lead-list.md) | Listagem |
| `/leads/new` | [screens/leads/lead-form.md](./screens/leads/lead-form.md) | Cadastro |
| `/leads/:id` | [screens/leads/lead-details.md](./screens/leads/lead-details.md) | Detalhe + Mensagens |
| `/leads/:id/edit` | [screens/leads/lead-form.md](./screens/leads/lead-form.md) | Edição |

### Pedidos

| Rota | Spec | Descrição |
|------|------|-----------|
| `/orders` | [screens/orders/order-list.md](./screens/orders/order-list.md) | Listagem |
| `/orders/new` | [screens/orders/order-form.md](./screens/orders/order-form.md) | Cadastro |
| `/orders/:id` | [screens/orders/order-details.md](./screens/orders/order-details.md) | Detalhe |
| `/orders/:id/edit` | [screens/orders/order-form.md](./screens/orders/order-form.md) | Edição |

### Agendamentos

| Rota | Spec | Descrição |
|------|------|-----------|
| `/appointments` | [screens/appointments/appointment-list.md](./screens/appointments/appointment-list.md) | Listagem |
| `/appointments/new` | [screens/appointments/appointment-form.md](./screens/appointments/appointment-form.md) | Cadastro |
| `/appointments/:id` | [screens/appointments/appointment-list.md](./screens/appointments/appointment-list.md) | Detalhe (via listagem) |
| `/appointments/:id/edit` | [screens/appointments/appointment-form.md](./screens/appointments/appointment-form.md) | Edição |

### Schedules

| Rota | Spec | Descrição |
|------|------|-----------|
| `/schedules` | [screens/schedule/schedule-list.md](./screens/schedule/schedule-list.md) | Listagem |
| `/schedules/new` | [screens/schedule/schedule-form.md](./screens/schedule/schedule-form.md) | Cadastro |
| `/schedules/:id/edit` | [screens/schedule/schedule-form.md](./screens/schedule/schedule-form.md) | Edição |

### Pessoas

| Rota | Spec | Descrição |
|------|------|-----------|
| `/persons` | [screens/people/person-list.md](./screens/people/person-list.md) | Listagem |
| `/persons/new` | [screens/people/person-form.md](./screens/people/person-form.md) | Cadastro |
| `/persons/:id/edit` | [screens/people/person-form.md](./screens/people/person-form.md) | Edição |

### Endereços

| Rota | Spec | Descrição |
|------|------|-----------|
| `/addresses` | [screens/people/address-list.md](./screens/people/address-list.md) | Listagem |
| `/addresses/new` | [screens/people/address-form.md](./screens/people/address-form.md) | Cadastro |
| `/addresses/:id/edit` | [screens/people/address-form.md](./screens/people/address-form.md) | Edição |

### Catálogo — Itens

| Rota | Spec | Descrição |
|------|------|-----------|
| `/catalog/items` | [screens/catalog/item-list.md](./screens/catalog/item-list.md) | Listagem |
| `/catalog/items/new` | [screens/catalog/item-form.md](./screens/catalog/item-form.md) | Cadastro |
| `/catalog/items/:id/edit` | [screens/catalog/item-form.md](./screens/catalog/item-form.md) | Edição |

### Catálogo — Categorias

| Rota | Spec | Descrição |
|------|------|-----------|
| `/catalog/categories` | [screens/catalog/item-category-list.md](./screens/catalog/item-category-list.md) | Listagem |
| `/catalog/categories/new` | [screens/catalog/item-category-form.md](./screens/catalog/item-category-form.md) | Cadastro |
| `/catalog/categories/:id/edit` | [screens/catalog/item-category-form.md](./screens/catalog/item-category-form.md) | Edição |

### Pipeline

| Rota | Spec | Descrição |
|------|------|-----------|
| `/pipeline-flows` | [screens/pipeline/pipeline-flow-list.md](./screens/pipeline/pipeline-flow-list.md) | Listagem |
| `/pipeline-flows/new` | [screens/pipeline/pipeline-flow-form.md](./screens/pipeline/pipeline-flow-form.md) | Cadastro |
| `/pipeline-flows/:id/edit` | [screens/pipeline/pipeline-flow-form.md](./screens/pipeline/pipeline-flow-form.md) | Edição |

### Administração — Usuários

| Rota | Spec | Descrição |
|------|------|-----------|
| `/users` | [screens/admin/user-list.md](./screens/admin/user-list.md) | Listagem |
| `/users/new` | [screens/admin/user-form.md](./screens/admin/user-form.md) | Cadastro |
| `/users/:id/edit` | [screens/admin/user-form.md](./screens/admin/user-form.md) | Edição |

### Administração — Tenants

| Rota | Spec | Descrição |
|------|------|-----------|
| `/tenants` | [screens/admin/tenant-list.md](./screens/admin/tenant-list.md) | Listagem |
| `/tenants/new` | [screens/admin/tenant-form.md](./screens/admin/tenant-form.md) | Cadastro |
| `/tenants/:id/edit` | [screens/admin/tenant-form.md](./screens/admin/tenant-form.md) | Edição |

### Administração — Workers

| Rota | Spec | Descrição |
|------|------|-----------|
| `/workers` | [screens/admin/worker-list.md](./screens/admin/worker-list.md) | Listagem |
| `/workers/new` | [screens/admin/worker-form.md](./screens/admin/worker-form.md) | Cadastro |
| `/workers/:id/edit` | [screens/admin/worker-form.md](./screens/admin/worker-form.md) | Edição |

### Administração — Roles e Permissions

| Rota | Spec | Descrição |
|------|------|-----------|
| `/admin/roles` | [screens/admin/role-list.md](./screens/admin/role-list.md) | Listagem de perfis |
| `/admin/roles/new` | [screens/admin/role-form.md](./screens/admin/role-form.md) | Cadastro de perfil |
| `/admin/roles/:id/edit` | [screens/admin/role-form.md](./screens/admin/role-form.md) | Edição de perfil |
| `/admin/permissions` | [screens/admin/permission-list.md](./screens/admin/permission-list.md) | Listagem de permissões |

---

## 4. Redirecionamentos

| De | Para | Condição |
|----|------|----------|
| `/` | `/dashboard` | Usuário autenticado |
| `/` | `/login` | Sem token válido |
| `/login` | `/dashboard` | Login com sucesso |
| Qualquer rota protegida | `/login` | Token ausente ou expirado (401) |

---

## 5. Guards de rota

- **AuthGuard**: verifica presença de token JWT válido. Se ausente → redirect `/login`.
- **Rota `/login`**: se já autenticado → redirect `/dashboard`.
- Guards implementados em `src/app/guards/`.

---

## 6. Layout

- **PublicLayout**: usado em `/login` — sem sidebar, sem header.
- **AppLayout**: usado em todas as rotas autenticadas — sidebar com menu, header com tenant/usuário.
- O menu lateral segue a organização por seção descrita na seção 3.

---

## 7. Lazy loading

Todas as páginas são carregadas via `React.lazy` com `Suspense` no nível do router. Isso garante que o bundle inicial contenha apenas o layout e a tela de login.
