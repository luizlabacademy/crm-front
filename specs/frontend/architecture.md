# Architecture

## 1. Purpose

Este documento define a arquitetura do front-end do CRM.

Seu objetivo é estabelecer: - a organização técnica da aplicação - os
padrões arquiteturais adotados - a estrutura de diretórios - a separação
de responsabilidades entre camadas - as regras de evolução do projeto

Documentos relacionados:
- `tech-stack.md`
- `frontend-guidelines.md`
- `ui-guidelines.md`

------------------------------------------------------------------------

## 2. Architectural Approach

A aplicação segue uma arquitetura modular orientada por domínio
(feature-based), com separação explícita entre server state e client
state.

Princípios: - organização por domínio - baixo acoplamento -
previsibilidade - escalabilidade progressiva

------------------------------------------------------------------------

## 3. Project Structure

    src/
      app/
        providers/
        router/
        layouts/
        guards/

      features/
        customers/
        leads/
        orders/
        appointments/

      components/
        ui/
        shared/

      lib/
        api/
        auth/
        utils/

      styles/

------------------------------------------------------------------------

## 4. State Management

### Server State

Responsável por dados vindos da API.

### Client State

Responsável por estado de interface e sessão leve.

Regra: Não duplicar dados de API em estado global.

------------------------------------------------------------------------

## 5. Routing

Padrão: - `/customers` - `/customers/new` - `/customers/:id` -
`/customers/:id/edit`

Regras: - kebab-case - navegação previsível - guards centralizados

------------------------------------------------------------------------

## 6. API Integration

-   client centralizado
-   contratos explícitos
-   tratamento padrão de erro (401, 403, 500)

------------------------------------------------------------------------

## 7. UI Architecture

Camadas: - UI base (componentes reutilizáveis) - UI compartilhada
(componentes compostos) - UI por feature

Seguir: - `frontend-guidelines.md` - `ui-guidelines.md`

------------------------------------------------------------------------

## 8. Forms

-   schema-driven
-   validação alinhada ao backend
-   feedback claro

------------------------------------------------------------------------

## 9. Error Handling

Toda tela deve prever: - loading - empty - success - error - 401 - 403

------------------------------------------------------------------------

## 10. Scalability

-   organizar por domínio
-   evitar abstração prematura
-   promover reuso quando necessário

------------------------------------------------------------------------

## 11. Final Rule

Priorizar: - simplicidade - consistência - clareza - evolução segura
