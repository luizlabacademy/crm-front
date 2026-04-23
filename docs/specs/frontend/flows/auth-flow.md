# Fluxo de Autenticação

> **ID do fluxo:** FE-FLOW-001
> **Telas envolvidas:** Login (`/login`), Dashboard (`/dashboard`), todas as telas protegidas

---

## 1. Visão geral

O CRM utiliza autenticação **JWT stateless**. Não há refresh token nem endpoint de logout — o token expira naturalmente e o frontend deve gerenciar o ciclo de vida localmente.

```
┌─────────┐     POST /auth/token      ┌─────────┐
│  Login   │ ───────────────────────── │ Backend │
│  Screen  │ ◄── { token: "eyJ..." }  │  (JWT)  │
└────┬─────┘                           └─────────┘
     │
     ▼
┌──────────────────────┐
│ Armazena token        │
│ (memória + storage)   │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐     Authorization: Bearer <token>
│ Navegação protegida   │ ──────────────────────────────────► API
│ (Dashboard, etc.)     │ ◄── 200 OK / 401 Unauthorized
└────┬─────────────────┘
     │ 401?
     ▼
┌──────────────────────┐
│ Limpa token           │
│ Redireciona → /login  │
└──────────────────────┘
```

---

## 2. Endpoint de autenticação

| Método | Rota | Body | Resposta |
|--------|------|------|----------|
| `POST` | `/api/v1/auth/token` | `{ "email": string, "password": string }` | `{ "token": string }` |

- **Não requer** header `Authorization`.
- Password enviada em **plain text** — o backend faz hash e compara com BCrypt.
- Resposta de sucesso: `200 OK` com JWT no campo `token`.
- Resposta de erro: `401 Unauthorized` (credenciais inválidas) ou `400 Bad Request` (campos faltando).

---

## 3. Etapas do fluxo

### 3.1. Acesso inicial (sem token)

1. Usuário acessa qualquer rota protegida (ex.: `/dashboard`).
2. Auth guard verifica presença de token válido no estado da aplicação.
3. **Sem token** → redireciona para `/login` com `?redirect=/dashboard` no query param.

### 3.2. Login

1. Usuário preenche email e senha no formulário.
2. Frontend valida campos obrigatórios e formato de email (client-side).
3. `POST /api/v1/auth/token` com `{ email, password }`.
4. **Sucesso (200):**
   - Decodifica o JWT (sem validar assinatura — apenas para ler `exp`, `sub`, claims).
   - Armazena token no estado global (Zustand/Context) e opcionalmente em `localStorage`.
   - Configura interceptor Axios/fetch para injetar `Authorization: Bearer <token>` em todas as requisições.
   - Redireciona para a rota do `?redirect` param, ou `/dashboard` por padrão.
5. **Erro (401):**
   - Exibe mensagem "Email ou senha incorretos." abaixo do formulário.
   - Não limpa o campo de email; limpa o campo de senha.
6. **Erro (400/5xx):**
   - Toast genérico "Erro ao conectar com o servidor. Tente novamente."

### 3.3. Navegação autenticada

1. Todas as requisições incluem `Authorization: Bearer <token>` via interceptor.
2. Se qualquer requisição retornar **401 Unauthorized**:
   - Limpa o token do estado e do storage.
   - Redireciona para `/login?redirect=<rota-atual>&expired=true`.
   - Exibe toast "Sua sessão expirou. Faça login novamente."
3. Se retornar **403 Forbidden** (sem permissão):
   - Exibe toast "Você não tem permissão para acessar este recurso."
   - **Não** faz logout — o token ainda é válido.

### 3.4. Expiração do token

1. O frontend deve ler o campo `exp` do JWT ao armazená-lo.
2. Configurar timer (ex.: `setTimeout`) para `(exp * 1000) - Date.now() - 60_000` (1 min antes de expirar).
3. Quando o timer dispara:
   - Exibe banner/toast "Sua sessão expira em breve. Salve seu trabalho."
   - **Não há refresh token** — o usuário deve fazer login novamente.
4. Quando o token efetivamente expira:
   - Limpa estado e redireciona para `/login?expired=true`.

### 3.5. Logout voluntário

1. Botão "Sair" no menu do usuário (header/sidebar).
2. Limpa token do estado global e do `localStorage`.
3. Redireciona para `/login`.
4. **Não há endpoint de logout no backend** — a invalidação é apenas local.

---

## 4. Auth guard — proteção de rotas

```
Regras de guarda:
- /login                → acessível SEM token; se já autenticado, redireciona para /dashboard
- /api/v1/auth/**       → não é rota do front (ignorar)
- /* (todas as demais)  → requerem token válido; sem token → /login
```

### Implementação sugerida (React Router)

```tsx
function AuthGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <>{children}</>;
}
```

---

## 5. Armazenamento do token

| Estratégia | Prós | Contras |
|------------|------|---------|
| **Memória (state)** | Mais seguro contra XSS | Perde ao recarregar página |
| **localStorage** | Persiste entre reloads | Vulnerável a XSS |
| **Memória + localStorage** (recomendado) | Persiste + estado reativo | Precisa sincronizar |

**Recomendação:** armazenar em memória (Zustand) como fonte primária; usar `localStorage` apenas para restaurar sessão ao recarregar a página. Ao restaurar, validar se o token ainda não expirou (`exp`).

---

## 6. Interceptor HTTP

```tsx
// Exemplo com Axios
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = `/login?redirect=${window.location.pathname}&expired=true`;
    }
    return Promise.reject(error);
  }
);
```

---

## 7. Diagrama de estados

```
                    ┌──────────────┐
                    │ NÃO AUTENTICADO │
                    └──────┬───────┘
                           │ login success
                           ▼
                    ┌──────────────┐
              ┌────►│  AUTENTICADO  │◄────┐
              │     └──────┬───────┘      │
              │            │              │
              │    401 / exp / logout     │
              │            │              │
              │            ▼              │
              │     ┌────────────┐        │
              │     │  EXPIRADO   │       │
              │     └──────┬─────┘        │
              │            │ re-login     │
              └────────────┘──────────────┘
```

---

## 8. Lacunas conhecidas

| # | Lacuna | Impacto | Mitigação |
|---|--------|---------|-----------|
| 1 | **Sem refresh token** | Usuário perde sessão ao expirar | Timer de aviso + redirect automático |
| 2 | **TTL do JWT desconhecido** | Não é possível calcular timeout exato | Ler campo `exp` do JWT decodificado |
| 3 | **Sem endpoint de logout** | Token continua válido no backend até expirar | Limpeza local é suficiente para UX |
| 4 | **Sem endpoint de "esqueci senha"** | Usuário sem acesso não pode recuperar conta | Deve ser tratado fora do sistema (admin reset) |

---

## 9. Critérios de aceite do fluxo

- [ ] **Given** usuário não autenticado, **When** acessa `/dashboard`, **Then** é redirecionado para `/login?redirect=/dashboard`.
- [ ] **Given** usuário na tela de login, **When** submete credenciais válidas, **Then** recebe token, armazena e redireciona para `/dashboard`.
- [ ] **Given** usuário na tela de login, **When** submete credenciais inválidas, **Then** vê mensagem "Email ou senha incorretos." e campo de senha é limpo.
- [ ] **Given** usuário autenticado, **When** qualquer requisição retorna 401, **Then** token é limpo e redireciona para `/login?expired=true`.
- [ ] **Given** usuário autenticado, **When** clica em "Sair", **Then** token é removido e redireciona para `/login`.
- [ ] **Given** token armazenado em localStorage, **When** página é recarregada, **Then** sessão é restaurada se token não expirou.
- [ ] **Given** usuário já autenticado, **When** acessa `/login`, **Then** é redirecionado para `/dashboard`.

---

## Referências

- Spec de tela: [`screens/auth/login.md`](../screens/auth/login.md)
- Guidelines de API: [`api-integration-guidelines.md`](../api-integration-guidelines.md)
- Guidelines de roteamento: [`routing-guidelines.md`](../routing-guidelines.md)
