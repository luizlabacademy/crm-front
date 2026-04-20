import { useRef, useState } from "react";
import { Camera, Eye, Loader2, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useUploadFile, useUploads } from "@/features/uploads/api/useUploads";
import {
  getUploadViewUrl,
  type UploadFileType,
} from "@/features/uploads/types/uploadTypes";

interface PhotoUploaderProps {
  fileType: UploadFileType;
  tenantId: number;
  entityId: number | null;
  fallbackUrl?: string | null;
  disabled?: boolean;
  displayName?: string | null;
  subtitle?: string | null;
  shape?: "round" | "square";
  size?: "md" | "lg";
}

export function PhotoUploader({
  fileType,
  tenantId,
  entityId,
  fallbackUrl,
  disabled,
  displayName,
  subtitle,
  shape = "round",
  size = "lg",
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const enabledQuery = entityId != null && entityId > 0;

  const { data: uploads = [], isFetching } = useUploads({
    fileType,
    entityId: entityId ?? 0,
    enabled: enabledQuery,
  });
  const uploadMutation = useUploadFile();

  const current = uploads[0] ?? null;
  const currentUrl = current ? getUploadViewUrl(current) : null;
  const displayUrl = preview ?? currentUrl ?? fallbackUrl ?? null;

  function handlePick() {
    if (disabled || !entityId) {
      if (!entityId) {
        toast.info("Salve o cadastro antes de enviar a foto.");
      }
      return;
    }
    inputRef.current?.click();
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !entityId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no maximo 10MB.");
      return;
    }

    const tempUrl = URL.createObjectURL(file);
    setPreview(tempUrl);

    try {
      await uploadMutation.mutateAsync({
        file,
        fileType,
        tenantId,
        entityId,
      });
      toast.success("Foto enviada com sucesso.");
    } catch (err) {
      setPreview(null);
      if (axios.isAxiosError(err) && err.response?.status === 413) {
        toast.error("Arquivo muito grande para o servidor.");
      } else {
        toast.error("Nao foi possivel enviar a foto. Tente novamente.");
      }
    } finally {
      URL.revokeObjectURL(tempUrl);
      setPreview(null);
    }
  }

  const isRound = shape === "round";
  const dimensions = size === "lg" ? "h-24 w-24 sm:h-28 sm:w-28" : "h-16 w-16";
  const shapeClass = isRound ? "rounded-full" : "rounded-2xl";
  const isUploading = uploadMutation.isPending;
  const loading = isUploading || isFetching;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {previewOpen && displayUrl && (
        <button
          type="button"
          onClick={() => setPreviewOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          aria-label="Fechar preview"
        >
          <img
            src={displayUrl}
            alt="Preview"
            className="max-h-[90vh] max-w-[95vw] rounded-lg"
          />
          <span className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white">
            <X size={18} />
          </span>
        </button>
      )}

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => {
            if (displayUrl) setPreviewOpen(true);
          }}
          aria-label="Abrir foto"
          className={cn(
            "group relative overflow-hidden border border-border bg-muted",
            dimensions,
            shapeClass,
            "flex items-center justify-center",
            displayUrl ? "cursor-zoom-in" : "cursor-default",
          )}
        >
          {displayUrl ? (
            <>
              <img
                src={displayUrl}
                alt="Foto"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-black/50 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Eye size={12} />
                  Visualizar
                </span>
              </span>
            </>
          ) : (
            <Camera size={26} className="text-muted-foreground/60" />
          )}
        </button>

        {isUploading && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/40",
              shapeClass,
            )}
          >
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {(displayName || subtitle) && (
          <div className="min-w-0">
            {displayName && (
              <p className="truncate text-lg font-semibold text-foreground">
                {displayName}
              </p>
            )}
            {subtitle && (
              <p className="truncate text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePick}
            disabled={disabled || loading || !entityId}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <Upload size={13} />
            {currentUrl ? "Trocar foto" : "Enviar foto"}
          </button>
          {!entityId && (
            <span className="text-xs text-muted-foreground">
              Salve o cadastro para habilitar o envio.
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => void handleFile(e)}
          className="hidden"
        />
      </div>
    </div>
  );
}

interface PhotoUploaderCompactProps extends PhotoUploaderProps {
  onRemove?: () => void;
}

/** Minimal inline variant used inside cards/tables. */
export function PhotoUploaderCompact({
  fileType,
  tenantId,
  entityId,
  fallbackUrl,
  disabled,
  shape = "round",
  onRemove,
}: PhotoUploaderCompactProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const enabledQuery = entityId != null && entityId > 0;
  const { data: uploads = [] } = useUploads({
    fileType,
    entityId: entityId ?? 0,
    enabled: enabledQuery,
  });
  const uploadMutation = useUploadFile();
  const current = uploads[0] ?? null;
  const url = current ? getUploadViewUrl(current) : fallbackUrl ?? null;
  const shapeClass = shape === "round" ? "rounded-full" : "rounded-lg";

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !entityId) return;
    try {
      await uploadMutation.mutateAsync({
        file,
        fileType,
        tenantId,
        entityId,
      });
      toast.success("Foto enviada.");
    } catch {
      toast.error("Falha ao enviar foto.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || !entityId}
        className={cn(
          "h-10 w-10 overflow-hidden border border-border bg-muted",
          shapeClass,
          "flex items-center justify-center hover:opacity-90 disabled:opacity-50",
        )}
      >
        {url ? (
          <img src={url} alt="Foto" className="h-full w-full object-cover" />
        ) : (
          <Camera size={16} className="text-muted-foreground/60" />
        )}
      </button>
      {onRemove && url && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 size={14} />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => void handleFile(e)}
        className="hidden"
      />
    </div>
  );
}
