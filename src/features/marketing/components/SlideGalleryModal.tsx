import { useMemo, useState } from "react";
import { Check, Image as ImageIcon, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useCopyUpload,
  useUploadsByType,
} from "@/features/uploads/api/useUploads";
import {
  getUploadViewUrl,
  type UploadResponse,
} from "@/features/uploads/types/uploadTypes";

interface SlideGalleryModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: number;
  entityId: number;
  onPicked: (upload: UploadResponse) => void;
}

export function SlideGalleryModal({
  open,
  onClose,
  tenantId,
  entityId,
  onPicked,
}: SlideGalleryModalProps) {
  const [search, setSearch] = useState("");
  const [pickingId, setPickingId] = useState<string | null>(null);

  const {
    data: uploads = [],
    isLoading,
    isError,
    refetch,
  } = useUploadsByType({ fileType: "SLIDE_SAAS", enabled: open });

  const { copyUpload, isPending: isCopying } = useCopyUpload();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return uploads;
    return uploads.filter((u) =>
      [u.fileName, u.legend ?? ""].some((s) =>
        s.toLowerCase().includes(term),
      ),
    );
  }, [search, uploads]);

  async function handlePick(upload: UploadResponse) {
    if (isCopying) return;
    setPickingId(upload.id);
    try {
      const copied = await copyUpload({
        source: upload,
        targetFileType: "SLIDE_OWN",
        tenantId,
        entityId,
        legend: upload.legend ?? undefined,
      });
      toast.success("Slide adicionado à sua galeria.");
      onPicked(copied);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível copiar o slide. Tente novamente.");
    } finally {
      setPickingId(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold">Galeria de Slides</h2>
          <p className="text-xs text-muted-foreground">
            Escolha um slide da galeria para adicionar à sua landing page.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
          aria-label="Fechar galeria"
        >
          <X size={14} />
          Fechar
        </button>
      </header>

      <div className="border-b border-border px-4 py-3 sm:px-6">
        <div className="relative max-w-md">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou legenda..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-xl border border-border bg-muted"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-sm text-destructive">
              Erro ao carregar a galeria de slides.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
            >
              Tentar novamente
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-muted-foreground">
            <ImageIcon size={36} className="opacity-30" />
            <p className="text-sm">
              {search
                ? "Nenhum slide encontrado para sua busca."
                : "Nenhum slide disponível na galeria."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((upload) => {
              const url = getUploadViewUrl(upload);
              const isPicking = pickingId === upload.id;
              return (
                <div
                  key={upload.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="relative aspect-[16/9] w-full bg-muted">
                    <img
                      src={url}
                      alt={upload.legend ?? upload.fileName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="truncate text-sm font-medium">
                      {upload.legend?.trim() || upload.fileName}
                    </p>
                    <button
                      type="button"
                      disabled={isCopying}
                      onClick={() => void handlePick(upload)}
                      className={cn(
                        "mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                    >
                      {isPicking ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Copiando...
                        </>
                      ) : (
                        <>
                          <Check size={13} />
                          Escolher
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
