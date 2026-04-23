# Dados Geográficos (Country, State, City) — Consulta

## 1. Objetivo
- Consultar países, estados e cidades disponíveis no sistema. Dados read-only utilizados em seletores de endereço.
- Perfil: qualquer usuário autenticado (usados internamente por formulários de Address).

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/countries` | Lista países paginados |
| `GET` | `/api/v1/countries/{id}` | Detalhe de país |
| `GET` | `/api/v1/states` | Lista estados paginados |
| `GET` | `/api/v1/states/{id}` | Detalhe de estado |
| `GET` | `/api/v1/states/country/{countryId}` | Estados de um país |
| `GET` | `/api/v1/cities` | Lista cidades paginadas |
| `GET` | `/api/v1/cities/{id}` | Detalhe de cidade |
| `GET` | `/api/v1/cities/state/{stateId}` | Cidades de um estado |

- Requer `Authorization: Bearer <token>`.
- **Sem endpoints de criação/edição/exclusão** — dados são read-only e gerenciados via SQL de seed.
- Countries: ordenação por `country`. States: por `state`. Cities: por `city`.

## 3. Campos

**Country:** `id`, `iso2`, `iso3`, `country`.
**State:** `id`, `countryId`, `acronym`, `state`, `ibgeCode?`.
**City:** `id`, `stateId`, `city`, `ibgeCode?`.

## 4. Ações do usuário

- **Sem tela dedicada de gerenciamento** — dados são somente leitura.
- Usados exclusivamente como datasource de seletores em cascata no formulário de `Address`.

## 5. Regras de negócio

- Não há endpoint de mutação — nenhuma operação de escrita deve ser exposta na UI.
- `ibgeCode` disponível para integração com sistemas externos (ex.: ViaCEP).
- `iso2` / `iso3` úteis para formatação de flags de país.

## 6. Estados da interface

- Estados são carregados sob demanda (ao selecionar país).
- Cidades são carregadas sob demanda (ao selecionar estado).
- Erro de carregamento: toast "Não foi possível carregar os dados geográficos."

## 7. Navegação e fluxo

- Não há rota dedicada; componentes usados internamente em `/addresses/new` e `/addresses/:id/edit`.

## 8. Critérios de aceite

- [ ] `GET /api/v1/states/country/{countryId}` chamado ao selecionar país no formulário de endereço.
- [ ] `GET /api/v1/cities/state/{stateId}` chamado ao selecionar estado.
- [ ] Selects em cascata resetam valores dependentes ao trocar seleção.

## 9. Observações técnicas para front

- Cache em memória (ex.: React Query `staleTime: Infinity`) — dados geográficos raramente mudam.
- Pré-carregar países ao montar o formulário de endereço.
- Filtrar estados e cidades por query param `/country/{id}` e `/state/{id}` — não paginar (retorna lista completa).
