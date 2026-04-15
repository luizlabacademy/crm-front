import { useState, useMemo, useRef, useEffect } from "react";
import {
  Users,
  Search,
  MessageSquare,
  Mail,
  Plus,
  Check,
  X,
  Filter,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  MarketingContact,
  ContactChannel,
} from "@/features/marketing/types/marketingTypes";
import contactsData from "@/features/marketing/mocks/contacts.json";

// ─── Mock service ─────────────────────────────────────────────────────────────

function useContacts() {
  const [contacts, setContacts] = useState<MarketingContact[]>(
    contactsData as MarketingContact[],
  );

  function addContact(
    contact: Omit<MarketingContact, "id" | "createdAt">,
  ): void {
    setContacts((prev) => [
      {
        ...contact,
        id: `contact-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function removeContact(id: string): void {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  function addContacts(imported: Omit<MarketingContact, "id" | "createdAt">[]) {
    if (imported.length === 0) return;

    const now = Date.now();
    const createdAt = new Date().toISOString();

    setContacts((prev) => [
      ...imported.map((contact, index) => ({
        ...contact,
        id: `contact-${now}-${index}`,
        createdAt,
      })),
      ...prev,
    ]);
  }

  return { contacts, addContact, addContacts, removeContact };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHANNEL_LABEL: Record<ContactChannel, string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
};

const CHANNEL_ICON: Record<ContactChannel, React.ReactNode> = {
  whatsapp: <MessageSquare size={13} />,
  email: <Mail size={13} />,
};

const CHANNEL_CLASS: Record<ContactChannel, string> = {
  whatsapp: "text-emerald-600",
  email: "text-sky-600",
};

function fmtDate(iso: string) {
  try {
    return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

type CsvContactInput = Omit<MarketingContact, "id" | "createdAt">;

function parseCsvCells(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseOptIn(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return !["false", "0", "nao", "não", "off", "sem", "no"].includes(normalized);
}

function pickByAlias(
  row: Record<string, string>,
  aliases: string[],
): string | undefined {
  return aliases
    .map((alias) => row[alias])
    .find((value) => value !== undefined && value.trim() !== "");
}

function parseContactsCsv(content: string): CsvContactInput[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return [];

  const firstLine = lines[0];
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0)
      ? ";"
      : ",";

  const headerKeys = parseCsvCells(firstLine, delimiter).map(normalizeHeader);

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvCells(line, delimiter);
      const row: Record<string, string> = {};

      headerKeys.forEach((key, index) => {
        row[key] = (values[index] ?? "").trim();
      });

      const name = pickByAlias(row, ["nome", "name", "contato", "fullnome"]);
      if (!name) return null;

      const channelRaw = (
        pickByAlias(row, ["canal", "channel"]) ?? "whatsapp"
      ).toLowerCase();

      const tagsRaw = pickByAlias(row, ["tags", "etiquetas"]) ?? "";
      const tags = tagsRaw
        .split(/[|;,]/)
        .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
        .filter((tag) => tag.length > 0);

      return {
        name,
        phone:
          pickByAlias(row, ["telefone", "phone", "celular", "whatsapp"]) ?? "",
        email: pickByAlias(row, ["email", "e-mail", "mail"]) ?? "",
        channel: channelRaw.includes("mail") ? "email" : "whatsapp",
        source:
          pickByAlias(row, ["origem", "source", "fonte"]) ?? "Importacao CSV",
        tags,
        optIn: parseOptIn(
          pickByAlias(row, ["optin", "opt", "consentimento"]) ?? "true",
        ),
      } satisfies CsvContactInput;
    })
    .filter((contact): contact is CsvContactInput => contact !== null);
}

// ─── Tag Badge ────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  "cliente-vip": "bg-amber-100 text-amber-800",
  remarketing: "bg-blue-100 text-blue-800",
  "lead-recente": "bg-violet-100 text-violet-800",
  newsletter: "bg-sky-100 text-sky-800",
  "inativo-60d": "bg-red-100 text-red-800",
  "nao-compareceu": "bg-orange-100 text-orange-800",
  "re-engagement": "bg-pink-100 text-pink-800",
};

function TagBadge({ tag }: { tag: string }) {
  const cls = TAG_COLORS[tag] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", cls)}
    >
      {tag}
    </span>
  );
}

// ─── Summary bar ─────────────────────────────────────────────────────────────

function SummaryBar({ contacts }: { contacts: MarketingContact[] }) {
  const total = contacts.length;
  const whatsapp = contacts.filter((c) => c.channel === "whatsapp").length;
  const email = contacts.filter((c) => c.channel === "email").length;
  const optIn = contacts.filter((c) => c.optIn).length;

  const stats = [
    { label: "Total", value: total, icon: <Users size={16} /> },
    {
      label: "WhatsApp",
      value: whatsapp,
      icon: <MessageSquare size={16} />,
      color: "text-emerald-600",
    },
    {
      label: "E-mail",
      value: email,
      icon: <Mail size={16} />,
      color: "text-sky-600",
    },
    {
      label: "Opt-in Ativo",
      value: optIn,
      icon: <Check size={16} />,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-border bg-card p-4 space-y-1"
        >
          <div className={cn("text-muted-foreground", s.color)}>{s.icon}</div>
          <div className="text-xl font-bold text-foreground">{s.value}</div>
          <div className="text-xs text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Add Contact Form (inline drawer) ────────────────────────────────────────

interface AddContactFormProps {
  onSave: (contact: Omit<MarketingContact, "id" | "createdAt">) => void;
  onCancel: () => void;
}

function AddContactForm({ onSave, onCancel }: AddContactFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<ContactChannel>("whatsapp");
  const [source, setSource] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [optIn, setOptIn] = useState(true);

  function handleAddTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), phone, email, channel, tags, source, optIn });
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
      <p className="text-sm font-medium text-foreground">Novo contato</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Nome *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Canal
          </label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as ContactChannel)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="email">E-mail</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Telefone
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Origem
          </label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Ex.: WhatsApp, Instagram, Site..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="Digite e pressione Enter"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {t}
                  <button onClick={() => handleRemoveTag(t)}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm text-foreground">Opt-in ativo</span>
      </label>

      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Salvar Contato
        </button>
      </div>
    </div>
  );
}

// ─── Contact Row ──────────────────────────────────────────────────────────────

function ContactRow({
  contact,
  onRemove,
}: {
  contact: MarketingContact;
  onRemove: (id: string) => void;
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <p className="font-medium text-foreground text-sm">{contact.name}</p>
        <p className="text-xs text-muted-foreground">{contact.email}</p>
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">
        <span
          className={cn(
            "flex items-center gap-1.5 w-fit text-xs",
            CHANNEL_CLASS[contact.channel],
          )}
        >
          {CHANNEL_ICON[contact.channel]}
          {CHANNEL_LABEL[contact.channel]}
        </span>
      </td>

      <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
        {contact.phone || "—"}
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {contact.tags.length > 0 ? (
            contact.tags.map((tag) => <TagBadge key={tag} tag={tag} />)
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </td>

      <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
        {contact.source}
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            contact.optIn
              ? "bg-emerald-100 text-emerald-800"
              : "bg-muted text-muted-foreground",
          )}
        >
          {contact.optIn ? <Check size={10} /> : <X size={10} />}
          {contact.optIn ? "Opt-in" : "Sem opt-in"}
        </span>
      </td>

      <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
        {fmtDate(contact.createdAt)}
      </td>

      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onRemove(contact.id)}
          className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Remover contato"
        >
          <X size={14} />
        </button>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ContactListPage() {
  const PAGE_SIZE = 8;
  const { contacts, addContact, addContacts, removeContact } = useContacts();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<ContactChannel | "all">(
    "all",
  );
  const [optInFilter, setOptInFilter] = useState<"all" | "optin" | "no-optin">(
    "all",
  );
  const [showForm, setShowForm] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleCsvImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = parseContactsCsv(content);

      if (parsed.length === 0) {
        setImportMessage("Nenhum contato valido foi encontrado no CSV.");
      } else {
        addContacts(parsed);
        setImportMessage(`${parsed.length} contato(s) importado(s) via CSV.`);
      }
    } catch {
      setImportMessage("Nao foi possivel importar o arquivo CSV.");
    } finally {
      event.target.value = "";
    }
  }

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch =
        search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.tags.some((t) => t.includes(search.toLowerCase()));

      const matchChannel =
        channelFilter === "all" || c.channel === channelFilter;

      const matchOptIn =
        optInFilter === "all" ||
        (optInFilter === "optin" && c.optIn) ||
        (optInFilter === "no-optin" && !c.optIn);

      return matchSearch && matchChannel && matchOptIn;
    });
  }, [contacts, search, channelFilter, optInFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedContacts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, channelFilter, optInFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Lista de Contatos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie os contatos disponíveis para campanhas de marketing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvImport}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Upload size={16} />
            Importar CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Novo Contato
          </button>
        </div>
      </div>

      {importMessage && (
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {importMessage}
        </div>
      )}

      {/* Summary */}
      <SummaryBar contacts={contacts} />

      {/* Add form */}
      {showForm && (
        <AddContactForm
          onSave={(data) => {
            addContact(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail, tag..."
            className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Channel chips */}
        <div className="flex items-center gap-1.5">
          {(
            [
              { value: "all", label: "Todos" },
              { value: "whatsapp", label: "WhatsApp" },
              { value: "email", label: "E-mail" },
            ] as { value: ContactChannel | "all"; label: string }[]
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

        {/* Opt-in filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-muted-foreground" />
          {(
            [
              { value: "all", label: "Opt-in: Todos" },
              { value: "optin", label: "Com opt-in" },
              { value: "no-optin", label: "Sem opt-in" },
            ] as { value: typeof optInFilter; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOptInFilter(opt.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                optInFilter === opt.value
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
                Contato
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                Canal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                Telefone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                Tags
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                Origem
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                Opt-in
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden xl:table-cell">
                Criado em
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users size={28} className="opacity-30" />
                    <p className="text-sm">Nenhum contato encontrado.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedContacts.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  onRemove={removeContact}
                />
              ))
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <span>
              {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}{" "}
              contatos
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent"
              >
                <ChevronLeft size={12} />
                Anterior
              </button>
              <span className="px-2 text-[11px]">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent"
              >
                Próxima
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
