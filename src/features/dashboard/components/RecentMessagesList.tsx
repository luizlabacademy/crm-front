import { useNavigate, Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { formatRelative } from "@/lib/utils/formatDate";
import type { RecentMessage } from "@/features/dashboard/types/dashboardTypes";

interface RecentMessagesListProps {
  messages: RecentMessage[];
  isLoading?: boolean;
}

/** Derives a stable background color class from the customer name. */
function avatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-amber-500",
    "bg-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return colors[hash % colors.length];
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function sentimentClass(sentiment?: RecentMessage["sentiment"]): string {
  if (sentiment === "hot") return "bg-red-500";
  if (sentiment === "warm") return "bg-amber-500";
  return "bg-slate-400";
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-3 w-12 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function RecentMessagesList({
  messages,
  isLoading = false,
}: RecentMessagesListProps) {
  const navigate = useNavigate();
  const unreadTotal = messages.reduce(
    (sum, item) => sum + (item.unreadCount ?? 0),
    0,
  );

  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Conversas</h2>
          <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {unreadTotal} não lidas
          </span>
        </div>
        <Link
          to="/conversations"
          className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
        >
          Ver mais
          <ArrowRight size={12} />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5">
              <SkeletonRow />
            </div>
          ))
        ) : messages.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nenhuma mensagem recente.
          </p>
        ) : (
          messages.map((msg) => (
            <button
              key={msg.id}
              type="button"
              onClick={() => void navigate(`/leads/${msg.leadId}`)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-accent/50 transition-colors"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor(msg.customerName)}`}
              >
                {initial(msg.customerName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${sentimentClass(msg.sentiment)}`}
                  />
                  <p className="truncate text-sm font-medium">
                    {msg.customerName}
                  </p>
                  {msg.channel && (
                    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {msg.channel}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {msg.preview}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelative(msg.createdAt)}
                </span>
                {(msg.unreadCount ?? 0) > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {msg.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
