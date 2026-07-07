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

export type EverydayToolAccountId = string;

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
  legacyLabels?: string[];
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

export const everydayToolCatalogReviewedAt = "2026-07-05T08:52:38-06:00";

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
    label: "Business",
    legacyLabels: ["Business or Enterprise"],
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work information your organization allows in that workspace.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved information in that ChatGPT workspace.",
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
    note: "Good for regular writing, planning, analysis, and Claude Code access through the same Claude subscription when supported.",
  },
  {
    id: "max-5x",
    label: "Max 5x",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when you have the higher-capacity Max tier for frequent Claude and Claude Code work.",
  },
  {
    id: "max-20x",
    label: "Max 20x",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for the heaviest personal Claude usage, including Claude Code build work through the same subscription.",
  },
  {
    id: "team",
    label: "Team",
    legacyLabels: ["Team or Enterprise"],
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work information your organization allows in that Claude organization.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved information in that Claude organization.",
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
    id: "google-ai-plus",
    label: "Google AI Plus",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 1,
    note: "Use when your Google AI plan is the lighter paid Gemini tier.",
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
    label: "Google Workspace",
    legacyLabels: ["Google Workspace or enterprise"],
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work information your organization allows in Google Workspace.",
  },
  {
    id: "enterprise",
    label: "Google Workspace Enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved information in Google Workspace.",
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
    label: "Microsoft 365 Personal or Family",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 2,
    note: "Good when Copilot is part of your personal Microsoft 365 apps.",
  },
  {
    id: "m365-premium",
    label: "Microsoft 365 Premium",
    legacyLabels: ["Microsoft 365 Personal, Family, or Premium"],
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 2,
    note: "Use when your Microsoft 365 plan includes expanded personal Copilot features.",
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
    id: "m365-work-chat",
    label: "Copilot Chat at work",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 2,
    note: "Use for work chat access included with an eligible Microsoft 365 work account.",
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
    id: "max",
    label: "Max",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 2,
    note: "Use for the heaviest personal Perplexity plan.",
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
    label: "Business",
    legacyLabels: ["Business or Enterprise"],
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for code your organization allows in GitHub Copilot.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved code in GitHub Copilot.",
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
    label: "Teams Standard",
    legacyLabels: ["Team or Enterprise"],
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for code your organization allows in Cursor.",
  },
  {
    id: "cursor-teams-premium",
    label: "Teams Premium",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for team-approved code in Cursor.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved code in Cursor.",
  },
] satisfies EverydayToolAccountOption[];

const gensparkAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "research",
    capabilityScores: researchScores,
    maxPermissionLevel: 1,
    note: "Useful for trying Genspark with public or low-stakes work.",
  },
  {
    id: "genspark-plus",
    label: "Plus",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 2,
    note: "Use when you have the regular paid Genspark membership.",
  },
  {
    id: "genspark-pro",
    label: "Pro",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for heavier Genspark workspace, agent, and content work.",
  },
  {
    id: "team",
    label: "Team",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work information your organization allows in Genspark Team.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved information in Genspark.",
  },
] satisfies EverydayToolAccountOption[];

const grokAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "small",
    capabilityScores: fastGeneralScores,
    maxPermissionLevel: 1,
    note: "Useful for trying Grok with low-stakes questions.",
  },
  {
    id: "supergrok",
    label: "SuperGrok",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when your Grok account has higher limits and frontier model access.",
  },
  {
    id: "x-premium-plus",
    label: "X Premium+",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when Grok access comes through your X Premium+ subscription.",
  },
  {
    id: "xai-api",
    label: "xAI API or business",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for business information approved for your xAI account.",
  },
] satisfies EverydayToolAccountOption[];

const metaAiAccountOptions = [
  {
    id: "meta-ai-free",
    label: "Free Meta AI",
    tier: "small",
    capabilityScores: fastGeneralScores,
    maxPermissionLevel: 1,
    note: "Use when you use Meta AI in the Meta AI app, Facebook, Instagram, WhatsApp, or Messenger.",
  },
] satisfies EverydayToolAccountOption[];

const poeAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "small",
    capabilityScores: fastGeneralScores,
    maxPermissionLevel: 1,
    note: "Useful for trying Poe with limited messages.",
  },
  {
    id: "poe-starter-points",
    label: "10k points/day",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for the smallest Poe subscription tier.",
  },
  {
    id: "poe-660k",
    label: "660k points/month",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for regular Poe multi-model access.",
  },
  {
    id: "poe-1m65",
    label: "1.65M points/month",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for heavier Poe model usage.",
  },
  {
    id: "poe-3m3",
    label: "3.3M points/month",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for heavy Poe usage across premium models.",
  },
  {
    id: "poe-8m25",
    label: "8.25M points/month",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for the largest published Poe subscription tier.",
  },
] satisfies EverydayToolAccountOption[];

const youComAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "research",
    capabilityScores: researchScores,
    maxPermissionLevel: 1,
    note: "Useful for public search and light AI-agent use.",
  },
  {
    id: "pro",
    label: "Pro",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 2,
    note: "Use for regular You.com agent and research work.",
  },
  {
    id: "team",
    label: "Team",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 3,
    note: "Use only for work research your team allows in You.com.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved You.com work.",
  },
  {
    id: "api-paygo",
    label: "API pay-as-you-go",
    tier: "research",
    capabilityScores: researchScores,
    maxPermissionLevel: 3,
    note: "Use when your You.com access is through API billing rather than the chat app.",
  },
] satisfies EverydayToolAccountOption[];

const notebookLmAccountOptions = [
  {
    id: "notebooklm-standard",
    label: "Standard",
    tier: "research",
    capabilityScores: researchScores,
    maxPermissionLevel: 1,
    note: "Use for the regular free NotebookLM experience.",
  },
  {
    id: "notebooklm-plus",
    label: "NotebookLM in Plus",
    tier: "research",
    capabilityScores: researchScores,
    maxPermissionLevel: 2,
    note: "Use when NotebookLM limits are upgraded through Google AI Plus.",
  },
  {
    id: "notebooklm-pro",
    label: "NotebookLM in Pro",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 2,
    note: "Use when NotebookLM limits are upgraded through Google AI Pro.",
  },
  {
    id: "notebooklm-ultra",
    label: "NotebookLM in Ultra",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 2,
    note: "Use when NotebookLM has the highest personal Google AI limits.",
  },
  {
    id: "notebooklm-workspace",
    label: "Workspace or school account",
    tier: "research",
    capabilityScores: strongResearchScores,
    maxPermissionLevel: 3,
    note: "Use only for work or school sources your organization allows in NotebookLM.",
  },
] satisfies EverydayToolAccountOption[];

const replitAccountOptions = [
  {
    id: "replit-starter",
    label: "Starter",
    tier: "mid",
    capabilityScores: codingScores,
    maxPermissionLevel: 1,
    note: "Useful for exploring Replit with limited agent credits.",
  },
  {
    id: "replit-core",
    label: "Core",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Use for personal projects, simple apps, and regular Replit Agent work.",
  },
  {
    id: "replit-pro",
    label: "Pro",
    tier: "frontier",
    capabilityScores: scores({
      reasoning: 5,
      writing: 3,
      coding: 5,
      research: 3,
      packaging: 4,
    }),
    maxPermissionLevel: 2,
    note: "Use for commercial or professional Replit builds.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved code and app work in Replit.",
  },
] satisfies EverydayToolAccountOption[];

const deepSeekAccountOptions = [
  {
    id: "deepseek-free",
    label: "Free app",
    tier: "small",
    capabilityScores: fastGeneralScores,
    maxPermissionLevel: 1,
    note: "Use when you use the free DeepSeek chat app.",
  },
  {
    id: "api-paygo",
    label: "API pay-as-you-go",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when you access DeepSeek through API billing.",
  },
  {
    id: "api-capacity",
    label: "API with higher capacity",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work approved for a higher-capacity DeepSeek API account.",
  },
] satisfies EverydayToolAccountOption[];

const qwenAccountOptions = [
  {
    id: "qwen-studio-free",
    label: "Qwen Studio free",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 1,
    note: "Use when you use the free Qwen Studio chat experience.",
  },
  {
    id: "qwen-code-oauth",
    label: "Qwen Code sign-in",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Use when Qwen Code sign-in gives you included model calls.",
  },
  {
    id: "api-paygo",
    label: "Model Studio pay-as-you-go",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when Qwen access is billed by Model Studio usage.",
  },
  {
    id: "qwen-coding-plan",
    label: "Coding Plan",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Use when Qwen access comes through the fixed monthly coding plan.",
  },
  {
    id: "qwen-token-plan-team",
    label: "Token Plan Team",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for team-approved work in Alibaba Cloud Model Studio.",
  },
] satisfies EverydayToolAccountOption[];

const kimiAccountOptions = [
  {
    id: "kimi-free",
    label: "Free Kimi app",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 1,
    note: "Use when you use the Kimi chat app directly.",
  },
  {
    id: "api-paygo",
    label: "Kimi API pay-as-you-go",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when Kimi access is billed by API usage.",
  },
  {
    id: "api-recharged",
    label: "Kimi API recharged account",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when your Kimi API account has prepaid balance or voucher access.",
  },
  {
    id: "enterprise",
    label: "Sales or enterprise account",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for organization-approved Kimi work.",
  },
] satisfies EverydayToolAccountOption[];

const doubaoAccountOptions = [
  {
    id: "doubao-free",
    label: "Free Doubao app",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 1,
    note: "Use when you use the Doubao app directly.",
  },
  {
    id: "volcengine-paygo",
    label: "Volcano Engine pay-as-you-go",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when Doubao model access is billed through Volcano Engine.",
  },
  {
    id: "ark-coding-plan",
    label: "Ark Coding Plan",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Use when Doubao access comes through an Ark coding subscription.",
  },
  {
    id: "ark-savings-plan",
    label: "Ark savings plan",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work approved for your Volcano Engine savings-plan account.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved Doubao or Seed model work.",
  },
] satisfies EverydayToolAccountOption[];

const minimaxAccountOptions = [
  {
    id: "minimax-free",
    label: "Free or trial",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 1,
    note: "Use when you are trying MiniMax without a paid token plan.",
  },
  {
    id: "minimax-token-plus",
    label: "Token Plan Plus",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for personal projects and prototyping with MiniMax Token Plan.",
  },
  {
    id: "minimax-token-max",
    label: "Token Plan Max",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for daily coding, agent, and multimodal work in MiniMax.",
  },
  {
    id: "minimax-token-ultra",
    label: "Token Plan Ultra",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for heavy MiniMax agent workflows and extended sessions.",
  },
  {
    id: "api-paygo",
    label: "API pay-as-you-go",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work approved for your MiniMax API account.",
  },
  {
    id: "team",
    label: "Token Plan Team",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for team-approved MiniMax work.",
  },
] satisfies EverydayToolAccountOption[];

const zhipuAccountOptions = [
  {
    id: "zai-free",
    label: "Free chat",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 1,
    note: "Use when you use Z.ai or GLM chat directly.",
  },
  {
    id: "api-paygo",
    label: "API pay-as-you-go",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when GLM access is billed by API usage.",
  },
  {
    id: "glm-coding-lite",
    label: "GLM Coding Lite",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Use for the entry GLM coding subscription.",
  },
  {
    id: "glm-coding-pro",
    label: "GLM Coding Pro",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Use for frequent GLM coding work.",
  },
  {
    id: "glm-coding-max",
    label: "GLM Coding Max",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 2,
    note: "Use for the heaviest GLM coding subscription.",
  },
  {
    id: "team",
    label: "GLM Coding Team",
    tier: "frontier",
    capabilityScores: codingScores,
    maxPermissionLevel: 3,
    note: "Use only for team-approved GLM coding work.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved Zhipu or GLM work.",
  },
] satisfies EverydayToolAccountOption[];

const hunyuanAccountOptions = [
  {
    id: "hunyuan-free",
    label: "Free app or trial quota",
    tier: "mid",
    capabilityScores: balancedGeneralScores,
    maxPermissionLevel: 1,
    note: "Use when you use Hunyuan directly or have a trial quota.",
  },
  {
    id: "tokenhub-paygo",
    label: "TokenHub pay-as-you-go",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use when Hunyuan access is billed through Tencent Cloud TokenHub.",
  },
  {
    id: "hunyuan-3d-credits",
    label: "Hunyuan 3D credits",
    tier: "artifact",
    capabilityScores: artifactScores,
    maxPermissionLevel: 2,
    note: "Use when Hunyuan is mainly for 3D generation credits.",
  },
  {
    id: "workbuddy-tokenhub",
    label: "WorkBuddy or TokenHub package",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work approved for Tencent Cloud AI packages.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved Hunyuan work.",
  },
] satisfies EverydayToolAccountOption[];

const mistralAccountOptions = [
  {
    id: "basic",
    label: "Free",
    tier: "small",
    capabilityScores: fastGeneralScores,
    maxPermissionLevel: 1,
    note: "Useful for quick Mistral Vibe or Le Chat use.",
  },
  {
    id: "pro",
    label: "Pro",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 2,
    note: "Use for higher Mistral chat, research, and coding limits.",
  },
  {
    id: "team",
    label: "Team",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for work your team allows in Mistral.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use only for enterprise-approved Mistral work.",
  },
  {
    id: "mistral-studio-api",
    label: "Studio or API pay-as-you-go",
    tier: "frontier",
    capabilityScores: strongGeneralScores,
    maxPermissionLevel: 3,
    note: "Use when Mistral access is through Studio or API billing.",
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
  provider({
    id: "genspark",
    label: "Genspark",
    summary: "Use this when Genspark helps you research, create files, or work across an AI workspace.",
    defaultAccountId: "genspark-plus",
    defaultFrequencyId: "weekly",
    accountOptions: gensparkAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "grok",
    label: "Grok",
    summary: "Use this if Grok is one of the AI apps you already know.",
    defaultAccountId: "supergrok",
    defaultFrequencyId: "daily",
    accountOptions: grokAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "meta-ai",
    label: "Meta AI",
    summary: "Use this if Meta AI is one of the AI apps you already know.",
    defaultAccountId: "meta-ai-free",
    defaultFrequencyId: "weekly",
    accountOptions: metaAiAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "poe",
    label: "Poe",
    summary: "Use this if Poe is where you access several AI models through one account.",
    defaultAccountId: "poe-660k",
    defaultFrequencyId: "weekly",
    accountOptions: poeAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "you-com",
    label: "You.com",
    summary: "Use this when You.com helps you check current facts, sources, agents, or research.",
    defaultAccountId: "pro",
    defaultFrequencyId: "weekly",
    accountOptions: youComAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "notebooklm",
    label: "NotebookLM",
    summary: "Use this when NotebookLM helps you work from uploaded or saved source material.",
    defaultAccountId: "notebooklm-standard",
    defaultFrequencyId: "weekly",
    accountOptions: notebookLmAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  canvaProvider(),
  githubCopilotProvider(),
  cursorProvider(),
  provider({
    id: "replit",
    label: "Replit AI",
    summary: "Use this when Replit helps you build apps, code, or work with agents.",
    defaultAccountId: "replit-core",
    defaultFrequencyId: "weekly",
    accountOptions: replitAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "deepseek",
    label: "DeepSeek",
    summary: "Use this if DeepSeek is one of the AI apps or APIs you already know.",
    defaultAccountId: "deepseek-free",
    defaultFrequencyId: "weekly",
    accountOptions: deepSeekAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "qwen",
    label: "Qwen",
    summary: "Use this if Qwen Studio, Qwen Code, or Alibaba Model Studio is part of your AI setup.",
    defaultAccountId: "qwen-studio-free",
    defaultFrequencyId: "weekly",
    accountOptions: qwenAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "kimi",
    label: "Kimi",
    summary: "Use this if Kimi or Moonshot AI is one of the AI tools you already know.",
    defaultAccountId: "kimi-free",
    defaultFrequencyId: "weekly",
    accountOptions: kimiAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "doubao",
    label: "Doubao",
    summary: "Use this if Doubao, ByteDance Seed, or Volcano Engine is part of your AI setup.",
    defaultAccountId: "doubao-free",
    defaultFrequencyId: "weekly",
    accountOptions: doubaoAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "minimax",
    label: "MiniMax",
    summary: "Use this if MiniMax, MiniMax Code, or MiniMax Token Plan is part of your AI setup.",
    defaultAccountId: "minimax-token-plus",
    defaultFrequencyId: "weekly",
    accountOptions: minimaxAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "zhipu",
    label: "Zhipu",
    summary: "Use this if Z.ai, Zhipu, or GLM is one of the AI tools you already know.",
    defaultAccountId: "zai-free",
    defaultFrequencyId: "weekly",
    accountOptions: zhipuAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "hunyuan",
    label: "Tencent Hunyuan",
    summary: "Use this if Tencent Hunyuan or Tencent Cloud TokenHub is part of your AI setup.",
    defaultAccountId: "hunyuan-free",
    defaultFrequencyId: "weekly",
    accountOptions: hunyuanAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
  provider({
    id: "mistral",
    label: "Mistral Le Chat",
    summary: "Use this if Mistral Vibe or Le Chat is one of the AI apps you already know.",
    defaultAccountId: "pro",
    defaultFrequencyId: "weekly",
    accountOptions: mistralAccountOptions,
    frequencyOptions: realFrequencyOptions,
  }),
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
    summary: "Use this if Claude, including Claude Code through a Claude subscription, is one of the AI tools you already know.",
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
    (option) =>
      model.label.startsWith(`${labelPrefix}${option.label} -`) ||
      model.label === option.label ||
      option.legacyLabels?.some((legacyLabel) => model.label.startsWith(`${labelPrefix}${legacyLabel} -`)),
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
