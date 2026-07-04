import type { CapabilityScores, ModelInventoryItem, PermissionLevel } from "../types";

export type EverydayToolProviderId =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "copilot"
  | "perplexity"
  | "local"
  | "other";

export type EverydayToolModelOption = {
  id: string;
  label: string;
  tier: ModelInventoryItem["tier"];
  capabilityScores: CapabilityScores;
  maxPermissionLevel: PermissionLevel;
  localOnly?: boolean;
  note: string;
};

export type EverydayToolEffortOption = {
  id: string;
  label: string;
  tier?: ModelInventoryItem["tier"];
  capabilityBoost?: Partial<Record<keyof CapabilityScores, number>>;
  maxPermissionLevel?: PermissionLevel;
  note: string;
};

export type EverydayToolProvider = {
  id: EverydayToolProviderId;
  label: string;
  summary: string;
  defaultModelId: string;
  defaultEffortId: string;
  modelOptions: EverydayToolModelOption[];
  effortOptions: EverydayToolEffortOption[];
};

export type EverydayToolSelection = {
  providerId: EverydayToolProviderId;
  modelId: string;
  effortId: string;
};

const capabilityKeys = ["reasoning", "writing", "coding", "research", "packaging"] as const;

const fastGeneralScores = scores({
  reasoning: 3,
  writing: 3,
  coding: 2,
  research: 1,
  packaging: 2,
});

const balancedGeneralScores = scores({
  reasoning: 4,
  writing: 4,
  coding: 3,
  research: 2,
  packaging: 3,
});

const strongGeneralScores = scores({
  reasoning: 5,
  writing: 5,
  coding: 4,
  research: 3,
  packaging: 4,
});

const researchScores = scores({
  reasoning: 4,
  writing: 3,
  coding: 1,
  research: 5,
  packaging: 2,
});

const artifactScores = scores({
  reasoning: 3,
  writing: 4,
  coding: 2,
  research: 1,
  packaging: 5,
});

export const everydayToolProviders = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    summary: "Use the model picker and thinking setting you already choose inside ChatGPT.",
    defaultModelId: "gpt-5-5",
    defaultEffortId: "medium",
    modelOptions: [
      {
        id: "gpt-5-5",
        label: "GPT-5.5",
        tier: "mid",
        capabilityScores: balancedGeneralScores,
        maxPermissionLevel: 2,
        note: "Best fit when ChatGPT is your main general assistant.",
      },
      {
        id: "gpt-5-4",
        label: "GPT-5.4",
        tier: "frontier",
        capabilityScores: strongGeneralScores,
        maxPermissionLevel: 2,
        note: "Choose this if it is what your ChatGPT picker shows.",
      },
      {
        id: "gpt-5-3",
        label: "GPT-5.3",
        tier: "mid",
        capabilityScores: balancedGeneralScores,
        maxPermissionLevel: 2,
        note: "Good for normal writing, analysis, and planning work.",
      },
      {
        id: "o3-legacy",
        label: "o3 or legacy model",
        tier: "frontier",
        capabilityScores: scores({
          reasoning: 5,
          writing: 3,
          coding: 4,
          research: 2,
          packaging: 3,
        }),
        maxPermissionLevel: 1,
        note: "Only choose this if it still appears in your account.",
      },
      {
        id: "chatgpt-auto",
        label: "Auto / I am not sure",
        tier: "mid",
        capabilityScores: balancedGeneralScores,
        maxPermissionLevel: 1,
        note: "A safe choice when you normally leave ChatGPT on its default setting.",
      },
    ],
    effortOptions: [
      {
        id: "instant",
        label: "Instant",
        tier: "mid",
        capabilityBoost: { reasoning: -1, research: -1 },
        maxPermissionLevel: 1,
        note: "Fast everyday answers.",
      },
      {
        id: "medium",
        label: "Medium",
        tier: "mid",
        note: "Standard reasoning for normal work.",
      },
      {
        id: "high",
        label: "High",
        tier: "frontier",
        capabilityBoost: { reasoning: 1, research: 1 },
        note: "More thinking for harder tasks.",
      },
      {
        id: "extra-high",
        label: "Extra High",
        tier: "frontier",
        capabilityBoost: { reasoning: 1, coding: 1, research: 1 },
        note: "Use when mistakes would be expensive.",
      },
      {
        id: "pro-standard",
        label: "Pro Standard",
        tier: "frontier",
        capabilityBoost: { reasoning: 1, writing: 1, coding: 1 },
        note: "Stronger paid-plan work mode.",
      },
      {
        id: "pro-extended",
        label: "Pro Extended",
        tier: "frontier",
        capabilityBoost: { reasoning: 1, writing: 1, coding: 1, research: 1, packaging: 1 },
        note: "Most careful paid-plan work mode.",
      },
    ],
  },
  {
    id: "claude",
    label: "Claude",
    summary: "Pick the Claude model family and thinking depth that matches what you use.",
    defaultModelId: "claude-best",
    defaultEffortId: "balanced",
    modelOptions: [
      {
        id: "claude-best",
        label: "Best available",
        tier: "mid",
        capabilityScores: balancedGeneralScores,
        maxPermissionLevel: 2,
        note: "Good when you let Claude choose the best available model.",
      },
      {
        id: "claude-opus",
        label: "Opus",
        tier: "frontier",
        capabilityScores: strongGeneralScores,
        maxPermissionLevel: 2,
        note: "Use for careful writing, reasoning, and review.",
      },
      {
        id: "claude-sonnet",
        label: "Sonnet",
        tier: "mid",
        capabilityScores: balancedGeneralScores,
        maxPermissionLevel: 2,
        note: "Useful for everyday writing and analysis.",
      },
      {
        id: "claude-haiku",
        label: "Haiku",
        tier: "small",
        capabilityScores: fastGeneralScores,
        maxPermissionLevel: 1,
        note: "Use for quick, low-stakes help.",
      },
      {
        id: "claude-auto",
        label: "Auto / I am not sure",
        tier: "mid",
        capabilityScores: balancedGeneralScores,
        maxPermissionLevel: 1,
        note: "A safe choice when you are not sure which Claude model is selected.",
      },
    ],
    effortOptions: [
      {
        id: "quick",
        label: "Quick",
        tier: "small",
        capabilityBoost: { reasoning: -1 },
        maxPermissionLevel: 1,
        note: "Fast responses.",
      },
      {
        id: "balanced",
        label: "Balanced",
        note: "Normal effort for everyday work.",
      },
      {
        id: "extended-thinking",
        label: "Extended thinking",
        tier: "frontier",
        capabilityBoost: { reasoning: 1, writing: 1 },
        note: "More thinking for harder decisions.",
      },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    summary: "Use the Gemini option that matches your model picker.",
    defaultModelId: "gemini-pro",
    defaultEffortId: "balanced",
    modelOptions: [
      {
        id: "gemini-pro",
        label: "Pro",
        tier: "frontier",
        capabilityScores: strongGeneralScores,
        maxPermissionLevel: 2,
        note: "Strong general-purpose help.",
      },
      {
        id: "gemini-flash",
        label: "Flash",
        tier: "small",
        capabilityScores: fastGeneralScores,
        maxPermissionLevel: 1,
        note: "Fast answers for simple tasks.",
      },
      {
        id: "gemini-deep-research",
        label: "Deep Research",
        tier: "research",
        capabilityScores: researchScores,
        maxPermissionLevel: 1,
        note: "Use when the job needs current facts and source checking.",
      },
      {
        id: "gemini-auto",
        label: "Auto / I am not sure",
        tier: "mid",
        capabilityScores: balancedGeneralScores,
        maxPermissionLevel: 1,
        note: "A safe choice when Gemini is on its default setting.",
      },
    ],
    effortOptions: [
      {
        id: "quick",
        label: "Quick",
        tier: "small",
        maxPermissionLevel: 1,
        capabilityBoost: { reasoning: -1 },
        note: "Fast everyday answers.",
      },
      {
        id: "balanced",
        label: "Balanced",
        note: "Normal effort for everyday work.",
      },
      {
        id: "deep",
        label: "Deep thinking",
        tier: "frontier",
        capabilityBoost: { reasoning: 1, research: 1 },
        note: "More effort for harder work.",
      },
    ],
  },
  {
    id: "copilot",
    label: "Microsoft Copilot",
    summary: "Pick the Copilot mode you would choose in Microsoft 365 or Windows.",
    defaultModelId: "copilot-chat",
    defaultEffortId: "balanced",
    modelOptions: [
      {
        id: "copilot-chat",
        label: "Copilot Chat",
        tier: "mid",
        capabilityScores: balancedGeneralScores,
        maxPermissionLevel: 2,
        note: "Useful for everyday work questions and drafting.",
      },
      {
        id: "copilot-think-deeper",
        label: "Think Deeper",
        tier: "frontier",
        capabilityScores: strongGeneralScores,
        maxPermissionLevel: 2,
        note: "Use when you would choose a more careful Copilot answer.",
      },
      {
        id: "copilot-researcher",
        label: "Researcher",
        tier: "research",
        capabilityScores: researchScores,
        maxPermissionLevel: 1,
        note: "Use when Copilot is helping you check current information.",
      },
      {
        id: "copilot-office-artifact",
        label: "Create documents, tables, or slides",
        tier: "artifact",
        capabilityScores: artifactScores,
        maxPermissionLevel: 1,
        note: "Use when the job ends as a document, table, or slide outline.",
      },
    ],
    effortOptions: [
      {
        id: "quick",
        label: "Quick",
        tier: "small",
        maxPermissionLevel: 1,
        capabilityBoost: { reasoning: -1 },
        note: "Fast everyday answers.",
      },
      {
        id: "balanced",
        label: "Balanced",
        note: "Normal effort for everyday work.",
      },
      {
        id: "more-careful",
        label: "More careful",
        tier: "frontier",
        capabilityBoost: { reasoning: 1, writing: 1 },
        note: "More review before you use the result.",
      },
    ],
  },
  {
    id: "perplexity",
    label: "Perplexity",
    summary: "Use this for current facts, web answers, and citation-heavy tasks.",
    defaultModelId: "sonar",
    defaultEffortId: "pro-search",
    modelOptions: [
      {
        id: "sonar",
        label: "Sonar",
        tier: "research",
        capabilityScores: researchScores,
        maxPermissionLevel: 1,
        note: "Good for current web-backed answers.",
      },
      {
        id: "perplexity-pro",
        label: "Pro search",
        tier: "research",
        capabilityScores: researchScores,
        maxPermissionLevel: 1,
        note: "Use when citations or source checking matter.",
      },
      {
        id: "perplexity-deep-research",
        label: "Deep research",
        tier: "research",
        capabilityScores: scores({
          reasoning: 4,
          writing: 4,
          coding: 1,
          research: 5,
          packaging: 3,
        }),
        maxPermissionLevel: 1,
        note: "Use for longer current-facts research.",
      },
    ],
    effortOptions: [
      {
        id: "quick-answer",
        label: "Quick answer",
        tier: "research",
        capabilityBoost: { reasoning: -1 },
        note: "Fast source-backed answer.",
      },
      {
        id: "pro-search",
        label: "Pro search",
        tier: "research",
        note: "More source checking.",
      },
      {
        id: "deep-research",
        label: "Deep research",
        tier: "research",
        capabilityBoost: { reasoning: 1, writing: 1 },
        note: "Use for careful source review.",
      },
    ],
  },
  {
    id: "local",
    label: "Local or private AI",
    summary: "Use this when your tool runs locally or stays inside a private workplace environment.",
    defaultModelId: "private-general",
    defaultEffortId: "balanced",
    modelOptions: [
      {
        id: "private-general",
        label: "Private general model",
        tier: "mid",
        capabilityScores: balancedGeneralScores,
        maxPermissionLevel: 4,
        localOnly: true,
        note: "Useful when the work should stay private.",
      },
      {
        id: "local-small",
        label: "Local fast model",
        tier: "small",
        capabilityScores: fastGeneralScores,
        maxPermissionLevel: 4,
        localOnly: true,
        note: "Quick private help for low-stakes work.",
      },
      {
        id: "local-strong",
        label: "Local strongest model",
        tier: "frontier",
        capabilityScores: strongGeneralScores,
        maxPermissionLevel: 4,
        localOnly: true,
        note: "Private help for harder work.",
      },
    ],
    effortOptions: [
      {
        id: "quick",
        label: "Quick",
        tier: "small",
        capabilityBoost: { reasoning: -1 },
        note: "Fast private answer.",
      },
      {
        id: "balanced",
        label: "Balanced",
        note: "Normal private work mode.",
      },
      {
        id: "deep",
        label: "Deep thinking",
        tier: "frontier",
        capabilityBoost: { reasoning: 1, writing: 1 },
        note: "More local effort for hard tasks.",
      },
    ],
  },
  {
    id: "other",
    label: "Something else",
    summary: "Choose the closest match when your AI app is not listed.",
    defaultModelId: "other-default",
    defaultEffortId: "balanced",
    modelOptions: [
      {
        id: "other-default",
        label: "Default model",
        tier: "mid",
        capabilityScores: balancedGeneralScores,
        maxPermissionLevel: 1,
        note: "A general assistant not listed here.",
      },
      {
        id: "other-fast",
        label: "Fast model",
        tier: "small",
        capabilityScores: fastGeneralScores,
        maxPermissionLevel: 1,
        note: "A quick, low-stakes model.",
      },
      {
        id: "other-strong",
        label: "Strongest model",
        tier: "frontier",
        capabilityScores: strongGeneralScores,
        maxPermissionLevel: 2,
        note: "A stronger model for harder work.",
      },
      {
        id: "other-research",
        label: "Research mode",
        tier: "research",
        capabilityScores: researchScores,
        maxPermissionLevel: 1,
        note: "A tool you use for current facts.",
      },
      {
        id: "other-artifact",
        label: "Document, table, or slide mode",
        tier: "artifact",
        capabilityScores: artifactScores,
        maxPermissionLevel: 1,
        note: "A tool you use for finished files or structured outputs.",
      },
    ],
    effortOptions: [
      {
        id: "quick",
        label: "Quick",
        tier: "small",
        maxPermissionLevel: 1,
        capabilityBoost: { reasoning: -1 },
        note: "Fast answer.",
      },
      {
        id: "balanced",
        label: "Balanced",
        note: "Normal effort.",
      },
      {
        id: "deep",
        label: "Deep thinking",
        tier: "frontier",
        capabilityBoost: { reasoning: 1 },
        note: "More effort for harder work.",
      },
    ],
  },
] satisfies EverydayToolProvider[];

const fallbackProvider = everydayToolProviders.find((provider) => provider.id === "other") ?? everydayToolProviders[0];

const defaultProviderByModelId: Record<string, EverydayToolProviderId> = {
  "user-free-small-model": "gemini",
  "user-mid-synthesis-model": "chatgpt",
  "user-frontier-quality-model": "claude",
  "user-research-tool": "perplexity",
  "user-artifact-tool": "copilot",
};

export function getEverydayToolProvider(providerId: EverydayToolProviderId): EverydayToolProvider {
  return everydayToolProviders.find((provider) => provider.id === providerId) ?? fallbackProvider;
}

export function createEverydayToolModel(input: {
  id: string;
  providerId: EverydayToolProviderId;
  modelId?: string;
  effortId?: string;
  enabled?: boolean;
}): ModelInventoryItem {
  return applyEverydayToolSelection(
    {
      id: input.id,
      label: "",
      provider: "",
      tier: "mid",
      enabled: input.enabled ?? true,
      localOnly: false,
      capabilityScores: balancedGeneralScores,
      maxPermissionLevel: 1,
      requiresCredentials: false,
      requiresExternalCall: false,
      notes: "",
    },
    {
      providerId: input.providerId,
      modelId: input.modelId,
      effortId: input.effortId,
    },
  );
}

export function inferEverydayToolSelection(model: ModelInventoryItem): EverydayToolSelection {
  const provider = inferProvider(model);
  const modelOption = inferModelOption(provider, model);
  const effortOption = inferEffortOption(provider, model);

  return {
    providerId: provider.id,
    modelId: modelOption.id,
    effortId: effortOption.id,
  };
}

export function applyEverydayToolSelection(
  model: ModelInventoryItem,
  selection: Partial<EverydayToolSelection>,
): ModelInventoryItem {
  const currentSelection = inferEverydayToolSelection(model);
  const providerChanged = selection.providerId !== undefined && selection.providerId !== currentSelection.providerId;
  const provider = getEverydayToolProvider(selection.providerId ?? currentSelection.providerId);
  const selectedModelId = providerChanged
    ? provider.defaultModelId
    : selection.modelId ?? currentSelection.modelId;
  const selectedEffortId = providerChanged
    ? provider.defaultEffortId
    : selection.effortId ?? currentSelection.effortId;
  const modelOption = provider.modelOptions.find((option) => option.id === selectedModelId) ?? provider.modelOptions[0];
  const effortOption =
    provider.effortOptions.find((option) => option.id === selectedEffortId) ?? provider.effortOptions[0];
  const tier = effortOption.tier ?? modelOption.tier;
  const maxPermissionLevel = effortOption.maxPermissionLevel ?? modelOption.maxPermissionLevel;

  return {
    ...model,
    label: everydayToolLabel(provider, modelOption, effortOption),
    provider: provider.label,
    tier,
    localOnly: modelOption.localOnly ?? provider.id === "local",
    capabilityScores: applyCapabilityBoost(modelOption.capabilityScores, effortOption.capabilityBoost),
    maxPermissionLevel,
    requiresCredentials: false,
    requiresExternalCall: false,
    notes: `${modelOption.note} ${effortOption.note} The app only remembers this choice; it does not connect to ${provider.label}.`,
  };
}

export function everydayToolSummary(model: ModelInventoryItem): string {
  const selection = inferEverydayToolSelection(model);
  const provider = getEverydayToolProvider(selection.providerId);
  const modelOption =
    provider.modelOptions.find((option) => option.id === selection.modelId) ?? provider.modelOptions[0];
  const effortOption =
    provider.effortOptions.find((option) => option.id === selection.effortId) ?? provider.effortOptions[0];

  return `${provider.summary} Model: ${modelOption.label}. Setting: ${effortOption.label}.`;
}

function inferProvider(model: ModelInventoryItem): EverydayToolProvider {
  const providerByStoredValue = everydayToolProviders.find(
    (provider) => provider.id === model.provider || provider.label === model.provider,
  );

  if (providerByStoredValue) {
    return providerByStoredValue;
  }

  const providerByLabel = everydayToolProviders.find((provider) => model.label.startsWith(`${provider.label}:`));

  if (providerByLabel) {
    return providerByLabel;
  }

  return getEverydayToolProvider(defaultProviderByModelId[model.id] ?? "other");
}

function inferModelOption(provider: EverydayToolProvider, model: ModelInventoryItem): EverydayToolModelOption {
  const labelPrefix = `${provider.label}: `;
  const matchingOption = provider.modelOptions.find(
    (option) => model.label.startsWith(`${labelPrefix}${option.label} -`) || model.label === option.label,
  );

  if (matchingOption) {
    return matchingOption;
  }

  return provider.modelOptions.find((option) => option.tier === model.tier) ?? provider.modelOptions[0];
}

function inferEffortOption(provider: EverydayToolProvider, model: ModelInventoryItem): EverydayToolEffortOption {
  const matchingOptions = provider.effortOptions
    .filter((option) => model.label.endsWith(` - ${option.label}`))
    .sort((left, right) => right.label.length - left.label.length);

  if (matchingOptions[0]) {
    return matchingOptions[0];
  }

  return provider.effortOptions.find((option) => option.tier === model.tier) ?? provider.effortOptions[0];
}

function everydayToolLabel(
  provider: EverydayToolProvider,
  modelOption: EverydayToolModelOption,
  effortOption: EverydayToolEffortOption,
) {
  return `${provider.label}: ${modelOption.label} - ${effortOption.label}`;
}

function applyCapabilityBoost(
  baseScores: CapabilityScores,
  capabilityBoost: EverydayToolEffortOption["capabilityBoost"] = {},
): CapabilityScores {
  return capabilityKeys.reduce(
    (nextScores, capabilityKey) => ({
      ...nextScores,
      [capabilityKey]: clampScore(baseScores[capabilityKey] + (capabilityBoost[capabilityKey] ?? 0)),
    }),
    {} as CapabilityScores,
  );
}

function scores(capabilityScores: CapabilityScores): CapabilityScores {
  return capabilityScores;
}

function clampScore(score: number) {
  return Math.min(5, Math.max(0, score));
}
