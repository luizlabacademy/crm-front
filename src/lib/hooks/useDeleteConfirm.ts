import { useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";

interface DeleteTarget<L> {
  id: number;
  label: L;
}

interface UseDeleteConfirmOptions {
  mutation: UseMutationResult<void, Error, number>;
  onSuccess?: () => void;
}

export function useDeleteConfirm<L = string>({
  mutation,
  onSuccess,
}: UseDeleteConfirmOptions) {
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
