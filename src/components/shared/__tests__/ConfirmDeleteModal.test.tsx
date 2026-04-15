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
