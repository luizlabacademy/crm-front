import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  Bell,
  BookUser,
  Bot,
  Building2,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Command,
  CreditCard,
  Expand,
  GitBranch,
  Globe,
  House,
  LayoutDashboard,
  Lock,
  LogOut,
  Maximize2,
  Megaphone,
  Menu,
  MessageCircle,
  Minimize2,
  Package,
  Receipt,
  Ruler,
  Search,
  ShieldCheck,
  ShoppingCart,
  Settings,
  Tag,
  Ticket,
  Truck,
  User,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { toast } from "sonner";
import navigationConfig from "@/app/config/navigation.json";
import { useAuthStore } from "@/lib/auth/authStore";
import { applyTheme, getStoredTheme } from "@/lib/theme/theme";
import { cn } from "@/lib/utils";
import notificationsResponse from "@/mocks/GET-account--notifications.json";
import profileResponse from "@/mocks/GET-account--profile.json";

// ─── ErrorBoundary ────────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro não capturado:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold text-foreground">
            Algo deu errado nesta página.
          </p>
          <p className="text-sm text-muted-foreground">
            Tente recarregar ou navegue para outra seção.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  children?: NavItem[];
}

interface NavSection {
  section: string;
  items: NavItem[];
}

interface NavItemConfig {
  label: string;
  to: string;
  icon: string;
  children?: NavItemConfig[];
}

interface NavSectionConfig {
  section: string;
  items: NavItemConfig[];
}

interface FeatureIndexItem {
  section: string;
  label: string;
  to: string;
  icon: ReactNode;
  breadcrumb?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "message-circle": MessageCircle,
  "clipboard-list": ClipboardList,
  "shopping-cart": ShoppingCart,
  "calendar-range": CalendarRange,
  users: Users,
  megaphone: Megaphone,
  zap: Zap,
  "book-user": BookUser,
  bot: Bot,
  globe: Globe,
  ticket: Ticket,
  wallet: Wallet,
  "user-plus": UserPlus,
  package: Package,
  receipt: Receipt,
  tag: Tag,
  ruler: Ruler,
  "building-2": Building2,
  "user-cog": UserCog,
  wrench: Wrench,
  "git-branch": GitBranch,
  "shield-check": ShieldCheck,
  lock: Lock,
  settings: Settings,
  "credit-card": CreditCard,
  truck: Truck,
};

function iconNode(iconName: string, size = 16) {
  const Icon = ICON_MAP[iconName] ?? LayoutDashboard;
  return <Icon size={size} />;
}

function mapNavItems(items: NavItemConfig[]): NavItem[] {
  return items.map((item) => ({
    label: item.label,
    to: item.to,
    icon: iconNode(item.icon),
    children: item.children ? mapNavItems(item.children) : undefined,
  }));
}

const NAV: NavSection[] = (navigationConfig as NavSectionConfig[]).map(
  (section) => ({
    section: section.section,
    items: mapNavItems(section.items),
  }),
);

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
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium leading-none transition-all [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:shrink-0 [&_svg]:transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-foreground shadow-sm ring-1 ring-sidebar-border [&_svg]:text-sidebar-foreground"
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground [&_svg]:text-sidebar-foreground/70 hover:[&_svg]:text-sidebar-foreground",
        )
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
}

function itemMatchesPath(item: NavItem, pathname: string): boolean {
  if (item.to === pathname) return true;
  if (pathname.startsWith(`${item.to}/`)) return true;
  if (!item.children?.length) return false;
  return item.children.some((child) => itemMatchesPath(child, pathname));
}

function SidebarTreeItem({
  item,
  onClose,
  depth,
  pathname,
}: {
  item: NavItem;
  onClose: () => void;
  depth: number;
  pathname: string;
}) {
  const hasChildren = Boolean(item.children?.length);
  const isActiveBranch = itemMatchesPath(item, pathname);
  const [expanded, setExpanded] = useState(isActiveBranch);

  if (!hasChildren) {
    return (
      <li key={`${item.to}-${item.label}`}>
        <SidebarLink item={item} onClick={onClose} />
      </li>
    );
  }

  return (
    <li key={`${item.to}-${item.label}`}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium transition-all",
          isActiveBranch
            ? "bg-sidebar-accent text-sidebar-foreground shadow-sm ring-1 ring-sidebar-border"
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
        )}
      >
        <span className="flex items-center gap-2.5 leading-none">
          {item.icon}
          <span>{item.label}</span>
        </span>
        <ChevronRight
          size={14}
          className={cn(
            "text-sidebar-foreground/70 transition-transform",
            expanded && "rotate-90",
          )}
        />
      </button>

      {expanded ? (
        <SidebarItems
          items={item.children ?? []}
          onClose={onClose}
          depth={depth + 1}
          pathname={pathname}
        />
      ) : null}
    </li>
  );
}

function SidebarItems({
  items,
  onClose,
  pathname,
  depth = 0,
}: {
  items: NavItem[];
  onClose: () => void;
  pathname: string;
  depth?: number;
}) {
  return (
    <ul className={cn("space-y-1", depth > 0 && "mt-1.5 pl-4")}>
      {items.map((item) => (
        <SidebarTreeItem
          key={`${item.to}-${item.label}`}
          item={item}
          onClose={onClose}
          depth={depth}
          pathname={pathname}
        />
      ))}
    </ul>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function Sidebar({ open, onClose }: SidebarProps) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

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
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-sidebar-border bg-white dark:bg-sidebar shadow-sm",
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
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/55">
                {section.section}
              </p>
              <SidebarItems
                items={section.items}
                onClose={onClose}
                pathname={location.pathname}
              />
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium text-sidebar-foreground/85 transition-all hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}

interface BreadcrumbItem {
  label: string;
  to?: string;
  current?: boolean;
}

function findNavTrail(items: NavItem[], pathname: string): NavItem[] | null {
  for (const item of items) {
    const isDirectMatch =
      pathname === item.to || pathname.startsWith(`${item.to}/`);
    if (isDirectMatch) return [item];

    if (item.children?.length) {
      const childTrail = findNavTrail(item.children, pathname);
      if (childTrail) return [item, ...childTrail];
    }
  }
  return null;
}

function BreadcrumbBar({ items }: { items: BreadcrumbItem[] }) {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2 text-sm">
      <button
        type="button"
        onClick={() => void navigate("/dashboard")}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Ir para dashboard"
      >
        <House size={14} />
      </button>

      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="inline-flex items-center gap-2"
        >
          <ChevronRight size={14} className="text-muted-foreground" />
          {item.to && !item.current ? (
            <button
              type="button"
              onClick={() => void navigate(item.to as string)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </button>
          ) : (
            <span
              className={cn(
                item.current
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(-1);
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, sectionFilter]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  function moveActive(direction: 1 | -1) {
    if (items.length === 0) return;

    const nextIndex =
      activeIndex < 0
        ? direction > 0
          ? 0
          : items.length - 1
        : (activeIndex + direction + items.length) % items.length;

    setActiveIndex(nextIndex);

    const element = resultsRef.current?.querySelector<HTMLElement>(
      `[data-result-index="${nextIndex}"]`,
    );
    element?.scrollIntoView({ block: "nearest" });
  }

  function triggerActive() {
    if (items.length === 0) return;
    const target = items[activeIndex >= 0 ? activeIndex : 0];
    if (target) onSelect(target);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      triggerActive();
    }
  }

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
          <div className="mb-2 flex items-center justify-end md:hidden">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Fechar
            </button>
          </div>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
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

        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto p-2">
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
            items.map((item, index) => (
              <button
                key={`${item.section}-${item.to}`}
                data-result-index={index}
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent",
                  activeIndex === index && "bg-accent ring-1 ring-ring/40",
                )}
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
                    {item.breadcrumb ? ` - ${item.breadcrumb}` : ""}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">Abrir</span>
              </button>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px]">
                ↑
              </kbd>
              <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px]">
                ↓
              </kbd>
              <span>Selecionar</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px]">
                Enter
              </kbd>
              <span>Abrir</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="hidden rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground md:inline-flex"
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

  const notifications = useMemo(() => notificationsResponse.responseBody, []);

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
  }, []);

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
    <header className="h-16 w-full border-b border-border bg-white dark:bg-card">
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
            onClick={() => {
              if (document.fullscreenElement) {
                void document.exitFullscreen().catch(() => undefined);
              }
              void navigate("/dashboard");
            }}
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
                src={profileResponse.responseBody.avatarUrl}
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
                  Preferencias
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
  const location = useLocation();
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

  useEffect(() => {
    if (window.scrollY <= 0) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const sections = useMemo(
    () => ["Todos", ...NAV.map((section) => section.section)],
    [],
  );

  const featureIndex = useMemo<FeatureIndexItem[]>(
    () =>
      NAV.flatMap((section) => {
        function flattenItems(
          items: NavItem[],
          parents: string[] = [],
        ): FeatureIndexItem[] {
          return items.flatMap((item) => {
            const breadcrumb = [...parents, item.label];
            const current: FeatureIndexItem = {
              section: section.section,
              label: item.label,
              to: item.to,
              icon: item.icon,
              breadcrumb: breadcrumb.join(" / "),
            };

            const nested = item.children
              ? flattenItems(item.children, breadcrumb)
              : [];

            return [current, ...nested];
          });
        }

        return flattenItems(section.items);
      }),
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
        item.to.toLowerCase().includes(normalizedQuery) ||
        (item.breadcrumb ?? "").toLowerCase().includes(normalizedQuery);
      return matchesSection && matchesQuery;
    });
  }, [featureIndex, featureQuery, sectionFilter]);

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const directMap: Record<string, BreadcrumbItem[]> = {
      "/notifications": [{ label: "Notificacoes", current: true }],
      "/me/profile": [{ label: "Meu perfil", current: true }],
      "/settings": [{ label: "Preferencias", current: true }],
    };

    if (directMap[location.pathname]) {
      return directMap[location.pathname];
    }

    for (const section of NAV) {
      const trail = findNavTrail(section.items, location.pathname);
      if (!trail || trail.length === 0) continue;

      const sectionCrumb: BreadcrumbItem = {
        label: section.section,
      };

      const itemCrumbs = trail.map((item, index) => {
        const isLast = index === trail.length - 1;
        return {
          label: item.label,
          to: isLast ? undefined : item.to,
          current: isLast,
        } satisfies BreadcrumbItem;
      });

      return [sectionCrumb, ...itemCrumbs];
    }

    return [];
  }, [location.pathname]);

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

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <BreadcrumbBar items={breadcrumbs} />
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
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
