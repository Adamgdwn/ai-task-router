import {
  applyEverydayToolSelection,
  everydayToolSummary,
  getEverydayToolProvider,
  inferEverydayToolSelection,
} from "../../domain/defaults/everydayToolCatalog";
import { defaultModels } from "../../domain/defaults/defaultModels";

describe("everyday tool catalog", () => {
  it("uses provider-specific account labels for common AI apps", () => {
    expect(accountLabels("chatgpt")).toEqual(["Free", "Go", "Plus", "Pro", "Business or Enterprise"]);
    expect(accountLabels("claude")).toEqual(["Free", "Pro", "Max 5x", "Max 20x", "Team or Enterprise"]);
    expect(accountLabels("gemini")).toEqual([
      "Free",
      "Google AI Pro",
      "Google AI Ultra",
      "Google Workspace or enterprise",
    ]);
    expect(accountLabels("perplexity")).toEqual(["Free", "Pro", "Enterprise Pro", "Enterprise Max"]);
    expect(accountLabels("github-copilot")).toContain("Pro+");
    expect(accountLabels("cursor")).toContain("Ultra");
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
