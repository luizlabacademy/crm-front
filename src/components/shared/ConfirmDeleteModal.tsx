import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/shared/Button";

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
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && (
              <RefreshCw
                size={12}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
