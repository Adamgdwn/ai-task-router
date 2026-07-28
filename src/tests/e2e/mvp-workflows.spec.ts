import { expect, test, type Locator, type Page } from "@playwright/test";
import { createEverydayToolModel } from "../../domain/defaults/everydayToolCatalog";
import type { ModelInventoryItem } from "../../domain/types";
import { legacyPrefilledToolModels } from "../fixtures/legacyPrefilledToolModels";
import { routeReadyModels } from "../fixtures/routeReadyModels";
import { e2eTaskFixtures, type E2ETaskFixtureTag } from "../fixtures/e2eTaskFixtures";

const localStoreDatabaseName = "ai-task-router-local-store";
const requiredFixtureCoverage: E2ETaskFixtureTag[] = [
  "public",
  "internal",
  "confidential",
  "regulated",
  "highly restricted",
  "public-facing risk",
  "current-facts",
  "citation",
  "coding",
  "writing",
  "planning",
  "packaging",
  "review",
];

test("fixture task suite covers the MVP routing scenarios", () => {
  expect(e2eTaskFixtures.length).toBeGreaterThanOrEqual(20);

  const coveredTags = new Set(e2eTaskFixtures.flatMap((fixture) => fixture.coverage));

  for (const expectedTag of requiredFixtureCoverage) {
    expect(coveredTags.has(expectedTag), `Missing fixture coverage for ${expectedTag}`).toBe(true);
  }

  for (const fixture of e2eTaskFixtures) {
    expect(fixture.description).not.toMatch(/password|secret|token|api[_ -]?key/i);
    expect(fixture.title.trim().length).toBeGreaterThan(0);
    expect(fixture.description.trim().length).toBeGreaterThan(20);
  }
});

test("first-run setup stays guided and has no standalone include or execution workflow", async ({ page }) => {
  await openApp(page);

  await expect(page.getByRole("heading", { name: "Start Here", level: 2 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Choose my tools" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pick how to choose" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Describe my task" })).toBeVisible();
  await expect(page.getByText("Your browser only")).toBeVisible();
  await expect(page.getByText("No hidden AI calls or telemetry")).toBeVisible();
  await expect(page.getByText(/uses your browser storage to remember your AI tools/)).toBeVisible();
  // The whole case for routing used to arrive only after a task was described, so a visitor who
  // never described one learned nothing. These three worked examples are that case, before the
  // decision, and the middle one has to survive: an app that only says "smaller is cheaper" teaches
  // people to route everything to the smallest tool and re-run half of it.
  await expect(page.getByRole("heading", { name: "Why which tool you pick matters" })).toBeVisible();
  await expect(page.getByText("Smaller is not automatically better.")).toBeVisible();
  await expect(page.getByText(/10-watt LED bulb/).first()).toBeVisible();
  await page.getByRole("button", { name: "Learn more" }).click();
  await expect(page.getByText(/does not use tracking cookies, analytics, or hidden uploads/)).toBeVisible();
  await expect(page.getByRole("button", { name: "What To Include" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Choose what to include" })).toHaveCount(0);
  await expectNoExecutionControls(page);

  await page.getByRole("button", { name: "How To Choose", exact: true }).click();
  const howToChooseNextStep = page.locator(".setupNavigationActions").getByRole("button", { name: "Next step" });
  await expect(howToChooseNextStep).toBeVisible();
  await howToChooseNextStep.click();
  await expect(page.getByRole("heading", { name: "My Task", level: 2 })).toBeVisible();
});

test("My AI Tools uses one manual selector, tailored account choices, local models, remove, and stable layout", async ({
  page,
}) => {
  await openApp(page);
  await page.getByRole("button", { name: "My AI Tools", exact: true }).click();

  await expect(page.getByText("0 selected")).toBeVisible();
  await expect(page.getByText("How this treats tools, models, and privacy")).toBeVisible();
  await page.getByText("How this treats tools, models, and privacy").click();
  await expect(page.getByText(/does not read live provider model menus/)).toBeVisible();
  await expect(page.getByText(/Catalog last reviewed/)).toBeVisible();
  await expect(toolRows(page)).toHaveCount(1);

  const firstToolRow = toolRows(page).first();
  const firstApp = firstToolRow.getByRole("combobox", { name: "AI app for user-mid-synthesis-model" });
  const firstAccount = firstToolRow.getByRole("combobox", { name: "Account level for user-mid-synthesis-model" });

  await expect(firstApp).toHaveValue("none");
  await expect(firstAccount).toBeDisabled();

  await firstApp.selectOption("chatgpt");
  await expect(firstApp).toHaveValue("chatgpt");
  await expect(toolRows(page)).toHaveCount(1);
  await expect(page.getByText("1 selected")).toBeVisible();
  await expect(selectOptionLabels(firstAccount)).resolves.toEqual([
    "Free",
    "Go",
    "Plus",
    "Pro",
    "Business",
    "Enterprise",
  ]);
  await firstAccount.selectOption("pro");
  await firstToolRow.getByRole("combobox", { name: "How often for user-mid-synthesis-model" }).selectOption("hourly");

  await page.getByRole("button", { name: /Add another tool/ }).click();
  await expect(toolRows(page)).toHaveCount(2);

  const secondToolRow = toolRows(page).nth(1);
  const secondApp = secondToolRow.getByRole("combobox", { name: "AI app for user-free-small-model" });
  await secondApp.selectOption("local");

  const localModel = secondToolRow.getByRole("combobox", { name: "Local model for user-free-small-model" });
  await expect(localModel).toBeVisible();
  await expect(selectOptionLabels(localModel)).resolves.toEqual([
    "Ollama",
    "LM Studio",
    "Jan",
    "llama.cpp",
    "GPT4All",
    "Open WebUI or private endpoint",
    "Other local model",
  ]);
  await localModel.selectOption("local-lm-studio");
  await expect(page.getByText("2 selected")).toBeVisible();

  await expect(page.locator(".recordPill").filter({ hasText: "Selected" }).first()).toHaveCSS("white-space", "nowrap");
  await expectNoHorizontalOverflow(page);

  await secondToolRow.getByRole("button", { name: "Remove Local or private AI" }).click();
  await expect(page.getByText("1 selected")).toBeVisible();
  await expect(toolRows(page)).toHaveCount(1);
  expect(await selectedOptionTextCount(page, "Local or private AI")).toBe(0);
});

test("stale five-row local setup migrates back to one blank selector", async ({ page }) => {
  await openApp(page);
  await replaceIndexedDbRecords(page, "modelInventory", legacyPrefilledToolModels);
  await page.reload();

  await page.getByRole("button", { name: "My AI Tools", exact: true }).click();

  await expect(page.getByText("0 selected")).toBeVisible();
  await expect(toolRows(page)).toHaveCount(1);
  await expect(page.getByRole("region", { name: "ChatGPT" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Gemini" })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "AI app for user-mid-synthesis-model" })).toHaveValue("none");
  await expect(page.getByRole("option", { name: "Genspark" })).toBeAttached();
});

test("task intake routes, saves, prepares exports, and records feedback without provider execution", async ({ page }) => {
  await openAppWithRouteReadyModels(page);

  await page.getByRole("button", { name: "My Task", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Do you want to include anything specific?" })).toBeVisible();

  const nothingSpecific = page.getByRole("button", { name: /Nothing specific/ });
  await expect(nothingSpecific).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("checkbox", { name: /Documents or text I will paste/ }).check();
  await expect(nothingSpecific).toHaveAttribute("aria-pressed", "false");
  await nothingSpecific.click();
  await expect(nothingSpecific).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Use shortcut Draft public-facing copy" }).click();
  await page.getByRole("button", { name: "Show me my best options" }).click();

  await expect(page.getByRole("heading", { name: "Best Options", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What this route costs to run" })).toBeVisible();
  await expect(page.locator("dt").filter({ hasText: "100k-token example" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Suggested AI toolkit" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended work path" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Create the draft" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Run the prompt" })).toHaveCount(0);
  await expect(page.locator(".stageGuidanceItem.stage-create")).toBeVisible();
  await expect(page.locator(".stageChoiceSummary").filter({ hasText: "Mode" }).first()).toBeVisible();
  await expect(page.locator(".stageChoiceSummary").filter({ hasText: "Why this help" }).first()).toBeVisible();
  await expect(page.locator(".stageChoiceSummary").filter({ hasText: "Upgrade trigger" }).first()).toBeVisible();
  await expect(page.getByText("Path for this stage").first()).toBeVisible();
  await expect(page.getByText("Action").first()).toBeVisible();
  await expect(page.locator(".stageGuidanceSection details")).toHaveCount(0);
  await expect(page.locator(".stageGuidanceSection summary")).toHaveCount(0);
  const stageLayout = await page.locator(".stageGuidanceItem.stage-create").evaluate((stage) => {
    const row = stage.getBoundingClientRect();
    const overview = stage.querySelector(".stageOverview")?.getBoundingClientRect();
    const actions = stage.querySelector(".stageActionGrid")?.getBoundingClientRect();
    const path = stage.querySelector(".stageWorkItems")?.getBoundingClientRect();
    const methodPill = stage.querySelector(".methodPill")?.getBoundingClientRect();

    return {
      rowWidth: row.width,
      overviewTop: overview?.top ?? 0,
      actionsTop: actions?.top ?? 0,
      pathTop: path?.top ?? 0,
      pathWidth: path?.width ?? 0,
      methodPillHeight: methodPill?.height ?? 0,
    };
  });
  expect(Math.abs(stageLayout.overviewTop - stageLayout.actionsTop)).toBeLessThan(2);
  expect(stageLayout.pathTop).toBeGreaterThan(stageLayout.actionsTop);
  expect(stageLayout.pathWidth).toBeGreaterThan(stageLayout.rowWidth * 0.9);
  expect(stageLayout.methodPillHeight).toBeLessThan(40);
  await expect(page.getByRole("heading", { name: "Your options" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Selected route", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Choose this route" }).first()).toBeVisible();
  await expect(page.getByLabel("100 use route cost and energy comparison")).toBeVisible();
  await expect(page.getByText("100-use scenario")).toBeVisible();
  await expect(page.getByText("linear scale; exact totals below")).toBeVisible();
  await expect(page.getByText("Solid: cost")).toBeVisible();
  await expect(page.getByText("Dashed: energy")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lean route", level: 4 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Balanced route", level: 4 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Premium route", level: 4 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cost and energy" })).toHaveCount(3);
  await expect(page.getByText("Estimated energy", { exact: true })).toHaveCount(3);
  await expect(page.locator("dt").filter({ hasText: "If you paid per token" })).toHaveCount(6);
  await expect(page.locator("dt").filter({ hasText: "Added to your bill" })).toHaveCount(6);
  await expect(page.locator("dt").filter({ hasText: "Energy compared with" })).toHaveCount(3);
  await expect(page.getByText("Estimated savings")).toHaveCount(0);
  await expect(page.getByText("Energy saved")).toHaveCount(0);
  await expect(page.getByText("Est. saved")).toHaveCount(0);
  // Watt-hours alone taught nothing, so every energy figure a user decides on carries a unit they
  // can picture. The multiple does the division the reader was previously left to do, and neither
  // may reintroduce the savings vocabulary R-010 forbids.
  await expect(page.getByText(/10-watt LED bulb/).first()).toBeVisible();
  await expect(page.getByText(/roughly [\d.]+x this route|about the same as this route/).first()).toBeVisible();
  await expect(page.getByText(/Human approval is required before using public-facing/)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Accept selected route and save prompts" }).click();
  await expect(page.getByText("Selected route, decision card, prompts, and followed-choice impact saved on this device.")).toBeVisible();
  await expect(page.getByText("1 accepted or edited choice counted on this device.")).toBeVisible();
  // The lean/balanced/premium split was computed and discarded before this; it is the only surface
  // that answers "am I always reaching for the heaviest option?"
  await expect(page.locator("dt").filter({ hasText: "Which routes you followed" })).toBeVisible();

  await page.getByRole("button", { name: "Decision Card", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Route card: Draft public-facing copy" })).toBeVisible();
  await expect(page.getByLabel("Prepared route card Markdown")).toContainText("# Route card: Draft public-facing copy");
  await expect(page.getByRole("link", { name: "Download Markdown" })).toHaveAttribute(
    "download",
    /^route-card-.*\.md$/,
  );

  await page.getByRole("button", { name: "Copy-Ready Prompts", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Prompt package: Draft public-facing copy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prompt steps" })).toBeVisible();
  await expect(page.getByLabel("Prepared prompt package Markdown")).toContainText(
    "# Prompt package: Draft public-facing copy",
  );
  await expect(page.getByRole("link", { name: "Download Markdown" })).toHaveAttribute(
    "download",
    /^prompt-package-.*\.md$/,
  );

  await page.getByRole("button", { name: "Past Choices", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Route card: Draft public-facing copy" })).toBeVisible();
  // Past Choices rendered neither cost nor energy and had every figure needed for both. The row
  // now carries what the choice would cost metered and what the heaviest option offered would have.
  await expect(page.locator("dt").filter({ hasText: "If this run were metered" }).first()).toBeVisible();
  await expect(page.locator("dt").filter({ hasText: "Against the heaviest offered" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "How you have been choosing" })).toBeVisible();
  await expect(page.getByText(/Across \d+ followed choices? where something heavier was also on offer/)).toBeVisible();
  await page.getByRole("combobox", { name: "What happened?" }).selectOption("edited");
  await page.getByRole("combobox", { name: "Usefulness rating" }).selectOption("5");
  await page.getByRole("textbox", { name: "Private note" }).fill("Useful after a tiny wording change.");
  await page.getByRole("button", { name: "Save feedback" }).click();
  await expect(page.getByText("Feedback saved in this browser.")).toBeVisible();

  await page.getByRole("button", { name: "Open decision card" }).click();
  await expect(page.getByRole("heading", { name: "Route card: Draft public-facing copy" })).toBeVisible();
  await expectNoExecutionControls(page);
});

/**
 * The cold path, with no IndexedDB injection anywhere in it. Every other routing test starts from
 * the `routeReadyModels` fixture, which is an inventory no user has ever produced by hand, so the
 * journey a real person takes - open the app, add one tool through the picker, type a task in their
 * own words, get a route, save it - was never actually exercised.
 *
 * It also covers the fresh-install case from R3: before any tool is added, the app has to say the
 * plan is the user doing the work by hand rather than quietly presenting a route.
 */
test("cold start: add one tool through the picker, describe a task in free text, route it, save it", async ({
  page,
}) => {
  await openApp(page);

  // R3 first-run honesty: routing before any tool exists must admit there is no AI in the plan.
  await page.getByRole("button", { name: "My Task", exact: true }).click();
  await page
    .getByRole("textbox", { name: "What do you need help with?" })
    .fill("I need to turn six pages of messy meeting notes into a short summary my team can read.");
  await page.getByRole("button", { name: "Show me my best options" }).click();

  await expect(page.getByRole("heading", { name: "Best Options", level: 2 })).toBeVisible();
  await expect(page.getByText(/You have not added any AI tools yet, so this plan is you doing the work by hand/)).toBeVisible();

  // Now add a tool the way a user does: through the picker, with no fixture in sight.
  await page.getByRole("button", { name: "Add my AI tools" }).click();
  await expect(page.getByRole("heading", { name: "My AI Tools", level: 2 })).toBeVisible();

  const toolRow = toolRows(page).first();
  await toolRow.getByRole("combobox", { name: "AI app for user-mid-synthesis-model" }).selectOption("chatgpt");
  await toolRow.getByRole("combobox", { name: "Account level for user-mid-synthesis-model" }).selectOption("plus");
  await expect(page.getByText("1 selected")).toBeVisible();

  await page.getByRole("button", { name: "Save my choices" }).click();
  await expect(page.getByRole("button", { name: "Save my choices" })).toBeDisabled();

  // Same free-text task, now with a real tool behind it.
  await page.getByRole("button", { name: "My Task", exact: true }).click();
  await page
    .getByRole("textbox", { name: "What do you need help with?" })
    .fill("I need to turn six pages of messy meeting notes into a short summary my team can read.");
  await page.getByRole("button", { name: "Show me my best options" }).click();

  await expect(page.getByRole("heading", { name: "Best Options", level: 2 })).toBeVisible();
  await expect(page.getByText(/You have not added any AI tools yet/)).toHaveCount(0);

  // The route has to name the tool the user actually picked, not a fixture's.
  await expect(page.locator(".stageGuidanceSection").getByText(/ChatGPT/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your options" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Selected route", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Accept selected route and save prompts" }).click();
  await expect(
    page.getByText("Selected route, decision card, prompts, and followed-choice impact saved on this device."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Decision Card", exact: true }).click();
  await expect(page.getByLabel("Prepared route card Markdown")).toContainText("ChatGPT");
  await expectNoExecutionControls(page);
});

test("the same tools choose reasoning for a structured plan and fast mode for a simple rewrite", async ({ page }) => {
  const manualReviewModel = routeReadyModels.find((model) => model.id === "manual-human-review");
  if (!manualReviewModel) {
    throw new Error("Manual review model is required for the browser routing fixture.");
  }
  const models = [
    manualReviewModel,
    createEverydayToolModel({
      id: "chatgpt-go",
      providerId: "chatgpt",
      accountId: "go",
      frequencyId: "daily",
    }),
    createEverydayToolModel({
      id: "perplexity-free",
      providerId: "perplexity",
      accountId: "basic",
      frequencyId: "weekly",
    }),
    createEverydayToolModel({
      id: "copilot-free",
      providerId: "copilot",
      accountId: "basic",
      frequencyId: "weekly",
    }),
  ] satisfies ModelInventoryItem[];
  const browserErrors: string[] = [];

  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });

  await openApp(page);
  await replaceIndexedDbRecords(page, "modelInventory", models);
  await page.reload();
  await page.getByRole("button", { name: "My Task", exact: true }).click();

  const taskDescription = page.getByRole("textbox", { name: "What do you need help with?" });
  await taskDescription.fill(
    "Create a practical plan for a community open house with responsibilities, dependencies, risks, review points, and the first action.",
  );
  await page.getByRole("combobox", { name: "What kind of help do you need?" }).selectOption("planning");
  await page.getByRole("combobox", { name: "What are you making?" }).selectOption("plan");
  await page.getByRole("combobox", { name: "How polished should it be?" }).selectOption("standard");
  await page.getByRole("button", { name: "Show me my best options" }).click();

  const workPath = page.locator(".stageGuidanceSection");
  await expect(page.getByRole("heading", { name: "Best Options", level: 2 })).toBeVisible();
  await expect(page.getByText(/The request has moderate reasoning demand/).first()).toBeVisible();
  await expect(workPath.getByText(/highest GPT-5\.5 Thinking level your Go picker offers for direct reasoning/).first()).toBeVisible();
  await expect(workPath.getByText(/Perplexity/)).toHaveCount(0);
  await expect(workPath.getByText(/Microsoft Copilot/)).toHaveCount(0);
  await expect(workPath.getByRole("heading", { name: "Build the master prompt" })).toHaveCount(0);
  await expect(workPath.getByText(/responsibilities and owners/).first()).toBeVisible();
  await expect(workPath.getByText(/dependencies and ordering/).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "My Task", exact: true }).click();
  await taskDescription.fill("Rewrite this paragraph in plain language.");
  await page.getByRole("combobox", { name: "What kind of help do you need?" }).selectOption("writing");
  await page.getByRole("combobox", { name: "What are you making?" }).selectOption("draft");
  await page.getByRole("combobox", { name: "How polished should it be?" }).selectOption("quick");
  await page.getByRole("button", { name: "Show me my best options" }).click();

  await expect(page.getByText(/The request has light reasoning demand/).first()).toBeVisible();
  await expect(page.locator(".stageGuidanceSection").getByText(/GPT-5\.5 Instant for direct execution/).first()).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("corrected screens do not overflow on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAppWithRouteReadyModels(page);

  // Start Here now carries figures on a screen that used to hold only short prose, and this test
  // was the one place a phone-width layout gets checked at all.
  await expect(page.getByRole("heading", { name: "Why which tool you pick matters" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "My AI Tools", exact: true }).click();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "My Task", exact: true }).click();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Help", exact: true }).click();
  await expect(page.getByRole("heading", { name: "What the three routes mean", level: 3 })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

async function openApp(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Start Here", level: 2 })).toBeVisible();
  await waitForLocalConfiguration(page);
}

async function openAppWithRouteReadyModels(page: Page) {
  await openApp(page);
  await replaceIndexedDbRecords(page, "modelInventory", routeReadyModels);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Start Here", level: 2 })).toBeVisible();
}

async function waitForLocalConfiguration(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(async (databaseName) => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open(databaseName);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });
        const storeNames = ["modelInventory", "sourcePermissions", "policySettings"];
        const transaction = database.transaction(storeNames, "readonly");
        const counts = await Promise.all(
          storeNames.map(
            (storeName) =>
              new Promise<number>((resolve, reject) => {
                const request = transaction.objectStore(storeName).count();

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
              }),
          ),
        );

        database.close();
        return counts.every((count) => count > 0);
      }, localStoreDatabaseName),
    )
    .toBe(true);
}

function toolRows(page: Page) {
  return page.getByRole("region", { name: "Tool selection" });
}

async function selectOptionLabels(select: Locator) {
  return select.locator("option").evaluateAll((options) =>
    options.map((option) => (option.textContent ?? "").trim()).filter(Boolean),
  );
}

async function selectedOptionTextCount(page: Page, selectedText: string) {
  return page.locator("select").evaluateAll(
    (selects, text) =>
      selects.filter((select) => {
        const selectedOption = (select as HTMLSelectElement).selectedOptions[0];

        return selectedOption?.textContent?.trim() === text;
      }).length,
    selectedText,
  );
}

async function replaceIndexedDbRecords(page: Page, storeName: string, records: readonly unknown[]) {
  await page.evaluate(
    async ({ databaseName, storeName: targetStoreName, records: targetRecords }) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(databaseName);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(targetStoreName, "readwrite");
        const store = transaction.objectStore(targetStoreName);
        store.clear();

        for (const record of targetRecords) {
          store.put(record);
        }

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });

      database.close();
    },
    {
      databaseName: localStoreDatabaseName,
      storeName,
      records,
    },
  );
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2);
}

async function expectNoExecutionControls(page: Page) {
  const forbiddenControlName = /\b(execute|connect account|send to|send prompt|send to provider|run ai|call provider)\b/i;

  await expect(page.getByRole("button", { name: forbiddenControlName })).toHaveCount(0);
  await expect(page.getByRole("link", { name: forbiddenControlName })).toHaveCount(0);
}
