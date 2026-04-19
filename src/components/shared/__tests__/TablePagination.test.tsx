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

  it("shows correct page number", () => {
    render(
      <TablePagination
        page={1}
        totalPages={5}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByText("2")).toBeInTheDocument();
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
