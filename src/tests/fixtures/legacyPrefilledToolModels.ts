import { defaultModels } from "../../domain/defaults/defaultModels";
import type { ModelInventoryItem } from "../../domain/types";

const legacyPrefilledToolSlots: Partial<
  Record<ModelInventoryItem["id"], Pick<ModelInventoryItem, "label" | "provider" | "tier">>
> = {
  "user-free-small-model": {
    label: "Gemini: Flash - Quick",
    provider: "Gemini",
    tier: "small",
  },
  "user-mid-synthesis-model": {
    label: "ChatGPT: GPT-5.5 - Medium",
    provider: "ChatGPT",
    tier: "mid",
  },
  "user-frontier-quality-model": {
    label: "Claude: Opus - Extended thinking",
    provider: "Claude",
    tier: "frontier",
  },
  "user-research-tool": {
    label: "Perplexity: Sonar - Pro search",
    provider: "Perplexity",
    tier: "research",
  },
  "user-artifact-tool": {
    label: "Microsoft Copilot: Create documents, tables, or slides - Balanced",
    provider: "Microsoft Copilot",
    tier: "artifact",
  },
};

export const legacyPrefilledToolModels = defaultModels.map((model) => {
  const legacySlot = legacyPrefilledToolSlots[model.id];

  if (!legacySlot) {
    return model;
  }

  return {
    ...model,
    ...legacySlot,
    enabled: true,
  };
}) satisfies ModelInventoryItem[];
