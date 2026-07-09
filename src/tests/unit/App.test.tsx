import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
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
import { createEverydayToolModel } from "../../domain/defaults/everydayToolCatalog";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

type TestInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

let databaseCounter = 0;
const storesToDelete: LocalStore[] = [];

afterEach(async () => {
  cleanup();
  vi.mocked(invoke).mockReset();
  delete (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  delete (window as Window & { __TAURI__?: unknown }).__TAURI__;

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
    expect(screen.getByRole("heading", { name: "Install the browser version", level: 3 })).toBeInTheDocument();
    expect(screen.getByText(/Computer checking still needs the desktop app/)).toBeInTheDocument();
    expect(screen.getByText(/uses your browser storage to remember your AI tools/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Learn more" }));
    expect(screen.getByText(/does not use tracking cookies, analytics, or hidden uploads/)).toBeInTheDocument();
    expect(screen.getByText(/when a smaller route is enough/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "What To Include" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Choose what to include" })).not.toBeInTheDocument();

    for (const definition of screenDefinitions) {
      await user.click(screen.getByRole("button", { name: definition.label }));

      expect(screen.getByRole("heading", { name: definition.title, level: 2 })).toBeInTheDocument();
      expect(screen.getByText(definition.summary)).toBeInTheDocument();
    }
  });

  it("offers browser install when the browser exposes the install prompt", async () => {
    const user = userEvent.setup();
    const prompt = vi.fn().mockResolvedValue(undefined);

    render(<App store={buildTestStore()} />);

    expect(await screen.findByText(/Computer checking still needs the desktop app/)).toBeInTheDocument();

    const installEvent = new Event("beforeinstallprompt", { cancelable: true }) as TestInstallPromptEvent;
    Object.assign(installEvent, {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
    });

    window.dispatchEvent(installEvent);

    expect(installEvent.defaultPrevented).toBe(true);

    await user.click(await screen.findByRole("button", { name: "Install browser app" }));

    await waitFor(() => {
      expect(prompt).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("Install started. Your browser will finish it.")).toBeInTheDocument();
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

  it("lets desktop users check selected local tools and add found tools to My AI Tools", async () => {
    const user = userEvent.setup();
    const invokeMock = vi.mocked(invoke);

    Object.defineProperty(window, "__TAURI_INTERNALS__", {
      configurable: true,
      value: {},
    });

    invokeMock.mockImplementation(async (command, payload) => {
      if (command === "get_desktop_discovery_options") {
        return {
          schemaVersion: 1,
          platform: "windows",
          options: [
            {
              toolId: "ollama",
              label: "Ollama",
              summary: "Checks the Ollama app and its common local model folder.",
              checkKinds: ["fixed-cli", "known-folder"],
              defaultSelected: true,
              detailsAvailable: true,
            },
            {
              toolId: "lm-studio",
              label: "LM Studio",
              summary: "Checks common LM Studio model folders.",
              checkKinds: ["known-folder"],
              defaultSelected: true,
              detailsAvailable: true,
            },
            {
              toolId: "jan",
              label: "Jan",
              summary: "Checks common Jan model folders.",
              checkKinds: ["known-folder"],
              defaultSelected: true,
              detailsAvailable: true,
            },
            {
              toolId: "gpt4all",
              label: "GPT4All",
              summary: "Checks common GPT4All model folders.",
              checkKinds: ["known-folder"],
              defaultSelected: true,
              detailsAvailable: true,
            },
          ],
        };
      }

      if (command === "run_desktop_discovery") {
        const request = (payload as { request: { detailLevel: "summary" | "details"; selectedToolIds: string[] } })
          .request;

        expect(request.selectedToolIds).not.toContain("jan");

        return {
          schemaVersion: 1,
          requestId: "desktop-check-test",
          checkedAt: "2026-07-04T17:53:03-06:00",
          platform: "windows",
          summary: {
            toolsChecked: request.selectedToolIds.length,
            toolsDetected: 1,
            modelsFound: 2,
          },
          results: request.selectedToolIds.map((toolId) =>
            toolId === "ollama"
              ? {
                  toolId: "ollama",
                  label: "Ollama",
                  status: "models-found",
                  detected: true,
                  modelCount: 2,
                  modelNames: request.detailLevel === "details" ? ["llama3:latest"] : [],
                  checkedLocationCount: 2,
                  shownPathDetails: false,
                  note: "Ollama answered the read-only model list check.",
                }
              : {
                  toolId,
                  label: toolId === "lm-studio" ? "LM Studio" : "GPT4All",
                  status: "not-found",
                  detected: false,
                  modelCount: 0,
                  modelNames: [],
                  checkedLocationCount: 2,
                  shownPathDetails: false,
                  note: "No common local model folder was found.",
                },
          ),
        };
      }

      throw new Error(`Unexpected invoke command: ${command}`);
    });

    render(<App store={buildTestStore()} />);

    await user.click(screen.getByRole("button", { name: "My AI Tools" }));

    expect(await screen.findByRole("button", { name: "Check this computer" })).toBeInTheDocument();
    expect(invokeMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Check this computer" }));
    expect(await screen.findByRole("group", { name: "What should we check?" })).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Jan/ }));
    await user.click(screen.getByRole("button", { name: "Run check" }));

    expect((await screen.findAllByText(/Found 1 tool and 2 local models/)).length).toBeGreaterThan(0);
    expect(screen.queryByText("llama3:latest")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add Ollama to My AI Tools" }));

    expect(await screen.findByText("Ollama was added. Save my choices when you are ready.")).toBeInTheDocument();
    const localToolRow = screen.getAllByRole("region", { name: "Tool selection" })[0];
    expect(within(localToolRow).getByRole("combobox", { name: "AI app for user-mid-synthesis-model" })).toHaveDisplayValue(
      "Local or private AI",
    );
    expect(within(localToolRow).getByRole("combobox", { name: "Local model for user-mid-synthesis-model" })).toHaveDisplayValue(
      "Ollama",
    );

    await user.click(screen.getByRole("button", { name: "Show model names" }));

    expect(await screen.findByText("llama3:latest")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide model names" }));

    await waitFor(() => {
      expect(screen.queryByText("llama3:latest")).not.toBeInTheDocument();
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

  it("lets users save choosing style and keeps task include choices contextual", async () => {
    const user = userEvent.setup();
    const store = await buildRouteReadyTestStore();
    const { unmount } = render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "My Task" }));
    expect(await screen.findByRole("heading", { name: "Do you want to include anything specific?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nothing specific/ })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("checkbox", { name: /A website or current search/ }));
    expect(screen.getByRole("button", { name: /Nothing specific/ })).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: /Nothing specific/ }));
    expect(screen.getByRole("button", { name: /Nothing specific/ })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "How To Choose" }));
    expect(screen.queryByRole("checkbox", { name: /Suggest a full AI toolkit/ })).not.toBeInTheDocument();
    expect(screen.getByText(/whether to favor lower cost, everyday balance, or stronger quality/)).toBeInTheDocument();

    await user.click(await screen.findByRole("radio", { name: /Best quality when it matters/ }));
    await user.click(screen.getByRole("button", { name: "Save my choices" }));

    await screen.findByText("Your choices were saved on this device.");

    unmount();
    render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "How To Choose" }));
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
    await screen.findByText("Notes or background I already know");
    await user.click(screen.getByRole("button", { name: "Use shortcut Draft public-facing copy" }));
    await user.click(screen.getByRole("button", { name: "Show me my best options" }));

    expect(await screen.findByRole("heading", { name: "Best Options", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lean route", level: 4 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Balanced route", level: 4 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Premium route", level: 4 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Start with: Balanced route" })).toBeInTheDocument();
    expect(screen.getByText(/This looks like a write or rewrite job/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quick project plan" })).toBeInTheDocument();
    expect(screen.getByText("Frame the outcome")).toBeInTheDocument();
    expect(screen.getAllByText("Recommended help").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mode").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Why this help").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Upgrade trigger").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Use .* to /).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Decision").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Why").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Check").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Lean route: .* cost at 50 uses/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Balanced route: .* energy at 75 uses/)).toBeInTheDocument();
    expect(screen.getAllByText("Best fit").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "What this route can save" })).toBeInTheDocument();
    expect(screen.getByText("Savings recommendation")).toBeInTheDocument();
    expect(screen.getByText("100k-token example")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Suggested AI toolkit" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Close-enough starters" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Paid upgrades" })).toBeInTheDocument();
    expect(screen.getByText(/not your bill, and they are not a guarantee/)).toBeInTheDocument();
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

  it("breaks a difficult build request into visible build routing details", async () => {
    const user = userEvent.setup();
    const store = await buildRouteReadyTestStore();
    const configuration = await store.loadConfiguration();
    await store.saveModelInventory([
      ...configuration.modelInventory.filter((model) => model.tier === "human"),
      createEverydayToolModel({
        id: "chatgpt-pro-build-plan",
        providerId: "chatgpt",
        accountId: "pro",
        frequencyId: "daily",
      }),
      createEverydayToolModel({
        id: "claude-build-plan",
        providerId: "claude",
        accountId: "pro",
        frequencyId: "daily",
      }),
    ]);

    render(<App store={store} />);

    await user.click(screen.getByRole("button", { name: "My Task" }));
    await screen.findByText("Notes or background I already know");
    fireEvent.change(screen.getByLabelText("What do you need help with?"), {
      target: {
        value:
          "Build the master prompt for a finance tracker app that imports spreadsheet data, categorizes expenses, tracks month over month trends, shows where I need to improve, shows what looks good, recommends the best model, protects private financial data, and creates the first usable build slice.",
      },
    });
    await user.selectOptions(screen.getByRole("combobox", { name: "What kind of help do you need?" }), "planning");
    await user.selectOptions(screen.getByRole("combobox", { name: "What are you making?" }), "plan");
    await user.selectOptions(screen.getByRole("combobox", { name: "How polished should it be?" }), "high");
    await user.click(screen.getByRole("button", { name: "Show me my best options" }));

    expect(await screen.findByRole("heading", { name: "Best Options", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Build the data import flow")).toBeInTheDocument();
    expect(screen.getByText("Build the categorization rules")).toBeInTheDocument();
    expect(screen.getByText("Build the tracking view")).toBeInTheDocument();
    expect(screen.getByText("Build the insight and recommendation view")).toBeInTheDocument();
    expect(screen.getAllByText(/GPT-5.5 Pro Extended/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Claude/).length).toBeGreaterThan(0);
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
    await screen.findByRole("heading", { name: "Do you want to include anything specific?" });
    await user.click(screen.getByRole("button", { name: "Use shortcut Research current facts" }));
    await user.click(screen.getByRole("button", { name: "Show me my best options" }));

    expect(await screen.findByRole("heading", { name: "Best Options", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Left out for safety" })).toBeInTheDocument();
    expect(screen.getByText("Websites or web search is left out for this task.")).toBeInTheDocument();
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
    const printReport = vi.fn();
    installClipboardMock(clipboardWriteText);
    Object.defineProperty(window, "print", {
      configurable: true,
      value: printReport,
    });

    render(<App store={await buildRouteReadyTestStore()} />);

    await generateAndSavePublicFacingRoute(user);
    await user.click(screen.getByRole("button", { name: "Decision Card" }));

    expect(await screen.findByRole("heading", { name: "Route card: Draft public-facing copy" })).toBeInTheDocument();
    expect((screen.getByRole("combobox", { name: "Saved decision card" }) as HTMLSelectElement).value).toMatch(
      /^route-card-/,
    );
    expect(screen.getByRole("heading", { name: "Quick project plan" })).toBeInTheDocument();
    expect(screen.getByText("Options and tradeoffs")).toBeInTheDocument();
    expect(screen.getByText("Left out for safety")).toBeInTheDocument();
    expect(screen.getByText("Warnings")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What this route can save" })).toBeInTheDocument();
    expect(screen.getByText("100k-token example")).toBeInTheDocument();

    const markdownPreview = screen.getByLabelText("Prepared route card Markdown") as HTMLTextAreaElement;
    expect(markdownPreview.value).toContain("# Route card: Draft public-facing copy");
    expect(markdownPreview.value).toContain("## Quick Project Plan");
    expect(markdownPreview.value).toContain("Recommended help:");
    expect(markdownPreview.value).toContain("## Route Options");

    const downloadLink = screen.getByRole("link", { name: "Download Markdown" });
    expect(downloadLink).toHaveAttribute("download", expect.stringMatching(/^route-card-.*\.md$/));
    expect(downloadLink.getAttribute("href")).toContain("data:text/markdown;charset=utf-8");

    await user.click(screen.getByRole("button", { name: "Save PDF report" }));
    expect(printReport).toHaveBeenCalledTimes(1);

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
  await screen.findByText("Notes or background I already know");
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
