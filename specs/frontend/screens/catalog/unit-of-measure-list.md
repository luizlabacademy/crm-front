# Unidades de Medida — Listagem (read-only)

> **ID da tela:** FE-SCREEN-CATALOG-05
> **Rota:** `/catalog/units-of-measure`

---

## 1. Objetivo

Exibir todas as unidades de medida disponíveis no sistema. Dados **somente leitura** — não há criação, edição ou exclusão pelo frontend. UoM são gerenciadas via seed SQL no backend.

Perfil: qualquer usuário autenticado. Usadas como datasource em formulários de **Item** e **OrderItem**.

---

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/units-of-measure` | Lista paginada de UoM |
| `GET` | `/api/v1/units-of-measure/{id}` | Detalhe de uma UoM |

- Requer `Authorization: Bearer <token>`.
- **Sem endpoints de mutação** (POST/PUT/DELETE) — recurso read-only.
- Paginação padrão: `page`, `size`, `sort`.

---

## 3. Campos e dados da tela

### Tabela de listagem

| Coluna | Campo API | Tipo | Descrição |
|--------|-----------|------|-----------|
| Código | `code` | `string (uuid)` | Identificador único gerado pelo backend |
| Nome | `name` | `string` | Nome da unidade (ex.: "Quilograma", "Litro") |
| Símbolo | `symbol` | `string?` | Abreviação (ex.: "kg", "L") — pode ser `null` |
| Ativo | `active` | `boolean` | Status da unidade |

### Campos retornados mas não exibidos na tabela

| Campo | Tipo | Uso |
|-------|------|-----|
| `id` | `int64` | Chave primária — usada em links e referências internas |
| `createdAt` | `date-time` | Auditoria |
| `updatedAt` | `date-time` | Auditoria |

---

## 4. Ações do usuário

| Ação | Descrição |
|------|-----------|
| Visualizar lista | Consultar todas as UoM paginadas |
| Buscar/filtrar | Filtro por nome ou símbolo (client-side ou query param se disponível) |
| Ordenar colunas | Click no cabeçalho ordena por `name` ou `symbol` |
| Ver detalhe | Click na linha abre modal/drawer com dados completos da UoM |

> **Não há ações de criação, edição ou exclusão.** A tela é puramente informativa.

---

## 5. Regras de negócio

- **Read-only absoluto** — nenhum botão de "Novo", "Editar" ou "Excluir" deve existir nesta tela.
- UoM inativas (`active: false`) devem ser exibidas com indicador visual (badge cinza, texto opaco) mas **não ocultadas** — o admin precisa ver todas.
- O campo `symbol` é opcional; quando `null`, exibir "-" ou célula vazia.
- Esta tela serve como referência rápida; o uso principal de UoM é como seletor nos formulários de Item e OrderItem.

---

## 6. Estados da interface

| Estado | Comportamento |
|--------|--------------|
| **Carregando** | Skeleton na tabela enquanto `GET /units-of-measure` está em flight |
| **Lista vazia** | Mensagem "Nenhuma unidade de medida cadastrada." (improvável — seed garante dados) |
| **Erro de rede** | Toast "Erro ao carregar unidades de medida." com botão "Tentar novamente" |
| **Sucesso** | Tabela renderizada com paginação |

---

## 7. Navegação e fluxo

| Origem | Ação | Destino |
|--------|------|---------|
| Menu lateral > Catálogo > Unidades de Medida | Click | `/catalog/units-of-measure` |
| Formulário de Item (seletor de UoM) | Link "Ver todas" | `/catalog/units-of-measure` |
| Linha da tabela | Click | Modal/drawer de detalhe (sem navegação de rota) |

---

## 8. Critérios de aceite

- [ ] **Given** usuário autenticado na rota `/catalog/units-of-measure`, **When** a página carrega, **Then** `GET /api/v1/units-of-measure` é chamado e a tabela exibe os resultados.
- [ ] **Given** a lista retorna dados, **When** renderizada, **Then** cada linha exibe código, nome, símbolo e status ativo.
- [ ] **Given** uma UoM com `active: false`, **When** renderizada, **Then** aparece com badge/indicador de inativa.
- [ ] **Given** uma UoM com `symbol: null`, **When** renderizada, **Then** a coluna símbolo exibe "-" ou vazio.
- [ ] **Given** erro na requisição, **When** falha, **Then** toast de erro com opção de retry.
- [ ] **Given** a tela está carregada, **When** o usuário procura, **Then** não existe botão de "Novo", "Editar" ou "Excluir" em nenhum lugar da tela.

---

## 9. Observações técnicas para front

- Cache agressivo recomendado: `staleTime: 5 * 60 * 1000` (5 min) ou até `Infinity` — dados raramente mudam.
- Quando usada como seletor em formulários de Item/OrderItem, carregar via hook compartilhado (`useUnitsOfMeasure`) para evitar requisições duplicadas.
- A paginação segue o padrão Spring (`page`, `size`, `sort`). Para seletores, considerar buscar todas de uma vez (`size=999`) já que o volume é baixo.
- Não implementar modais de CRUD — qualquer tentativa viola a regra de read-only.
