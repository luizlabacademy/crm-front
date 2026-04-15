import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useDeleteConfirm } from "../useDeleteConfirm";
import type { UseMutationResult } from "@tanstack/react-query";

function makeMutation(
  overrides?: Partial<UseMutationResult<void, Error, number>>,
): UseMutationResult<void, Error, number> {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isIdle: true,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
    reset: vi.fn(),
    status: "idle",
    variables: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
    context: undefined,
    ...overrides,
  } as unknown as UseMutationResult<void, Error, number>;
}

describe("useDeleteConfirm", () => {
  it("initializes with deleteTarget = null", () => {
    const mutation = makeMutation();
    const { result } = renderHook(() => useDeleteConfirm({ mutation }));
    expect(result.current.deleteTarget).toBeNull();
  });

  it("requestDelete sets deleteTarget", () => {
    const mutation = makeMutation();
    const { result } = renderHook(() => useDeleteConfirm({ mutation }));
    act(() => result.current.requestDelete(42, "Test Item"));
    expect(result.current.deleteTarget).toEqual({ id: 42, label: "Test Item" });
  });

  it("cancelDelete clears deleteTarget", () => {
    const mutation = makeMutation();
    const { result } = renderHook(() => useDeleteConfirm({ mutation }));
    act(() => result.current.requestDelete(1, "Item"));
    act(() => result.current.cancelDelete());
    expect(result.current.deleteTarget).toBeNull();
  });

  it("confirmDelete does nothing when no deleteTarget", () => {
    const mutateFn = vi.fn();
    const mutation = makeMutation({ mutate: mutateFn });
    const { result } = renderHook(() => useDeleteConfirm({ mutation }));
    act(() => result.current.confirmDelete());
    expect(mutateFn).not.toHaveBeenCalled();
  });

  it("confirmDelete calls mutation.mutate with the target id", () => {
    const mutateFn = vi.fn();
    const mutation = makeMutation({ mutate: mutateFn });
    const { result } = renderHook(() => useDeleteConfirm({ mutation }));
    act(() => result.current.requestDelete(7, "Target"));
    act(() => result.current.confirmDelete());
    expect(mutateFn).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("isDeleting reflects mutation.isPending", () => {
    const mutation = makeMutation({ isPending: true });
    const { result } = renderHook(() => useDeleteConfirm({ mutation }));
    expect(result.current.isDeleting).toBe(true);
  });

  it("onSuccess callback clears deleteTarget and calls onSuccess option", () => {
    const onSuccess = vi.fn();
    let capturedOnSuccess: (() => void) | undefined;
    const mutateFn = vi.fn((_id: number, opts: { onSuccess: () => void }) => {
      capturedOnSuccess = opts.onSuccess;
    });
    const mutation = makeMutation({
      mutate: mutateFn as UseMutationResult<void, Error, number>["mutate"],
    });
    const { result } = renderHook(() =>
      useDeleteConfirm({ mutation, onSuccess }),
    );

    act(() => result.current.requestDelete(3, "Label"));
    act(() => result.current.confirmDelete());
    act(() => capturedOnSuccess?.());

    expect(result.current.deleteTarget).toBeNull();
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
