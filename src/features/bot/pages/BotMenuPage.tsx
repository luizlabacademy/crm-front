import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  FileText,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import type {
  BotMenuLevel,
  BotMenuItem,
  BotOperation,
  BotTemplate,
  OperationCategory,
  ActionType,
} from "../types";

// ─── Initial Mock Data ───────────────────────────────────────────────────

const MOCK_OPERATIONS_BY_CATEGORY: Record<OperationCategory, BotOperation[]> = {
  capture: [
    {
      id: "cap-1",
      category: "capture",
      label: "Capturar nome",
      actionType: "WRITE",
    },
    {
      id: "cap-2",
      category: "capture",
      label: "Capturar telefone",
      actionType: "WRITE",
    },
    {
      id: "cap-3",
      category: "capture",
      label: "Capturar email",
      actionType: "WRITE",
    },
    {
      id: "cap-4",
      category: "capture",
      label: "Identificar interesse",
      actionType: "DECISION",
    },
    {
      id: "cap-5",
      category: "capture",
      label: "Classificar lead",
      actionType: "WRITE",
    },
    {
      id: "cap-6",
      category: "capture",
      label: "Atualizar/consultar CRM",
      actionType: "INTEGRATION",
    },
  ],
  context: [
    {
      id: "ctx-1",
      category: "context",
      label: "Buscar histórico de atendimentos",
      actionType: "READ",
    },
    {
      id: "ctx-2",
      category: "context",
      label: "Recuperar preferências",
      actionType: "READ",
    },
    {
      id: "ctx-3",
      category: "context",
      label: "Aplicar tags dinâmicas",
      actionType: "WRITE",
    },
    {
      id: "ctx-4",
      category: "context",
      label: "Definir variáveis de sessão",
      actionType: "WRITE",
    },
  ],
  scheduling: [
    {
      id: "sch-1",
      category: "scheduling",
      label: "Consultar disponibilidade",
      actionType: "READ",
    },
    {
      id: "sch-2",
      category: "scheduling",
      label: "Sugerir horários otimizados",
      actionType: "DECISION",
    },
    {
      id: "sch-3",
      category: "scheduling",
      label: "Criar agendamento",
      actionType: "WRITE",
    },
    {
      id: "sch-4",
      category: "scheduling",
      label: "Confirmar agendamento",
      actionType: "COMMUNICATION",
    },
    {
      id: "sch-5",
      category: "scheduling",
      label: "Remarcar",
      actionType: "WRITE",
    },
    {
      id: "sch-6",
      category: "scheduling",
      label: "Cancelar",
      actionType: "WRITE",
    },
  ],
  commercial: [
    {
      id: "com-1",
      category: "commercial",
      label: "Recomendar serviços complementares",
      actionType: "DECISION",
    },
    {
      id: "com-2",
      category: "commercial",
      label: "Aplicar cupom/desconto",
      actionType: "WRITE",
    },
    {
      id: "com-3",
      category: "commercial",
      label: "Enviar oferta personalizada",
      actionType: "COMMUNICATION",
    },
    {
      id: "com-4",
      category: "commercial",
      label: "Reservar vaga temporária",
      actionType: "WRITE",
    },
  ],
  payment: [
    {
      id: "pay-1",
      category: "payment",
      label: "Gerar link de pagamento",
      actionType: "INTEGRATION",
    },
    {
      id: "pay-2",
      category: "payment",
      label: "Validar pagamento recebido",
      actionType: "READ",
    },
    {
      id: "pay-3",
      category: "payment",
      label: "Alterar status para pago/pendente",
      actionType: "WRITE",
    },
  ],
  operational: [
    {
      id: "op-1",
      category: "operational",
      label: "Criar pedido/OS",
      actionType: "WRITE",
    },
    {
      id: "op-2",
      category: "operational",
      label: "Consultar status do pedido",
      actionType: "READ",
    },
    {
      id: "op-3",
      category: "operational",
      label: "Atualizar status do atendimento",
      actionType: "WRITE",
    },
    {
      id: "op-4",
      category: "operational",
      label: "Notificar profissional/equipe",
      actionType: "COMMUNICATION",
    },
  ],
  communication: [
    {
      id: "msg-1",
      category: "communication",
      label: "Enviar resumo do agendamento",
      actionType: "COMMUNICATION",
    },
    {
      id: "msg-2",
      category: "communication",
      label: "Disparar lembretes automáticos",
      actionType: "COMMUNICATION",
    },
    {
      id: "msg-3",
      category: "communication",
      label: "Solicitar confirmação do cliente",
      actionType: "COMMUNICATION",
    },
    {
      id: "msg-4",
      category: "communication",
      label: "Transferir para atendente humano",
      actionType: "INTEGRATION",
    },
  ],
  retention: [
    {
      id: "ret-1",
      category: "retention",
      label: "Registrar feedback/NPS",
      actionType: "WRITE",
    },
    {
      id: "ret-2",
      category: "retention",
      label: "Oferecer retorno/manutenção",
      actionType: "DECISION",
    },
    {
      id: "ret-3",
      category: "retention",
      label: "Criar follow-up automático",
      actionType: "WRITE",
    },
    {
      id: "ret-4",
      category: "retention",
      label: "Reativar cliente inativo",
      actionType: "DECISION",
    },
  ],
};

const INITIAL_MENU_LEVEL: BotMenuLevel = {
  id: "root",
  question: "Olá! O que você deseja?",
  items: [
    {
      id: "item-1",
      label: "Agendar um atendimento",
      operations: [
        MOCK_OPERATIONS_BY_CATEGORY.scheduling[0],
        MOCK_OPERATIONS_BY_CATEGORY.scheduling[2],
      ],
      submenu: null,
    },
    {
      id: "item-2",
      label: "Ver lista de serviços",
      operations: [],
      submenu: null,
    },
    {
      id: "item-3",
      label: "Mudar o horário do meu agendamento",
      operations: [MOCK_OPERATIONS_BY_CATEGORY.scheduling[4]],
      submenu: null,
    },
    {
      id: "item-4",
      label: "Cancelar meu agendamento",
      operations: [MOCK_OPERATIONS_BY_CATEGORY.scheduling[5]],
      submenu: null,
    },
  ],
};

const INITIAL_TEMPLATES: BotTemplate[] = [
  {
    id: "tpl-1",
    title: "Confirmação de Agendamento",
    body: "Perfeito! Seu agendamento foi confirmado para {data} às {hora} com {profissional}. Qualquer dúvida, entre em contato.",
    createdAt: "2026-04-15",
  },
  {
    id: "tpl-2",
    title: "Lembrete de Agendamento",
    body: "Não esqueça! Você tem um agendamento amanhã às {hora} com {profissional}. Confirme sua presença ou nos avise se não puder comparecer.",
    createdAt: "2026-04-16",
  },
  {
    id: "tpl-3",
    title: "Cancelamento de Agendamento",
    body: "Seu agendamento para {data} foi cancelado. Se desejar remarcar, é só chamar a gente!",
    createdAt: "2026-04-17",
  },
];

// ─── Category Labels & Colors ───────────────────────────────────────────

const CATEGORY_LABELS: Record<OperationCategory, string> = {
  capture: "Captura e Qualificação",
  context: "Contexto e Personalização",
  scheduling: "Agendamento (core)",
  commercial: "Comercial (conversão)",
  payment: "Pagamento",
  operational: "Operacional",
  communication: "Comunicação",
  retention: "Retenção",
};

const CATEGORY_COLORS: Record<OperationCategory, string> = {
  capture: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  context: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  scheduling: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  commercial: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  payment: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  operational: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  communication: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  retention: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  READ: "Consulta",
  WRITE: "Cria/Atualiza",
  DECISION: "Decisão",
  INTEGRATION: "Integração",
  COMMUNICATION: "Comunicação",
};

// ─── Operations Modal ───────────────────────────────────────────────────

interface OperationsModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (operations: BotOperation[]) => void;
  initialOperations: BotOperation[];
}

function OperationsModal({
  open,
  onClose,
  onConfirm,
  initialOperations,
}: OperationsModalProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialOperations.map((op) => op.id))
  );
  const [expandedCategory, setExpandedCategory] =
    useState<OperationCategory | null>(null);

  if (!open) return null;

  const toggleOperation = (opId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(opId)) {
      newSelected.delete(opId);
    } else {
      newSelected.add(opId);
    }
    setSelected(newSelected);
  };

  const handleConfirm = () => {
    const ops: BotOperation[] = [];
    Object.entries(MOCK_OPERATIONS_BY_CATEGORY).forEach(([_, catOps]) => {
      catOps.forEach((op) => {
        if (selected.has(op.id)) ops.push(op);
      });
    });
    onConfirm(ops);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-lg max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Selecionar Operações</h2>

        <div className="space-y-3">
          {(
            Object.entries(CATEGORY_LABELS) as [
              OperationCategory,
              string,
            ][]
          ).map(([catKey, catLabel]) => {
            const ops = MOCK_OPERATIONS_BY_CATEGORY[catKey];
            const isExpanded = expandedCategory === catKey;

            return (
              <div key={catKey} className="border border-border rounded-lg">
                <button
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : catKey)
                  }
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-sm">{catLabel}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 space-y-2 bg-muted/20">
                    {ops.map((op) => (
                      <label
                        key={op.id}
                        className="flex items-start gap-3 cursor-pointer hover:bg-muted/30 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(op.id)}
                          onChange={() => toggleOperation(op.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{op.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {ACTION_TYPE_LABELS[op.actionType]}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 border-t border-border pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Template Modal ─────────────────────────────────────────────────────

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: BotTemplate) => void;
  initialTemplate?: BotTemplate | null;
}

function TemplateModal({
  open,
  onClose,
  onSave,
  initialTemplate,
}: TemplateModalProps) {
  const [title, setTitle] = useState(initialTemplate?.title ?? "");
  const [body, setBody] = useState(initialTemplate?.body ?? "");

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;

    const template: BotTemplate = {
      id: initialTemplate?.id ?? `tpl-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      createdAt: initialTemplate?.createdAt ?? new Date().toISOString(),
    };

    onSave(template);
    setTitle("");
    setBody("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-lg max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-4">
          {initialTemplate ? "Editar Template" : "Novo Template"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Confirmação de Agendamento"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Conteúdo</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ex: Perfeito! Seu agendamento foi confirmado para {data} às {hora}..."
              rows={8}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {"{variavel}"} para inserir variáveis dinâmicas
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 border-t border-border pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !body.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Menu Flow Components ───────────────────────────────────────────────

interface MenuItemRowProps {
  item: BotMenuItem;
  onUpdate: (updated: BotMenuItem) => void;
  onOpenOperationsModal: (item: BotMenuItem) => void;
  onAddSubmenu: (item: BotMenuItem) => void;
  onDelete: () => void;
}

function MenuItemRow({
  item,
  onUpdate,
  onOpenOperationsModal,
  onAddSubmenu,
  onDelete,
}: MenuItemRowProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(item.label);

  const handleLabelBlur = () => {
    if (labelValue.trim() && labelValue !== item.label) {
      onUpdate({ ...item, label: labelValue.trim() });
    } else {
      setLabelValue(item.label);
    }
    setIsEditingLabel(false);
  };

  const hasSubmenu = item.submenu !== null;
  const hasOperations = item.operations.length > 0;

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex-1">
        {isEditingLabel ? (
          <input
            type="text"
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={handleLabelBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLabelBlur();
            }}
            autoFocus
            className="w-full rounded px-2 py-1 border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <div
            onClick={() => setIsEditingLabel(true)}
            className="text-sm font-medium cursor-pointer hover:text-primary p-1"
          >
            {item.label}
          </div>
        )}

        {hasOperations && (
          <div className="flex flex-wrap gap-2 mt-2">
            {item.operations.slice(0, 3).map((op) => (
              <span
                key={op.id}
                className={cn(
                  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium",
                  CATEGORY_COLORS[op.category]
                )}
              >
                {op.label}
              </span>
            ))}
            {item.operations.length > 3 && (
              <span className="text-xs text-muted-foreground px-2 py-0.5">
                +{item.operations.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenOperationsModal(item)}
          className={cn(
            "rounded px-3 py-1.5 text-xs font-medium transition-colors",
            hasOperations
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "border border-input hover:bg-muted"
          )}
          title={hasOperations ? "Editar operações" : "Adicionar operações"}
        >
          {hasOperations ? "Editar ops" : "+ Operação"}
        </button>

        {!hasSubmenu && (
          <button
            onClick={() => onAddSubmenu(item)}
            className="rounded px-3 py-1.5 text-xs font-medium border border-input hover:bg-muted transition-colors"
            title="Adicionar submenu"
          >
            + Submenu
          </button>
        )}

        <button
          onClick={onDelete}
          className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Excluir item"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

interface MenuLevelBoxProps {
  level: BotMenuLevel;
  onUpdate: (updated: BotMenuLevel) => void;
  onOpenOperationsModal: (item: BotMenuItem) => void;
  depth: number;
}

function MenuLevelBox({
  level,
  onUpdate,
  onOpenOperationsModal,
  depth,
}: MenuLevelBoxProps) {
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [questionValue, setQuestionValue] = useState(level.question);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [showNewItemInput, setShowNewItemInput] = useState(false);

  const handleQuestionBlur = () => {
    if (questionValue.trim() && questionValue !== level.question) {
      onUpdate({ ...level, question: questionValue.trim() });
    } else {
      setQuestionValue(level.question);
    }
    setIsEditingQuestion(false);
  };

  const handleAddItem = () => {
    if (!newItemLabel.trim()) {
      setShowNewItemInput(false);
      return;
    }

    const newItem: BotMenuItem = {
      id: `item-${Date.now()}`,
      label: newItemLabel.trim(),
      operations: [],
      submenu: null,
    };

    onUpdate({
      ...level,
      items: [...level.items, newItem],
    });

    setNewItemLabel("");
    setShowNewItemInput(false);
  };

  const handleUpdateItem = (updatedItem: BotMenuItem) => {
    onUpdate({
      ...level,
      items: level.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    });
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdate({
      ...level,
      items: level.items.filter((item) => item.id !== itemId),
    });
  };

  const handleAddSubmenu = (parentItem: BotMenuItem) => {
    const newSubmenu: BotMenuLevel = {
      id: `level-${Date.now()}`,
      question: "Nova pergunta?",
      items: [],
    };

    const updatedItem: BotMenuItem = {
      ...parentItem,
      submenu: newSubmenu,
    };

    handleUpdateItem(updatedItem);
  };

  const handleUpdateSubmenu = (
    parentItemId: string,
    updatedSubmenu: BotMenuLevel
  ) => {
    handleUpdateItem({
      ...level.items.find((item) => item.id === parentItemId)!,
      submenu: updatedSubmenu,
    });
  };

  const marginLeft = depth > 0 ? "ml-6" : "";
  const paddingLeft = depth > 0 ? "pl-6" : "";

  return (
    <div className={cn("relative", marginLeft)}>
      {depth > 0 && (
        <>
          <div className="absolute -left-4 top-0 bottom-0 w-0 border-l-2 border-dashed border-border" />
          <div className="absolute -left-4 top-6 w-4 border-t-2 border-dashed border-border" />
        </>
      )}

      <div className={cn("rounded-xl border border-border bg-card p-6", paddingLeft)}>
        {/* Question */}
        <div className="mb-6">
          {isEditingQuestion ? (
            <textarea
              value={questionValue}
              onChange={(e) => setQuestionValue(e.target.value)}
              onBlur={handleQuestionBlur}
              autoFocus
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <div
              onClick={() => setIsEditingQuestion(true)}
              className="text-sm font-semibold cursor-pointer hover:text-primary p-2 -m-2 rounded"
            >
              {level.question}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="space-y-3 mb-6">
          {level.items.map((item) => (
            <div key={item.id}>
              <MenuItemRow
                item={item}
                onUpdate={handleUpdateItem}
                onOpenOperationsModal={onOpenOperationsModal}
                onAddSubmenu={handleAddSubmenu}
                onDelete={() => handleDeleteItem(item.id)}
              />

              {/* Submenu */}
              {item.submenu && (
                <div className="mt-4">
                  <MenuLevelBox
                    level={item.submenu}
                    onUpdate={(updated) =>
                      handleUpdateSubmenu(item.id, updated)
                    }
                    onOpenOperationsModal={onOpenOperationsModal}
                    depth={depth + 1}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new item input */}
        {showNewItemInput ? (
          <input
            type="text"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            onBlur={handleAddItem}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddItem();
            }}
            autoFocus
            placeholder="Novo item..."
            className="w-full rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        ) : (
          <button
            onClick={() => setShowNewItemInput(true)}
            className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Adicionar item
          </button>
        )}
      </div>
    </div>
  );
}

function MenuFlowTab({
  level,
  onUpdate,
  onOpenOperationsModal,
}: {
  level: BotMenuLevel;
  onUpdate: (updated: BotMenuLevel) => void;
  onOpenOperationsModal: (item: BotMenuItem) => void;
}) {
  return (
    <div className="space-y-6">
      <MenuLevelBox
        level={level}
        onUpdate={onUpdate}
        onOpenOperationsModal={onOpenOperationsModal}
        depth={0}
      />
    </div>
  );
}

// ─── Templates Tab ─────────────────────────────────────────────────────

function TemplatesTab({
  templates,
  onDelete,
  onOpenModal,
}: {
  templates: BotTemplate[];
  onDelete: (id: string) => void;
  onOpenModal: (template?: BotTemplate) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Templates de Mensagens</h3>
        <button
          onClick={() => onOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Novo Template
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Título
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                Corpo
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum template criado.
                </td>
              </tr>
            )}
            {templates.map((template) => (
              <tr
                key={template.id}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {template.title}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                  {template.body.substring(0, 50)}
                  {template.body.length > 50 ? "..." : ""}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onOpenModal(template)}
                      className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Editar template"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(template.id)}
                      className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Excluir template"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

type Tab = "flow" | "templates";

export function BotMenuPage() {
  const [activeTab, setActiveTab] = useState<Tab>("flow");
  const [menuLevel, setMenuLevel] = useState<BotMenuLevel>(INITIAL_MENU_LEVEL);
  const [templates, setTemplates] = useState<BotTemplate[]>(INITIAL_TEMPLATES);
  const [operationsModalOpen, setOperationsModalOpen] = useState(false);
  const [selectedItemForOps, setSelectedItemForOps] =
    useState<BotMenuItem | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] =
    useState<BotTemplate | null>(null);

  const handleOpenOperationsModal = (item: BotMenuItem) => {
    setSelectedItemForOps(item);
    setOperationsModalOpen(true);
  };

  const handleConfirmOperations = (operations: BotOperation[]) => {
    if (!selectedItemForOps) return;

    const updateItemRecursive = (
      level: BotMenuLevel
    ): BotMenuLevel => {
      return {
        ...level,
        items: level.items.map((item) => {
          if (item.id === selectedItemForOps.id) {
            return { ...item, operations };
          }
          if (item.submenu) {
            return {
              ...item,
              submenu: updateItemRecursive(item.submenu),
            };
          }
          return item;
        }),
      };
    };

    setMenuLevel(updateItemRecursive(menuLevel));
    setSelectedItemForOps(null);
  };

  const handleSaveTemplate = (template: BotTemplate) => {
    if (selectedTemplateForEdit) {
      setTemplates(
        templates.map((t) => (t.id === template.id ? template : t))
      );
      setSelectedTemplateForEdit(null);
    } else {
      setTemplates([...templates, template]);
    }
    setTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleOpenTemplateModal = (template?: BotTemplate) => {
    setSelectedTemplateForEdit(template || null);
    setTemplateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bot"
        description="Configure menus de atendimento automático e templates de resposta."
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(
          [
            { key: "flow" as const, label: "Fluxo de Menu", icon: <GitBranch size={14} /> },
            { key: "templates" as const, label: "Templates", icon: <FileText size={14} /> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "flow" ? (
        <MenuFlowTab
          level={menuLevel}
          onUpdate={setMenuLevel}
          onOpenOperationsModal={handleOpenOperationsModal}
        />
      ) : (
        <TemplatesTab
          templates={templates}
          onDelete={handleDeleteTemplate}
          onOpenModal={handleOpenTemplateModal}
        />
      )}

      {/* Modals */}
      <OperationsModal
        open={operationsModalOpen}
        onClose={() => setOperationsModalOpen(false)}
        onConfirm={handleConfirmOperations}
        initialOperations={selectedItemForOps?.operations ?? []}
      />

      <TemplateModal
        open={templateModalOpen}
        onClose={() => {
          setTemplateModalOpen(false);
          setSelectedTemplateForEdit(null);
        }}
        onSave={handleSaveTemplate}
        initialTemplate={selectedTemplateForEdit}
      />
    </div>
  );
}
