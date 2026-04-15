import { render } from "@testing-library/react";
import { SkeletonRow } from "../SkeletonRow";

describe("SkeletonRow", () => {
  it("renders the default number of cells", () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonRow />
        </tbody>
      </table>,
    );
    expect(container.querySelectorAll("td")).toHaveLength(6);
  });

  it("renders the specified number of cells", () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonRow cols={8} />
        </tbody>
      </table>,
    );
    expect(container.querySelectorAll("td")).toHaveLength(8);
  });

  it("renders the pulse animation div in each cell", () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonRow cols={3} />
        </tbody>
      </table>,
    );
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });
});
