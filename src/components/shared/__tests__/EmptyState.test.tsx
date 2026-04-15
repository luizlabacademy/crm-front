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
