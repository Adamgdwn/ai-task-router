import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../App";
import {
  createLocalStore,
  createLocalStoreDatabase,
  type LocalStore,
  type LocalStoreDatabase,
} from "../../storage/localStore";
import { screenDefinitions } from "../../ui/screens/screenDefinitions";

let databaseCounter = 0;
const storesToDelete: LocalStore[] = [];

afterEach(async () => {
  cleanup();

  await Promise.all(storesToDelete.map((store) => store.deleteDatabase()));
  storesToDelete.length = 0;
});

describe("App", () => {
  it("renders the product boundary and every planned screen", async () => {
    const user = userEvent.setup();

    render(<App store={buildTestStore()} />);

    expect(screen.getByAltText("Guided AI Labs")).toHaveAttribute(
      "src",
      "/brand/guided-ai-labs-logo-dark-safe.svg",
    );
    expect(screen.getByText("Guided AI Labs")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI Task Router", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("No external AI API calls")).toBeInTheDocument();
    expect(screen.getByText("No connectors or execution mode")).toBeInTheDocument();

    for (const definition of screenDefinitions) {
      await user.click(screen.getByRole("button", { name: definition.label }));

      expect(screen.getByRole("heading", { name: definition.title, level: 2 })).toBeInTheDocument();
      expect(screen.getByText(definition.summary)).toBeInTheDocument();
    }
  });

  it("lets users edit tool inventory and keeps changes after refresh", async () => {
    const user = userEvent.setup();
    const store = buildTestStore();
    const { unmount } = render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "Tool Inventory" }));
    const freeAgentRow = await screen.findByRole("region", { name: "User-configured free/small model" });
    const freeAgentLabel = within(freeAgentRow).getByRole("textbox", {
      name: "Tool label for user-free-small-model",
    });

    await user.clear(freeAgentLabel);
    await user.type(freeAgentLabel, "My free assistant");
    await user.click(within(freeAgentRow).getByRole("checkbox", { name: "Enabled" }));
    await user.click(screen.getByRole("button", { name: "Save setup" }));

    await screen.findByText("Local setup saved.");

    unmount();
    render(<App store={store} />);
    await user.click(screen.getByRole("button", { name: "Tool Inventory" }));

    const savedFreeAgentRow = await screen.findByRole("region", { name: "My free assistant" });
    expect(within(savedFreeAgentRow).getByDisplayValue("My free assistant")).toBeInTheDocument();
    expect(within(savedFreeAgentRow).getByRole("checkbox", { name: "Disabled" })).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Restore defaults" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("User-configured free/small model")).toBeInTheDocument();
    });
  });

  it("lets users save source permissions, policy default choice, and the disabled best-stack note", async () => {
    const user = userEvent.setup();
    const store = buildTestStore();
    const { unmount } = render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "Source Permissions" }));
    await user.selectOptions(await screen.findByRole("combobox", { name: "Permission level for web" }), "0");

    await user.click(screen.getByRole("button", { name: "Policy Settings" }));
    expect(screen.getByRole("checkbox", { name: /Proposed best stack recommendations/ })).toBeDisabled();

    await user.click(await screen.findByRole("radio", { name: "Quality first" }));
    await user.click(screen.getByRole("button", { name: "Save setup" }));

    await screen.findByText("Local setup saved.");

    unmount();
    render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "Source Permissions" }));
    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Permission level for web" })).toHaveValue("0");
    });

    await user.click(screen.getByRole("button", { name: "Policy Settings" }));
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "Quality first" })).toBeChecked();
    });
  });

  it("shows task intake validation near required fields", async () => {
    const user = userEvent.setup();

    render(<App store={buildTestStore()} />);

    await user.click(screen.getByRole("button", { name: "Task Intake" }));
    await screen.findByText(/Routing runs in this browser from the local setup, task intake, and policy default/);

    await user.click(screen.getByRole("button", { name: "Generate local routes" }));

    expect(await screen.findByText("Task title is required.")).toBeInTheDocument();
    expect(screen.getByText("Task description is required.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Route Results" }));

    expect(screen.getByRole("heading", { name: "Task intake needs correction" })).toBeInTheDocument();
  });

  it("generates route results from a template and saves route artifacts locally", async () => {
    const user = userEvent.setup();
    const store = buildTestStore();

    render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "Task Intake" }));
    await screen.findByText("Personal memory");
    await user.selectOptions(screen.getByLabelText("Start from template"), "draft-public-facing-copy");
    await user.click(screen.getByRole("button", { name: "Generate local routes" }));

    expect(await screen.findByRole("heading", { name: "Route Results", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lean route", level: 4 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Balanced route", level: 4 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Premium route", level: 4 })).toBeInTheDocument();
    expect(screen.getAllByText("Recommended route").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Warnings" })).toBeInTheDocument();
    expect(screen.getByText(/Human approval is required before using public-facing/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save route card and prompt package" }));

    expect(await screen.findByText("Route card and prompt package saved locally.")).toBeInTheDocument();

    const records = await store.loadRouteRecords();
    expect(records.routeCards).toHaveLength(1);
    expect(records.promptPackages).toHaveLength(1);
    expect(records.routeCards[0]?.promptPackage.id).toBe(records.promptPackages[0]?.id);
  });

  it("shows blocked routes when requested sources fail local gates", async () => {
    const user = userEvent.setup();
    const store = buildTestStore();

    await store.seedDefaultConfigurationIfEmpty();
    const configuration = await store.loadConfiguration();
    await store.saveSourcePermissionRegistry(
      configuration.sourcePermissionRegistry.map((sourcePermission) =>
        sourcePermission.id === "web" ? { ...sourcePermission, permissionLevel: 0 } : sourcePermission,
      ),
    );

    render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "Task Intake" }));
    await screen.findByText("Web");
    await user.selectOptions(screen.getByLabelText("Start from template"), "research-current-facts");
    await user.click(screen.getByRole("button", { name: "Generate local routes" }));

    expect(await screen.findByRole("heading", { name: "Route Results", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Blocked routes" })).toBeInTheDocument();
    expect(screen.getByText("Web is set to no access and cannot be used in a route.")).toBeInTheDocument();
    expect(screen.getByText(/Current facts or citations need an allowed research source/)).toBeInTheDocument();
  });

  it("shows an empty local artifact state before route cards are saved", async () => {
    const user = userEvent.setup();

    render(<App store={buildTestStore()} />);

    await user.click(screen.getByRole("button", { name: "Route Card" }));

    expect(await screen.findByRole("heading", { name: "No saved route artifacts yet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Task Intake" })).toBeInTheDocument();
  });

  it("shows saved route cards with local copy and Markdown download preparation", async () => {
    const user = userEvent.setup();
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    installClipboardMock(clipboardWriteText);

    render(<App store={buildTestStore()} />);

    await generateAndSavePublicFacingRoute(user);
    await user.click(screen.getByRole("button", { name: "Route Card" }));

    expect(await screen.findByRole("heading", { name: "Route card: Draft public-facing copy" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Saved route card" })).toHaveValue("route-card-task-local-route");
    expect(screen.getByText("Route options and tradeoffs")).toBeInTheDocument();
    expect(screen.getByText("Blocked routes")).toBeInTheDocument();
    expect(screen.getByText("Warnings")).toBeInTheDocument();

    const markdownPreview = screen.getByLabelText("Prepared route card Markdown") as HTMLTextAreaElement;
    expect(markdownPreview.value).toContain("# Route card: Draft public-facing copy");
    expect(markdownPreview.value).toContain("## Route Options");

    const downloadLink = screen.getByRole("link", { name: "Download Markdown" });
    expect(downloadLink).toHaveAttribute("download", expect.stringMatching(/^route-card-.*\.md$/));
    expect(downloadLink.getAttribute("href")).toContain("data:text/markdown;charset=utf-8");

    await user.click(screen.getByRole("button", { name: "Copy Route card Markdown" }));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(expect.stringContaining("# Route card: Draft public-facing copy"));
    });
    expect(screen.getByText("Route card Markdown copied locally.")).toBeInTheDocument();
  });

  it("shows saved prompt packages with ordered steps and step-level approval copy", async () => {
    const user = userEvent.setup();
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    installClipboardMock(clipboardWriteText);

    render(<App store={buildTestStore()} />);

    await generateAndSavePublicFacingRoute(user);
    await user.click(screen.getByRole("button", { name: "Prompt Package" }));

    expect(await screen.findByRole("heading", { name: "Prompt package: Draft public-facing copy" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prompt steps" })).toBeInTheDocument();
    expect(screen.getByText("Human approval requirements stay attached to the step where they matter.")).toBeInTheDocument();
    expect(screen.getByText("Human approval required")).toBeInTheDocument();
    expect(screen.getAllByText("Expected output").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Input refs").length).toBeGreaterThan(0);

    const markdownPreview = screen.getByLabelText("Prepared prompt package Markdown") as HTMLTextAreaElement;
    expect(markdownPreview.value).toContain("# Prompt package: Draft public-facing copy");
    expect(markdownPreview.value).toContain("Human approval: Required");

    const downloadLink = screen.getByRole("link", { name: "Download Markdown" });
    expect(downloadLink).toHaveAttribute("download", expect.stringMatching(/^prompt-package-.*\.md$/));

    await user.click(screen.getAllByRole("button", { name: "Copy prompt step text" })[0]);

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(expect.stringContaining("Expected output:"));
    });
    expect(screen.getByText("Prompt step 1 copied locally.")).toBeInTheDocument();
  });
});

function buildTestStore(): LocalStore {
  databaseCounter += 1;

  const database: LocalStoreDatabase = createLocalStoreDatabase(`ai-task-router-app-test-${databaseCounter}`);
  const store = createLocalStore({ database });

  storesToDelete.push(store);

  return store;
}

async function generateAndSavePublicFacingRoute(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Task Intake" }));
  await screen.findByText("Personal memory");
  await user.selectOptions(screen.getByLabelText("Start from template"), "draft-public-facing-copy");
  await user.click(screen.getByRole("button", { name: "Generate local routes" }));
  await screen.findByRole("heading", { name: "Route Results", level: 2 });
  await user.click(screen.getByRole("button", { name: "Save route card and prompt package" }));
  await screen.findByText("Route card and prompt package saved locally.");
}

function installClipboardMock(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText,
    },
  });
}
