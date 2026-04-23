# Pessoas (Person) — Listagem

## 1. Objetivo
- Exibir todas as pessoas (físicas e jurídicas) cadastradas no sistema, com paginação e filtro por tenant.
- Perfil: administradores e gestores autenticados.

## 2. Endpoints envolvidos

| Método | Rota | Finalidade |
|--------|------|-----------|
| `GET` | `/api/v1/persons` | Lista pessoas paginadas |
| `DELETE` | `/api/v1/persons/{id}` | Remove pessoa |

- Requer `Authorization: Bearer <token>`.
- Parâmetros: `page` (0), `size` (20), `tenantId` (opcional).
- Ordenação: `id` ASC.
- Response `200`: `PageResponse<PersonResponse>`.

## 3. Campos e dados da tela

| Campo | Tipo | Origem |
|-------|------|--------|
| ID | Long | `PersonResponse.id` |
| Tipo | String (derivado) | Física (se `physical` preenchido) / Jurídica (se `legal` preenchido) |
| Nome | String | `physical.fullName` ou `legal.corporateName` |
| CPF / CNPJ | String | `physical.cpf` ou `legal.cnpj` |
| Ativo | Boolean | `PersonResponse.active` |
| Criado em | OffsetDateTime | `PersonResponse.createdAt` |
| Qtd. contatos | Number (derivado) | `PersonResponse.contacts.length` |

## 4. Ações do usuário

- **Listar**: carrega ao entrar com `page=0&size=20`.
- **Filtrar por tenant**: select ou input de `tenantId`.
- **Paginar**: próxima/anterior, seletor de tamanho.
- **Novo**: botão "Novo" → `/persons/new`.
- **Editar**: clique na linha → `/persons/:id/edit`.
- **Excluir**: botão com confirmação → `DELETE` → recarrega lista.

## 5. Regras de negócio

- Uma pessoa pode ter `physical` OU `legal` preenchido (não ambos).
- Pessoas podem ser vinculadas a Workers, Users e Customers.
- `active = false` desativa sem excluir.

## 6. Estados da interface

- **Carregando**: skeleton na tabela.
- **Vazio**: "Nenhuma pessoa cadastrada." com botão "Cadastrar pessoa".
- **Sucesso**: tabela paginada.
- **Erro de rede / 5xx**: toast com retry.
- **Não autenticado (401)**: redirect `/login`.

## 7. Navegação e fluxo

- Origem: menu "Pessoas" ou via formulário de Worker/Customer/User.
- "Novo" → `/persons/new`.
- Editar → `/persons/:id/edit`.
- Após exclusão: permanece na listagem.

## 8. Critérios de aceite

- [ ] Ao acessar a rota, dispara `GET /api/v1/persons?page=0&size=20`.
- [ ] Filtro por `tenantId` funciona.
- [ ] Tipo (Física/Jurídica) exibido corretamente na coluna.
- [ ] CPF com máscara `XXX.XXX.XXX-XX`, CNPJ com `XX.XXX.XXX/XXXX-XX`.
- [ ] Exclusão com confirmação.

## 9. Observações técnicas para front

- Determinar tipo: se `physical !== null` → Física; se `legal !== null` → Jurídica.
- Exibir nome: `physical.fullName` ou `legal.corporateName`.
- Exibir documento: `physical.cpf` (com máscara CPF) ou `legal.cnpj` (com máscara CNPJ).
- Badge ativo/inativo.
- Formatar `createdAt` como `dd/MM/yyyy HH:mm`.
- Paginação server-side.
