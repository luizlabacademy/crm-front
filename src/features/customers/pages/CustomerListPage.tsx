import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useCustomers,
  useDeleteCustomer,
} from "@/features/customers/api/useCustomers";
import {
  getEntityDisplayName,
  getEntityDocument,
} from "@/lib/types/personTypes";
import { formatDateTime } from "@/lib/utils/formatDate";
import { SkeletonRow } from "@/components/shared/SkeletonRow";
import { ActiveBadge } from "@/components/shared/ActiveBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import { Button } from "@/components/shared/Button";
import { InputGroup, InputGroupAddon } from "@/components/shared/InputGroup";
import {
  DataTableContainer,
  Table,
  TableBody,
  TableCell,
  TableEmptyRow,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@/components/shared/Table";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDocument(doc: string): string {
  const digits = doc.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }
  return doc;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CustomerListPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [tenantIdInput, setTenantIdInput] = useState("");
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useCustomers({
    page,
    size: 20,
    tenantId,
  });

  const deleteMutation = useDeleteCustomer();

  const customers = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  function handleTenantFilter(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(tenantIdInput, 10);
    setTenantId(isNaN(val) ? null : val);
    setPage(0);
  }

  function handleClearFilter() {
    setTenantIdInput("");
    setTenantId(null);
    setPage(0);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Cliente excluído com sucesso.");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.error("Cliente não encontrado.");
      } else {
        toast.error("Erro ao excluir. Tente novamente.");
      }
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Carregando..."
              : `${totalElements} cliente${totalElements !== 1 ? "s" : ""} cadastrado${totalElements !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button type="button" onClick={() => void navigate("/customers/new")}>
          <Plus size={15} />
          Novo cliente
        </Button>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleTenantFilter}
        className="flex items-center gap-2 flex-wrap"
      >
        <InputGroup className="w-56">
          <InputGroupAddon>Tenant</InputGroupAddon>
          <input
            type="number"
            value={tenantIdInput}
            onChange={(e) => setTenantIdInput(e.target.value)}
            placeholder="ID"
            className="h-8 w-full border-0 bg-transparent px-2 text-sm outline-none"
          />
        </InputGroup>
        <Button type="submit" variant="outline" size="xs">
          Filtrar
        </Button>
        {tenantId !== null && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleClearFilter}
          >
            Limpar filtro
          </Button>
        )}
      </form>

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>Erro ao carregar clientes. Verifique sua conexão.</span>
          <Button
            type="button"
            variant="link"
            size="xs"
            onClick={() => void refetch()}
          >
            <RefreshCw size={12} />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Table */}
      <DataTableContainer>
        <TableScroll>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border text-left text-xs text-muted-foreground bg-muted/40">
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={7} />
                ))
              ) : customers.length === 0 ? (
                <TableEmptyRow colSpan={7}>
                  <p>Nenhum cliente encontrado.</p>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={() => void navigate("/customers/new")}
                    className="mt-2"
                  >
                    Cadastrar primeiro cliente
                  </Button>
                </TableEmptyRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => void navigate(`/customers/${customer.id}`)}
                  >
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {customer.id}
                    </TableCell>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {getEntityDisplayName(customer)}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[180px] truncate">
                      {customer.email ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {customer.document
                        ? formatDocument(customer.document)
                        : getEntityDocument(customer) !== "—"
                          ? getEntityDocument(customer)
                          : "—"}
                    </TableCell>
                    <TableCell>
                      <ActiveBadge active={customer.active} />
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDateTime(customer.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="Ver detalhes"
                          onClick={() =>
                            void navigate(`/customers/${customer.id}`)
                          }
                          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label="Editar"
                          onClick={() =>
                            void navigate(`/customers/${customer.id}/edit`)
                          }
                          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label="Excluir"
                          onClick={() =>
                            setDeleteTarget({
                              id: customer.id,
                              name: getEntityDisplayName(customer),
                            })
                          }
                          className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableScroll>

        <TablePagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </DataTableContainer>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          description={
            <>
              Deseja excluir o cliente{" "}
              <span className="font-medium">{deleteTarget.name}</span>? Esta
              ação não pode ser desfeita.
            </>
          }
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
