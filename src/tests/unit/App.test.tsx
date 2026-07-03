import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../App";
import { screenDefinitions } from "../../ui/screens/screenDefinitions";

describe("App skeleton", () => {
  it("renders the product boundary and every planned placeholder screen", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "AI Task Router", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("No external AI API calls")).toBeInTheDocument();
    expect(screen.getByText("No connectors or execution mode")).toBeInTheDocument();

    for (const definition of screenDefinitions) {
      await user.click(screen.getByRole("button", { name: definition.label }));

      expect(screen.getByRole("heading", { name: definition.title, level: 2 })).toBeInTheDocument();
      expect(screen.getByText(definition.summary)).toBeInTheDocument();
    }
  });
});
