import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  Bell,
  BookUser,
  Building2,
  CalendarRange,
  ChevronDown,
  ClipboardList,
  Command,
  Expand,
  GitBranch,
  Globe,
  LayoutDashboard,
  Lock,
  LogOut,
  Maximize2,
  Megaphone,
  Menu,
  MessageCircle,
  Minimize2,
  Package,
  Ruler,
  Search,
  ShieldCheck,
  ShoppingCart,
  Settings,
  Tag,
  Ticket,
  User,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth/authStore";
import { applyTheme, getStoredTheme } from "@/lib/theme/theme";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

interface FeatureIndexItem {
  section: string;
  label: string;
  to: string;
  icon: ReactNode;
}

const NAV: NavSection[] = [
  {
    section: "Principal",
    items: [
      {
        label: "Dashboard",
        to: "/dashboard",
        icon: <LayoutDashboard size={16} />,
      },
      {
        label: "Conversas",
        to: "/conversations",
        icon: <MessageCircle size={16} />,
      },
    ],
  },
  {
    section: "Operacoes",
    items: [
      {
        label: "Leads",
        to: "/marketing/leads",
        icon: <ClipboardList size={16} />,
      },
      {
        label: "Buscar Pedidos",
        to: "/orders",
        icon: <ShoppingCart size={16} />,
      },
      {
        label: "Agendamentos",
        to: "/schedules/board",
        icon: <CalendarRange size={16} />,
      },
      { label: "Clientes", to: "/customers", icon: <Users size={16} /> },
    ],
  },
  {
    section: "Marketing",
    items: [
      {
        label: "Campanhas de Marketing",
        to: "/marketing/campaigns",
        icon: <Megaphone size={16} />,
      },
      {
        label: "Marketing Automatizado",
        to: "/marketing/automation",
        icon: <Zap size={16} />,
      },
      {
        label: "Lista de Contatos",
        to: "/marketing/contacts",
        icon: <BookUser size={16} />,
      },
      {
        label: "Landing Page",
        to: "/marketing/landing-page",
        icon: <Globe size={16} />,
      },
      {
        label: "Cupons",
        to: "/marketing/coupons",
        icon: <Ticket size={16} />,
      },
      {
        label: "Cashback",
        to: "/marketing/cashback",
        icon: <Wallet size={16} />,
      },
      {
        label: "Afiliados",
        to: "/marketing/affiliates",
        icon: <UserPlus size={16} />,
      },
    ],
  },
  {
    section: "Cadastros",
    items: [
      { label: "Itens", to: "/catalog/items", icon: <Package size={16} /> },
      {
        label: "Categorias",
        to: "/catalog/categories",
        icon: <Tag size={16} />,
      },
      {
        label: "Unidades de Medida",
        to: "/catalog/units-of-measure",
        icon: <Ruler size={16} />,
      },
      { label: "Tenants", to: "/tenants", icon: <Building2 size={16} /> },
      { label: "Usuarios", to: "/users", icon: <UserCog size={16} /> },
      { label: "Workers", to: "/workers", icon: <Wrench size={16} /> },
    ],
  },
  {
    section: "Configuracoes",
    items: [
      {
        label: "Fluxos de Pipeline",
        to: "/pipeline-flows",
        icon: <GitBranch size={16} />,
      },
      { label: "Perfis", to: "/admin/roles", icon: <ShieldCheck size={16} /> },
      {
        label: "Permissoes",
        to: "/admin/permissions",
        icon: <Lock size={16} />,
      },
    ],
  },
];

interface SidebarLinkProps {
  item: NavItem;
  onClick?: () => void;
}

function SidebarLink({ item, onClick }: SidebarLinkProps) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function Sidebar({ open, onClose }: SidebarProps) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    void navigate("/login");
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar border-r border-sidebar-border",
          "transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0 lg:z-auto",
        )}
      >
        <div className="flex h-14 items-center justify-end border-b border-sidebar-border px-4 shrink-0 lg:hidden">
          <button
            className="text-sidebar-foreground"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-6 max-lg:overflow-y-auto max-lg:flex-1">
          {NAV.map((section) => (
            <div key={section.section}>
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {section.section}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <SidebarLink item={item} onClick={onClose} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}

interface FeatureSearchModalProps {
  open: boolean;
  query: string;
  sectionFilter: string;
  sections: string[];
  items: FeatureIndexItem[];
  onQueryChange: (value: string) => void;
  onSectionFilterChange: (value: string) => void;
  onClose: () => void;
  onSelect: (item: FeatureIndexItem) => void;
}

function FeatureSearchModal({
  open,
  query,
  sectionFilter,
  sections,
  items,
  onQueryChange,
  onSectionFilterChange,
  onClose,
  onSelect,
}: FeatureSearchModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto mt-14 w-full max-w-4xl rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              autoFocus
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Buscar funcionalidades, paginas e modulos..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-24 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
              ESC
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => onSectionFilterChange(section)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  sectionFilter === section
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <p className="text-sm font-medium">
                Nenhuma funcionalidade encontrada.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tente outro termo de busca ou mude a categoria.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <button
                key={`${item.section}-${item.to}`}
                type="button"
                onClick={() => onSelect(item)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {item.section}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">Abrir</span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Enter ou clique para abrir a funcionalidade.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

interface TopBarProps {
  onOpenMenu: () => void;
  onOpenFeatureSearch: () => void;
}

function TopBar({ onOpenMenu, onOpenFeatureSearch }: TopBarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement),
  );
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const notifications = useMemo(
    () => [
      {
        id: "n-1",
        title: "Novo lead recebido",
        description: "Lead do canal WhatsApp aguardando atendimento.",
        time: "agora",
        unread: true,
      },
      {
        id: "n-2",
        title: "Pedido atualizado",
        description: "Pedido #1042 alterado para status Em separacao.",
        time: "ha 12 min",
        unread: true,
      },
      {
        id: "n-3",
        title: "Campanha finalizada",
        description: "Campanha Recovery Abril foi concluida.",
        time: "ha 1 h",
        unread: false,
      },
    ],
    [],
  );

  const unreadCount = notifications.filter((item) => item.unread).length;

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!notificationsOpen) return;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setNotificationsOpen(false);
      if (event.key === "Escape") setProfileMenuOpen(false);
    }

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen]);

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      toast.error("Nao foi possivel alternar o modo de tela cheia.");
    }
  }

  return (
    <header className="h-16 w-full border-b border-border bg-background">
      <div className="flex h-full w-full items-center gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={onOpenMenu}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-accent lg:hidden"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={() => void navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Expand size={16} />
            </span>
            <span className="text-base font-semibold tracking-tight">CRM</span>
          </button>
        </div>

        <div className="mx-auto hidden w-full max-w-2xl md:block">
          <button
            type="button"
            onClick={onOpenFeatureSearch}
            className="flex h-11 w-full items-center gap-3 rounded-xl border border-border bg-card px-3 text-left text-sm transition-colors hover:border-ring"
          >
            <Search size={16} className="text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              Buscar funcionalidades
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
              <Command size={12} />
              <span>Ctrl</span>
              <span>K</span>
            </span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenFeatureSearch}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Buscar funcionalidades"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Alternar tela cheia"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Notificacoes"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-11 z-30 w-[340px] rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold">Notificacoes</p>
                  <span className="text-xs text-muted-foreground">
                    {unreadCount} novas
                  </span>
                </div>

                <ul className="max-h-80 overflow-y-auto p-1.5">
                  {notifications.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                      >
                        <span
                          className={cn(
                            "mt-1 h-2 w-2 shrink-0 rounded-full",
                            item.unread ? "bg-blue-500" : "bg-muted",
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.time}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-border px-3 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      void navigate("/notifications");
                    }}
                    className="w-full rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Ver todas
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative ml-1" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 text-foreground transition-colors hover:bg-accent"
              aria-label="Perfil"
            >
              <img
                src="https://i.pravatar.cc/96?img=12"
                alt="Avatar"
                className="h-7 w-7 rounded-full object-cover"
              />
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-11 z-30 w-52 rounded-xl border border-border bg-card p-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    void navigate("/me/profile");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <User size={15} />
                  Meu perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    void navigate("/settings");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <Settings size={15} />
                  Configuracoes
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                    void navigate("/login");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [featureSearchOpen, setFeatureSearchOpen] = useState(false);
  const [featureQuery, setFeatureQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("Todos");

  useEffect(() => {
    const currentTheme = getStoredTheme();
    applyTheme(currentTheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function handleSystemThemeChange() {
      if (getStoredTheme() === "system") applyTheme("system");
    }

    media.addEventListener("change", handleSystemThemeChange);
    return () => media.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const sections = useMemo(
    () => ["Todos", ...NAV.map((section) => section.section)],
    [],
  );

  const featureIndex = useMemo<FeatureIndexItem[]>(
    () =>
      NAV.flatMap((section) =>
        section.items.map((item) => ({
          section: section.section,
          label: item.label,
          to: item.to,
          icon: item.icon,
        })),
      ),
    [],
  );

  const filteredFeatures = useMemo(() => {
    return featureIndex.filter((item) => {
      const matchesSection =
        sectionFilter === "Todos" || item.section === sectionFilter;
      const normalizedQuery = featureQuery.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery === "" ||
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.section.toLowerCase().includes(normalizedQuery) ||
        item.to.toLowerCase().includes(normalizedQuery);
      return matchesSection && matchesQuery;
    });
  }, [featureIndex, featureQuery, sectionFilter]);

  const openFeatureSearch = useCallback(() => {
    setFeatureSearchOpen(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      event.preventDefault();
      openFeatureSearch();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openFeatureSearch]);

  function closeFeatureSearch() {
    setFeatureSearchOpen(false);
  }

  function handleSelectFeature(item: FeatureIndexItem) {
    setFeatureSearchOpen(false);
    setSidebarOpen(false);
    setFeatureQuery("");
    void navigate(item.to);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar
        onOpenMenu={() => setSidebarOpen(true)}
        onOpenFeatureSearch={() => {
          setSectionFilter("Todos");
          openFeatureSearch();
        }}
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>

      <FeatureSearchModal
        open={featureSearchOpen}
        query={featureQuery}
        sectionFilter={sectionFilter}
        sections={sections}
        items={filteredFeatures}
        onQueryChange={setFeatureQuery}
        onSectionFilterChange={setSectionFilter}
        onClose={closeFeatureSearch}
        onSelect={handleSelectFeature}
      />
    </div>
  );
}
