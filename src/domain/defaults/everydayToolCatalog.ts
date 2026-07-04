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
  | "go"
  | "paid"
  | "plus"
  | "pro"
  | "business"
  | "team"
  | "max-5x"
  | "max-20x"
  | "google-ai-pro"
  | "google-ai-ultra"
  | "m365-personal"
  | "m365-copilot"
  | "enterprise-pro"
  | "enterprise-max"
  | "pro-plus"
  | "max"
  | "hobby"
  | "ultra"
  | "local-ollama"
  | "local-lm-studio"
  | "local-jan"
  | "local-llama-cpp"
  | "local-gpt4all"
  | "local-open-webui"
  | "local-other";

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
  accountLabel?: string;
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

const consumerAccountOptions = [
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
    label: "Paid or premium",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 2,
    note: "Good for normal writing, planning, and analysis.",
  },
  {
    id: "pro",
    label: "Highest personal plan",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when quality matters more than speed.",
  },
  {
    id: "team",
    label: "Team, work, or enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work information your organization allows in that account.",
  },
] satisfies EverydayToolAccountOption[];

const chatGptAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "small",
    capabilityScores: fastGeneralScores,
    maxPermissionLevel: 1,
    note: "Useful for quick, low-stakes help.",
  },
  {
    id: "go",
    label: "Go",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 1,
    note: "Use when the account has expanded everyday access but not the full Plus tier.",
  },
  {
    id: "plus",
    label: "Plus",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 2,
    note: "Good for regular writing, planning, analysis, and expanded research features.",
  },
  {
    id: "pro",
    label: "Pro",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when quality, deep reasoning, or higher limits matter more than speed.",
  },
  {
    id: "business",
    label: "Business or Enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work information your organization allows in that workspace.",
  },
] satisfies EverydayToolAccountOption[];

const claudeAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "small",
    capabilityScores: fastGeneralScores,
    maxPermissionLevel: 1,
    note: "Useful for occasional low-stakes help.",
  },
  {
    id: "pro",
    label: "Pro",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 2,
    note: "Good for regular writing, planning, and analysis.",
  },
  {
    id: "max-5x",
    label: "Max 5x",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when you have the higher-capacity Max tier for frequent work.",
  },
  {
    id: "max-20x",
    label: "Max 20x",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for the heaviest personal Claude usage.",
  },
  {
    id: "team",
    label: "Team or Enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work information your organization allows in that Claude organization.",
  },
] satisfies EverydayToolAccountOption[];

const geminiAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "small",
    capabilityScores: fastGeneralScores,
    maxPermissionLevel: 1,
    note: "Useful for quick, low-stakes Gemini help.",
  },
  {
    id: "google-ai-pro",
    label: "Google AI Pro",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 2,
    note: "Good for regular Gemini app use with expanded AI access.",
  },
  {
    id: "google-ai-ultra",
    label: "Google AI Ultra",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for the highest personal Gemini usage tier.",
  },
  {
    id: "team",
    label: "Google Workspace or enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work information your organization allows in Google Workspace.",
  },
] satisfies EverydayToolAccountOption[];

const copilotAccountOptions = [
  {
    id: "basic",
    label: "Free Copilot",
    tier: "small",
    capabilityScores: fastGeneralScores,
    maxPermissionLevel: 1,
    note: "Useful for quick public or personal help.",
  },
  {
    id: "m365-personal",
    label: "Microsoft 365 Personal, Family, or Premium",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 2,
    note: "Good when Copilot is part of your personal Microsoft 365 apps.",
  },
  {
    id: "pro",
    label: "Copilot Pro",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 2,
    note: "Use when you have paid personal Copilot access.",
  },
  {
    id: "m365-copilot",
    label: "Microsoft 365 Copilot for work",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 3,
    note: "Use only for work information your organization allows in Microsoft 365 Copilot.",
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
    label: "Pro or paid",
    tier: "research",
    capabilityScores: researchScores,
    maxPermissionLevel: 1,
    note: "Use for regular current-facts checks.",
  },
  {
    id: "pro",
    label: "Highest research tier",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 2,
    note: "Use for careful research or citation-heavy work.",
  },
  {
    id: "team",
    label: "Team or enterprise",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 3,
    note: "Use only for work research your organization allows in that account.",
  },
] satisfies EverydayToolAccountOption[];

const perplexityAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "research",
    capabilityScores: researchScores,
    maxPermissionLevel: 1,
    note: "Good for public questions and basic source-backed answers.",
  },
  {
    id: "pro",
    label: "Pro",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 2,
    note: "Use for regular current-facts checks, research, and citation-heavy work.",
  },
  {
    id: "enterprise-pro",
    label: "Enterprise Pro",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 3,
    note: "Use only for work research your organization allows in Perplexity Enterprise.",
  },
  {
    id: "enterprise-max",
    label: "Enterprise Max",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 3,
    note: "Use for the highest approved Perplexity Enterprise tier.",
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
    label: "Paid or premium",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 2,
    note: "Good for regular finished-file or structured-output help.",
  },
  {
    id: "pro",
    label: "Highest creator plan",
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
    label: "Team, business, or enterprise",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 3,
    note: "Use only for work artifacts your organization allows in that account.",
  },
] satisfies EverydayToolAccountOption[];

const canvaAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 1,
    note: "Useful for simple design or visual-output help.",
  },
  {
    id: "pro",
    label: "Pro",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 2,
    note: "Use when Canva Pro AI and premium design features are available.",
  },
  {
    id: "business",
    label: "Business",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 3,
    note: "Use only for work artifacts your organization allows in Canva Business.",
  },
  {
    id: "team",
    label: "Enterprise",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved brand or design work.",
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
    label: "Pro or paid",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Good for regular coding, debugging, and repo assistance.",
  },
  {
    id: "pro",
    label: "Highest individual plan",
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
    label: "Team, business, or enterprise",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for code your organization allows in that account.",
  },
] satisfies EverydayToolAccountOption[];

const githubCopilotAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "mid",
    capabilityScores: codingScores,
    maxPermissionLevel: 1,
    note: "Useful for light coding help.",
  },
  {
    id: "pro",
    label: "Pro",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Good for regular coding with GitHub Copilot.",
  },
  {
    id: "pro-plus",
    label: "Pro+",
    tier: "frontier",
    capabilityScores: scores({
      reasoning: 5,
      writing: 3,
      coding: 5,
      research: 3,
      packaging: 4,
    }),
    maxPermissionLevel: 2,
    note: "Use when your individual Copilot plan has higher premium usage.",
  },
  {
    id: "max",
    label: "Max",
    tier: "frontier",
    capabilityScores: scores({
      reasoning: 5,
      writing: 3,
      coding: 5,
      research: 3,
      packaging: 4,
    }),
    maxPermissionLevel: 2,
    note: "Use for the highest individual GitHub Copilot usage tier.",
  },
  {
    id: "team",
    label: "Business or Enterprise",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for code your organization allows in GitHub Copilot.",
  },
] satisfies EverydayToolAccountOption[];

const cursorAccountOptions = [
  {
    id: "hobby",
    label: "Hobby",
    tier: "mid",
    capabilityScores: codingScores,
    maxPermissionLevel: 1,
    note: "Useful for light Cursor use.",
  },
  {
    id: "pro",
    label: "Pro",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Good for regular Cursor agent and coding work.",
  },
  {
    id: "pro-plus",
    label: "Pro+",
    tier: "frontier",
    capabilityScores: scores({
      reasoning: 5,
      writing: 3,
      coding: 5,
      research: 3,
      packaging: 4,
    }),
    maxPermissionLevel: 2,
    note: "Use when your Cursor plan has higher included usage than Pro.",
  },
  {
    id: "ultra",
    label: "Ultra",
    tier: "frontier",
    capabilityScores: scores({
      reasoning: 5,
      writing: 3,
      coding: 5,
      research: 3,
      packaging: 4,
    }),
    maxPermissionLevel: 2,
    note: "Use for the heaviest individual Cursor usage tier.",
  },
  {
    id: "team",
    label: "Team or Enterprise",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for code your organization allows in Cursor.",
  },
] satisfies EverydayToolAccountOption[];

const localModelOptions = [
  {
    id: "local-ollama",
    label: "Ollama",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 4,
    localOnly: true,
    note: "Use when Ollama is installed and the model runs on your own machine or private host.",
  },
  {
    id: "local-lm-studio",
    label: "LM Studio",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 4,
    localOnly: true,
    note: "Use when LM Studio is the local model app you recognize.",
  },
  {
    id: "local-jan",
    label: "Jan",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 4,
    localOnly: true,
    note: "Use when Jan is the local model app you recognize.",
  },
  {
    id: "local-llama-cpp",
    label: "llama.cpp",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 4,
    localOnly: true,
    note: "Use when a llama.cpp model or server is the local setup you recognize.",
  },
  {
    id: "local-gpt4all",
    label: "GPT4All",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 4,
    localOnly: true,
    note: "Use when GPT4All is the local model app you recognize.",
  },
  {
    id: "local-open-webui",
    label: "Open WebUI or private endpoint",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 4,
    localOnly: true,
    note: "Use when a private local server or workplace-hosted model is the setup you recognize.",
  },
  {
    id: "local-other",
    label: "Other local model",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 4,
    localOnly: true,
    note: "Use when your local model app is not listed here.",
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
  chatGptProvider(),
  claudeProvider(),
  geminiProvider(),
  copilotProvider(),
  perplexityProvider(),
  researchProvider("genspark", "Genspark"),
  generalProvider("grok", "Grok"),
  generalProvider("meta-ai", "Meta AI"),
  generalProvider("poe", "Poe"),
  researchProvider("you-com", "You.com"),
  researchProvider("notebooklm", "NotebookLM"),
  canvaProvider(),
  githubCopilotProvider(),
  cursorProvider(),
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
    summary: "Use this for Ollama, LM Studio, Jan, llama.cpp, GPT4All, Open WebUI, or another private model.",
    accountLabel: "Local model",
    defaultAccountId: "local-ollama",
    defaultFrequencyId: "weekly",
    accountOptions: localModelOptions,
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

  const boundaryNote =
    provider.id === "local"
      ? "The app only remembers this choice; it does not scan your computer or start local model tools."
      : `The app only remembers this choice; it does not connect to ${provider.label}.`;

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
    notes: `${accountOption.note} ${frequencyOption.note} ${boundaryNote}`,
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
    return "Choose one AI app you already know. Add another row only when you want another tool.";
  }

  return `${provider.summary} ${provider.accountLabel ?? "Account level"}: ${accountOption.label}. Use: ${
    frequencyOption.label
  }.`;
}

function provider(providerConfig: EverydayToolProvider): EverydayToolProvider {
  return providerConfig;
}

function chatGptProvider(): EverydayToolProvider {
  return provider({
    id: "chatgpt",
    label: "ChatGPT",
    summary: "Use this if ChatGPT is one of the AI apps you already know.",
    defaultAccountId: "plus",
    defaultFrequencyId: "daily",
    accountOptions: chatGptAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function claudeProvider(): EverydayToolProvider {
  return provider({
    id: "claude",
    label: "Claude",
    summary: "Use this if Claude is one of the AI apps you already know.",
    defaultAccountId: "pro",
    defaultFrequencyId: "daily",
    accountOptions: claudeAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function geminiProvider(): EverydayToolProvider {
  return provider({
    id: "gemini",
    label: "Gemini",
    summary: "Use this if Gemini is one of the AI apps you already know.",
    defaultAccountId: "google-ai-pro",
    defaultFrequencyId: "daily",
    accountOptions: geminiAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function copilotProvider(): EverydayToolProvider {
  return provider({
    id: "copilot",
    label: "Microsoft Copilot",
    summary: "Use this when Copilot helps create documents, tables, slides, images, or polished outputs.",
    defaultAccountId: "m365-copilot",
    defaultFrequencyId: "weekly",
    accountOptions: copilotAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function perplexityProvider(): EverydayToolProvider {
  return provider({
    id: "perplexity",
    label: "Perplexity",
    summary: "Use this when Perplexity helps you check current facts, sources, or research.",
    defaultAccountId: "pro",
    defaultFrequencyId: "weekly",
    accountOptions: perplexityAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function canvaProvider(): EverydayToolProvider {
  return provider({
    id: "canva",
    label: "Canva Magic Studio",
    summary: "Use this when Canva helps create designs, images, slides, or polished outputs.",
    defaultAccountId: "pro",
    defaultFrequencyId: "weekly",
    accountOptions: canvaAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function githubCopilotProvider(): EverydayToolProvider {
  return provider({
    id: "github-copilot",
    label: "GitHub Copilot",
    summary: "Use this when GitHub Copilot helps you write, review, or understand code.",
    defaultAccountId: "pro",
    defaultFrequencyId: "weekly",
    accountOptions: githubCopilotAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function cursorProvider(): EverydayToolProvider {
  return provider({
    id: "cursor",
    label: "Cursor",
    summary: "Use this when Cursor helps you write, review, or understand code.",
    defaultAccountId: "pro",
    defaultFrequencyId: "weekly",
    accountOptions: cursorAccountOptions,
    frequencyOptions: realFrequencyOptions,
  });
}

function generalProvider(id: EverydayToolProviderId, label: string): EverydayToolProvider {
  return provider({
    id,
    label,
    summary: `Use this if ${label} is one of the AI apps you already know.`,
    defaultAccountId: "paid",
    defaultFrequencyId: "daily",
    accountOptions: consumerAccountOptions,
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
