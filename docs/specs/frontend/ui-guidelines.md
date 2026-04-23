# UI Guidelines — Front-end CRM

## 1. Objetivo

Definir padrões de UI para garantir consistência, previsibilidade, clareza funcional e boa experiência de uso em todas as telas do CRM.

Este documento orienta a construção de páginas, formulários, listagens, detalhes, filtros, feedback visual e estados da interface.

---

## 2. Princípios Gerais

### 2.1 Clareza
- A interface deve deixar evidente:
  - o que a tela mostra
  - o que o usuário pode fazer
  - o que aconteceu após cada ação

### 2.2 Consistência
- Componentes equivalentes devem se comportar da mesma forma em todo o sistema.
- A mesma ação deve ter o mesmo padrão visual e de interação em telas diferentes.

### 2.3 Eficiência
- Priorizar fluxos rápidos para operações frequentes.
- Reduzir cliques desnecessários.
- Evitar excesso de elementos decorativos.

### 2.4 Feedback explícito
- Toda ação relevante deve gerar retorno perceptível.
- O usuário nunca deve ficar em dúvida se a ação foi processada, falhou ou está em andamento.

### 2.5 Escalabilidade
- A UI deve suportar crescimento de dados, novas colunas, filtros adicionais e novos estados sem colapsar visualmente.

---

## 3. Estrutura Padrão das Telas

Toda tela deve, quando aplicável, seguir esta composição:

1. **Header da página**
   - título
   - descrição curta opcional
   - ações principais

2. **Área de filtros**
   - busca
   - filtros rápidos
   - filtros avançados, se necessário

3. **Conteúdo principal**
   - tabela, cards, formulário ou detalhe

4. **Área de feedback**
   - loading
   - empty state
   - error state
   - mensagens contextuais

5. **Ações secundárias**
   - paginação
   - exportação
   - navegação complementar

---

## 4. Estados Obrigatórios de UI

Toda tela deve prever explicitamente os estados abaixo.

### 4.1 Loading
- Exibir indicador visível de carregamento.
- Evitar tela vazia sem contexto.
- Em tabelas, preferir skeleton ou loading state na própria área de conteúdo.
- Em formulários, desabilitar submit durante envio.

### 4.2 Empty State
Usar quando não houver dados a exibir.

Deve conter:
- mensagem clara
- explicação curta
- ação recomendada, quando fizer sentido

Exemplos:
- “Nenhum cliente encontrado.”
- “Nenhum pedido cadastrado até o momento.”

### 4.3 Success
- Confirmar ações importantes com feedback visual discreto e claro.
- Exemplos:
  - “Cliente salvo com sucesso.”
  - “Pedido removido com sucesso.”

### 4.4 Error
- Mensagens de erro devem ser úteis, objetivas e não técnicas para o usuário final.
- Não expor stack trace, exceções internas ou detalhes sensíveis.
- Quando possível, incluir ação de recuperação:
  - tentar novamente
  - revisar campos
  - recarregar

### 4.5 Unauthorized (401)
- Indicar sessão inválida ou expirada.
- Redirecionar para login quando apropriado.
- Preservar fluxo de retorno se fizer sentido.

### 4.6 Forbidden (403)
- Informar que o usuário não possui permissão.
- Não esconder silenciosamente a falha.
- Exibir mensagem clara:
  - “Você não possui permissão para acessar este recurso.”

---

## 5. Diretrizes para Formulários

## 5.1 Estrutura
Formulários devem ter:
- título claro
- agrupamento lógico de campos
- labels visíveis
- campos obrigatórios identificáveis
- ações no rodapé ou topo de forma consistente

## 5.2 Labels e ajuda
- Todo campo deve ter label clara.
- Placeholder não substitui label.
- Texto de apoio deve ser usado apenas quando agrega contexto real.

## 5.3 Validação
- Validar no cliente para melhorar UX.
- A API permanece fonte final da validação.
- Exibir erros próximos ao campo.
- Mensagens devem ser específicas:
  - bom: “E-mail inválido”
  - ruim: “Campo incorreto”

## 5.4 Campos obrigatórios
- Devem ser claramente identificados.
- Evitar excesso de obrigatoriedade sem justificativa funcional.

## 5.5 Submit
- Botão principal deve deixar clara a ação:
  - “Salvar”
  - “Criar cliente”
  - “Atualizar pedido”
- Durante envio:
  - desabilitar botão
  - evitar múltiplos submits
  - exibir loading

## 5.6 Cancelamento
- Deve existir ação de cancelar ou voltar quando aplicável.
- Se houver risco de perda de dados, pedir confirmação.

## 5.7 Máscaras e formatação
Aplicar quando fizer sentido:
- telefone
- CPF/CNPJ
- CEP
- moeda
- data/hora

A máscara não deve impedir correção nem colar valor válido.

---

## 6. Diretrizes para Tabelas e Listagens

## 6.1 Uso
Tabelas devem ser usadas para dados comparáveis, repetitivos e operacionais.

## 6.2 Estrutura mínima
Toda listagem deve considerar:
- colunas com nomes claros
- ordenação quando relevante
- paginação quando o volume justificar
- filtro/busca quando a consulta for recorrente
- ações por linha ou em massa, se necessário

## 6.3 Colunas
- Priorizar colunas realmente úteis para decisão.
- Evitar excesso de colunas visíveis por padrão.
- Valores longos devem ser truncados com estratégia clara.

## 6.4 Ações
Ações comuns:
- visualizar
- editar
- excluir
- mudar status

Regras:
- ações destrutivas devem pedir confirmação
- ações secundárias devem ficar em menu contextual quando houver muitas opções

## 6.5 Busca e filtros
- Busca textual deve ser simples e rápida.
- Filtros avançados só devem aparecer quando agregarem valor real.
- A interface deve deixar claro quando há filtros ativos.

## 6.6 Paginação
- Obrigatória quando o volume de dados puder crescer.
- Exibir quantidade total quando disponível.
- Manter consistência entre telas equivalentes.

## 6.7 Empty state em listagens
- Não mostrar tabela vazia sem mensagem.
- Explicar se não há registros ou se o filtro não retornou resultados.

---

## 7. Diretrizes para Telas de Detalhe

## 7.1 Objetivo
Apresentar uma entidade com mais contexto, histórico e ações relacionadas.

## 7.2 Estrutura recomendada
- resumo principal
- atributos organizados por seção
- informações relacionadas
- ações principais
- histórico/status quando aplicável

## 7.3 Navegação
- Deve existir caminho claro de retorno à origem.
- Breadcrumb é recomendado em telas profundas.

---

## 8. Feedback Visual e Mensagens

## 8.1 Mensagens de sucesso
- Curtas
- objetivas
- orientadas à ação concluída

## 8.2 Mensagens de erro
Devem responder, quando possível:
- o que falhou
- o que o usuário pode fazer agora

## 8.3 Toasts e alertas
- Toast: ações rápidas e confirmação transitória
- Alert inline: erro ou aviso contextual dentro da tela
- Modal: confirmação de ação crítica

## 8.4 Confirmações
Usar confirmação para:
- exclusão
- alteração irreversível
- saída com dados não salvos
- ações que afetam múltiplos registros

---

## 9. Consistência de Ações

Padrões recomendados:

- **Primária**: salvar, criar, confirmar
- **Secundária**: cancelar, voltar
- **Destrutiva**: excluir, remover, desativar

Regras:
- deve haver apenas uma ação primária dominante por área
- ações destrutivas devem ser claramente distinguíveis
- o posicionamento dos botões deve ser consistente entre telas similares

---

## 10. Navegação e Fluxo

## 10.1 Navegação previsível
- O usuário deve entender de onde veio e para onde pode ir.
- Evitar redirecionamentos inesperados.

## 10.2 Pós-ação
Após criar/editar:
- redirecionar de forma consistente
- ou manter na tela com confirmação clara

A decisão deve seguir o objetivo do fluxo:
- operação em sequência → permanecer pode ser melhor
- operação isolada → redirecionar pode ser melhor

## 10.3 Voltar
- “Voltar” deve respeitar o fluxo esperado
- não depender exclusivamente do histórico do navegador

---

## 11. Acessibilidade

## 11.1 Regras mínimas
- labels associadas aos campos
- foco visível
- navegação por teclado
- contraste suficiente
- mensagens compreensíveis
- uso correto de `aria-*` quando necessário

## 11.2 Componentes interativos
- botões e links devem ser semanticamente corretos
- ícones isolados devem ter descrição acessível

## 11.3 Erros de formulário
- erros devem ser perceptíveis visualmente e semanticamente
- não depender apenas de cor

---

## 12. Responsividade

## 12.1 Princípio
A interface deve funcionar bem em larguras menores, mesmo que o uso principal seja desktop.

## 12.2 Tabelas
Em telas menores, considerar:
- scroll horizontal controlado
- colunas prioritárias
- colapso para cards, se necessário

## 12.3 Formulários
- campos devem reorganizar sem quebrar leitura
- evitar múltiplas colunas estreitas em mobile

---

## 13. Padrões para Filtros

## 13.1 Filtros simples
Usar para:
- status
- data
- tenant
- responsável
- categoria

## 13.2 Filtros avançados
Usar apenas quando houver necessidade real de refinamento.

## 13.3 Estado dos filtros
- filtros ativos devem ser visíveis
- deve haver ação clara para limpar filtros

---

## 14. Padrões para Dados Sensíveis

- Não expor dados sensíveis sem necessidade operacional.
- Ocultar ou mascarar informações quando apropriado.
- Mensagens de erro não devem revelar detalhes internos.
- Permissões devem refletir claramente o que pode ou não ser visualizado.

---

## 15. Regras de Consistência entre Telas

Telas relacionadas devem manter consistência em:
- nomenclatura
- posicionamento de ações
- comportamento de loading
- comportamento de erro
- filtros
- paginação
- ordenação
- confirmações
- navegação de retorno

Exemplos:
- `customer-list`, `lead-list` e `order-list` devem seguir o mesmo padrão estrutural
- `customer-form`, `lead-form` e `order-form` devem compartilhar lógica visual semelhante

---

## 16. O que evitar

- tela sem estado de loading
- tabela vazia sem mensagem
- erro genérico sem contexto
- label ausente em formulário
- múltiplas ações primárias competindo
- comportamento inconsistente entre módulos equivalentes
- depender apenas de cor para indicar estado
- modal para tudo
- filtros excessivos sem necessidade
- campos obrigatórios sem explicação funcional

---

## 17. Relação com outros documentos

Este arquivo define regras de UI.

Complementos recomendados:
- `frontend-guidelines.md` → governança geral das specs
- `routing-guidelines.md` → padrões de rotas e navegação
- `api-integration-guidelines.md` → integração com backend
- `screens/*.md` → especificações de telas
- `flows/*.md` → especificações de fluxos

---

## 18. Regra final

Toda spec de tela deve ser implementável, testável e consistente com estas diretrizes.

Quando houver dúvida:
- não supor
- registrar em `Open Questions`
- manter a UI simples, clara e operacional
