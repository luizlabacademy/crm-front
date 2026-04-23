# Planos — Cadastro e Edicao

## 1. Objetivo
- Criar ou editar planos SaaS com seus beneficios no mesmo formulario.
- Garantir consistencia transacional no payload enviado para API.

## 2. Endpoints envolvidos

| Metodo | Rota | Finalidade |
|--------|------|-----------|
| `POST` | `/settings/saas/plans` | Cria plano com beneficios |
| `PUT` | `/settings/saas/plans/{id}` | Atualiza plano com beneficios |
| `GET` | `/settings/saas/plans/{id}` | Carrega dados para edicao |
| `DELETE` | `/settings/saas/plans/{id}` | Remove plano |

- Requer `Authorization: Bearer <token>`.
- O payload deve enviar dados do plano e lista completa de beneficios.
- Erros e respostas devem seguir `specs/frontend/api-error-response-guidelines.md`.

## 3. Campos e dados da tela

| Campo | Tipo | Obrigatorio | Validacoes |
|-------|------|-------------|-----------|
| Nome | input text | Sim | Nao vazio, max 255 |
| Descricao | textarea | Nao | Texto livre |
| Categoria | select | Sim | Enum valido |

**Beneficios (lista dinamica):**

| Campo | Tipo | Obrigatorio | Validacoes |
|-------|------|-------------|-----------|
| Descricao do beneficio | input/textarea inline | Sim | Nao vazio |

## 4. Acoes do usuario

- **Adicionar beneficio**: insere nova linha editavel.
- **Remover beneficio**: remove linha da lista antes de salvar.
- **Editar beneficio**: alteracao inline de descricao.
- **Salvar**: envia `POST` (novo) ou `PUT` (edicao) com beneficios no mesmo payload.
- **Excluir plano** (edicao): confirma e envia `DELETE`.
- **Cancelar**: retorna para `/settings/plans` sem persistir.

## 5. Regras de negocio

- Beneficios nao possuem CRUD independente.
- Um plano deve possuir pelo menos 1 beneficio.
- `PUT` atualiza plano e substitui a lista de beneficios pelo payload atual.
- `tenant_id` nunca deve ser enviado pelo frontend; vem do token no backend.

## 6. Estados da interface

- **Carregando (edicao)**: skeleton no formulario.
- **Salvando**: botao com spinner e campos desabilitados.
- **Sucesso**: toast + retorno para `/settings/plans`.
- **Erro de validacao (400)**: mapear `errors[]` em mensagens inline.
- **Nao encontrado (404)**: mensagem "Plano nao encontrado.".
- **Nao autenticado (401)**: redirect `/login`.
- **Sem permissao (403)**: toast "Sem permissao".

## 7. Navegacao e fluxo

- Origem (novo): `/settings/plans/new`.
- Origem (edicao): `/settings/plans/:id/edit`.
- Pos-salvar: `/settings/plans`.
- Cancelar: `/settings/plans`.

## 8. Criterios de aceite

- [ ] `name` vazio desabilita o submit.
- [ ] Sem beneficios validos, submit bloqueado.
- [ ] Em novo cadastro, `POST` recebe payload com `benefits[]`.
- [ ] Em edicao, `GET` preenche o formulario e `PUT` persiste alteracoes.
- [ ] Exclusao exige confirmacao explicita antes do `DELETE`.

## 9. Observacoes tecnicas para front

- Usar `react-hook-form` com `useFieldArray` para beneficios.
- Hooks sugeridos em `src/features/plans/api/`:
  - `usePlan`
  - `useCreatePlan`
  - `useUpdatePlan`
  - `useDeletePlan`
- Invalidar `['plans']` apos mutacoes.
