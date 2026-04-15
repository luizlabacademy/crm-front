import { renderHook, act } from "@testing-library/react";
import { useDisclosure } from "../useDisclosure";

describe("useDisclosure", () => {
  it("initializes with isOpen = false by default", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it("initializes with isOpen = true when initialState is true", () => {
    const { result } = renderHook(() => useDisclosure(true));
    expect(result.current.isOpen).toBe(true);
  });

  it("open() sets isOpen to true", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it("close() sets isOpen to false", () => {
    const { result } = renderHook(() => useDisclosure(true));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("toggle() flips isOpen from false to true", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
  });

  it("toggle() flips isOpen from true to false", () => {
    const { result } = renderHook(() => useDisclosure(true));
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it("returns stable function references across renders", () => {
    const { result, rerender } = renderHook(() => useDisclosure());
    const { open, close, toggle } = result.current;
    rerender();
    expect(result.current.open).toBe(open);
    expect(result.current.close).toBe(close);
    expect(result.current.toggle).toBe(toggle);
  });
});
