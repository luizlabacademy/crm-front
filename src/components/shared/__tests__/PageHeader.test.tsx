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
