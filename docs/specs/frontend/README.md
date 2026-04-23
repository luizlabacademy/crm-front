# Especificações de Front-end — CRM

## Overview

Este projeto representa o front-end de um CRM que integra uma solução de automação de vendas e operações de entrega.

A plataforma combina:
- atendimento automatizado via chatbot (inicialmente WhatsApp)
- gestão de pedidos e agendamentos (total ou parcialmente automatizados)
- integração com plataformas de orquestração de delivery
- controle próprio de operações de entrega

O CRM atua como interface central para:
- acompanhamento de clientes, pedidos e leads
- gestão operacional
- tomada de decisão

### Escopo da versão atual

A versão em desenvolvimento é focada em pequenos negócios de delivery, como:
- hamburguerias
- marmitarias
- pizzarias
- lanchonetes
- pastelarias
- açaíterias
- docerias
- sorveterias
- casas de salgados
- cozinhas industriais (refeições prontas)
- dark kitchens
- restaurantes de pequeno porte com foco em delivery

### Evolução prevista

A arquitetura foi pensada para expansão, incluindo:
- atendimento a salões de beleza (agendamentos)
- suporte a funis de vendas mais complexos
- ampliação dos canais de atendimento e automação

---

Este projeto segue uma abordagem de **Spec-Driven Development (SDD)**, onde as telas, fluxos e comportamentos são definidos previamente antes da implementação.

---

Documentação funcional de todas as telas, guidelines e fluxos do front-end do CRM, gerada a partir dos controllers, modelos de domínio e OpenAPI do backend Kotlin/Spring Boot.

---

## Documentos de referência

| Documento | Descrição |
|-----------|-----------|
| [tech-stack.md](./tech-stack.md) | Tecnologias adotadas e justificativas |
| [architecture.md](./architecture.md) | Arquitetura modular por feature |
| [ui-guidelines.md](./ui-guidelines.md) | Padrões visuais, componentes, estados, acessibilidade |
| [frontend-guidelines.md](./frontend-guidelines.md) | Governança, convenções de código e fluxo de trabalho |
| [routing-guidelines.md](./routing-guidelines.md) | Mapa completo de rotas do SPA |
| [api-integration-guidelines.md](./api-integration-guidelines.md) | Matriz tela × endpoint, autenticação e lacunas |
| [api-error-response-guidelines.md](./api-error-response-guidelines.md) | Padrão global de respostas de sucesso e erro |

---

## Índice de telas

### Dashboard

| Arquivo | Tela |
|---------|------|
| [screens/dashboard/dashboard.md](./screens/dashboard/dashboard.md) | Dashboard (tela inicial pós-login) |

### Autenticação

| Arquivo | Tela |
|---------|------|
| [screens/auth/login.md](./screens/auth/login.md) | Login / Autenticação JWT |

### Clientes

| Arquivo | Tela |
|---------|------|
| [screens/customers/customer-list.md](./screens/customers/customer-list.md) | Clientes — Listagem |
| [screens/customers/customer-form.md](./screens/customers/customer-form.md) | Clientes — Cadastro e Edição |
| [screens/customers/customer-details.md](./screens/customers/customer-details.md) | Clientes — Detalhe |

### Leads

| Arquivo | Tela |
|---------|------|
| [screens/leads/lead-list.md](./screens/leads/lead-list.md) | Leads — Listagem |
| [screens/leads/lead-form.md](./screens/leads/lead-form.md) | Leads — Cadastro e Edição |
| [screens/leads/lead-details.md](./screens/leads/lead-details.md) | Leads — Detalhe e Mensagens |

### Pedidos

| Arquivo | Tela |
|---------|------|
| [screens/orders/order-list.md](./screens/orders/order-list.md) | Pedidos — Listagem |
| [screens/orders/order-form.md](./screens/orders/order-form.md) | Pedidos — Cadastro e Edição |
| [screens/orders/order-details.md](./screens/orders/order-details.md) | Pedidos — Detalhe |

### Agendamentos

| Arquivo | Tela |
|---------|------|
| [screens/appointments/appointment-list.md](./screens/appointments/appointment-list.md) | Agendamentos — Listagem |
| [screens/appointments/appointment-form.md](./screens/appointments/appointment-form.md) | Agendamentos — Cadastro e Edição |

### Schedules (vínculo Tenant/Cliente/Appointment)

| Arquivo | Tela |
|---------|------|
| [screens/schedule/schedule-list.md](./screens/schedule/schedule-list.md) | Schedules — Listagem |
| [screens/schedule/schedule-form.md](./screens/schedule/schedule-form.md) | Schedules — Cadastro e Edição |

### Pessoas e Endereços

| Arquivo | Tela |
|---------|------|
| [screens/people/person-list.md](./screens/people/person-list.md) | Pessoas — Listagem |
| [screens/people/person-form.md](./screens/people/person-form.md) | Pessoas — Cadastro e Edição |
| [screens/people/address-list.md](./screens/people/address-list.md) | Endereços — Listagem |
| [screens/people/address-form.md](./screens/people/address-form.md) | Endereços — Cadastro e Edição |

### Catálogo

| Arquivo | Tela |
|---------|------|
| [screens/catalog/item-list.md](./screens/catalog/item-list.md) | Itens — Listagem |
| [screens/catalog/item-form.md](./screens/catalog/item-form.md) | Itens — Cadastro e Edição |
| [screens/catalog/item-category-list.md](./screens/catalog/item-category-list.md) | Categorias — Listagem |
| [screens/catalog/item-category-form.md](./screens/catalog/item-category-form.md) | Categorias — Cadastro e Edição |
| [screens/catalog/unit-of-measure-list.md](./screens/catalog/unit-of-measure-list.md) | Unidades de Medida — Consulta (read-only) |

### Pipeline

| Arquivo | Tela |
|---------|------|
| [screens/pipeline/pipeline-flow-list.md](./screens/pipeline/pipeline-flow-list.md) | Funis de Vendas — Listagem |
| [screens/pipeline/pipeline-flow-form.md](./screens/pipeline/pipeline-flow-form.md) | Funis de Vendas — Cadastro e Edição |

### Administração

| Arquivo | Tela |
|---------|------|
| [screens/admin/user-list.md](./screens/admin/user-list.md) | Usuários — Listagem |
| [screens/admin/user-form.md](./screens/admin/user-form.md) | Usuários — Cadastro e Edição |
| [screens/admin/role-list.md](./screens/admin/role-list.md) | Perfis (Roles) — Listagem |
| [screens/admin/role-form.md](./screens/admin/role-form.md) | Perfis (Roles) — Cadastro e Edição |
| [screens/admin/permission-list.md](./screens/admin/permission-list.md) | Permissões — Listagem e Cadastro |
| [screens/admin/tenant-list.md](./screens/admin/tenant-list.md) | Tenants — Listagem |
| [screens/admin/tenant-form.md](./screens/admin/tenant-form.md) | Tenants — Cadastro e Edição |
| [screens/admin/worker-list.md](./screens/admin/worker-list.md) | Funcionários — Listagem |
| [screens/admin/worker-form.md](./screens/admin/worker-form.md) | Funcionários — Cadastro e Edição |
| [screens/admin/plan-list.md](./screens/admin/plan-list.md) | Planos — Listagem |
| [screens/admin/plan-form.md](./screens/admin/plan-form.md) | Planos — Cadastro e Edição |

### Comercial

| Arquivo | Tela |
|---------|------|
| [screens/public/plans.md](./screens/public/plans.md) | Planos Públicos (Pricing Table) |

### Dados Geográficos

| Arquivo | Tela |
|---------|------|
| [screens/geo/geo-unit-lookup.md](./screens/geo/geo-unit-lookup.md) | Consulta de País/Estado/Cidade (read-only) |

---

## Fluxos

| Arquivo | Descrição |
|---------|-----------|
| [flows/auth-flow.md](./flows/auth-flow.md) | Fluxo completo de autenticação (login, JWT, expiração, redirect) |
| [flows/customer-lifecycle-flow.md](./flows/customer-lifecycle-flow.md) | Ciclo de vida do cliente (cadastro → atendimento → pedidos) |
| [flows/lead-to-order-flow.md](./flows/lead-to-order-flow.md) | Conversão de lead em pedido (funil → negociação → fechamento) |
| [flows/scheduling-flow.md](./flows/scheduling-flow.md) | Fluxo de agendamentos (appointment → schedule → atendimento) |

---

## Totais

- **38 arquivos de telas** cobrindo todos os domínios do CRM
- **4 fluxos** documentando jornadas completas
- **6 documentos de referência** (guidelines, stack, arquitetura)
