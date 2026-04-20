import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUploadFile, useUploads } from "@/features/uploads/api/useUploads";
import {
  getUploadViewUrl,
  type UploadFileType,
} from "@/features/uploads/types/uploadTypes";

interface PhotoGalleryProps {
  fileType: UploadFileType;
  tenantId: number;
  entityId: number | null;
  fallbackUrls?: string[];
  disabled?: boolean;
  maxPhotos?: number;
}

export function PhotoGallery({
  fileType,
  tenantId,
  entityId,
  fallbackUrls = [],
  disabled,
  maxPhotos = 10,
}: PhotoGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const enabledQuery = entityId != null && entityId > 0;

  const { data: uploads = [], isFetching } = useUploads({
    fileType,
    entityId: entityId ?? 0,
    enabled: enabledQuery,
  });
  const uploadMutation = useUploadFile();

  const items =
    uploads.length > 0
      ? uploads.map((u) => ({
          id: u.id,
          url: getUploadViewUrl(u),
          legend: u.legend ?? null,
        }))
      : fallbackUrls.map((url, i) => ({
          id: `fallback-${i}`,
          url,
          legend: null,
        }));

  const canAddMore = items.length < maxPhotos;

  function handlePick() {
    if (disabled || !entityId) {
      if (!entityId) toast.info("Salve o cadastro antes de enviar fotos.");
      return;
    }
    inputRef.current?.click();
  }

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || !entityId) return;

    const available = Math.max(0, maxPhotos - items.length);
    const toUpload = files.slice(0, available);
    if (toUpload.length < files.length) {
      toast.warning(`Limite de ${maxPhotos} fotos. Enviando apenas ${toUpload.length}.`);
    }

    let nextSort = items.length;
    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) {
        toast.error(`Arquivo ${file.name} nao e uma imagem.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Arquivo ${file.name} excede 10MB.`);
        continue;
      }
      try {
        await uploadMutation.mutateAsync({
          file,
          fileType,
          tenantId,
          entityId,
          sortOrder: nextSort,
        });
        nextSort += 1;
      } catch {
        toast.error(`Falha ao enviar ${file.name}.`);
      }
    }
    toast.success("Fotos enviadas.");
  }

  const isUploading = uploadMutation.isPending;

  return (
    <div className="space-y-3">
      {previewUrl && (
        <button
          type="button"
          onClick={() => setPreviewUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          aria-label="Fechar preview"
        >
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-[90vh] max-w-[95vw] rounded-lg"
          />
          <span className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white">
            <X size={18} />
          </span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setPreviewUrl(item.url)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted transition-transform hover:scale-[1.01]"
          >
            <img
              src={item.url}
              alt={item.legend ?? "Foto"}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            {item.legend && (
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-[11px] text-white">
                {item.legend}
              </span>
            )}
          </button>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={handlePick}
            disabled={disabled || isUploading || !entityId}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/40 text-xs text-muted-foreground transition-colors",
              "hover:bg-accent hover:border-primary/40",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {isUploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {items.length === 0 ? (
                  <ImagePlus size={24} />
                ) : (
                  <Plus size={20} />
                )}
                <span>
                  {items.length === 0 ? "Adicionar fotos" : "Adicionar"}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {items.length === 0 && !canAddMore && (
        <p className="text-xs text-muted-foreground">Nenhuma foto cadastrada.</p>
      )}

      {!entityId && (
        <p className="text-xs text-muted-foreground">
          Salve o cadastro para habilitar o envio de fotos.
        </p>
      )}

      {isFetching && !isUploading && entityId && (
        <p className="text-[11px] text-muted-foreground">Carregando fotos...</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => void handleFiles(e)}
        className="hidden"
      />
    </div>
  );
}
