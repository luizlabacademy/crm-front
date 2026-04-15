import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate, useSearchParams } from "react-router";
import {
  GripVertical,
  Users,
  ArrowLeft,
  Megaphone,
  Search,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/utils/formatDate";
import type {
  LeadBoardCard,
  LeadBoardStatus,
  CampaignType,
  MarketingCampaign,
} from "@/features/marketing/types/marketingTypes";
import leadsData from "@/features/marketing/mocks/leads.json";
import campaignsData from "@/features/marketing/mocks/campaigns.json";
import type {
  Over,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";

// ─── Board Columns ────────────────────────────────────────────────────────────

const LEAD_COLUMNS: { key: LeadBoardStatus; label: string }[] = [
  { key: "LEAD", label: "Lead" },
  { key: "AGENDADO", label: "Agendado" },
  { key: "ATENDIDO", label: "Atendido" },
  { key: "CANCELADO", label: "Cancelado" },
  { key: "NAO_COMPARECEU", label: "Não Compareceu" },
];

const COLUMN_BORDER: Record<LeadBoardStatus, string> = {
  LEAD: "border-t-blue-500",
  AGENDADO: "border-t-violet-500",
  ATENDIDO: "border-t-emerald-500",
  CANCELADO: "border-t-red-500",
  NAO_COMPARECEU: "border-t-orange-500",
};

const COLUMN_BG: Record<LeadBoardStatus, string> = {
  LEAD: "bg-blue-50/35",
  AGENDADO: "bg-violet-50/35",
  ATENDIDO: "bg-emerald-50/35",
  CANCELADO: "bg-red-50/35",
  NAO_COMPARECEU: "bg-orange-50/35",
};

const COLUMN_HEADER_BG: Record<LeadBoardStatus, string> = {
  LEAD: "bg-blue-100/55",
  AGENDADO: "bg-violet-100/55",
  ATENDIDO: "bg-emerald-100/55",
  CANCELADO: "bg-red-100/55",
  NAO_COMPARECEU: "bg-orange-100/55",
};

const BADGE_COLOR: Record<LeadBoardStatus, string> = {
  LEAD: "bg-blue-100 text-blue-800",
  AGENDADO: "bg-violet-100 text-violet-800",
  ATENDIDO: "bg-emerald-100 text-emerald-800",
  CANCELADO: "bg-red-100 text-red-800",
  NAO_COMPARECEU: "bg-orange-100 text-orange-800",
};

const BADGE_LABEL: Record<LeadBoardStatus, string> = {
  LEAD: "Lead",
  AGENDADO: "Agendado",
  ATENDIDO: "Atendido",
  CANCELADO: "Cancelado",
  NAO_COMPARECEU: "Não Compareceu",
};

const CAMPAIGN_TYPE_OPTIONS: { value: CampaignType | "all"; label: string }[] =
  [
    { value: "all", label: "Todos" },
    { value: "Remarketing", label: "Remarketing" },
    { value: "Recovery", label: "Recovery" },
    { value: "Re-engagement", label: "Re-engagement" },
  ];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function toLeadStatus(raw: string): LeadBoardStatus {
  const valid: LeadBoardStatus[] = [
    "LEAD",
    "AGENDADO",
    "ATENDIDO",
    "CANCELADO",
    "NAO_COMPARECEU",
  ];
  return valid.includes(raw as LeadBoardStatus)
    ? (raw as LeadBoardStatus)
    : "LEAD";
}

function buildLeads(raw: typeof leadsData): LeadBoardCard[] {
  return raw.map((l) => ({
    ...l,
    status: toLeadStatus(l.status),
  })) as LeadBoardCard[];
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function SortableLeadCard({ lead }: { lead: LeadBoardCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group cursor-grab active:cursor-grabbing rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/20",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 rounded p-0.5 text-foreground/80 hover:text-foreground"
        >
          <GripVertical size={14} />
        </button>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate text-sm font-medium leading-tight">
            {lead.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{lead.phone}</p>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-foreground tabular-nums">
              {formatCents(lead.estimatedValueCents)}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {lead.source}
            </span>
          </div>
          {lead.campaignName && (
            <p className="truncate text-[11px] text-muted-foreground flex items-center gap-1">
              <Megaphone size={10} />
              {lead.campaignName}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground text-right">
            {formatShortDate(lead.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

function LeadCardOverlay({ lead }: { lead: LeadBoardCard }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-card p-3 shadow-xl ring-2 ring-primary/20 w-64">
      <div className="flex items-start gap-2">
        <GripVertical size={14} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium">{lead.name}</p>
          <p className="truncate text-xs text-muted-foreground">{lead.phone}</p>
          <span className="text-xs font-medium tabular-nums">
            {formatCents(lead.estimatedValueCents)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Board Column ─────────────────────────────────────────────────────────────

function BoardColumn({
  status,
  leads,
  isDropTarget,
}: {
  status: LeadBoardStatus;
  leads: LeadBoardCard[];
  isDropTarget: boolean;
}) {
  const ids = leads.map((l) => l.id);
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-[240px] flex-1 flex-col overflow-hidden rounded-xl border border-border/80 border-t-4 transition-all",
        COLUMN_BORDER[status],
        COLUMN_BG[status],
        (isOver || isDropTarget) &&
          "ring-2 ring-primary/35 border-primary/40 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-10 flex items-center justify-between border-b border-border/50 px-4 py-3 backdrop-blur-sm",
          COLUMN_HEADER_BG[status],
          (isOver || isDropTarget) && "bg-primary/10",
        )}
      >
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            BADGE_COLOR[status],
          )}
        >
          {BADGE_LABEL[status]}
        </span>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
          {leads.length}
        </span>
      </div>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          className={cn(
            "flex-1 space-y-2 overflow-y-auto p-3 min-h-[120px]",
            (isOver || isDropTarget) && "bg-primary/5",
          )}
        >
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users size={24} className="text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">Nenhum lead</p>
            </div>
          ) : (
            leads.map((lead) => <SortableLeadCard key={lead.id} lead={lead} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LeadsBoardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const campaignIdParam = searchParams.get("campaignId");
  const campaignNameParam = searchParams.get("campaignName");

  const [leads, setLeads] = useState<LeadBoardCard[]>(() =>
    buildLeads(leadsData),
  );
  const [campaigns] = useState<MarketingCampaign[]>(
    campaignsData as MarketingCampaign[],
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    campaignIdParam,
  );
  const [campaignModalOpen, setCampaignModalOpen] = useState(!campaignIdParam);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState<
    CampaignType | "all"
  >("all");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) => {
        const matchSearch =
          campaignSearch === "" ||
          campaign.name.toLowerCase().includes(campaignSearch.toLowerCase());
        const matchType =
          campaignTypeFilter === "all" || campaign.type === campaignTypeFilter;
        return matchSearch && matchType;
      }),
    [campaigns, campaignSearch, campaignTypeFilter],
  );

  const filteredLeads = useMemo(() => {
    if (!selectedCampaignId) return leads;
    return leads.filter((lead) => lead.campaignId === selectedCampaignId);
  }, [leads, selectedCampaignId]);

  const columnData = useMemo(() => {
    const grouped: Record<LeadBoardStatus, LeadBoardCard[]> = {
      LEAD: [],
      AGENDADO: [],
      ATENDIDO: [],
      CANCELADO: [],
      NAO_COMPARECEU: [],
    };
    for (const lead of filteredLeads) {
      grouped[lead.status].push(lead);
    }
    return grouped;
  }, [filteredLeads]);

  const activeLead = activeId
    ? (filteredLeads.find((l) => l.id === activeId) ?? null)
    : null;

  function findColumn(id: string): LeadBoardStatus | undefined {
    const col = LEAD_COLUMNS.find((c) => c.key === id);
    if (col) return col.key;
    return leads.find((l) => l.id === id)?.status;
  }

  function resolveOverColumn(over: Over | null): LeadBoardStatus | undefined {
    if (!over) return undefined;
    const fromId = findColumn(String(over.id));
    if (fromId) return fromId;
    const containerId = over.data.current?.sortable?.containerId;
    if (!containerId) return undefined;
    return findColumn(String(containerId));
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }
    const overCol = resolveOverColumn(over);
    setOverColumnId(overCol ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;

    const activeCol = findColumn(String(active.id));
    const overCol = resolveOverColumn(over);
    if (!activeCol || !overCol) return;

    const overIsColumn = LEAD_COLUMNS.some((c) => c.key === String(over.id));

    if (activeCol !== overCol) {
      setLeads((prev) =>
        prev.map((l) => (l.id === active.id ? { ...l, status: overCol } : l)),
      );
      return;
    }

    if (activeCol === overCol && active.id !== over.id && !overIsColumn) {
      setLeads((prev) => {
        const colLeads = prev.filter((l) => l.status === activeCol);
        const others = prev.filter((l) => l.status !== activeCol);
        const oldIndex = colLeads.findIndex((l) => l.id === active.id);
        const newIndex = colLeads.findIndex((l) => l.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const reordered = [...colLeads];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);
        return [...others, ...reordered];
      });
    }
  }

  function handleBack() {
    if ((window.history.state?.idx ?? 0) > 0) {
      void navigate(-1);
      return;
    }
    void navigate("/marketing/campaigns");
  }

  function handleSelectCampaign(campaign: MarketingCampaign) {
    setSelectedCampaignId(campaign.id);
    setSearchParams({
      campaignId: campaign.id,
      campaignName: campaign.name,
    });
    setCampaignModalOpen(false);
  }

  function clearCampaignSelection() {
    setSelectedCampaignId(null);
    setSearchParams({});
    setCampaignModalOpen(true);
  }

  const selectedCampaignName =
    campaigns.find((option) => option.id === selectedCampaignId)?.name ??
    campaignNameParam;

  const title = selectedCampaignName
    ? `Leads · ${selectedCampaignName}`
    : "Board de Leads";
  const subtitle = selectedCampaignName
    ? `Leads filtrados da campanha "${selectedCampaignName}"`
    : "Gerencie o funil de leads de marketing";

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-muted/30">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-6 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{title}</h1>
              {selectedCampaignId && (
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {filteredLeads.length} leads
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCampaignId && (
            <button
              type="button"
              onClick={clearCampaignSelection}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              Limpar seleção
            </button>
          )}
          <button
            type="button"
            onClick={() => setCampaignModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Megaphone size={14} />
            {selectedCampaignId ? "Trocar campanha" : "Selecionar campanha"}
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        {!selectedCampaignId ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-lg rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <Megaphone
                size={28}
                className="mx-auto text-muted-foreground/60"
              />
              <h2 className="mt-3 text-lg font-semibold">
                Selecione uma campanha
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha uma campanha para carregar as colunas do board de leads.
              </p>
              <button
                type="button"
                onClick={() => setCampaignModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Selecionar campanha
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setOverColumnId(null)}
          >
            <div className="flex h-full gap-4">
              {LEAD_COLUMNS.map((col) => (
                <BoardColumn
                  key={col.key}
                  status={col.key}
                  leads={columnData[col.key] ?? []}
                  isDropTarget={overColumnId === col.key}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={null}>
              {activeLead ? <LeadCardOverlay lead={activeLead} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {campaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div>
                <h3 className="text-base font-semibold">Selecionar campanha</h3>
                <p className="text-xs text-muted-foreground">
                  Use os mesmos filtros de busca e tipo das campanhas de
                  marketing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCampaignModalOpen(false)}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={campaignSearch}
                    onChange={(event) => setCampaignSearch(event.target.value)}
                    placeholder="Buscar campanhas..."
                    className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {CAMPAIGN_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCampaignTypeFilter(option.value)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        campaignTypeFilter === option.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[340px] overflow-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                        Campanha
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                        Tipo
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-10 text-center text-sm text-muted-foreground"
                        >
                          Nenhuma campanha encontrada com os filtros informados.
                        </td>
                      </tr>
                    ) : (
                      filteredCampaigns.map((campaign) => (
                        <tr
                          key={campaign.id}
                          className="border-b border-border last:border-0 hover:bg-muted/20"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {campaign.name}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {campaign.type}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleSelectCampaign(campaign)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                              Selecionar
                              <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
