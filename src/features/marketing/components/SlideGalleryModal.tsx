import { useEffect, useMemo, useState } from "react";
import { Check, Eye, Image as ImageIcon, Loader2, Search, X } from "lucide-react";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
        sortOrder: 0,
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
      <header className="border-b border-border/80 bg-card px-5 py-3 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Galeria de Slides</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/80 bg-muted/60 px-3 text-sm font-medium text-foreground hover:bg-muted"
            aria-label="Fechar galeria"
          >
            <X size={14} />
            Fechar
          </button>
        </div>

        <div className="mt-3 space-y-2">
          <div className="relative max-w-md">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou legenda..."
              className="h-10 w-full rounded-lg border border-border/80 bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/90 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-muted/10 px-5 py-7 sm:px-7">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[12/5] animate-pulse rounded-xl border border-border/80 bg-muted/70"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <p className="text-base font-medium text-destructive">
              Erro ao carregar a galeria de slides.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg border border-border bg-background px-4 py-2 text-base hover:bg-accent"
            >
              Tentar novamente
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
            <ImageIcon size={36} className="opacity-30" />
            <p className="text-base font-medium leading-relaxed text-foreground/80">
              {search
                ? "Nenhum slide encontrado para sua busca."
                : "Nenhum slide disponível na galeria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {filtered.map((upload) => {
              const url = getUploadViewUrl(upload);
              const isPicking = pickingId === upload.id;
              return (
                <div
                  key={upload.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(url)}
                    className="group/image relative aspect-[12/5] w-full overflow-hidden bg-muted"
                    title="Visualizar imagem"
                  >
                    <img
                      src={url}
                      alt={upload.legend?.trim() || "Slide da galeria"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover/image:bg-black/45">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-black/65 px-3 py-1.5 text-sm font-semibold text-white opacity-0 transition-opacity group-hover/image:opacity-100">
                        <Eye size={15} />
                        Clique para visualizar
                      </div>
                    </div>
                  </button>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    {upload.legend?.trim() ? (
                      <p className="line-clamp-2 text-base font-semibold leading-relaxed text-foreground">
                        {upload.legend}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={isCopying}
                      onClick={() => void handlePick(upload)}
                      className={cn(
                        "mt-auto inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-border/80 bg-muted/70 px-5 text-lg font-semibold text-foreground hover:bg-muted transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                    >
                      {isPicking ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Copiando...
                        </>
                      ) : (
                        <>
                          <Check size={20} />
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

      {previewUrl && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background">
          <header className="flex items-center justify-end border-b border-border px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
              aria-label="Fechar visualização"
            >
              <X size={14} />
              Fechar
            </button>
          </header>

          <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
            <img
              src={previewUrl}
              alt="Visualização do slide"
              className="max-h-full w-full max-w-6xl rounded-xl border border-border object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
