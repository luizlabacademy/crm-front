import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ShoppingCart,
  CalendarCheck,
  CalendarDays,
  UserSquare,
  MapPin,
  Package,
  Tag,
  Ruler,
  GitBranch,
  Building2,
  UserCog,
  Wrench,
  ShieldCheck,
  Lock,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth/authStore";
import type { ReactNode } from "react";

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    section: "Principal",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    section: "Operacoes",
    items: [
      { label: "Clientes", to: "/customers", icon: <Users size={16} /> },
      { label: "Leads", to: "/leads", icon: <MessageSquare size={16} /> },
      { label: "Pedidos", to: "/orders", icon: <ShoppingCart size={16} /> },
      { label: "Agendamentos", to: "/appointments", icon: <CalendarCheck size={16} /> },
      { label: "Schedules", to: "/schedules", icon: <CalendarDays size={16} /> },
    ],
  },
  {
    section: "Pessoas",
    items: [
      { label: "Pessoas", to: "/persons", icon: <UserSquare size={16} /> },
      { label: "Enderecos", to: "/addresses", icon: <MapPin size={16} /> },
    ],
  },
  {
    section: "Catalogo",
    items: [
      { label: "Itens", to: "/catalog/items", icon: <Package size={16} /> },
      { label: "Categorias", to: "/catalog/categories", icon: <Tag size={16} /> },
      { label: "Unidades de Medida", to: "/catalog/units-of-measure", icon: <Ruler size={16} /> },
    ],
  },
  {
    section: "Pipeline",
    items: [
      { label: "Fluxos de Pipeline", to: "/pipeline-flows", icon: <GitBranch size={16} /> },
    ],
  },
  {
    section: "Administracao",
    items: [
      { label: "Tenants", to: "/tenants", icon: <Building2 size={16} /> },
      { label: "Usuarios", to: "/users", icon: <UserCog size={16} /> },
      { label: "Workers", to: "/workers", icon: <Wrench size={16} /> },
      { label: "Perfis", to: "/admin/roles", icon: <ShieldCheck size={16} /> },
      { label: "Permissoes", to: "/admin/permissions", icon: <Lock size={16} /> },
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
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
          "lg:static lg:translate-x-0 lg:z-auto"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border shrink-0">
          <span className="font-semibold text-sidebar-foreground tracking-tight">CRM</span>
          <button
            className="lg:hidden text-sidebar-foreground"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
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

        <div className="border-t border-sidebar-border p-3 shrink-0">
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

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-border px-4 lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="text-foreground"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 font-semibold">CRM</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}