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
import { legacyPrefilledToolModels } from "../fixtures/legacyPrefilledToolModels";
import { routeReadyModels } from "../fixtures/routeReadyModels";

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
    expect(screen.getByText("Your browser only")).toBeInTheDocument();
    expect(screen.getByText("No hidden AI calls or telemetry")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose my tools" })).toBeInTheDocument();

    for (const definition of screenDefinitions) {
      await user.click(screen.getByRole("button", { name: definition.label }));

      expect(screen.getByRole("heading", { name: definition.title, level: 2 })).toBeInTheDocument();
      expect(screen.getByText(definition.summary)).toBeInTheDocument();
    }
  });

  it("lets users add familiar AI apps one at a time and keeps changes after refresh", async () => {
    const user = userEvent.setup();
    const store = buildTestStore();
    const { unmount } = render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "My AI Tools" }));
    const firstToolRow = (await screen.findAllByRole("region", { name: "Tool selection" }))[0];
    const firstApp = within(firstToolRow).getByRole("combobox", {
      name: "AI app for user-mid-synthesis-model",
    });
    const firstAccount = within(firstToolRow).getByRole("combobox", {
      name: "Account level for user-mid-synthesis-model",
    });
    const firstFrequency = within(firstToolRow).getByRole("combobox", {
      name: "How often for user-mid-synthesis-model",
    });

    expect(firstAccount).toBeDisabled();
    expect(firstFrequency).toBeDisabled();

    await user.selectOptions(firstApp, "chatgpt");
    await waitFor(() => {
      expect(firstApp).toHaveDisplayValue("ChatGPT");
    });
    expect(screen.getByRole("option", { name: "Go" })).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: "Tool selection" })).toHaveLength(1);
    await user.selectOptions(
      within(firstToolRow).getByRole("combobox", { name: "Account level for user-mid-synthesis-model" }),
      "pro",
    );
    await user.selectOptions(
      within(firstToolRow).getByRole("combobox", { name: "How often for user-mid-synthesis-model" }),
      "hourly",
    );

    await user.click(screen.getByRole("button", { name: /Add another tool/ }));
    await waitFor(() => {
      expect(screen.getAllByRole("region", { name: "Tool selection" })).toHaveLength(2);
    });
    const secondToolRow = screen.getAllByRole("region", { name: "Tool selection" })[1];
    await user.selectOptions(
      within(secondToolRow).getByRole("combobox", { name: "AI app for user-free-small-model" }),
      "local",
    );
    await waitFor(() => {
      expect(
        within(secondToolRow).getByRole("combobox", { name: "AI app for user-free-small-model" }),
      ).toHaveDisplayValue("Local or private AI");
    });
    expect(within(secondToolRow).getByRole("combobox", { name: "Local model for user-free-small-model" })).toHaveDisplayValue(
      "Ollama",
    );
    await user.selectOptions(
      within(secondToolRow).getByRole("combobox", { name: "Local model for user-free-small-model" }),
      "local-lm-studio",
    );
    await user.selectOptions(
      within(secondToolRow).getByRole("combobox", { name: "How often for user-free-small-model" }),
      "weekly",
    );
    await user.click(screen.getByRole("button", { name: "Save my choices" }));

    await screen.findByText("Your choices were saved on this device.");

    unmount();
    render(<App store={store} />);
    await user.click(screen.getByRole("button", { name: "My AI Tools" }));

    const savedToolRows = await screen.findAllByRole("region", { name: "Tool selection" });
    const savedChatGptRow = savedToolRows[0];
    expect(
      within(savedChatGptRow).getByRole("combobox", { name: "AI app for user-mid-synthesis-model" }),
    ).toHaveDisplayValue("ChatGPT");
    expect(
      within(savedChatGptRow).getByRole("combobox", { name: "Account level for user-mid-synthesis-model" }),
    ).toHaveDisplayValue("Pro");
    expect(
      within(savedChatGptRow).getByRole("combobox", { name: "How often for user-mid-synthesis-model" }),
    ).toHaveDisplayValue("Many times a day");

    const savedLocalRow = savedToolRows[1];
    expect(
      within(savedLocalRow).getByRole("combobox", { name: "AI app for user-free-small-model" }),
    ).toHaveDisplayValue("Local or private AI");
    expect(
      within(savedLocalRow).getByRole("combobox", { name: "Local model for user-free-small-model" }),
    ).toHaveDisplayValue("LM Studio");
    expect(screen.getAllByRole("region", { name: "Tool selection" })).toHaveLength(2);

    await user.click(within(savedLocalRow).getByRole("button", { name: "Remove Local or private AI" }));

    await waitFor(() => {
      expect(screen.getByText("1 selected")).toBeInTheDocument();
    });
    expect(screen.getAllByRole("region", { name: "Tool selection" })).toHaveLength(1);
    expect(screen.queryByDisplayValue("Local or private AI")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Restore starter choices" }));

    await waitFor(() => {
      expect(screen.getAllByRole("region", { name: "Tool selection" })).toHaveLength(1);
    });
  });

  it("upgrades the old prefilled AI tool starter rows into one blank selector", async () => {
    const user = userEvent.setup();
    const store = buildTestStore();

    await store.seedDefaultConfigurationIfEmpty();
    await store.saveModelInventory(legacyPrefilledToolModels);

    render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "My AI Tools" }));

    expect(await screen.findByText("0 selected")).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: "Tool selection" })).toHaveLength(1);
    expect(screen.queryByRole("region", { name: "ChatGPT" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Gemini" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "AI app for user-mid-synthesis-model" })).toHaveDisplayValue(
      "Choose an AI app",
    );
    expect(screen.getByRole("option", { name: "Genspark" })).toBeInTheDocument();
  });

  it("lets users save information comfort, choosing style, and the disabled toolkit note", async () => {
    const user = userEvent.setup();
    const store = await buildRouteReadyTestStore();
    const { unmount } = render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "What To Include" }));
    await user.click(await screen.findByRole("checkbox", { name: "Include Websites or web search" }));

    await user.click(screen.getByRole("button", { name: "Choosing Style" }));
    expect(screen.getByRole("checkbox", { name: /Suggest a full AI toolkit/ })).toBeDisabled();

    await user.click(await screen.findByRole("radio", { name: /Best quality when it matters/ }));
    await user.click(screen.getByRole("button", { name: "Save my choices" }));

    await screen.findByText("Your choices were saved on this device.");

    unmount();
    render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "What To Include" }));
    await waitFor(() => {
      expect(screen.getByRole("checkbox", { name: "Include Websites or web search" })).not.toBeChecked();
    });

    await user.click(screen.getByRole("button", { name: "Choosing Style" }));
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: /Best quality when it matters/ })).toBeChecked();
    });
  });

  it("shows task intake validation near required fields", async () => {
    const user = userEvent.setup();

    render(<App store={buildTestStore()} />);

    await user.click(screen.getByRole("button", { name: "My Task" }));
    await screen.findByText(/Recommendations are prepared in this browser/);

    await user.click(screen.getByRole("button", { name: "Show me my best options" }));

    expect(await screen.findByText("Describe what you are trying to do.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Best Options" }));

    expect(screen.getByRole("heading", { name: "This needs a bit more detail" })).toBeInTheDocument();
  });

  it("generates route results from a template and saves route artifacts locally", async () => {
    const user = userEvent.setup();
    const store = await buildRouteReadyTestStore();

    render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "My Task" }));
    await screen.findByText("What I already know");
    await user.click(screen.getByRole("button", { name: "Use shortcut Draft public-facing copy" }));
    await user.click(screen.getByRole("button", { name: "Show me my best options" }));

    expect(await screen.findByRole("heading", { name: "Best Options", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lean route", level: 4 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Balanced route", level: 4 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Premium route", level: 4 })).toBeInTheDocument();
    expect(screen.getAllByText("Best fit").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Warnings" })).toBeInTheDocument();
    expect(screen.getByText(/Human approval is required before using public-facing/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save decision and prompts" }));

    expect(await screen.findByText("Decision card, prompts, and Past Choices record saved on this device.")).toBeInTheDocument();

    const records = await store.loadRouteRecords();
    expect(records.routeCards).toHaveLength(1);
    expect(records.promptPackages).toHaveLength(1);
    expect(records.routeLogEntries).toHaveLength(1);
    expect(records.routeCards[0]?.promptPackage.id).toBe(records.promptPackages[0]?.id);
    expect(records.routeLogEntries[0]).toMatchObject({
      routeCardId: records.routeCards[0]?.id,
      selectedOptionId: records.routeCards[0]?.recommendedOptionId,
      outcome: "deferred",
    });
  });

  it("shows blocked routes when requested sources fail local gates", async () => {
    const user = userEvent.setup();
    const store = await buildRouteReadyTestStore();
    const configuration = await store.loadConfiguration();
    await store.saveSourcePermissionRegistry(
      configuration.sourcePermissionRegistry.map((sourcePermission) =>
        sourcePermission.id === "web" ? { ...sourcePermission, permissionLevel: 0 } : sourcePermission,
      ),
    );

    render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "My Task" }));
    await screen.findByText("Websites or web search");
    await user.click(screen.getByRole("button", { name: "Use shortcut Research current facts" }));
    await user.click(screen.getByRole("button", { name: "Show me my best options" }));

    expect(await screen.findByRole("heading", { name: "Best Options", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Left out for safety" })).toBeInTheDocument();
    expect(screen.getByText("Websites or web search is turned off in What To Include.")).toBeInTheDocument();
    expect(screen.getByText(/Current facts or citations need an allowed research source/)).toBeInTheDocument();
  });

  it("shows an empty local artifact state before route cards are saved", async () => {
    const user = userEvent.setup();

    render(<App store={await buildRouteReadyTestStore()} />);

    await user.click(screen.getByRole("button", { name: "Decision Card" }));

    expect(await screen.findByRole("heading", { name: "No saved plans yet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Describe my task" })).toBeInTheDocument();
  });

  it("shows an empty Past Choices state before route decisions are saved", async () => {
    const user = userEvent.setup();

    render(<App store={await buildRouteReadyTestStore()} />);

    await user.click(screen.getByRole("button", { name: "Past Choices" }));

    expect(await screen.findByRole("heading", { name: "No Past Choices yet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Describe my task" })).toBeInTheDocument();
  });

  it("lets users filter Past Choices, save feedback, and open the saved decision card", async () => {
    const user = userEvent.setup();
    const store = buildTestStore();

    render(<App store={store} />);

    await generateAndSavePublicFacingRoute(user);
    await user.click(screen.getByRole("button", { name: "Past Choices" }));

    expect(await screen.findByRole("heading", { name: "Route card: Draft public-facing copy" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Show only" })).toHaveValue("all");
    expect(screen.getByRole("combobox", { name: "Sort by" })).toHaveValue("recent");
    expect(screen.getAllByText("Deferred - still deciding").length).toBeGreaterThan(0);

    await user.type(screen.getByRole("textbox", { name: "Search past choices" }), "nothing matches this");
    expect(await screen.findByRole("heading", { name: "No choices match that view" })).toBeInTheDocument();

    await user.clear(screen.getByRole("textbox", { name: "Search past choices" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Show only" }), "deferred");
    expect(await screen.findByRole("heading", { name: "Route card: Draft public-facing copy" })).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "What happened?" }), "edited");
    await user.selectOptions(screen.getByRole("combobox", { name: "Usefulness rating" }), "5");
    await user.type(screen.getByRole("textbox", { name: "Private note" }), "Useful after a tiny wording change.");
    await user.click(screen.getByRole("button", { name: "Save feedback" }));

    expect(await screen.findByText("Feedback saved in this browser.")).toBeInTheDocument();

    const records = await store.loadRouteRecords();
    expect(records.routeLogEntries[0]).toMatchObject({
      outcome: "edited",
      feedback: {
        rating: 5,
        notes: "Useful after a tiny wording change.",
      },
    });

    await user.click(screen.getByRole("button", { name: "Open decision card" }));

    expect(await screen.findByRole("heading", { name: "Route card: Draft public-facing copy" })).toBeInTheDocument();
    expect((screen.getByRole("combobox", { name: "Saved decision card" }) as HTMLSelectElement).value).toBe(
      records.routeCards[0]?.id,
    );
  });

  it("shows saved route cards with local copy and Markdown download preparation", async () => {
    const user = userEvent.setup();
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    installClipboardMock(clipboardWriteText);

    render(<App store={await buildRouteReadyTestStore()} />);

    await generateAndSavePublicFacingRoute(user);
    await user.click(screen.getByRole("button", { name: "Decision Card" }));

    expect(await screen.findByRole("heading", { name: "Route card: Draft public-facing copy" })).toBeInTheDocument();
    expect((screen.getByRole("combobox", { name: "Saved decision card" }) as HTMLSelectElement).value).toMatch(
      /^route-card-/,
    );
    expect(screen.getByText("Options and tradeoffs")).toBeInTheDocument();
    expect(screen.getByText("Left out for safety")).toBeInTheDocument();
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
    expect(screen.getByText("Route card Markdown copied on this device.")).toBeInTheDocument();
  });

  it("shows saved prompt packages with ordered steps and step-level approval copy", async () => {
    const user = userEvent.setup();
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    installClipboardMock(clipboardWriteText);

    render(<App store={buildTestStore()} />);

    await generateAndSavePublicFacingRoute(user);
    await user.click(screen.getByRole("button", { name: "Copy-Ready Prompts" }));

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
    expect(screen.getByText("Prompt step 1 copied on this device.")).toBeInTheDocument();
  });
});

function buildTestStore(): LocalStore {
  databaseCounter += 1;

  const database: LocalStoreDatabase = createLocalStoreDatabase(`ai-task-router-app-test-${databaseCounter}`);
  const store = createLocalStore({ database });

  storesToDelete.push(store);

  return store;
}

async function buildRouteReadyTestStore(): Promise<LocalStore> {
  const store = buildTestStore();

  await store.seedDefaultConfigurationIfEmpty();
  await store.saveModelInventory(routeReadyModels);

  return store;
}

async function generateAndSavePublicFacingRoute(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "My Task" }));
  await screen.findByText("What I already know");
  await user.click(screen.getByRole("button", { name: "Use shortcut Draft public-facing copy" }));
  await user.click(screen.getByRole("button", { name: "Show me my best options" }));
  await screen.findByRole("heading", { name: "Best Options", level: 2 });
  await user.click(screen.getByRole("button", { name: "Save decision and prompts" }));
  await screen.findByText("Decision card, prompts, and Past Choices record saved on this device.");
}

function installClipboardMock(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText,
    },
  });
}
