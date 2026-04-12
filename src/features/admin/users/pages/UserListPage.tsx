import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  User,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useUsers,
  useDeleteUser,
  useTenants,
} from "@/features/admin/users/api/useUsers";
import { ADMIN_SEED_EMAIL } from "@/features/admin/users/types/userTypes";
import type {
  TenantResponse,
  UserResponse,
} from "@/features/admin/users/types/userTypes";
import { usePersons } from "@/features/persons/api/usePersons";
import { getPersonDisplayName } from "@/features/persons/types/personTypes";
import { cn } from "@/lib/utils";

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600",
      )}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

interface TenantAutocompleteProps {
  tenants: TenantResponse[];
  value: number | null;
  onChange: (tenantId: number | null) => void;
}

function TenantAutocomplete({
  tenants,
  value,
  onChange,
}: TenantAutocompleteProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selected = tenants.find((tenant) => tenant.id === value);
  const shownValue = open ? search : (selected?.name ?? "");
  const filtered = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative min-w-72">
      <div className="relative">
        <input
          type="text"
          value={shownValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Filtrar por tenant"
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        />
        <Search
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent transition-colors"
            onMouseDown={() => {
              onChange(null);
              setSearch("");
              setOpen(false);
            }}
          >
            Todos os tenants
          </button>
          {filtered.map((tenant) => (
            <button
              key={tenant.id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
              onMouseDown={() => {
                onChange(tenant.id);
                setSearch("");
                setOpen(false);
              }}
            >
              {tenant.name}{" "}
              <span className="text-xs text-muted-foreground">
                #{tenant.id}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Nenhum tenant encontrado.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface DeleteModalProps {
  email: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({
  email,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-destructive mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Confirmar exclusão</p>
            <p className="text-sm text-muted-foreground">
              Deseja excluir o usuário{" "}
              <span className="font-medium">{email}</span>? Esta ação não pode
              ser desfeita.
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

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span>
        Página {page + 1} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page === 0}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages - 1}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

function toEnumLabel(value: string): string {
  return value.trim().replace(/\s+/g, "_").replace(/-/g, "_").toUpperCase();
}

function getProfileLabel(user: UserResponse): string {
  if (user.roleEnums && user.roleEnums.length > 0) {
    return user.roleEnums.map((value) => toEnumLabel(value)).join(", ");
  }
  if (user.profiles && user.profiles.length > 0) {
    return user.profiles.map((value) => toEnumLabel(value)).join(", ");
  }
  if (user.profile) return toEnumLabel(user.profile);
  if (user.roleEnum) return toEnumLabel(user.roleEnum);
  if (user.roleName) return toEnumLabel(user.roleName);
  if (user.role?.name) return toEnumLabel(user.role.name);
  if (user.roles && user.roles.length > 0) {
    return user.roles.map((role) => toEnumLabel(role.name)).join(", ");
  }
  if (user.roleId != null) return `ROLE_${user.roleId}`;

  const anyUser = user as unknown as Record<string, unknown>;
  const rawProfiles = anyUser["profiles"];
  if (Array.isArray(rawProfiles) && rawProfiles.length > 0) {
    return rawProfiles
      .map((value) =>
        typeof value === "string" ? toEnumLabel(value) : String(value),
      )
      .join(", ");
  }

  return "—";
}

export function UserListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    email: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({
    page,
    size: 20,
    tenantId,
  });
  const deleteMutation = useDeleteUser();
  const { data: tenantsData } = useTenants();
  const { data: personsData } = usePersons({ page: 0, size: 500, tenantId });

  const users = data?.content ?? [];
  const tenants = tenantsData?.content ?? [];
  const persons = personsData?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const personsById = useMemo(
    () =>
      new Map(
        persons.map((person) => [person.id, getPersonDisplayName(person)]),
      ),
    [persons],
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Usuário excluído com sucesso.");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.error("Usuário não encontrado.");
      } else {
        toast.error("Erro ao excluir. Tente novamente.");
      }
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Carregando..."
              : `${totalElements} usuário${totalElements !== 1 ? "s" : ""} cadastrado${totalElements !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void navigate("/users/new")}
          className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Novo usuário
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <TenantAutocomplete
          tenants={tenants}
          value={tenantId}
          onChange={(newTenantId) => {
            setTenantId(newTenantId);
            setPage(0);
          }}
        />
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>Erro ao carregar usuários. Verifique sua conexão.</span>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-1.5 underline underline-offset-2 hover:no-underline"
          >
            <RefreshCw size={12} />
            Tentar novamente
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground bg-muted/40">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <User size={32} className="text-muted-foreground/50" />
                      <p>Nenhum usuário encontrado.</p>
                      <button
                        type="button"
                        onClick={() => void navigate("/users/new")}
                        className="mt-1 text-sm text-primary hover:underline"
                      >
                        Criar usuário
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isAdmin = user.email === ADMIN_SEED_EMAIL;
                  const personName =
                    user.personId != null
                      ? (personsById.get(user.personId) ??
                        `Pessoa #${user.personId}`)
                      : "Sem vínculo";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => void navigate(`/users/${user.id}/edit`)}
                    >
                      <td className="px-4 py-3 font-medium max-w-[220px] truncate">
                        {personName}
                      </td>
                      <td className="px-4 py-3 max-w-[220px] truncate">
                        {user.email}
                        {isAdmin && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-medium">
                            admin
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[220px] truncate">
                        {getProfileLabel(user)}
                      </td>
                      <td className="px-4 py-3">
                        <ActiveBadge active={user.active} />
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            aria-label="Editar usuário"
                            onClick={() =>
                              void navigate(`/users/${user.id}/edit`)
                            }
                            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            aria-label="Excluir usuário"
                            disabled={isAdmin}
                            title={
                              isAdmin
                                ? "Usuário administrador não pode ser excluído"
                                : undefined
                            }
                            onClick={() =>
                              setDeleteTarget({
                                id: user.id,
                                email: user.email,
                              })
                            }
                            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </div>

      {deleteTarget && (
        <DeleteModal
          email={deleteTarget.email}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
