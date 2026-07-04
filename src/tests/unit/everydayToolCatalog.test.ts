import {
  applyEverydayToolSelection,
  everydayToolSummary,
  getEverydayToolProvider,
  inferEverydayToolSelection,
} from "../../domain/defaults/everydayToolCatalog";
import { defaultModels } from "../../domain/defaults/defaultModels";

describe("everyday tool catalog", () => {
  it("uses provider-specific account labels for common AI apps", () => {
    expect(accountLabels("chatgpt")).toEqual(["Free", "Go", "Plus", "Pro", "Business", "Enterprise"]);
    expect(accountLabels("claude")).toEqual(["Free", "Pro", "Max 5x", "Max 20x", "Team", "Enterprise"]);
    expect(accountLabels("gemini")).toEqual([
      "Free",
      "Google AI Plus",
      "Google AI Pro",
      "Google AI Ultra",
      "Google Workspace",
      "Google Workspace Enterprise",
    ]);
    expect(accountLabels("perplexity")).toEqual(["Free", "Pro", "Max", "Enterprise Pro", "Enterprise Max"]);
    expect(accountLabels("github-copilot")).toContain("Pro+");
    expect(accountLabels("cursor")).toContain("Ultra");
  });

  it("uses researched provider-specific labels for broader AI apps", () => {
    expect(accountLabels("genspark")).toEqual(["Free", "Plus", "Pro", "Team", "Enterprise"]);
    expect(accountLabels("grok")).toEqual(["Free", "SuperGrok", "X Premium+", "xAI API or business"]);
    expect(accountLabels("meta-ai")).toEqual(["Free Meta AI"]);
    expect(accountLabels("poe")).toEqual([
      "Free",
      "10k points/day",
      "660k points/month",
      "1.65M points/month",
      "3.3M points/month",
      "8.25M points/month",
    ]);
    expect(accountLabels("notebooklm")).toEqual([
      "Standard",
      "NotebookLM in Plus",
      "NotebookLM in Pro",
      "NotebookLM in Ultra",
      "Workspace or school account",
    ]);
    expect(accountLabels("replit")).toEqual(["Starter", "Core", "Pro", "Enterprise"]);
    expect(accountLabels("qwen")).toContain("Token Plan Team");
    expect(accountLabels("minimax")).toContain("Token Plan Ultra");
    expect(accountLabels("zhipu")).toContain("GLM Coding Max");
    expect(accountLabels("mistral")).toEqual(["Free", "Pro", "Team", "Enterprise", "Studio or API pay-as-you-go"]);
  });

  it("maps local private AI to selectable local model tools without external calls", () => {
    const blankModel = defaultModels.find((model) => model.id === "user-mid-synthesis-model");

    if (!blankModel) {
      throw new Error("The default tool slot is required for local model tests.");
    }

    const localModel = applyEverydayToolSelection(blankModel, {
      providerId: "local",
      accountId: "local-lm-studio",
      frequencyId: "weekly",
    });

    expect(inferEverydayToolSelection(localModel)).toEqual({
      providerId: "local",
      accountId: "local-lm-studio",
      frequencyId: "weekly",
    });
    expect(localModel).toMatchObject({
      enabled: true,
      localOnly: true,
      maxPermissionLevel: 4,
      requiresCredentials: false,
      requiresExternalCall: false,
      provider: "Local or private AI",
    });
    expect(everydayToolSummary(localModel)).toContain("Local model: LM Studio.");
  });
});

function accountLabels(providerId: Parameters<typeof getEverydayToolProvider>[0]) {
  return getEverydayToolProvider(providerId).accountOptions.map((option) => option.label);
}
