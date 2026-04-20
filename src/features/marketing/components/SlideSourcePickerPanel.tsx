import { Image, Loader2, Upload, X } from "lucide-react";

interface SlideSourcePickerPanelProps {
  title?: string;
  description?: string;
  onChooseFromGallery: () => void;
  onUpload: () => void;
  isUploading?: boolean;
  onCancel?: () => void;
}

export function SlideSourcePickerPanel({
  title,
  description,
  onChooseFromGallery,
  onUpload,
  isUploading = false,
  onCancel,
}: SlideSourcePickerPanelProps) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-5 shadow-sm">
      {(title || description || onCancel) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            {title ? <h3 className="text-base font-semibold">{title}</h3> : null}
            {description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>

          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md border border-border p-2 hover:bg-accent"
              disabled={isUploading}
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onChooseFromGallery}
          disabled={isUploading}
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center hover:bg-accent transition-colors disabled:opacity-50"
        >
          <Image size={24} className="text-primary" />
          <span className="text-sm font-medium">Escolher da galeria</span>
          <span className="text-xs text-muted-foreground">
            Slides prontos disponibilizados pela plataforma.
          </span>
        </button>

        <button
          type="button"
          onClick={onUpload}
          disabled={isUploading}
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center hover:bg-accent transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 size={24} className="animate-spin text-primary" />
          ) : (
            <Upload size={24} className="text-primary" />
          )}
          <span className="text-sm font-medium">
            {isUploading ? "Enviando..." : "Fazer upload"}
          </span>
          <span className="text-xs text-muted-foreground">
            Envie uma imagem do seu computador.
          </span>
        </button>
      </div>
    </div>
  );
}
