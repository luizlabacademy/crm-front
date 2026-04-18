import { useState } from "react";
import { Trash2, Copy, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Menu } from "../types";

interface MenuNodeCustomProps {
  menu: Menu;
  isSelected: boolean;
  isConnecting: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onUpdate: (menu: Menu) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onStartConnection: (optionIdx: number, nodeId: string) => void;
  onCompleteConnection: () => void;
  onCancelConnection: () => void;
}

export function MenuNodeCustom({
  menu,
  isSelected,
  isConnecting,
  onMouseDown,
  onUpdate,
  onDelete,
  onDuplicate,
  onStartConnection,
  onCancelConnection,
}: MenuNodeCustomProps) {
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [questionValue, setQuestionValue] = useState(menu.question);
  const [editingOptionIdx, setEditingOptionIdx] = useState<number | null>(null);
  const [editingOptionLabel, setEditingOptionLabel] = useState("");
  const [connectingOptionIdx, setConnectingOptionIdx] = useState<number | null>(
    null
  );

  const handleQuestionBlur = () => {
    if (questionValue.trim() !== menu.question) {
      onUpdate({ ...menu, question: questionValue.trim() });
    } else {
      setQuestionValue(menu.question);
    }
    setIsEditingQuestion(false);
  };

  const handleAddOption = () => {
    onUpdate({
      ...menu,
      options: [
        ...menu.options,
        { label: "Nova opção", nextMenuRef: null },
      ],
    });
  };

  const handleUpdateOptionLabel = (idx: number, newLabel: string) => {
    const updatedOptions = [...menu.options];
    updatedOptions[idx].label = newLabel;
    onUpdate({ ...menu, options: updatedOptions });
  };

  const handleDeleteOption = (idx: number) => {
    const updatedOptions = menu.options.filter((_, i) => i !== idx);
    onUpdate({ ...menu, options: updatedOptions });
  };

  const handleStartConnection = (idx: number) => {
    setConnectingOptionIdx(idx);
    onStartConnection(idx, menu.ref);
  };

  return (
    <div
      className={cn(
        "w-80 rounded-lg border-2 shadow-lg transition-all duration-200",
        "bg-white dark:bg-slate-800 cursor-grab active:cursor-grabbing",
        isSelected
          ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900"
          : "border-slate-200 dark:border-slate-700",
        isConnecting && "ring-2 ring-orange-300 dark:ring-orange-900"
      )}
      onMouseDown={onMouseDown}
    >
      {/* Header with Ref Badge */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-t-[5px]">
        <span className="inline-block px-2 py-1 rounded text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          {menu.ref}
        </span>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="rounded p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Duplicar diálogo"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Excluir diálogo"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Question Section */}
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">
            Pergunta
          </label>
          {isEditingQuestion ? (
            <textarea
              value={questionValue}
              onChange={(e) => setQuestionValue(e.target.value)}
              onBlur={handleQuestionBlur}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleQuestionBlur();
                }
              }}
              autoFocus
              rows={3}
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingQuestion(true);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full rounded border border-slate-300 dark:border-slate-600 p-2.5 text-sm text-left leading-relaxed hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              {questionValue || "Clique para editar..."}
            </button>
          )}
        </div>

        {/* Options Section */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
            Opções de Resposta
          </label>
          <div className="space-y-2">
            {menu.options.map((option, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2 p-2 rounded border transition-all",
                  connectingOptionIdx === idx
                    ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartConnection(idx);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={cn(
                    "flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all mt-1",
                    connectingOptionIdx === idx
                      ? "border-orange-500 bg-orange-500"
                      : "border-slate-400 dark:border-slate-500 hover:border-orange-400 dark:hover:border-orange-400"
                  )}
                  title="Conectar a outro diálogo"
                />

                <div className="flex-1 space-y-1">
                  {editingOptionIdx === idx ? (
                    <input
                      type="text"
                      value={editingOptionLabel}
                      onChange={(e) => setEditingOptionLabel(e.target.value)}
                      onBlur={() => {
                        if (editingOptionLabel.trim()) {
                          handleUpdateOptionLabel(idx, editingOptionLabel);
                        }
                        setEditingOptionIdx(null);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editingOptionLabel.trim()) {
                            handleUpdateOptionLabel(idx, editingOptionLabel);
                          }
                          setEditingOptionIdx(null);
                        }
                      }}
                      autoFocus
                      className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingOptionIdx(idx);
                        setEditingOptionLabel(option.label);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full rounded border border-transparent px-2 py-1 text-xs text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-slate-900 dark:text-slate-100"
                    >
                      {option.label || "(vazio)"}
                    </button>
                  )}
                  {option.nextMenuRef && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 px-2">
                      → {option.nextMenuRef}
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOption(idx);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="flex-shrink-0 rounded p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Excluir opção"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddOption();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full rounded border border-dashed border-slate-300 dark:border-slate-600 px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1 mt-2 transition-colors"
          >
            <Plus size={12} />
            Adicionar opção
          </button>
        </div>
      </div>

      {/* Connection indicator */}
      {connectingOptionIdx !== null && (
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-orange-50 dark:bg-orange-900/20 rounded-b-[5px] flex items-center justify-between">
          <span className="text-xs font-medium text-orange-700 dark:text-orange-400">
            Conectando opção "{menu.options[connectingOptionIdx].label}"
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConnectingOptionIdx(null);
              onCancelConnection();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="rounded p-1 hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors"
          >
            <X size={14} className="text-orange-700 dark:text-orange-400" />
          </button>
        </div>
      )}
    </div>
  );
}
