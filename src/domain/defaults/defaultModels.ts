import type { ModelInventoryItem } from "../types";
import { createEverydayToolModel } from "./everydayToolCatalog";

export const defaultModels = [
  {
    id: "manual-human-review",
    label: "My own final review",
    provider: "You",
    tier: "human",
    enabled: true,
    localOnly: true,
    capabilityScores: {
      reasoning: 5,
      writing: 4,
      coding: 3,
      research: 3,
      packaging: 4,
    },
    maxPermissionLevel: 4,
    requiresCredentials: false,
    requiresExternalCall: false,
    notes: "Always available as the final approval step. The app records the recommendation only.",
  },
  createEverydayToolModel({
    id: "user-free-small-model",
    providerId: "gemini",
    modelId: "gemini-flash",
    effortId: "quick",
  }),
  createEverydayToolModel({
    id: "user-mid-synthesis-model",
    providerId: "chatgpt",
    modelId: "gpt-5-5",
    effortId: "medium",
  }),
  createEverydayToolModel({
    id: "user-frontier-quality-model",
    providerId: "claude",
    modelId: "claude-opus",
    effortId: "extended-thinking",
  }),
  createEverydayToolModel({
    id: "user-research-tool",
    providerId: "perplexity",
    modelId: "sonar",
    effortId: "pro-search",
  }),
  createEverydayToolModel({
    id: "user-artifact-tool",
    providerId: "copilot",
    modelId: "copilot-office-artifact",
    effortId: "balanced",
  }),
] satisfies ModelInventoryItem[];
