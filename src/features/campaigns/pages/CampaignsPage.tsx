import { useState } from "react";
import {
  Megaphone,
  MessageSquare,
  Mail,
  Users,
  Plus,
  Search,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart2,
  Eye,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  getCampaigns,
  getContactLists,
  type MockCampaign,
  type MockContactList,
} from "@/mocks/mockApi";

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignChannel = "whatsapp" | "email";
type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

type Campaign = MockCampaign;
type ContactList = MockContactList;

// ─── Mock Data (from centralized mocks — replace with React Query hooks) ────

let MOCK_CAMPAIGNS: Campaign[] = [];
let MOCK_LISTS: ContactList[] = [];

// Eagerly load mock data (will be replaced by useQuery)
void getCampaigns().then((d) => {
  MOCK_CAMPAIGNS = d;
});
void getContactLists().then((d) => {
  MOCK_LISTS = d;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Rascunho",
  scheduled: "Agendada",
  sending: "Enviando",
  sent: "Enviada",
  failed: "Falhou",
};

const STATUS_ICON: Record<CampaignStatus, React.ReactNode> = {
  draft: <Clock size={12} />,
  scheduled: <Clock size={12} />,
  sending: <Send size={12} className="animate-pulse" />,
  sent: <CheckCircle2 size={12} />,
  failed: <XCircle size={12} />,
};

const STATUS_CLASS: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  sending: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const CHANNEL_LABEL: Record<CampaignChannel, string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
};

const CHANNEL_ICON: Record<CampaignChannel, React.ReactNode> = {
  whatsapp: <MessageSquare size={14} />,
  email: <Mail size={14} />,
};

const CHANNEL_CLASS: Record<CampaignChannel, string> = {
  whatsapp: "text-emerald-600",
  email: "text-sky-600",
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function StatsBar({ campaigns }: { campaigns: Campaign[] }) {
  const total = campaigns.length;
  const sent = campaigns.filter((c) => c.status === "sent").length;
  const totalRecipients = campaigns.reduce((s, c) => s + c.totalCount, 0);
  const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0);
  const avgOpen =
    campaigns.filter((c) => c.openRate != null).length > 0
      ? Math.round(
          campaigns.reduce((s, c) => s + (c.openRate ?? 0), 0) /
            campaigns.filter((c) => c.openRate != null).length,
        )
      : 0;

  const stats = [
    {
      label: "Total de Campanhas",
      value: total,
      icon: <Megaphone size={16} />,
    },
    { label: "Enviadas", value: sent, icon: <CheckCircle2 size={16} /> },
    {
      label: "Total de Destinatarios",
      value: totalRecipients.toLocaleString("pt-BR"),
      icon: <Users size={16} />,
    },
    {
      label: "Mensagens Entregues",
      value: totalSent.toLocaleString("pt-BR"),
      icon: <Send size={16} />,
    },
    {
      label: "Taxa Media de Abertura",
      value: `${avgOpen}%`,
      icon: <BarChart2 size={16} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-border bg-card p-4 space-y-1"
        >
          <div className="text-muted-foreground">{s.icon}</div>
          <div className="text-xl font-bold text-foreground">{s.value}</div>
          <div className="text-xs text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "campaigns" | "lists";

// ─── Campaigns Table ──────────────────────────────────────────────────────────

function CampaignsTab({
  search,
  channelFilter,
}: {
  search: string;
  channelFilter: CampaignChannel | "all";
}) {
  const filtered = MOCK_CAMPAIGNS.filter((c) => {
    const matchSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.listName.toLowerCase().includes(search.toLowerCase());
    const matchChannel = channelFilter === "all" || c.channel === channelFilter;
    return matchSearch && matchChannel;
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
              Campanha
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
              Canal
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
              Lista
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground hidden lg:table-cell">
              Enviados
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground hidden lg:table-cell">
              Abertura
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground hidden xl:table-cell">
              Data
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
              Acoes
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-10 text-center text-sm text-muted-foreground"
              >
                Nenhuma campanha encontrada.
              </td>
            </tr>
          )}
          {filtered.map((c) => (
            <tr
              key={c.id}
              className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {c.name}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span
                  className={cn(
                    "flex items-center gap-1 w-fit",
                    CHANNEL_CLASS[c.channel],
                  )}
                >
                  {CHANNEL_ICON[c.channel]}
                  <span className="text-xs">{CHANNEL_LABEL[c.channel]}</span>
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                {c.listName}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_CLASS[c.status],
                  )}
                >
                  {STATUS_ICON[c.status]}
                  {STATUS_LABEL[c.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden lg:table-cell">
                {c.sentCount.toLocaleString("pt-BR")} /{" "}
                {c.totalCount.toLocaleString("pt-BR")}
              </td>
              <td className="px-4 py-3 text-right text-xs hidden lg:table-cell">
                {c.openRate != null ? (
                  <span className="text-foreground font-medium">
                    {c.openRate}%
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden xl:table-cell">
                {c.sentAt ? fmtDate(c.sentAt) : fmtDate(c.scheduledAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Lists Tab ────────────────────────────────────────────────────────────────

function ListsTab({
  search,
  channelFilter,
}: {
  search: string;
  channelFilter: CampaignChannel | "all";
}) {
  const filtered = MOCK_LISTS.filter((l) => {
    const matchSearch =
      search === "" || l.name.toLowerCase().includes(search.toLowerCase());
    const matchChannel = channelFilter === "all" || l.channel === channelFilter;
    return matchSearch && matchChannel;
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
              Lista
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
              Canal
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
              Contatos
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground hidden sm:table-cell">
              Criada em
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
              Acoes
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-10 text-center text-sm text-muted-foreground"
              >
                Nenhuma lista encontrada.
              </td>
            </tr>
          )}
          {filtered.map((l) => (
            <tr
              key={l.id}
              className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                <div className="flex items-center gap-2">{l.name}</div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "flex items-center gap-1 w-fit",
                    CHANNEL_CLASS[l.channel],
                  )}
                >
                  {CHANNEL_ICON[l.channel]}
                  <span className="text-xs">{CHANNEL_LABEL[l.channel]}</span>
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="flex items-center justify-end gap-1 text-sm text-foreground">
                  <Users size={13} className="text-muted-foreground" />
                  {l.contactCount.toLocaleString("pt-BR")}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                {fmtDate(l.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Ver contatos"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Excluir lista"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CampaignsPage() {
  const [tab, setTab] = useState<Tab>("campaigns");
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<CampaignChannel | "all">(
    "all",
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Campanhas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            WhatsApp Marketing, E-mail Marketing e Listas de Transmissao
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus size={16} />
          Nova Campanha
        </button>
      </div>

      {/* Stats */}
      <StatsBar campaigns={MOCK_CAMPAIGNS} />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(
          [
            {
              key: "campaigns",
              label: "Campanhas",
              icon: <Megaphone size={14} />,
            },
            {
              key: "lists",
              label: "Listas de Contatos",
              icon: <Users size={14} />,
            },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              tab === "campaigns" ? "Buscar campanhas..." : "Buscar listas..."
            }
            className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Channel filter chips */}
        <div className="flex items-center gap-1.5">
          {(
            [
              { value: "all", label: "Todos" },
              { value: "whatsapp", label: "WhatsApp" },
              { value: "email", label: "E-mail" },
            ] as { value: CampaignChannel | "all"; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setChannelFilter(opt.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                channelFilter === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === "campaigns" ? (
        <CampaignsTab search={search} channelFilter={channelFilter} />
      ) : (
        <ListsTab search={search} channelFilter={channelFilter} />
      )}
    </div>
  );
}
