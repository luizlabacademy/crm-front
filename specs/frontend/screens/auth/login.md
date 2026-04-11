# Tela de Login

## 1. Objetivo
- Autenticar o usuário na plataforma CRM e obter o token JWT necessário para acessar todos os demais endpoints.
- Perfil: qualquer usuário cadastrado no sistema (admin, atendente, gestor).

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/auth/token` | Autentica e retorna o JWT |

- Único endpoint público (não requer `Authorization: Bearer`).
- Request body: `{ "email": "string", "password": "string" }`
- Response `200`: `{ "token": "eyJ..." }`
- Response `401`: sem body — credenciais inválidas.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Origem | Validações |
|-------|------|-------------|--------|-----------|
| E-mail | string / input text | Sim | request `email` | Formato e-mail válido; não vazio |
| Senha | string / input password | Sim | request `password` | Não vazio; mínimo 1 caractere |

## 4. Ações do usuário

- **Preencher e-mail e senha** → habilita o botão "Entrar".
- **Clicar em "Entrar"** → dispara `POST /api/v1/auth/token`.
  - Sucesso (200): armazena o token (localStorage ou cookie httpOnly), redireciona para a tela inicial do CRM (`/dashboard`).
  - Falha (401): exibe mensagem "E-mail ou senha inválidos".
- **Toggle de visibilidade da senha** → alterna entre `type=password` e `type=text`.

## 5. Regras de negócio

- O backend normaliza prefixos `$2b$` → `$2a$` do BCrypt automaticamente; o front não precisa tratar isso.
- A senha não é retornada em nenhum endpoint — nunca exibir `passwordHash` na interface.
- Após login bem-sucedido, o token deve ser enviado em `Authorization: Bearer <token>` em todas as demais requisições.
- Sem endpoint de refresh token ou logout no backend atual — o token expira conforme configuração do `JwtService` (pendente de definição do TTL).

## 6. Estados da interface

- **Padrão**: formulário vazio, botão "Entrar" desabilitado enquanto campos obrigatórios estiverem vazios.
- **Carregando**: botão com spinner, campos desabilitados durante a requisição.
- **Sucesso**: redireciona para `/dashboard` sem exibir mensagem.
- **Erro 401**: banner/toast de erro "E-mail ou senha inválidos. Verifique suas credenciais."
- **Erro de rede / 5xx**: mensagem "Não foi possível conectar ao servidor. Tente novamente."

## 7. Navegação e fluxo

- Origem: rota raiz `/` ou redirecionamento automático quando o token estiver ausente/expirado.
- Após sucesso: `/dashboard`.
- Não há link de "Esqueci minha senha" (endpoint não existe no backend).

## 8. Critérios de aceite

- [ ] Given: formulário vazio → botão "Entrar" está desabilitado.
- [ ] Given: e-mail inválido (sem `@`) → mensagem de validação inline antes de enviar.
- [ ] Given: credenciais corretas → token armazenado e redirect para `/dashboard`.
- [ ] Given: credenciais erradas → mensagem de erro exibida, campos não são limpos.
- [ ] Given: requisição em andamento → botão desabilitado e spinner visível.

## 9. Observações técnicas para front

- Armazenar o token em `localStorage` ou cookie `httpOnly` (preferir cookie para segurança contra XSS).
- Implementar interceptor HTTP global para injetar o header `Authorization: Bearer` em toda requisição autenticada.
- Implementar interceptor de resposta para detectar `401` e redirecionar para `/login` com limpeza do token armazenado.
- Não há paginação nesta tela.
- Campo de senha deve ter `autocomplete="current-password"` para compatibilidade com gerenciadores de senha.
