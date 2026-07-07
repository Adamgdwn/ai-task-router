import { expect, test, type Locator, type Page } from "@playwright/test";
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
  await expect(page.getByRole("button", { name: "Pick choosing style" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Describe my task" })).toBeVisible();
  await expect(page.getByText("Your browser only")).toBeVisible();
  await expect(page.getByText("No hidden AI calls or telemetry")).toBeVisible();
  await expect(page.getByRole("button", { name: "What To Include" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Choose what to include" })).toHaveCount(0);
  await expectNoExecutionControls(page);
});

test("My AI Tools uses one manual selector, tailored account choices, local models, remove, and stable layout", async ({
  page,
}) => {
  await openApp(page);
  await page.getByRole("button", { name: "My AI Tools", exact: true }).click();

  await expect(page.getByText("0 selected")).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "What this route can save" })).toBeVisible();
  await expect(page.locator("dt").filter({ hasText: "100k-token example" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Suggested AI toolkit" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your options" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lean route", level: 4 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Balanced route", level: 4 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Premium route", level: 4 })).toBeVisible();
  await expect(page.getByText(/Human approval is required before using public-facing/)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Save decision and prompts" }).click();
  await expect(page.getByText("Decision card, prompts, and Past Choices record saved on this device.")).toBeVisible();

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
  await page.getByRole("combobox", { name: "What happened?" }).selectOption("edited");
  await page.getByRole("combobox", { name: "Usefulness rating" }).selectOption("5");
  await page.getByRole("textbox", { name: "Private note" }).fill("Useful after a tiny wording change.");
  await page.getByRole("button", { name: "Save feedback" }).click();
  await expect(page.getByText("Feedback saved in this browser.")).toBeVisible();

  await page.getByRole("button", { name: "Open decision card" }).click();
  await expect(page.getByRole("heading", { name: "Route card: Draft public-facing copy" })).toBeVisible();
  await expectNoExecutionControls(page);
});

test("corrected screens do not overflow on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAppWithRouteReadyModels(page);

  await page.getByRole("button", { name: "My AI Tools", exact: true }).click();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "My Task", exact: true }).click();
  await expectNoHorizontalOverflow(page);
});

async function openApp(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Start Here", level: 2 })).toBeVisible();
}

async function openAppWithRouteReadyModels(page: Page) {
  await openApp(page);
  await replaceIndexedDbRecords(page, "modelInventory", routeReadyModels);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Start Here", level: 2 })).toBeVisible();
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
