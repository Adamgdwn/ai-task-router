import { createEverydayToolModel } from "../../domain/defaults/everydayToolCatalog";
import { defaultModels } from "../../domain/defaults/defaultModels";
import type { ModelInventoryItem } from "../../domain/types";

const manualReviewModel = defaultModels.find((model) => model.id === "manual-human-review");

if (!manualReviewModel) {
  throw new Error("The manual review model is required for route-ready test fixtures.");
}

export const routeReadyModels = [
  manualReviewModel,
  createEverydayToolModel({
    id: "user-free-small-model",
    providerId: "gemini",
    accountId: "basic",
    frequencyId: "weekly",
  }),
  createEverydayToolModel({
    id: "user-mid-synthesis-model",
    providerId: "chatgpt",
    accountId: "plus",
    frequencyId: "daily",
  }),
  createEverydayToolModel({
    id: "user-frontier-quality-model",
    providerId: "claude",
    accountId: "max-5x",
    frequencyId: "daily",
  }),
  createEverydayToolModel({
    id: "user-research-tool",
    providerId: "perplexity",
    accountId: "pro",
    frequencyId: "weekly",
  }),
  createEverydayToolModel({
    id: "user-artifact-tool",
    providerId: "copilot",
    accountId: "m365-copilot",
    frequencyId: "weekly",
  }),
] satisfies ModelInventoryItem[];
