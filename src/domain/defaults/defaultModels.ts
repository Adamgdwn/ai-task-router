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
    id: "user-mid-synthesis-model",
    providerId: "none",
    enabled: false,
  }),
  createEverydayToolModel({
    id: "user-free-small-model",
    providerId: "none",
    enabled: false,
  }),
  createEverydayToolModel({
    id: "user-frontier-quality-model",
    providerId: "none",
    enabled: false,
  }),
  createEverydayToolModel({
    id: "user-research-tool",
    providerId: "none",
    enabled: false,
  }),
  createEverydayToolModel({
    id: "user-artifact-tool",
    providerId: "none",
    enabled: false,
  }),
  createEverydayToolModel({
    id: "user-ai-tool-slot-6",
    providerId: "none",
    enabled: false,
  }),
  createEverydayToolModel({
    id: "user-ai-tool-slot-7",
    providerId: "none",
    enabled: false,
  }),
  createEverydayToolModel({
    id: "user-ai-tool-slot-8",
    providerId: "none",
    enabled: false,
  }),
] satisfies ModelInventoryItem[];
