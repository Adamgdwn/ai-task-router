import type { CapabilityScores, ModelInventoryItem, PermissionLevel } from "../types";

export type EverydayToolProviderId =
  | "none"
  | "chatgpt"
  | "claude"
  | "gemini"
  | "copilot"
  | "perplexity"
  | "genspark"
  | "grok"
  | "meta-ai"
  | "poe"
  | "you-com"
  | "notebooklm"
  | "canva"
  | "github-copilot"
  | "cursor"
  | "replit"
  | "deepseek"
  | "qwen"
  | "kimi"
  | "doubao"
  | "minimax"
  | "zhipu"
  | "hunyuan"
  | "mistral"
  | "local"
  | "other";

export type EverydayToolAccountId =
  | "not-selected"
  | "basic"
  | "paid"
  | "pro"
  | "team"
  | "local-basic"
  | "local-strong";

export type EverydayToolFrequencyId =
  | "not-selected"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "rarely";

export type EverydayToolAccountOption = {
  id: EverydayToolAccountId;
  label: string;
  tier: ModelInventoryItem["tier"];
  capabilityScores: CapabilityScores;
  maxPermissionLevel: PermissionLevel;
  localOnly?: boolean;
  note: string;
};

export type EverydayToolFrequencyOption = {
  id: EverydayToolFrequencyId;
  label: string;
  rank: number;
  note: string;
};

export type EverydayToolProvider = {
  id: EverydayToolProviderId;
  label: string;
  summary: string;
  defaultAccountId: EverydayToolAccountId;
  defaultFrequencyId: EverydayToolFrequencyId;
  accountOptions: EverydayToolAccountOption[];
  frequencyOptions: EverydayToolFrequencyOption[];
};

export type EverydayToolSelection = {
  providerId: EverydayToolProviderId;
  accountId: EverydayToolAccountId;
  frequencyId: EverydayToolFrequencyId;
};

const emptyEverydayToolSelection = {
  providerId: "none",
  accountId: "not-selected",
  frequencyId: "not-selected",
} satisfies EverydayToolSelection;

const capabilityKeys = ["reasoning", "writing", "coding", "research", "packaging"] as const;

const emptyScores = scores({
  reasoning: 0,
  writing: 0,
  coding: 0,
  research: 0,
  packaging: 0,
});

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

const strongResearchScores = scores({
  reasoning: 5,
  writing: 4,
  coding: 1,
  research: 5,
  packaging: 3,
});

const artifactScores = scores({
  reasoning: 3,
  writing: 4,
  coding: 2,
  research: 1,
  packaging: 5,
});

const codingScores = scores({
  reasoning: 4,
  writing: 2,
  coding: 5,
  research: 2,
  packaging: 3,
});

const placeholderAccountOptions = [
  {
    id: "not-selected",
    label: "Pick an app first",
    tier: "small",
    capabilityScores: emptyScores,
    maxPermissionLevel: 0,
    localOnly: true,
    note: "No AI app has been selected for this row.",
  },
] satisfies EverydayToolAccountOption[];

const generalAccountOptions = [
  {
    id: "basic",
    label: "Free or basic",
    tier: "small",
    capabilityScores: fastGeneralScores,
    maxPermissionLevel: 1,
    note: "Useful for quick, low-stakes help.",
  },
  {
    id: "paid",
    label: "Paid everyday",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 2,
    note: "Good for normal writing, planning, and analysis.",
  },
  {
    id: "pro",
    label: "Pro or strongest",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when quality matters more than speed.",
  },
  {
    id: "team",
    label: "Work, team, or enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work information your organization allows in that account.",
  },
] satisfies EverydayToolAccountOption[];

const researchAccountOptions = [
  {
    id: "basic",
    label: "Free or basic",
    tier: "research",
    capabilityScores: researchScores,
    maxPermissionLevel: 1,
    note: "Good for public questions and source-backed answers.",
  },
  {
    id: "paid",
    label: "Paid everyday",
    tier: "research",
    capabilityScores: researchScores,
    maxPermissionLevel: 1,
    note: "Use for regular current-facts checks.",
  },
  {
    id: "pro",
    label: "Pro or strongest",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 2,
    note: "Use for careful research or citation-heavy work.",
  },
  {
    id: "team",
    label: "Work, team, or enterprise",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 3,
    note: "Use only for work research your organization allows in that account.",
  },
] satisfies EverydayToolAccountOption[];

const artifactAccountOptions = [
  {
    id: "basic",
    label: "Free or basic",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 1,
    note: "Useful when the tool helps shape a document, table, image, or slide.",
  },
  {
    id: "paid",
    label: "Paid everyday",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 2,
    note: "Good for regular finished-file or structured-output help.",
  },
  {
    id: "pro",
    label: "Pro or strongest",
    tier: "artifact",
    capabilityScores: scores({
      reasoning: 4,
      writing: 5,
      coding: 2,
      research: 2,
      packaging: 5,
    }),
    maxPermissionLevel: 2,
    note: "Use when the final package needs more polish.",
  },
  {
    id: "team",
    label: "Work, team, or enterprise",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 3,
    note: "Use only for work artifacts your organization allows in that account.",
  },
] satisfies EverydayToolAccountOption[];

const codingAccountOptions = [
  {
    id: "basic",
    label: "Free or basic",
    tier: "mid",
    capabilityScores: codingScores,
    maxPermissionLevel: 1,
    note: "Useful for simple coding help.",
  },
  {
    id: "paid",
    label: "Paid everyday",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Good for regular coding, debugging, and repo assistance.",
  },
  {
    id: "pro",
    label: "Pro or strongest",
    tier: "frontier",
    capabilityScores: scores({
      reasoning: 5,
      writing: 3,
      coding: 5,
      research: 3,
      packaging: 4,
    }),
    maxPermissionLevel: 2,
    note: "Use for harder code or architecture work.",
  },
  {
    id: "team",
    label: "Work, team, or enterprise",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for code your organization allows in that account.",
  },
] satisfies EverydayToolAccountOption[];

const localAccountOptions = [
  {
    id: "local-basic",
    label: "Local or private basic",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 4,
    localOnly: true,
    note: "Useful when the work should stay private.",
  },
  {
    id: "local-strong",
    label: "Local or private strongest",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 4,
    localOnly: true,
    note: "Private help for harder work.",
  },
] satisfies EverydayToolAccountOption[];

export const everydayToolFrequencyOptions = [
  {
    id: "not-selected",
    label: "Pick an app first",
    rank: 0,
    note: "No usage frequency has been selected.",
  },
  {
    id: "hourly",
    label: "Many times a day",
    rank: 5,
    note: "This is one of the user's most familiar tools.",
  },
  {
    id: "daily",
    label: "Daily",
    rank: 4,
    note: "The user reaches for this tool most days.",
  },
  {
    id: "weekly",
    label: "A few times a week",
    rank: 3,
    note: "The user uses this tool regularly.",
  },
  {
    id: "monthly",
    label: "Now and then",
    rank: 2,
    note: "The user knows this tool but does not rely on it daily.",
  },
  {
    id: "rarely",
    label: "Rarely",
    rank: 1,
    note: "The user only occasionally uses this tool.",
  },
] satisfies EverydayToolFrequencyOption[];

const realFrequencyOptions = everydayToolFrequencyOptions.filter((option) => option.id !== "not-selected");
const placeholderFrequencyOptions = everydayToolFrequencyOptions.filter((option) => option.id === "not-selected");

export const everydayToolProviders = [
  provider({
    id: "none",
    label: "Choose an AI app",
    summary: "Start by picking one AI app you already recognize.",
    defaultAccountId: "not-selected",
    defaultFrequencyId: "not-selected",
    accountOptions: placeholderAccountOptions,
    frequencyOptions: placeholderFrequencyOptions,
  }),
  generalProvider("chatgpt", "ChatGPT"),
  generalProvider("claude", "Claude"),
  generalProvider("gemini", "Gemini"),
  artifactProvider("copilot", "Microsoft Copilot"),
  researchProvider("perplexity", "Perplexity"),
  researchProvider("genspark", "Genspark"),
  generalProvider("grok", "Grok"),
  generalProvider("meta-ai", "Meta AI"),
  generalProvider("poe", "Poe"),
  researchProvider("you-com", "You.com"),
  researchProvider("notebooklm", "NotebookLM"),
  artifactProvider("canva", "Canva Magic Studio"),
  codingProvider("github-copilot", "GitHub Copilot"),
  codingProvider("cursor", "Cursor"),
  codingProvider("replit", "Replit AI"),
  generalProvider("deepseek", "DeepSeek"),
  generalProvider("qwen", "Qwen"),
  generalProvider("kimi", "Kimi"),
  generalProvider("doubao", "Doubao"),
  generalProvider("minimax", "MiniMax"),
  generalProvider("zhipu", "Zhipu"),
  generalProvider("hunyuan", "Tencent Hunyuan"),
  generalProvider("mistral", "Mistral Le Chat"),
  provider({
    id: "local",
    label: "Local or private AI",
    summary: "Use this when your tool runs locally or stays inside a private workplace environment.",
    defaultAccountId: "local-basic",
    defaultFrequencyId: "weekly",
    accountOptions: localAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  generalProvider("other", "Something else"),
] satisfies EverydayToolProvider[];

const fallbackProvider = everydayToolProviders.find((candidateProvider) => candidateProvider.id === "other") ?? everydayToolProviders[0];

const legacyPrefilledToolDefaults: Partial<Record<ModelInventoryItem["id"], { label: string; provider: string }>> = {
  "user-free-small-model": {
    label: "Gemini: Flash - Quick",
    provider: "Gemini",
  },
  "user-mid-synthesis-model": {
    label: "ChatGPT: GPT-5.5 - Medium",
    provider: "ChatGPT",
  },
  "user-frontier-quality-model": {
    label: "Claude: Opus - Extended thinking",
    provider: "Claude",
  },
  "user-research-tool": {
    label: "Perplexity: Sonar - Pro search",
    provider: "Perplexity",
  },
  "user-artifact-tool": {
    label: "Microsoft Copilot: Create documents, tables, or slides - Balanced",
    provider: "Microsoft Copilot",
  },
};

export function getEverydayToolProvider(providerId: EverydayToolProviderId): EverydayToolProvider {
  return everydayToolProviders.find((candidateProvider) => candidateProvider.id === providerId) ?? fallbackProvider;
}

export function createEverydayToolModel(input: {
  id: string;
  providerId: EverydayToolProviderId;
  accountId?: EverydayToolAccountId;
  frequencyId?: EverydayToolFrequencyId;
  enabled?: boolean;
}): ModelInventoryItem {
  return applyEverydayToolSelection(
    {
      id: input.id,
      label: "",
      provider: "",
      tier: "small",
      enabled: input.enabled ?? input.providerId !== "none",
      localOnly: false,
      capabilityScores: emptyScores,
      maxPermissionLevel: 0,
      requiresCredentials: false,
      requiresExternalCall: false,
      notes: "",
    },
    {
      providerId: input.providerId,
      accountId: input.accountId,
      frequencyId: input.frequencyId,
    },
  );
}

export function inferEverydayToolSelection(model: ModelInventoryItem): EverydayToolSelection {
  if (isLegacyPrefilledEverydayTool(model)) {
    return emptyEverydayToolSelection;
  }

  const provider = inferProvider(model);
  const accountOption = inferAccountOption(provider, model);
  const frequencyOption = inferFrequencyOption(provider, model);

  return {
    providerId: provider.id,
    accountId: accountOption.id,
    frequencyId: frequencyOption.id,
  };
}

export function applyEverydayToolSelection(
  model: ModelInventoryItem,
  selection: Partial<EverydayToolSelection>,
): ModelInventoryItem {
  const currentSelection = inferEverydayToolSelection(model);
  const providerChanged = selection.providerId !== undefined && selection.providerId !== currentSelection.providerId;
  const provider = getEverydayToolProvider(selection.providerId ?? currentSelection.providerId);
  const selectedAccountId =
    selection.accountId ?? (providerChanged ? provider.defaultAccountId : currentSelection.accountId);
  const selectedFrequencyId =
    selection.frequencyId ?? (providerChanged ? provider.defaultFrequencyId : currentSelection.frequencyId);
  const accountOption =
    provider.accountOptions.find((option) => option.id === selectedAccountId) ?? provider.accountOptions[0];
  const frequencyOption =
    provider.frequencyOptions.find((option) => option.id === selectedFrequencyId) ?? provider.frequencyOptions[0];
  const selected = provider.id !== "none";

  if (!selected) {
    return {
      ...model,
      label: "Add an AI app",
      provider: provider.label,
      tier: "small",
      enabled: false,
      localOnly: true,
      capabilityScores: emptyScores,
      maxPermissionLevel: 0,
      requiresCredentials: false,
      requiresExternalCall: false,
      notes: "No AI app has been selected for this slot.",
    };
  }

  return {
    ...model,
    label: everydayToolLabel(provider, accountOption, frequencyOption),
    provider: provider.label,
    tier: accountOption.tier,
    enabled: true,
    localOnly: accountOption.localOnly ?? provider.id === "local",
    capabilityScores: accountOption.capabilityScores,
    maxPermissionLevel: accountOption.maxPermissionLevel,
    requiresCredentials: false,
    requiresExternalCall: false,
    notes: `${accountOption.note} ${frequencyOption.note} The app only remembers this choice; it does not connect to ${provider.label}.`,
  };
}

export function isEverydayToolSelected(model: ModelInventoryItem): boolean {
  return inferEverydayToolSelection(model).providerId !== "none" && model.enabled;
}

export function isLegacyPrefilledEverydayTool(model: ModelInventoryItem): boolean {
  const legacyDefault = legacyPrefilledToolDefaults[model.id];

  return Boolean(
    legacyDefault &&
      model.enabled &&
      model.label === legacyDefault.label &&
      model.provider === legacyDefault.provider,
  );
}

export function everydayToolFrequencyRank(model: ModelInventoryItem): number {
  const selection = inferEverydayToolSelection(model);
  const provider = getEverydayToolProvider(selection.providerId);
  const frequencyOption =
    provider.frequencyOptions.find((option) => option.id === selection.frequencyId) ??
    everydayToolFrequencyOptions.find((option) => option.id === selection.frequencyId) ??
    everydayToolFrequencyOptions[0];

  return isEverydayToolSelected(model) ? frequencyOption.rank : 0;
}

export function everydayToolSummary(model: ModelInventoryItem): string {
  const selection = inferEverydayToolSelection(model);
  const provider = getEverydayToolProvider(selection.providerId);
  const accountOption =
    provider.accountOptions.find((option) => option.id === selection.accountId) ?? provider.accountOptions[0];
  const frequencyOption =
    provider.frequencyOptions.find((option) => option.id === selection.frequencyId) ?? provider.frequencyOptions[0];

  if (provider.id === "none") {
    return "Choose one AI app you already know. A new blank line appears after each selection.";
  }

  return `${provider.summary} Account: ${accountOption.label}. Use: ${frequencyOption.label}.`;
}

function provider(providerConfig: EverydayToolProvider): EverydayToolProvider {
  return providerConfig;
}

function generalProvider(id: EverydayToolProviderId, label: string): EverydayToolProvider {
  return provider({
    id,
    label,
    summary: `Use this if ${label} is one of the AI apps you already know.`,
    defaultAccountId: "paid",
    defaultFrequencyId: "daily",
    accountOptions: generalAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function researchProvider(id: EverydayToolProviderId, label: string): EverydayToolProvider {
  return provider({
    id,
    label,
    summary: `Use this when ${label} helps you check current facts, sources, or research.`,
    defaultAccountId: "paid",
    defaultFrequencyId: "weekly",
    accountOptions: researchAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function artifactProvider(id: EverydayToolProviderId, label: string): EverydayToolProvider {
  return provider({
    id,
    label,
    summary: `Use this when ${label} helps create documents, tables, slides, images, or polished outputs.`,
    defaultAccountId: "paid",
    defaultFrequencyId: "weekly",
    accountOptions: artifactAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function codingProvider(id: EverydayToolProviderId, label: string): EverydayToolProvider {
  return provider({
    id,
    label,
    summary: `Use this when ${label} helps you write, review, or understand code.`,
    defaultAccountId: "paid",
    defaultFrequencyId: "weekly",
    accountOptions: codingAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function inferProvider(model: ModelInventoryItem): EverydayToolProvider {
  const providerByStoredValue = everydayToolProviders.find(
    (candidateProvider) => candidateProvider.id === model.provider || candidateProvider.label === model.provider,
  );

  if (providerByStoredValue) {
    return providerByStoredValue;
  }

  const providerByLabel = everydayToolProviders.find((candidateProvider) =>
    model.label.startsWith(`${candidateProvider.label}:`),
  );

  if (providerByLabel) {
    return providerByLabel;
  }

  if (model.label === "Add an AI app") {
    return getEverydayToolProvider("none");
  }

  if (!model.enabled) {
    return getEverydayToolProvider("none");
  }

  return getEverydayToolProvider("other");
}

function inferAccountOption(provider: EverydayToolProvider, model: ModelInventoryItem): EverydayToolAccountOption {
  const labelPrefix = `${provider.label}: `;
  const matchingOption = provider.accountOptions.find(
    (option) => model.label.startsWith(`${labelPrefix}${option.label} -`) || model.label === option.label,
  );

  if (matchingOption) {
    return matchingOption;
  }

  const legacyOption = provider.accountOptions.find((option) => option.tier === model.tier);
  if (legacyOption) {
    return legacyOption;
  }

  return provider.accountOptions[0];
}

function inferFrequencyOption(provider: EverydayToolProvider, model: ModelInventoryItem): EverydayToolFrequencyOption {
  const matchingOptions = provider.frequencyOptions
    .filter((option) => model.label.endsWith(` - ${option.label}`))
    .sort((left, right) => right.label.length - left.label.length);

  if (matchingOptions[0]) {
    return matchingOptions[0];
  }

  if (provider.id === "none") {
    return provider.frequencyOptions[0];
  }

  return provider.frequencyOptions.find((option) => option.id === provider.defaultFrequencyId) ?? provider.frequencyOptions[0];
}

function everydayToolLabel(
  provider: EverydayToolProvider,
  accountOption: EverydayToolAccountOption,
  frequencyOption: EverydayToolFrequencyOption,
) {
  return `${provider.label}: ${accountOption.label} - ${frequencyOption.label}`;
}

function scores(capabilityScores: CapabilityScores): CapabilityScores {
  return capabilityKeys.reduce(
    (nextScores, capabilityKey) => ({
      ...nextScores,
      [capabilityKey]: clampScore(capabilityScores[capabilityKey]),
    }),
    {} as CapabilityScores,
  );
}

function clampScore(score: number) {
  return Math.min(5, Math.max(0, score));
}
