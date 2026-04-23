# Endereços — Cadastro e Edição

## 1. Objetivo
- Criar ou editar um endereço com seletores geográficos em cascata (País → Estado → Cidade).
- Perfil: gestores e atendentes autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/api/v1/addresses` | Cria endereço (201) |
| `PUT` | `/api/v1/addresses/{id}` | Atualiza endereço (200) |
| `GET` | `/api/v1/addresses/{id}` | Carrega dados para edição |
| `GET` | `/api/v1/countries` | Lista países |
| `GET` | `/api/v1/states/country/{countryId}` | Estados por país |
| `GET` | `/api/v1/cities/state/{stateId}` | Cidades por estado |

- Requer `Authorization: Bearer <token>`.
- Request body (`AddressRequest`): `street`, `number?`, `complement?`, `neighborhood`, `cityId`, `postalCode`, `latitude?`, `longitude?`, `active`.
- Response `201`/`200`: `AddressResponse` completo.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|-----------|
| País | select (Long) | Sim (para cascata) | Carregado de `/api/v1/countries` |
| Estado | select (Long) | Sim (para cascata) | Carregado por `countryId` |
| Cidade | select (Long) → `cityId` | Sim | Carregado por `stateId` |
| Logradouro | input text | Sim | Não vazio |
| Número | input text | Não | — |
| Complemento | input text | Não | — |
| Bairro | input text | Sim | Não vazio |
| CEP | input text | Sim | Formato `XXXXX-XXX` (8 dígitos) |
| Latitude | input decimal | Não | Entre -90 e 90 |
| Longitude | input decimal | Não | Entre -180 e 180 |
| Ativo | toggle | Não | Default: true |

## 4. Ações do usuário

- **Seleção em cascata**: País → habilita Estado → habilita Cidade.
- **Busca por CEP**: preencher automaticamente logradouro e bairro via API de CEP externa (ex.: ViaCEP) — pendente de definição.
- **Salvar**: `POST` (novo) ou `PUT` (edição) → toast + redirect.
- **Cancelar**: volta para `/addresses` sem salvar.
- **Modo edição**: carrega dados via `GET /api/v1/addresses/{id}` e resolve cascata inversa (cityId → stateId → countryId).

## 5. Regras de negócio

- `cityId` é o campo enviado ao backend; País e Estado são apenas para cascata na UI.
- `latitude` e `longitude` são opcionais; podem ser preenchidos por geolocalização do navegador — pendente de definição.
- `PUT` substitui todos os campos.
- Countries, States e Cities são read-only.

## 6. Estados da interface

- **Carregando países**: spinner no select de país.
- **Carregando estados**: spinner ao selecionar país.
- **Carregando cidades**: spinner ao selecionar estado.
- **Carregando dados (edição)**: skeleton no formulário.
- **Salvando**: botão com spinner, campos desabilitados.
- **Sucesso**: toast "Endereço salvo com sucesso." + redirect.
- **Erro de validação (400)**: mensagens inline.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem (novo): botão "Novo" na listagem → `/addresses/new`.
- Origem (edição): botão editar na listagem → `/addresses/:id/edit`.
- Esta tela pode ser acessada diretamente ou como componente embutido em formulários de Customer/Worker.
- Após salvar: `/addresses`.
- Cancelar: `/addresses`.

## 8. Critérios de aceite

- [ ] Given: país selecionado → select de estado habilitado e populado.
- [ ] Given: estado selecionado → select de cidade habilitado e populado.
- [ ] Given: troca de país → estado e cidade resetados.
- [ ] Given: troca de estado → cidade resetada.
- [ ] Given: `cityId` enviado corretamente ao backend.
- [ ] Given: CEP com formato inválido → erro inline.
- [ ] Given: edição → cascata carregada corretamente a partir do `cityId` existente.

## 9. Observações técnicas para front

- Seletores em cascata: resetar estado e cidade ao trocar país; resetar cidade ao trocar estado.
- CEP: máscara `XXXXX-XXX`; enviar sem máscara (somente dígitos).
- Opcionalmente buscar endereço via ViaCEP (`viacep.com.br/ws/{cep}/json/`) — pendente de definição.
- `latitude` / `longitude`: `input[type=number]` com `step=0.000001`.
- Countries e States são read-only (cache com `staleTime: Infinity`).
- Na edição, resolver cascata inversa: a partir de `cityId`, buscar cidade para obter `stateId`, depois estado para obter `countryId`.
