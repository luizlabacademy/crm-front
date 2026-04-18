import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Search,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  MarketingCampaign,
  CampaignType,
  CampaignStatus,
  CreateCampaignPayload,
} from "@/features/marketing/types/marketingTypes";
import campaignsData from "@/mocks/GET-marketing--all-campaigns.json";
import { CreateCampaignModal } from "./CreateCampaignModal";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

// ─── Mock service (substitui futura API) ──────────────────────────────────────

function useCampaigns() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(
    campaignsData.responseBody as unknown as MarketingCampaign[],
  );

  function addCampaign(payload: CreateCampaignPayload): MarketingCampaign {
    const newCampaign: MarketingCampaign = {
      id: `camp-${Date.now()}`,
      name: payload.name,
      type: payload.type,
      status: "Ativa",
      createdAt: new Date().toISOString(),
      destination: payload.destination,
      audience: payload.audience,
      templateId: payload.templateId,
      metrics: { sent: 0, delivered: 0, replied: 0, converted: 0, clicked: 0 },
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    return newCampaign;
  }

  return { campaigns, addCampaign };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<CampaignStatus, { label: string; cls: string }> = {
  Ativa: { label: "Ativa", cls: "bg-emerald-100 text-emerald-800" },
  Pausada: { label: "Pausada", cls: "bg-yellow-100 text-yellow-800" },
  Finalizada: { label: "Finalizada", cls: "bg-muted text-muted-foreground" },
};

const TYPE_BADGE: Record<CampaignType, string> = {
  Remarketing: "bg-blue-100 text-blue-800",
  Recovery: "bg-violet-100 text-violet-800",
  "Re-engagement": "bg-orange-100 text-orange-800",
};

function fmtDate(iso: string) {
  try {
    return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

// ─── Metrics summary (top bar) ────────────────────────────────────────────────

function MetricsSummary({ campaigns }: { campaigns: MarketingCampaign[] }) {
  const totSent = campaigns.reduce((s, c) => s + c.metrics.sent, 0);
  const totReplied = campaigns.reduce((s, c) => s + c.metrics.replied, 0);
  const totConverted = campaigns.reduce((s, c) => s + c.metrics.converted, 0);
  const replyRate = totSent > 0 ? Math.round((totReplied / totSent) * 100) : 0;
  const convRate = totSent > 0 ? Math.round((totConverted / totSent) * 100) : 0;

  const items = [
    {
      label: "Enviados",
      value: totSent.toLocaleString("pt-BR"),
      icon: <MessageSquare size={16} />,
      color: "text-blue-600",
    },
    {
      label: "Respondidos",
      value: totReplied.toLocaleString("pt-BR"),
      icon: <TrendingUp size={16} />,
      color: "text-violet-600",
    },
    {
      label: "Convertidos",
      value: totConverted.toLocaleString("pt-BR"),
      icon: <CheckCircle2 size={16} />,
      color: "text-emerald-600",
    },
    {
      label: "Taxa de Resposta",
      value: `${replyRate}%`,
      icon: <TrendingUp size={16} />,
      color: "text-orange-600",
    },
    {
      label: "Taxa de Conversão",
      value: `${convRate}%`,
      icon: <CheckCircle2 size={16} />,
      color: "text-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-card p-4 space-y-1"
        >
          <div className={item.color}>{item.icon}</div>
          <div className="text-xl font-bold text-foreground">{item.value}</div>
          <div className="text-xs text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Campaign Row ─────────────────────────────────────────────────────────────

function CampaignRow({
  campaign,
  onNavigate,
}: {
  campaign: MarketingCampaign;
  onNavigate: (id: string, name: string) => void;
}) {
  const badge = STATUS_BADGE[campaign.status];

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{campaign.name}</span>
          <span className="text-[11px] text-muted-foreground">
            {fmtDate(campaign.createdAt)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            TYPE_BADGE[campaign.type],
          )}
        >
          {campaign.type}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            badge.cls,
          )}
        >
          {badge.label}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">
          {campaign.metrics.sent.toLocaleString("pt-BR")} enviados
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {campaign.metrics.replied.toLocaleString("pt-BR")} respondidos
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs font-medium text-foreground">
          {campaign.metrics.converted.toLocaleString("pt-BR")} convertidos
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onNavigate(campaign.id, campaign.name)}
          className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-auto"
          title="Ver board de leads"
        >
          Ver Leads
          <ChevronRight size={13} />
        </button>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MarketingCampaignsPage() {
  const navigate = useNavigate();
  const { campaigns, addCampaign } = useCampaigns();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CampaignType | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());

  const filtered = useMemo(
    () =>
      campaigns.filter((c) => {
        const matchSearch =
          search === "" || c.name.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || c.type === typeFilter;
        return matchSearch && matchType;
      }),
    [campaigns, search, typeFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedCampaigns = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function handleNavigateToBoard(campaignId: string, campaignName: string) {
    void navigate(
      `/marketing/leads?campaignId=${encodeURIComponent(campaignId)}&campaignName=${encodeURIComponent(campaignName)}`,
    );
  }

  function handleCreate(payload: CreateCampaignPayload) {
    addCampaign(payload);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Campanhas de Marketing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Remarketing, Recovery e Re-engagement
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Criar Campanha
        </button>
      </div>

      {/* Metrics */}
      <MetricsSummary campaigns={campaigns} />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar campanhas..."
            className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Type filter chips */}
        <div className="flex items-center gap-1.5">
          {(
            [
              { value: "all", label: "Todos" },
              { value: "Remarketing", label: "Remarketing" },
              { value: "Recovery", label: "Recovery" },
              { value: "Re-engagement", label: "Re-engagement" },
            ] as { value: CampaignType | "all"; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                typeFilter === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Campanha
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                Enviados
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                Respondidos
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                Convertidos
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Megaphone size={28} className="opacity-30" />
                    <p className="text-sm">Nenhuma campanha encontrada.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedCampaigns.map((campaign) => (
                <CampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  onNavigate={handleNavigateToBoard}
                />
              ))
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <TablePagination
            page={page - 1}
            totalPages={totalPages}
            totalElements={filtered.length}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setDefaultPageSize(size);
              setPageSize(size);
              setPage(1);
            }}
            onFirst={() => setPage(1)}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            onLast={() => setPage(totalPages)}
          />
        )}
      </div>

      {/* Create modal */}
      <CreateCampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
