# Pessoas (Person) — Cadastro e Edição

## 1. Objetivo
- Criar ou editar uma pessoa (física ou jurídica) com seus contatos.
- Perfil: administradores e gestores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/persons` | Cria pessoa (201) |
| `PUT` | `/api/v1/persons/{id}` | Atualiza pessoa (200) |
| `GET` | `/api/v1/persons/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/tenants` | Lista tenants para seleção |

- Requer `Authorization: Bearer <token>`.
- Request body (`PersonRequest`): `tenantId`, `active`, `physical?`, `legal?`, `contacts[]`.
- Response `201`/`200`: `PersonResponse` completo.

## 3. Campos e dados da tela

### Dados gerais

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Tenant | select (Long) | Sim | Deve existir |
| Tipo | radio (Física / Jurídica) | Sim | Controla exibição dos campos abaixo |
| Ativo | toggle | Não | Default: true |

### Pessoa física (`physical`)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Nome completo | input text | Sim | Não vazio |
| CPF | input text | Sim | 11 dígitos, algoritmo de CPF válido |
| Data de nascimento | input date | Não | Data válida, no passado |

### Pessoa jurídica (`legal`)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Razão social | input text | Sim | Não vazio |
| Nome fantasia | input text | Não | — |
| CNPJ | input text | Sim | 14 dígitos, algoritmo de CNPJ válido |

### Contatos (lista dinâmica)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| Tipo | select (String) | Sim por item | Ex.: EMAIL, PHONE, WHATSAPP |
| Valor | input text | Sim por item | Não vazio |
| Principal | toggle | Não | Default: false |
| Ativo (contato) | toggle | Não | Default: true |

## 4. Ações do usuário

- **Selecionar tipo** (física/jurídica): exibe campos correspondentes, oculta os do tipo oposto.
- **Adicionar contato**: botão "+" adiciona linha.
- **Remover contato**: ícone "x" na linha.
- **Salvar**: `POST` (novo) ou `PUT` (edição) → toast + redirect.
- **Cancelar**: volta para `/persons` sem salvar.
- **Modo edição**: carrega dados via `GET /api/v1/persons/{id}`.

## 5. Regras de negócio

- Uma pessoa pode ter `physical` OU `legal` preenchido (não ambos simultaneamente).
- A lista `contacts` pode ser vazia.
- Somente um contato pode ser `primary = true` por tipo — validação client-side.
- `PUT` substitui todos os dados, incluindo a lista de contatos.
- Ao mudar o tipo (física → jurídica), limpar os campos do tipo anterior.

## 6. Estados da interface

- **Carregando (edição)**: skeleton no formulário.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Pessoa salva com sucesso." + redirect.
- **Erro de validação (400)**: mensagens inline nos campos.
- **Não encontrado (404)**: mensagem "Pessoa não encontrada." com botão de voltar.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/persons/new`.
- Origem (edição): botão editar na listagem → `/persons/:id/edit`.
- Após salvar: `/persons/:id` ou `/persons`.
- Cancelar: `/persons`.

## 8. Critérios de aceite

- [ ] Given: seleção de tipo Física → campos de PF visíveis, PJ ocultos.
- [ ] Given: seleção de tipo Jurídica → campos de PJ visíveis, PF ocultos.
- [ ] Given: CPF com formato inválido → erro inline.
- [ ] Given: CNPJ com formato inválido → erro inline.
- [ ] Given: formulário válido (novo) → `POST /api/v1/persons` com body correto.
- [ ] Given: edição → `GET` carrega e preenche; `PUT` envia dados completos incluindo contatos.
- [ ] Given: lista de contatos → permite adicionar e remover dinamicamente.

## 9. Observações técnicas para front

- Validação de CPF: algoritmo de dígitos verificadores.
- Validação de CNPJ: algoritmo de dígitos verificadores.
- Máscara CPF: `XXX.XXX.XXX-XX`. Máscara CNPJ: `XX.XXX.XXX/XXXX-XX`.
- Enviar sem máscara (somente dígitos).
- Tipos de contato sugeridos: `EMAIL`, `PHONE`, `WHATSAPP`, `OTHER` — valores pendentes de definição no backend.
- Seletor de `tenantId`: pré-preencher com tenant do usuário logado.
- Schema Zod com discriminated union para tipo físico/jurídico.
