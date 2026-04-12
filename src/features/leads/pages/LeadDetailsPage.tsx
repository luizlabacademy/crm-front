import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Send,
} from "lucide-react";
import {
  useLead,
  useDeleteLead,
  useLeadMessages,
  useSendLeadMessage,
} from "@/features/leads/api/useLeads";
import { useAuthStore } from "@/lib/auth/authStore";
import { formatDateTime } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function decodeJwtSub(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const sub = payload.userId ?? payload.sub;
    const parsed = parseInt(String(sub), 10);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
};

// ─── Message schema ───────────────────────────────────────────────────────────

const messageSchema = z.object({
  message: z.string().min(1, "Mensagem não pode ser vazia"),
  channel: z.string().optional(),
});

type MessageForm = z.infer<typeof messageSchema>;

// ─── Delete modal ─────────────────────────────────────────────────────────────

function DeleteModal({
  onConfirm,
  onCancel,
  isDeleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-destructive mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Confirmar exclusão</p>
            <p className="text-sm text-muted-foreground">
              Deseja excluir este lead? Esta ação não pode ser desfeita.
            </p>
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
            {isDeleting && <RefreshCw size={12} className="animate-spin" />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const leadId = id ? parseInt(id, 10) : null;

  const token = useAuthStore((s) => s.token);
  const currentUserId = decodeJwtSub(token);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: lead,
    isLoading: leadLoading,
    isError: leadError,
  } = useLead(leadId);
  const {
    data: messages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useLeadMessages(leadId);
  const deleteMutation = useDeleteLead();
  const sendMutation = useSendLeadMessage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "", channel: "" },
  });

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleDelete() {
    if (!leadId) return;
    try {
      await deleteMutation.mutateAsync(leadId);
      toast.success("Lead excluído com sucesso.");
      void navigate("/leads");
    } catch {
      toast.error("Erro ao excluir lead. Tente novamente.");
      setShowDeleteModal(false);
    }
  }

  async function onSendMessage(values: MessageForm) {
    if (!leadId) return;
    try {
      await sendMutation.mutateAsync({
        leadId,
        body: {
          message: values.message,
          channel: values.channel || null,
          createdByUserId: currentUserId,
        },
      });
      reset();
    } catch {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    }
  }

  // Loading state
  if (leadLoading) {
    return (
      <div className="space-y-5 max-w-3xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-full animate-pulse rounded bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error / not found
  if (leadError || !lead) {
    return (
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-2xl font-semibold">Lead não encontrado</h1>
        <p className="text-muted-foreground">
          O lead solicitado não existe ou não está disponível.
        </p>
        <button
          type="button"
          onClick={() => void navigate("/leads")}
          className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar à listagem
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void navigate("/leads")}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Lead #{lead.id}</h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1",
                STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-700",
              )}
            >
              {lead.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void navigate(`/leads/${lead.id}/edit`)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Pencil size={13} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-3 py-1.5 text-sm hover:bg-destructive/20 transition-colors"
          >
            <Trash2 size={13} />
            Excluir
          </button>
        </div>
      </div>

      {/* Lead info card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dados do lead
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Funil (Flow ID)</dt>
            <dd className="font-medium">{lead.flowId}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Cliente</dt>
            <dd className="font-medium">
              {lead.customerId != null ? (
                <Link
                  to={`/customers/${lead.customerId}`}
                  className="text-primary hover:underline"
                >
                  #{lead.customerId}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fonte</dt>
            <dd className="font-medium">{lead.source ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Valor estimado</dt>
            <dd className="font-medium">
              {formatCents(lead.estimatedValueCents)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Criado em</dt>
            <dd className="font-medium">{formatDateTime(lead.createdAt)}</dd>
          </div>
          {lead.updatedAt && (
            <div>
              <dt className="text-muted-foreground">Atualizado em</dt>
              <dd className="font-medium">{formatDateTime(lead.updatedAt)}</dd>
            </div>
          )}
          {lead.notes && (
            <div className="col-span-2">
              <dt className="text-muted-foreground">Notas</dt>
              <dd className="font-medium whitespace-pre-wrap">{lead.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Messages section */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Histórico de mensagens</h2>
          <button
            type="button"
            onClick={() => void refetchMessages()}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Atualizar"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Message list */}
        <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-5 space-y-3">
          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2
                size={20}
                className="animate-spin text-muted-foreground"
              />
            </div>
          ) : !messages || messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhuma mensagem registrada.
            </p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-0.5">
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
                <p className="text-xs text-muted-foreground px-1">
                  {msg.channel && (
                    <span className="font-medium">{msg.channel} · </span>
                  )}
                  {formatDateTime(msg.createdAt)}
                  {msg.createdByUserId && (
                    <span> · Usuário #{msg.createdByUserId}</span>
                  )}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send message form */}
        <form
          onSubmit={handleSubmit(onSendMessage)}
          className="border-t border-border px-5 py-4 space-y-3"
        >
          <div className="flex gap-2">
            <input
              type="text"
              {...register("channel")}
              placeholder="Canal (WhatsApp, Email, Telefone...)"
              className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
          <div className="flex gap-2">
            <textarea
              {...register("message")}
              rows={2}
              disabled={sendMutation.isPending}
              placeholder="Digite uma mensagem..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 resize-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="flex items-center gap-1.5 self-end rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sendMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Enviar
            </button>
          </div>
          {errors.message && (
            <p className="text-xs text-destructive">{errors.message.message}</p>
          )}
        </form>
      </div>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={() => void handleDelete()}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
