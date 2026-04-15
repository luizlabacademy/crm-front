import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

const colorMap = {
  WON: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
};

describe("StatusBadge", () => {
  it("applies the correct class from the color map", () => {
    render(<StatusBadge status="WON" colorMap={colorMap} />);
    expect(screen.getByText("WON")).toHaveClass(
      "bg-green-100",
      "text-green-800",
    );
  });

  it("falls back to gray for unknown status", () => {
    render(<StatusBadge status="UNKNOWN" colorMap={colorMap} />);
    expect(screen.getByText("UNKNOWN")).toHaveClass(
      "bg-gray-100",
      "text-gray-700",
    );
  });

  it("renders a custom label instead of the raw status", () => {
    render(<StatusBadge status="WON" colorMap={colorMap} label="Ganho" />);
    expect(screen.getByText("Ganho")).toBeInTheDocument();
  });

  it("renders with an empty color map and falls back gracefully", () => {
    render(<StatusBadge status="NEW" />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });
});
