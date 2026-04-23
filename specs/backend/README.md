# Especificacoes de Backend

## 1. Objetivo

Este diretorio consolida as especificacoes backend necessarias para atender o frontend do CRM.

O backend deve ser implementado orientado por contrato com o frontend, cobrindo:
- autenticacao/autorizacao;
- contratos de request/response;
- padrao global de erros;
- multi-tenancy;
- cobertura de endpoints por dominio de tela.

## 2. Fonte de verdade do contrato com frontend

- `specs/frontend/api-integration-guidelines.md`
- `specs/frontend/api-error-response-guidelines.md`
- `specs/frontend/README.md` (indice principal de telas)

## 3. Referencia de telas para o backend

O backend deve sempre considerar as telas do frontend como ponto de partida para escopo de API.

Referencias obrigatorias:
- indice principal: `specs/frontend/README.md`
- especificacoes de tela: `specs/frontend/screens/**`
- fluxos transversais: `specs/frontend/flows/**`

### 3.1 Como buscar telas novas que ainda nao estejam no README do frontend

Se uma tela for citada em task/issue e nao aparecer no indice, usar descoberta por estrutura de arquivos:
- procurar todos os arquivos de tela em `specs/frontend/screens/**/*.md`;
- comparar com entradas de `specs/frontend/README.md`;
- tratar arquivos encontrados fora do indice como candidatos a tela nova/nao indexada;
- considerar tambem mudancas em `specs/frontend/routing-guidelines.md` e `specs/frontend/flows/*.md`.

Regra operacional:
- nenhuma implementacao backend deve depender apenas do README de frontend;
- sempre validar a estrutura real de `specs/frontend/screens/` antes de fechar escopo.

## 4. Mapa global de necessidades do frontend

Para visao consolidada do que o frontend precisa do backend em todos os dominios, usar:
- [frontend-backend-needs-matrix.md](./frontend-backend-needs-matrix.md)

## 5. Especificacoes backend detalhadas por feature

| Documento | Dominio | Status |
|-----------|---------|--------|
| [settings-saas-plans-api-implementation.md](./settings-saas-plans-api-implementation.md) | Planos SaaS | Detalhado |

## 6. Diretriz para novas specs backend

Toda nova feature backend deve incluir, no minimo:
- objetivo funcional e escopo;
- rotas e DTOs de request/response;
- regras de validacao;
- regras de multi-tenancy e autorizacao;
- erros e respostas conforme padrao global;
- plano de testes (unitario e integracao);
- criterios de aceite orientados ao frontend.
