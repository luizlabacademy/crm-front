# CDD Refactoring Plan — crm-front

**Status:** ✅ Complete (Phase 1)  
**Scope:** Shared components extraction (Phase 1)  
**Audience:** Any developer working on this codebase  
**Prerequisites:** Read `architecture.md`, `frontend-guidelines.md`, `ui-guidelines.md`

---

## Overview

This plan converts the current codebase — which has ~15 near-identical inline component definitions scattered across feature pages — into a properly layered, Component-Driven codebase.

The work is divided into **four sequential waves**. Each wave is independently shippable and improves things without breaking anything already working.

| Wave | Focus                        | Estimated LOC removed |
| ---- | ---------------------------- | --------------------- |
| 1    | Shared primitive components  | ~900                  |
| 2    | Shared composite components  | ~600                  |
| 3    | Shared utility consolidation | ~150                  |
| 4    | Shared hooks                 | ~250                  |

**Total: ~1 900 lines of duplicated code eliminated**

---

## Governing rules (must be respected at every step)

1. **One file, one component** — no barrel files with multiple exported components.
2. **Props typed with a dedicated interface** — no inline `{ prop: type }` in function signatures.
3. **No `any`** — use `unknown` + narrowing where the type is uncertain.
4. **All UI text in pt-BR.**
5. **Tailwind classes only** — no CSS modules, no inline `style={{}}`.
6. **Accessible by default** — every destructive action must be keyboard-reachable and have an `aria-label`.
7. **One test file per shared component** — placed at `src/components/shared/__tests__/ComponentName.test.tsx`.
8. **Conventional Commits** — prefix every commit with `refactor:`, `feat:`, or `test:`.
9. **Import order:** React → external libs → `@/lib` → `@/components` → `@/features` → relative.
10. **No feature imports inside `src/components/shared/`** — shared components may only import from `@/lib` and `@/components/ui`.

---

## Wave 1 — Primitive shared components

These are the four components that appear verbatim in the most files. Extract each one first; it unblocks every subsequent cleanup.

---

### Task 1.1 — `SkeletonRow`

**Pain point:** P5 — defined independently in 8+ list pages.

**Current locations (all identical):**

- `features/customers/pages/CustomerListPage.tsx` (cols=7)
- `features/leads/pages/LeadListPage.tsx` (cols=7)
- `features/orders/pages/OrderListPage.tsx` (cols=8)
- `features/admin/tenants/pages/TenantListPage.tsx`
- `features/admin/users/pages/UserListPage.tsx`
- `features/admin/workers/pages/WorkerListPage.tsx`
- `features/admin/roles/pages/RoleListPage.tsx`
- `features/admin/permissions/pages/PermissionListPage.tsx`

**Create:** `src/components/shared/SkeletonRow.tsx`

```tsx
interface SkeletonRowProps {
  /** Number of <td> cells to render. Defaults to 6. */
  cols?: number;
}

export function SkeletonRow({ cols = 6 }: SkeletonRowProps) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}
```

**Usage pattern** (replace all inline definitions with):

```tsx
import { SkeletonRow } from "@/components/shared/SkeletonRow";
// …
{
  isLoading &&
    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />);
}
```

**Test file:** `src/components/shared/__tests__/SkeletonRow.test.tsx`

```tsx
import { render } from "@testing-library/react";
import { SkeletonRow } from "../SkeletonRow";

describe("SkeletonRow", () => {
  it("renders the default number of cells", () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonRow />
        </tbody>
      </table>,
    );
    expect(container.querySelectorAll("td")).toHaveLength(6);
  });

  it("renders the specified number of cells", () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonRow cols={8} />
        </tbody>
      </table>,
    );
    expect(container.querySelectorAll("td")).toHaveLength(8);
  });

  it("renders the pulse animation div in each cell", () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonRow cols={3} />
        </tbody>
      </table>,
    );
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });
});
```

**Acceptance criteria:**

- [ ] `SkeletonRow.tsx` created at `src/components/shared/`
- [ ] All 8 inline definitions deleted from feature pages
- [ ] All 8 pages import from `@/components/shared/SkeletonRow`
- [ ] `cols` prop passed correctly per page (7 for customers/leads, 8 for orders, etc.)
- [ ] Test file created and passing

---

### Task 1.2 — `ActiveBadge`

**Pain point:** P6a — defined independently in 9+ list and detail pages.

**Current locations:**

- `features/customers/pages/CustomerListPage.tsx`
- `features/customers/pages/CustomerDetailsPage.tsx`
- `features/admin/tenants/pages/TenantListPage.tsx`
- `features/admin/users/pages/UserListPage.tsx`
- `features/admin/workers/pages/WorkerListPage.tsx`
- `features/admin/roles/pages/RoleListPage.tsx`
- `features/admin/permissions/pages/PermissionListPage.tsx`
- `features/catalog/items/pages/ItemListPage.tsx`
- `features/catalog/categories/pages/ItemCategoryListPage.tsx`

**Create:** `src/components/shared/ActiveBadge.tsx`

```tsx
import { cn } from "@/lib/utils";

interface ActiveBadgeProps {
  active: boolean;
  /** Override labels. Defaults to "Ativo" / "Inativo". */
  labels?: { active: string; inactive: string };
}

export function ActiveBadge({
  active,
  labels = { active: "Ativo", inactive: "Inativo" },
}: ActiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600",
      )}
    >
      {active ? labels.active : labels.inactive}
    </span>
  );
}
```

**Test file:** `src/components/shared/__tests__/ActiveBadge.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { ActiveBadge } from "../ActiveBadge";

describe("ActiveBadge", () => {
  it("shows 'Ativo' and green classes when active=true", () => {
    render(<ActiveBadge active={true} />);
    const badge = screen.getByText("Ativo");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-green-100", "text-green-800");
  });

  it("shows 'Inativo' and gray classes when active=false", () => {
    render(<ActiveBadge active={false} />);
    const badge = screen.getByText("Inativo");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-gray-100", "text-gray-600");
  });

  it("respects custom labels", () => {
    render(
      <ActiveBadge active={true} labels={{ active: "Sim", inactive: "Não" }} />,
    );
    expect(screen.getByText("Sim")).toBeInTheDocument();
  });
});
```

**Acceptance criteria:**

- [ ] `ActiveBadge.tsx` created at `src/components/shared/`
- [ ] All 9 inline definitions deleted
- [ ] All 9 pages import from `@/components/shared/ActiveBadge`
- [ ] Test file created and passing

---

### Task 1.3 — `StatusBadge`

**Pain point:** P6b — four files define a `StatusBadge` with different `STATUS_COLORS` maps (leads, orders, order board cards, delivery board cards).

**Create:** `src/components/shared/StatusBadge.tsx`

The component is generic — the caller supplies the color map so it works for any domain without importing domain types.

```tsx
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  /** Map of status string → Tailwind class string. Falls back to gray. */
  colorMap?: Record<string, string>;
  /** Human-readable label. Defaults to the raw status value. */
  label?: string;
}

const DEFAULT_FALLBACK = "bg-gray-100 text-gray-700";

export function StatusBadge({
  status,
  colorMap = {},
  label,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        colorMap[status] ?? DEFAULT_FALLBACK,
      )}
    >
      {label ?? status}
    </span>
  );
}
```

**Per-feature color maps** — define once in the feature's type or api file, not inline:

```ts
// features/leads/types/leadTypes.ts
export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
};

// features/orders/types/orderTypes.ts
export const ORDER_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};
```

**Usage:**

```tsx
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LEAD_STATUS_COLORS } from "@/features/leads/types/leadTypes";

<StatusBadge status={lead.status} colorMap={LEAD_STATUS_COLORS} />;
```

**Test file:** `src/components/shared/__tests__/StatusBadge.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

const colorMap = {
  WON: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
};

describe("StatusBadge", () => {
  it("applies the correct class from the color map", () => {
    render(<StatusBadge status="WON" colorMap={colorMap} />);
    expect(screen.getByText("WON")).toHaveClass(
      "bg-green-100",
      "text-green-800",
    );
  });

  it("falls back to gray for unknown status", () => {
    render(<StatusBadge status="UNKNOWN" colorMap={colorMap} />);
    expect(screen.getByText("UNKNOWN")).toHaveClass(
      "bg-gray-100",
      "text-gray-700",
    );
  });

  it("renders a custom label instead of the raw status", () => {
    render(<StatusBadge status="WON" colorMap={colorMap} label="Ganho" />);
    expect(screen.getByText("Ganho")).toBeInTheDocument();
  });

  it("renders with an empty color map and falls back gracefully", () => {
    render(<StatusBadge status="NEW" />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });
});
```

**Acceptance criteria:**

- [ ] `StatusBadge.tsx` created at `src/components/shared/`
- [ ] `LEAD_STATUS_COLORS` moved to `features/leads/types/leadTypes.ts`
- [ ] `ORDER_STATUS_COLORS` moved to `features/orders/types/orderTypes.ts`
- [ ] All inline `StatusBadge` definitions deleted (leads list, orders list, board pages)
- [ ] All affected pages import shared `StatusBadge` and the relevant color map
- [ ] Test file created and passing

---

### Task 1.4 — `TablePagination`

**Pain point:** P4 — identical `Pagination` component defined in 8 list pages.

**Note on naming:** The project already uses React Router which exports a type called `Pagination` in some versions. To avoid conflicts, name the component `TablePagination`.

**Current locations (all identical JSX):**

- `CustomerListPage`, `LeadListPage`, `OrderListPage`, `TenantListPage`, `UserListPage`, `WorkerListPage`, `RoleListPage`, `PermissionListPage`

**Create:** `src/components/shared/TablePagination.tsx`

```tsx
interface TablePaginationProps {
  /** Zero-based current page index. */
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  /** Optional: show total record count. */
  totalElements?: number;
}

export function TablePagination({
  page,
  totalPages,
  onPrev,
  onNext,
  totalElements,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span>
        Página {page + 1} de {totalPages}
        {totalElements !== undefined && ` · ${totalElements} registros`}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page === 0}
          aria-label="Página anterior"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages - 1}
          aria-label="Próxima página"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
```

**Test file:** `src/components/shared/__tests__/TablePagination.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TablePagination } from "../TablePagination";

describe("TablePagination", () => {
  it("renders nothing when totalPages <= 1", () => {
    const { container } = render(
      <TablePagination
        page={0}
        totalPages={1}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows correct page label", () => {
    render(
      <TablePagination
        page={1}
        totalPages={5}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByText(/Página 2 de 5/)).toBeInTheDocument();
  });

  it("disables Anterior on first page", () => {
    render(
      <TablePagination
        page={0}
        totalPages={3}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("disables Próxima on last page", () => {
    render(
      <TablePagination
        page={2}
        totalPages={3}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /próxima/i })).toBeDisabled();
  });

  it("calls onPrev when Anterior is clicked", async () => {
    const onPrev = vi.fn();
    render(
      <TablePagination
        page={1}
        totalPages={3}
        onPrev={onPrev}
        onNext={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /anterior/i }));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it("calls onNext when Próxima is clicked", async () => {
    const onNext = vi.fn();
    render(
      <TablePagination
        page={1}
        totalPages={3}
        onPrev={vi.fn()}
        onNext={onNext}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /próxima/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("shows totalElements when provided", () => {
    render(
      <TablePagination
        page={0}
        totalPages={3}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        totalElements={42}
      />,
    );
    expect(screen.getByText(/42 registros/)).toBeInTheDocument();
  });
});
```

**Acceptance criteria:**

- [ ] `TablePagination.tsx` created at `src/components/shared/`
- [ ] All 8 inline `Pagination` definitions deleted
- [ ] All 8 pages import `TablePagination` from `@/components/shared/TablePagination`
- [ ] Test file created and passing

---

## Wave 2 — Composite shared components

These are slightly more complex components. Complete Wave 1 before starting Wave 2.

---

### Task 2.1 — `ConfirmDeleteModal`

**Pain point:** P3 — `DeleteModal` defined in ~12 files. The only differences between instances are the entity noun in the message body (e.g., "o cliente", "o lead", "o pedido").

**Create:** `src/components/shared/ConfirmDeleteModal.tsx`

```tsx
import { AlertCircle, RefreshCw } from "lucide-react";

interface ConfirmDeleteModalProps {
  /**
   * The full description message. Use a node for rich text.
   * Example: <>Deseja excluir o cliente <strong>{name}</strong>?</>
   */
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  /** Override the confirm button label. Defaults to "Excluir". */
  confirmLabel?: string;
}

export function ConfirmDeleteModal({
  description,
  onConfirm,
  onCancel,
  isDeleting,
  confirmLabel = "Excluir",
}: ConfirmDeleteModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={20}
            className="text-destructive mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p id="delete-modal-title" className="text-sm font-semibold">
              Confirmar exclusão
            </p>
            <p className="text-sm text-muted-foreground">{description}</p>
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
            {isDeleting && (
              <RefreshCw
                size={12}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Usage pattern:**

```tsx
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";

{
  deleteTarget && (
    <ConfirmDeleteModal
      description={
        <>
          Deseja excluir o cliente{" "}
          <span className="font-medium">{deleteTarget.name}</span>? Esta ação
          não pode ser desfeita.
        </>
      }
      onConfirm={handleDelete}
      onCancel={() => setDeleteTarget(null)}
      isDeleting={deleteMutation.isPending}
    />
  );
}
```

**Test file:** `src/components/shared/__tests__/ConfirmDeleteModal.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";

const defaultProps = {
  description: "Deseja excluir este registro?",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  isDeleting: false,
};

describe("ConfirmDeleteModal", () => {
  it("renders with the correct role and aria attributes", () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders the title and description", () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    expect(screen.getByText("Confirmar exclusão")).toBeInTheDocument();
    expect(
      screen.getByText("Deseja excluir este registro?"),
    ).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteModal {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: /excluir/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(<ConfirmDeleteModal {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("disables both buttons and shows spinner when isDeleting=true", () => {
    render(<ConfirmDeleteModal {...defaultProps} isDeleting={true} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("uses a custom confirm label", () => {
    render(<ConfirmDeleteModal {...defaultProps} confirmLabel="Remover" />);
    expect(
      screen.getByRole("button", { name: /remover/i }),
    ).toBeInTheDocument();
  });
});
```

**Acceptance criteria:**

- [ ] `ConfirmDeleteModal.tsx` created at `src/components/shared/`
- [ ] All ~12 inline `DeleteModal` definitions deleted
- [ ] All ~12 pages import `ConfirmDeleteModal` from `@/components/shared/ConfirmDeleteModal`
- [ ] `role="dialog"` + `aria-modal` + `aria-labelledby` attributes verified in browser
- [ ] Keyboard: Escape key closes modal (implement with `useEffect` + `keydown` listener inside the component, or accept `onCancel` wired to Escape by the caller)
- [ ] Test file created and passing

---

### Task 2.2 — `PageHeader`

**Pain point (new):** Every list page and form page repeats the same two-element header layout — a title + subtitle on the left, an action button on the right. No existing shared component covers this.

**Create:** `src/components/shared/PageHeader.tsx`

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
```

**Usage:**

```tsx
<PageHeader
  title="Clientes"
  description="Gerenciar clientes cadastrados"
  actions={
    <button onClick={() => navigate("/customers/new")} className="...">
      <Plus size={16} /> Novo
    </button>
  }
/>
```

**Test file:** `src/components/shared/__tests__/PageHeader.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { PageHeader } from "../PageHeader";

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Clientes" />);
    expect(
      screen.getByRole("heading", { name: "Clientes" }),
    ).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Clientes" description="Lista de clientes" />);
    expect(screen.getByText("Lista de clientes")).toBeInTheDocument();
  });

  it("does not render description paragraph when omitted", () => {
    render(<PageHeader title="Clientes" />);
    expect(screen.queryByText(/lista/i)).not.toBeInTheDocument();
  });

  it("renders actions slot", () => {
    render(<PageHeader title="X" actions={<button>Novo</button>} />);
    expect(screen.getByRole("button", { name: "Novo" })).toBeInTheDocument();
  });
});
```

**Acceptance criteria:**

- [ ] `PageHeader.tsx` created at `src/components/shared/`
- [ ] Adopted in all list pages and form pages (optional in this wave — page-specific wiring can be deferred to a cleanup PR)
- [ ] Test file created and passing

---

### Task 2.3 — `EmptyState`

**Pain point (new):** Every list page hard-codes an empty-state block in a slightly different way. Standardise it.

**Create:** `src/components/shared/EmptyState.tsx`

```tsx
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon = <PackageOpen size={40} className="text-muted-foreground" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action}
    </div>
  );
}
```

**Test file:** `src/components/shared/__tests__/EmptyState.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState title="Nenhum cliente encontrado." />);
    expect(screen.getByText("Nenhum cliente encontrado.")).toBeInTheDocument();
  });

  it("renders optional description", () => {
    render(
      <EmptyState title="X" description="Adicione o primeiro registro." />,
    );
    expect(
      screen.getByText("Adicione o primeiro registro."),
    ).toBeInTheDocument();
  });

  it("renders optional action", () => {
    render(<EmptyState title="X" action={<button>Criar</button>} />);
    expect(screen.getByRole("button", { name: "Criar" })).toBeInTheDocument();
  });

  it("renders with a custom icon", () => {
    render(<EmptyState title="X" icon={<span data-testid="custom-icon" />} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
```

**Acceptance criteria:**

- [ ] `EmptyState.tsx` created at `src/components/shared/`
- [ ] Adopted in all list pages where hard-coded empty messages exist
- [ ] Test file created and passing

---

## Wave 3 — Utility consolidation

These are pure TypeScript / non-JSX fixes. No new components needed — just deletions and import corrections.

---

### Task 3.1 — Remove all `formatCents` duplicates

**Pain point:** P10 — local `formatCents` defined in 5 files. The canonical `formatCurrency(cents)` already exists at `src/lib/utils/formatCurrency.ts`.

**Files to fix:**

1. `features/leads/pages/LeadListPage.tsx` — delete `formatCents`, import `formatCurrency`
2. `features/leads/pages/LeadDetailsPage.tsx` — same
3. `features/orders/pages/OrderListPage.tsx` — delete `formatCents`, import `formatCurrency`
4. `features/orders/pages/OrderFormPage.tsx` — same
5. `features/orders/pages/OrderDetailsPage.tsx` — same

**Note:** `formatCents` in `OrderListPage` accepts a second `currencyCode` arg, but the canonical `formatCurrency` always uses BRL. All uses pass the default BRL, so no behaviour change.

**Acceptance criteria:**

- [ ] All 5 local `formatCents` functions deleted
- [ ] All 5 files import `{ formatCurrency }` from `@/lib/utils/formatCurrency`
- [ ] All call-sites updated: `formatCents(x)` → `formatCurrency(x)`

---

### Task 3.2 — Consolidate `PageResponse<T>`

**Pain point:** P11 — `PageResponse<T>` re-defined in 7 feature type files.

**Canonical location:** `src/lib/types/personTypes.ts` (already exported there).

**Files to fix** (remove local definition, add re-export or direct import):

1. `features/leads/types/leadTypes.ts`
2. `features/orders/types/orderTypes.ts`
3. `features/admin/roles/types/roleTypes.ts`
4. `features/admin/permissions/types/permissionTypes.ts`
5. `features/catalog/items/types/itemTypes.ts`
6. `features/catalog/categories/types/itemCategoryTypes.ts`

**Pattern:**

```ts
// Before — in each file:
export interface PageResponse<T> { ... }

// After — delete the local definition, then either:
// Option A: import directly where needed
import type { PageResponse } from "@/lib/types/personTypes";
// Option B: re-export for backward compat if the type was already exported from the feature's type file
export type { PageResponse } from "@/lib/types/personTypes";
```

**Acceptance criteria:**

- [ ] 6 local `PageResponse<T>` interfaces deleted
- [ ] All import sites updated
- [ ] TypeScript compiler reports no errors (`pnpm tsc --noEmit`)

---

### Task 3.3 — Consolidate `useTenants`

**Pain point:** P7 — same tenant fetch hook defined independently in 3 API files.

**Locations:**

- `features/customers/api/useCustomers.ts` → `useTenants()`
- `features/admin/users/api/useUsers.ts` → `useTenants()`
- `features/admin/workers/api/useWorkers.ts` → `useTenantsList()`

**Create:** `src/lib/api/useTenants.ts`

```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { TenantResponse } from "@/features/admin/tenants/types/tenantTypes";

export function useTenants() {
  return useQuery<TenantResponse[]>({
    queryKey: ["tenants"],
    queryFn: () => api.get<TenantResponse[]>("/tenants").then((r) => r.data),
    staleTime: 60_000,
  });
}
```

**Note:** `TenantResponse` has three different shapes across files (P19). Pick the most complete one (from `tenantTypes.ts`) and reconcile the others to match before moving the hook.

**Acceptance criteria:**

- [ ] `src/lib/api/useTenants.ts` created
- [ ] All 3 local tenant hook definitions deleted
- [ ] All 3 files import `{ useTenants }` from `@/lib/api/useTenants`
- [ ] `TenantResponse` shape is consistent across all 3 import sites
- [ ] TypeScript compiler reports no errors

---

## Wave 4 — Shared hooks

Complete Waves 1–3 before starting Wave 4.

---

### Task 4.1 — `useDisclosure`

**Why:** Every page that shows a modal (delete, detail, form) manually writes `const [open, setOpen] = useState(false)` + open/close/toggle handlers. Extracting `useDisclosure` removes this boilerplate consistently.

**Create:** `src/lib/hooks/useDisclosure.ts`

```ts
import { useState, useCallback } from "react";

interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDisclosure(initialState = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((s) => !s), []);
  return { isOpen, open, close, toggle };
}
```

**Test file:** `src/lib/hooks/__tests__/useDisclosure.test.ts`

```ts
import { renderHook, act } from "@testing-library/react";
import { useDisclosure } from "../useDisclosure";

describe("useDisclosure", () => {
  it("starts closed by default", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it("starts open when initialState=true", () => {
    const { result } = renderHook(() => useDisclosure(true));
    expect(result.current.isOpen).toBe(true);
  });

  it("opens when open() is called", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it("closes when close() is called", () => {
    const { result } = renderHook(() => useDisclosure(true));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("toggles state when toggle() is called", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });
});
```

**Acceptance criteria:**

- [ ] `src/lib/hooks/useDisclosure.ts` created
- [ ] `src/lib/hooks/__tests__/useDisclosure.test.ts` created and passing
- [ ] Adopted optionally in pages as a progressive enhancement (not required to update all pages in this wave)

---

### Task 4.2 — `useDeleteConfirm`

**Why:** Every list page writes the same `deleteTarget` state + `handleDelete` + `deleteMutation.isPending` wiring. This hook unifies that pattern.

**Create:** `src/lib/hooks/useDeleteConfirm.ts`

```ts
import { useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";

interface DeleteTarget<T> {
  id: number;
  label: T;
}

interface UseDeleteConfirmOptions<L> {
  mutation: UseMutationResult<void, Error, number>;
  onSuccess?: () => void;
}

export function useDeleteConfirm<L = string>({
  mutation,
  onSuccess,
}: UseDeleteConfirmOptions<L>) {
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget<L> | null>(
    null,
  );

  function requestDelete(id: number, label: L) {
    setDeleteTarget({ id, label });
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    mutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        onSuccess?.();
      },
    });
  }

  return {
    deleteTarget,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting: mutation.isPending,
  };
}
```

**Test file:** `src/lib/hooks/__tests__/useDeleteConfirm.test.ts`

```ts
import { renderHook, act } from "@testing-library/react";
import { useDeleteConfirm } from "../useDeleteConfirm";

function makeMutation(mutateFn = vi.fn()) {
  return { mutate: mutateFn, isPending: false } as any;
}

describe("useDeleteConfirm", () => {
  it("starts with no delete target", () => {
    const { result } = renderHook(() =>
      useDeleteConfirm({ mutation: makeMutation() }),
    );
    expect(result.current.deleteTarget).toBeNull();
  });

  it("sets delete target when requestDelete is called", () => {
    const { result } = renderHook(() =>
      useDeleteConfirm({ mutation: makeMutation() }),
    );
    act(() => result.current.requestDelete(1, "João"));
    expect(result.current.deleteTarget).toEqual({ id: 1, label: "João" });
  });

  it("clears delete target when cancelDelete is called", () => {
    const { result } = renderHook(() =>
      useDeleteConfirm({ mutation: makeMutation() }),
    );
    act(() => result.current.requestDelete(1, "João"));
    act(() => result.current.cancelDelete());
    expect(result.current.deleteTarget).toBeNull();
  });

  it("calls mutation.mutate with the target id when confirmDelete is called", () => {
    const mutate = vi.fn();
    const { result } = renderHook(() =>
      useDeleteConfirm({ mutation: makeMutation(mutate) }),
    );
    act(() => result.current.requestDelete(42, "Item"));
    act(() => result.current.confirmDelete());
    expect(mutate).toHaveBeenCalledWith(42, expect.any(Object));
  });
});
```

**Acceptance criteria:**

- [ ] `src/lib/hooks/useDeleteConfirm.ts` created
- [ ] `src/lib/hooks/__tests__/useDeleteConfirm.test.ts` created and passing

---

## Test infrastructure setup (prerequisite for all test tasks)

Before writing any test file, confirm the test runner is installed and configured.

**Check:** Does `vitest` appear in `devDependencies` in `package.json`?

- If **yes** — verify `vitest.config.ts` exists and has `environment: "jsdom"` set, then proceed.
- If **no** — install the test stack first:

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Create `vitest.config.ts` at the project root:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom";
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

**Acceptance criteria:**

- [ ] `pnpm test` runs without error
- [ ] At least one test file (`SkeletonRow.test.tsx`) passes before proceeding to other tasks

---

## Execution order (recommended)

```
[INFRA] Set up Vitest
   │
   ▼
[1.1] SkeletonRow         ← easiest, warmup
[1.2] ActiveBadge
[1.3] StatusBadge
[1.4] TablePagination
   │
   ▼
[2.1] ConfirmDeleteModal  ← highest impact
[2.2] PageHeader
[2.3] EmptyState
   │
   ▼
[3.1] Remove formatCents
[3.2] Consolidate PageResponse<T>
[3.3] Consolidate useTenants
   │
   ▼
[4.1] useDisclosure
[4.2] useDeleteConfirm
```

Tasks within each wave can be parallelised across developers.

---

## File map — new files to create

```
src/
├── test/
│   └── setup.ts                                       NEW
├── lib/
│   ├── api/
│   │   └── useTenants.ts                              NEW
│   └── hooks/
│       ├── useDisclosure.ts                           NEW
│       ├── useDeleteConfirm.ts                        NEW
│       └── __tests__/
│           ├── useDisclosure.test.ts                  NEW
│           └── useDeleteConfirm.test.ts               NEW
└── components/
    └── shared/
        ├── SkeletonRow.tsx                            NEW
        ├── ActiveBadge.tsx                            NEW
        ├── StatusBadge.tsx                            NEW
        ├── TablePagination.tsx                        NEW
        ├── ConfirmDeleteModal.tsx                     NEW
        ├── PageHeader.tsx                             NEW
        ├── EmptyState.tsx                             NEW
        └── __tests__/
            ├── SkeletonRow.test.tsx                   NEW
            ├── ActiveBadge.test.tsx                   NEW
            ├── StatusBadge.test.tsx                   NEW
            ├── TablePagination.test.tsx               NEW
            ├── ConfirmDeleteModal.test.tsx            NEW
            ├── PageHeader.test.tsx                    NEW
            └── EmptyState.test.tsx                    NEW
```

---

## Definition of Done — per task

A task is **done** when all of the following are true:

1. The shared file is created at the correct path.
2. Every inline duplicate is deleted from every feature page.
3. Every feature page imports from the shared file.
4. `pnpm tsc --noEmit` reports zero errors.
5. `pnpm test` reports the task's test file as passing.
6. The PR description lists which files were changed and which duplicates were removed.

---

## Out of scope for this plan

The following pain points are **not** addressed here. They are tracked for a future Phase 2 plan:

- P1 — `ConversationsPage` decomposition
- P1 — `SchedulesBoardPage` decomposition
- P2 — Kanban board abstraction (`OrdersBoardPage`, `SalesBoardPage`, `DeliveryBoardPage`)
- P8/P9 — `CustomerAutocomplete` / `Field` wrapper / `inputClass` in form pages
- P12 — `decodeJwt` duplication in `LeadDetailsPage`
- P13 — Inline query hooks in `CustomerDetailsPage`
- P14 — `FieldError`/`Label`/`inputCls` in admin form pages
- P15 — `UserFormPage` inline sub-components
- P16 — `PermissionListPage` inline CRUD modal
- P17 — Campaigns and Schedules Board mock wiring
- P18 — Dashboard mock/real data indicator
- P19 — `TenantResponse` shape reconciliation (partially covered in Task 3.3)
- P20 — `useRole` 404 fallback
- P21 — `useChangeUserPassword` triple-fallback chain
- P22 — Hardcoded `tenantId: 1` in catalog forms
- P23 — E2E tests with Playwright
- P24 — `PersonFields.tsx` decomposition
