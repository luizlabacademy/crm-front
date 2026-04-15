import { AlertCircle, RefreshCw } from "lucide-react";

interface ConfirmDeleteModalProps {
  /**
   * Mensagem de descrição. Aceita ReactNode para texto rico.
   * Exemplo: <>Deseja excluir o cliente <strong>{name}</strong>?</>
   */
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  /** Sobrescreve o rótulo do botão de confirmação. Padrão: "Excluir". */
  confirmLabel?: string;
}

export function ConfirmDeleteModal({
  description,
  onConfirm,
  onCancel,
  isDeleting,
  confirmLabel = "Excluir",
}: ConfirmDeleteModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={20}
            className="text-destructive mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p id="delete-modal-title" className="text-sm font-semibold">
              Confirmar exclusão
            </p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-destructive/90 text-white px-3 py-1.5 text-sm hover:bg-destructive transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isDeleting && (
              <RefreshCw
                size={12}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
