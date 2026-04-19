import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  addEdge,
  Background,
  Controls,
  type Connection,
  type Edge,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import {
  BOT_OPERATION,
  BOT_OPTION_TYPE,
  type BotFlowState,
  type BotOperation,
  type Menu,
} from "../types";

type MenuNodeData = Record<string, unknown> & {
  menu: Menu;
  onUpdate: (menu: Menu) => void;
  onDelete: () => void;
};

interface FlowCanvasProps {
  flowState: BotFlowState;
  onUpdate: (flowState: BotFlowState) => void;
}

const OPERATION_OPTIONS: { value: BotOperation; label: string }[] = [
  {
    value: BOT_OPERATION.LIST_HAIR_SERVICES,
    label: "Exibir serviços de cabeleireiro",
  },
  {
    value: BOT_OPERATION.LIST_NAIL_SERVICES,
    label: "Exibir serviços de manicure/pedicure",
  },
  { value: BOT_OPERATION.LIST_ALL_SERVICES, label: "Exibir todos os serviços" },
  {
    value: BOT_OPERATION.LIST_AVAILABLE_TIMES,
    label: "Exibir horários disponíveis",
  },
  {
    value: BOT_OPERATION.LIST_AVAILABLE_PROFESSIONALS,
    label: "Exibir profissionais disponíveis",
  },
  { value: BOT_OPERATION.FINISH_SCHEDULING, label: "Finalizar agendamento" },
  { value: BOT_OPERATION.CANCEL_SCHEDULING, label: "Cancelar agendamento" },
];

const isSubmenuOption = (option: Menu["options"][number]) =>
  option.type !== BOT_OPTION_TYPE.OPERATION;

function MenuNode({
  data,
  selected,
}: {
  data: MenuNodeData;
  selected: boolean;
}) {
  const [questionDraft, setQuestionDraft] = useState(data.menu.question);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);

  useEffect(() => {
    setQuestionDraft(data.menu.question);
  }, [data.menu.question]);

  const handleQuestionCommit = () => {
    const nextQuestion = questionDraft.trim() || "Nova pergunta?";
    if (nextQuestion !== data.menu.question) {
      data.onUpdate({ ...data.menu, question: nextQuestion });
    }
    setIsEditingQuestion(false);
  };

  const handleAddOption = () => {
    data.onUpdate({
      ...data.menu,
      options: [
        ...data.menu.options,
        {
          label: "Digire o nome do submenu",
          type: BOT_OPTION_TYPE.SUBMENU,
          nextMenuRef: null,
          operation: null,
        },
      ],
    });
  };

  const handleOptionModeChange = (index: number, mode: string) => {
    const options = [...data.menu.options];

    if (mode === BOT_OPTION_TYPE.SUBMENU) {
      options[index] = {
        ...options[index],
        type: BOT_OPTION_TYPE.SUBMENU,
        operation: null,
        nextMenuRef: options[index].nextMenuRef,
      };
      data.onUpdate({ ...data.menu, options });
      return;
    }

    const selectedOperation = mode as BotOperation;
    if (options[index].nextMenuRef) {
      toast.warning(
        "Para ações diferentes de 'Abrir submenu', não é necessário criar submenus manualmente. O sistema cria esse fluxo automaticamente.",
      );
    }

    options[index] = {
      ...options[index],
      type: BOT_OPTION_TYPE.OPERATION,
      operation: selectedOperation,
      nextMenuRef: null,
    };

    data.onUpdate({ ...data.menu, options });
  };

  const handleOptionLabelChange = (index: number, label: string) => {
    const options = [...data.menu.options];
    options[index] = { ...options[index], label };
    data.onUpdate({ ...data.menu, options });
  };

  const handleOptionDelete = (index: number) => {
    const options = data.menu.options.filter((_, optionIndex) => optionIndex !== index);
    data.onUpdate({ ...data.menu, options });
  };

  return (
    <div
      className={cn(
        "w-80 rounded-xl border bg-card shadow-md",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
          {data.menu.ref}
        </span>
        <button
          type="button"
          onClick={data.onDelete}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Excluir menu"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Pergunta
          </label>
          {isEditingQuestion ? (
            <textarea
              value={questionDraft}
              onChange={(event) => setQuestionDraft(event.target.value)}
              onBlur={handleQuestionCommit}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  handleQuestionCommit();
                }
              }}
              rows={3}
              autoFocus
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingQuestion(true)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/40"
            >
              {data.menu.question}
            </button>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Opções</p>
          {data.menu.options.map((option, index) => (
            <div
              key={`${data.menu.ref}-option-${index}`}
              className="relative space-y-1.5 rounded-lg border border-border bg-background px-2 py-1.5"
            >
              <div className="flex items-center gap-2">
                <input
                  value={option.label}
                  onChange={(event) =>
                    handleOptionLabelChange(index, event.target.value)
                  }
                  className="flex-1 bg-transparent px-1 text-xs text-foreground outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleOptionDelete(index)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remover opção"
                >
                  <Trash2 size={12} />
                </button>

                {isSubmenuOption(option) && (
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`opt-${index}`}
                    className="!h-3 !w-3 !border-2 !border-white !bg-primary"
                  />
                )}
              </div>

              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Ação:
                </span>
                <select
                  value={
                    option.type === BOT_OPTION_TYPE.OPERATION
                      ? (option.operation ?? BOT_OPERATION.LIST_ALL_SERVICES)
                      : BOT_OPTION_TYPE.SUBMENU
                  }
                  onChange={(event) =>
                    handleOptionModeChange(index, event.target.value)
                  }
                  className="h-7 flex-1 rounded border border-input bg-background px-2 text-[11px] text-foreground outline-none"
                >
                  <option value={BOT_OPTION_TYPE.SUBMENU}>Abrir submenu</option>
                  {OPERATION_OPTIONS.map((operationOption) => (
                    <option key={operationOption.value} value={operationOption.value}>
                      {operationOption.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddOption}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <Plus size={12} />
            Adicionar opção
          </button>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-white !bg-slate-400"
      />
    </div>
  );
}

function buildInitialNodes(flowState: BotFlowState): Node<MenuNodeData>[] {
  const HORIZONTAL_GAP = 460;
  const VERTICAL_GAP = 270;
  const menuByRef = new Map(flowState.menus.map((menu) => [menu.ref, menu]));
  const visited = new Set<string>();
  const depthByRef = new Map<string, number>();
  const queue: string[] = [];

  if (menuByRef.has(flowState.initialMenuRef)) {
    queue.push(flowState.initialMenuRef);
    depthByRef.set(flowState.initialMenuRef, 0);
  }

  while (queue.length > 0) {
    const currentRef = queue.shift();
    if (!currentRef || visited.has(currentRef)) {
      continue;
    }

    visited.add(currentRef);
    const currentDepth = depthByRef.get(currentRef) ?? 0;
    const currentMenu = menuByRef.get(currentRef);

    if (!currentMenu) {
      continue;
    }

    currentMenu.options.forEach((option) => {
      if (!isSubmenuOption(option) || !option.nextMenuRef || !menuByRef.has(option.nextMenuRef)) {
        return;
      }

      const knownDepth = depthByRef.get(option.nextMenuRef);
      const nextDepth = currentDepth + 1;

      if (knownDepth === undefined || nextDepth < knownDepth) {
        depthByRef.set(option.nextMenuRef, nextDepth);
      }

      if (!visited.has(option.nextMenuRef)) {
        queue.push(option.nextMenuRef);
      }
    });
  }

  let fallbackDepth =
    depthByRef.size > 0 ? Math.max(...depthByRef.values()) + 1 : 0;

  flowState.menus.forEach((menu) => {
    if (!depthByRef.has(menu.ref)) {
      depthByRef.set(menu.ref, fallbackDepth);
      fallbackDepth += 1;
    }
  });

  const menusByDepth = new Map<number, Menu[]>();
  flowState.menus.forEach((menu) => {
    const depth = depthByRef.get(menu.ref) ?? 0;
    const levelMenus = menusByDepth.get(depth) ?? [];
    levelMenus.push(menu);
    menusByDepth.set(depth, levelMenus);
  });

  const orderedDepths = [...menusByDepth.keys()].sort((a, b) => a - b);
  const positionedNodes: Node<MenuNodeData>[] = [];

  orderedDepths.forEach((depth) => {
    const levelMenus = menusByDepth
      .get(depth)
      ?.sort((first, second) => first.ref.localeCompare(second.ref));

    if (!levelMenus) {
      return;
    }

    levelMenus.forEach((menu, index) => {
      positionedNodes.push({
        id: menu.ref,
        type: "menuNode",
        position: { x: depth * HORIZONTAL_GAP, y: index * VERTICAL_GAP },
        data: {
          menu,
          onUpdate: () => undefined,
          onDelete: () => undefined,
        },
      });
    });
  });

  return positionedNodes;
}

function buildInitialEdges(flowState: BotFlowState): Edge[] {
  return flowState.menus.flatMap((menu) => {
    const menuEdges: Edge[] = [];

    menu.options.forEach((option, optionIndex) => {
      if (!isSubmenuOption(option) || !option.nextMenuRef) {
        return;
      }

      menuEdges.push({
        id: `edge-${menu.ref}-${optionIndex}`,
        source: menu.ref,
        target: option.nextMenuRef,
        sourceHandle: `opt-${optionIndex}`,
        animated: true,
      });
    });

    return menuEdges;
  });
}

export function FlowCanvas({ flowState, onUpdate }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<MenuNodeData>>(
    buildInitialNodes(flowState),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildInitialEdges(flowState));

  const nodeTypes = useMemo(() => ({ menuNode: MenuNode }), []);

  const updateMenuNode = useCallback(
    (menuRef: string, updatedMenu: Menu) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === menuRef
            ? {
                ...node,
                data: {
                  ...node.data,
                  menu: updatedMenu,
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const deleteMenuNode = useCallback(
    (menuRef: string) => {
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== menuRef));
      setEdges((prevEdges) =>
        prevEdges.filter((edge) => edge.source !== menuRef && edge.target !== menuRef),
      );
    },
    [setEdges, setNodes],
  );

  const flowNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onUpdate: (menu: Menu) => updateMenuNode(node.id, menu),
          onDelete: () => deleteMenuNode(node.id),
        },
      })),
    [deleteMenuNode, nodes, updateMenuNode],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.sourceHandle) {
        return;
      }

      const sourceNode = flowNodes.find((node) => node.id === connection.source);
      const optionIndex = Number(connection.sourceHandle.replace("opt-", ""));
      const sourceOption = sourceNode?.data.menu.options[optionIndex];

      if (!sourceOption || sourceOption.type === BOT_OPTION_TYPE.OPERATION) {
        window.alert(
          "Esta opção está configurada como ação. Não é necessário criar submenu: o sistema cria automaticamente o fluxo desse tipo de ação.",
        );
        return;
      }

      setEdges((prevEdges) => {
        const filteredEdges = prevEdges.filter(
          (edge) =>
            !(
              edge.source === connection.source &&
              edge.sourceHandle === connection.sourceHandle
            ),
        );

        return addEdge(
          {
            ...connection,
            id: `edge-${connection.source}-${connection.sourceHandle ?? "default"}`,
            animated: true,
          },
          filteredEdges,
        );
      });
    },
    [flowNodes, setEdges],
  );

  useEffect(() => {
    const validSourceHandles = new Set<string>();

    flowNodes.forEach((node) => {
      node.data.menu.options.forEach((option, index) => {
        if (isSubmenuOption(option)) {
          validSourceHandles.add(`${node.id}|opt-${index}`);
        }
      });
    });

    setEdges((prevEdges) => {
      const filteredEdges = prevEdges.filter((edge) =>
        validSourceHandles.has(`${edge.source}|${edge.sourceHandle ?? ""}`),
      );

      return filteredEdges.length === prevEdges.length ? prevEdges : filteredEdges;
    });
  }, [flowNodes, setEdges]);

  const handleAddNode = () => {
    const menuRef = `MENU_${Date.now()}`;
    const maxY = Math.max(
      0,
      ...nodes.map((node) =>
        typeof node.position.y === "number" ? node.position.y : 0,
      ),
    );

    setNodes((prevNodes) => [
      ...prevNodes,
      {
        id: menuRef,
        type: "menuNode",
        position: { x: 0, y: maxY + 280 },
        data: {
          menu: { ref: menuRef, question: "Nova pergunta?", options: [] },
          onUpdate: () => undefined,
          onDelete: () => undefined,
        },
      },
    ]);
  };

  useEffect(() => {
    const nextMenus = flowNodes.map((node) => {
      const options = node.data.menu.options.map((option, index) => {
        if (!isSubmenuOption(option)) {
          return {
            ...option,
            nextMenuRef: null,
          };
        }

        const edge = edges.find(
          (flowEdge) =>
            flowEdge.source === node.id && flowEdge.sourceHandle === `opt-${index}`,
        );

        return {
          ...option,
          nextMenuRef: edge?.target ?? null,
        };
      });

      return {
        ...node.data.menu,
        options,
      };
    });

    onUpdate({
      initialMenuRef:
        nextMenus.find((menu) => menu.ref === flowState.initialMenuRef)?.ref ??
        nextMenus[0]?.ref ??
        flowState.initialMenuRef,
      menus: nextMenus,
    });
  }, [edges, flowNodes, flowState.initialMenuRef, onUpdate]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <button
        type="button"
        onClick={handleAddNode}
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-md transition-opacity hover:opacity-90"
      >
        <Plus size={14} />
        Novo Submenu
      </button>

      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
