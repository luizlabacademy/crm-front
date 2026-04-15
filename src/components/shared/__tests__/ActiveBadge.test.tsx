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
