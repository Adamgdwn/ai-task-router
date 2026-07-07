import {
  everydayToolProviders,
  inferEverydayToolSelection,
  type EverydayToolAccountOption,
  type EverydayToolProvider,
} from "../defaults/everydayToolCatalog";
import type { ModelInventoryItem, RouteOption, TaskIntake } from "../types";

export type SuggestedToolkitItem = {
  id: string;
  label: string;
  category: "close-enough" | "paid-upgrade";
  providerLabel: string;
  accountLabel: string;
  role: string;
  capabilityScore: number;
  alreadySelected: boolean;
  localOnly: boolean;
  reason: string;
  savingsAngle: string;
};

export type SuggestedToolkit = {
  starters: SuggestedToolkitItem[];
  paidUpgrades: SuggestedToolkitItem[];
  summary: string;
};

type ToolkitCandidate = SuggestedToolkitItem & {
  providerId: string;
  tier: ModelInventoryItem["tier"];
  rank: number;
};

type BuildSuggestedToolkitInput = {
  task: TaskIntake;
  models: readonly ModelInventoryItem[];
  recommended: RouteOption | undefined;
};

const starterCount = 3;
const paidUpgradeCount = 2;

export function buildSuggestedToolkit({
  task,
  models,
  recommended,
}: BuildSuggestedToolkitInput): SuggestedToolkit {
  const selectedProviderIds = selectedEverydayProviderIds(models);
  const prefersHighestTier = recommended?.estimatedCostLevel === "high" || task.qualityBar === "critical";
  const candidates = everydayToolProviders
    .filter((provider) => provider.id !== "none" && provider.id !== "other")
    .flatMap((provider) => toolkitCandidatesForProvider(provider, task, selectedProviderIds, prefersHighestTier));
  const starters = uniqueProviderCandidates(candidates.filter(isStarterCandidate))
    .sort((left, right) => toolkitCandidateSort(right, left))
    .slice(0, starterCount);
  const paidUpgrades = uniqueProviderCandidates(
    candidates.filter(isPaidUpgradeCandidate),
  )
    .sort((left, right) => toolkitCandidateSort(right, left))
    .slice(0, paidUpgradeCount);

  return {
    starters,
    paidUpgrades,
    summary: toolkitSummary(task, recommended, starters, paidUpgrades),
  };
}

function toolkitCandidatesForProvider(
  provider: EverydayToolProvider,
  task: TaskIntake,
  selectedProviderIds: Set<string>,
  prefersHighestTier: boolean,
): ToolkitCandidate[] {
  return provider.accountOptions
    .filter((accountOption) => !isWorkAdminOnlyAccount(accountOption))
    .map((accountOption) => {
      const capabilityScore = taskCapabilityScore(task, accountOption);
      const localOnly = accountOption.localOnly ?? provider.id === "local";
      const paid = isPaidAccount(accountOption, localOnly);
      const rank =
        capabilityScore +
        roleFitBonus(provider, accountOption, task) +
        providerPracticalityBonus(provider) +
        defaultAccountBonus(provider, accountOption) +
        starterPracticalityBonus(accountOption, localOnly) +
        paidPracticalityBonus(accountOption, paid, prefersHighestTier);

      return {
        id: `${provider.id}-${accountOption.id}`,
        label: `${provider.label} ${accountOption.label}`,
        category: paid ? "paid-upgrade" : "close-enough",
        providerId: provider.id,
        providerLabel: provider.label,
        accountLabel: accountOption.label,
        tier: accountOption.tier,
        role: toolkitRole(provider, accountOption, task),
        capabilityScore,
        rank,
        alreadySelected: selectedProviderIds.has(provider.id),
        localOnly,
        reason: toolkitReason(provider, accountOption, task),
        savingsAngle: toolkitSavingsAngle(accountOption, localOnly, paid),
      };
    });
}

function defaultAccountBonus(provider: EverydayToolProvider, accountOption: EverydayToolAccountOption) {
  return accountOption.id === provider.defaultAccountId ? 0.08 : 0;
}

function providerPracticalityBonus(provider: EverydayToolProvider) {
  if (["chatgpt", "claude", "gemini", "copilot", "perplexity", "local"].includes(provider.id)) {
    return 0.8;
  }

  if (["github-copilot", "cursor", "canva", "notebooklm"].includes(provider.id)) {
    return 0.45;
  }

  return -0.55;
}

function starterPracticalityBonus(accountOption: EverydayToolAccountOption, localOnly: boolean) {
  if (localOnly && accountOption.tier === "mid") {
    return 0.55;
  }

  if (localOnly && accountOption.tier === "frontier") {
    return -0.75;
  }

  if (accountOption.tier === "small") {
    return 0.35;
  }

  return 0;
}

function paidPracticalityBonus(
  accountOption: EverydayToolAccountOption,
  paid: boolean,
  prefersHighestTier: boolean,
) {
  if (!paid) {
    return 0;
  }

  if (accountOption.tier === "mid") {
    return prefersHighestTier ? 0.2 : 0.75;
  }

  if (accountOption.tier === "frontier") {
    return prefersHighestTier ? 0.7 : -0.35;
  }

  return 0;
}

function selectedEverydayProviderIds(models: readonly ModelInventoryItem[]) {
  return new Set(
    models
      .filter((model) => model.enabled && model.tier !== "human")
      .map((model) => inferEverydayToolSelection(model).providerId)
      .filter((providerId) => providerId !== "none"),
  );
}

function isStarterCandidate(candidate: ToolkitCandidate) {
  return candidate.localOnly || candidate.tier === "small" || candidate.category === "close-enough";
}

function isPaidUpgradeCandidate(candidate: ToolkitCandidate) {
  return candidate.category === "paid-upgrade" && !candidate.localOnly;
}

function uniqueProviderCandidates(candidates: ToolkitCandidate[]) {
  const bestByProvider = new Map<string, ToolkitCandidate>();

  for (const candidate of candidates) {
    const previousCandidate = bestByProvider.get(candidate.providerId);

    if (!previousCandidate || toolkitCandidateSort(candidate, previousCandidate) > 0) {
      bestByProvider.set(candidate.providerId, candidate);
    }
  }

  return [...bestByProvider.values()];
}

function toolkitCandidateSort(left: ToolkitCandidate, right: ToolkitCandidate) {
  return (
    Number(left.alreadySelected) - Number(right.alreadySelected) ||
    left.rank - right.rank ||
    left.capabilityScore - right.capabilityScore ||
    right.label.localeCompare(left.label)
  );
}

function taskCapabilityScore(task: TaskIntake, accountOption: EverydayToolAccountOption) {
  const capabilityKeys = capabilityKeysForTask(task);
  const total = capabilityKeys.reduce((sum, key) => sum + accountOption.capabilityScores[key], 0);

  return Number((total / capabilityKeys.length).toFixed(1));
}

function capabilityKeysForTask(task: TaskIntake): Array<keyof EverydayToolAccountOption["capabilityScores"]> {
  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return ["coding", "reasoning"];
  }

  if (task.knowledgeWorkType === "research" || task.requiresCurrentFacts || task.requiresCitations) {
    return ["research", "reasoning"];
  }

  if (task.knowledgeWorkType === "packaging" || task.outputType === "table" || task.outputType === "slide outline") {
    return ["packaging", "writing"];
  }

  if (task.knowledgeWorkType === "analysis" || task.knowledgeWorkType === "planning") {
    return ["reasoning", "writing"];
  }

  return ["writing", "reasoning"];
}

function roleFitBonus(provider: EverydayToolProvider, accountOption: EverydayToolAccountOption, task: TaskIntake) {
  if ((task.requiresCurrentFacts || task.requiresCitations || task.knowledgeWorkType === "research") && accountOption.capabilityScores.research >= 5) {
    return 0.8;
  }

  if ((task.outputType === "table" || task.outputType === "slide outline" || task.knowledgeWorkType === "packaging") && accountOption.capabilityScores.packaging >= 5) {
    return 0.8;
  }

  if ((task.outputType === "code" || task.knowledgeWorkType === "coding") && accountOption.capabilityScores.coding >= 5) {
    return 0.8;
  }

  if (provider.id === "chatgpt" || provider.id === "claude" || provider.id === "gemini") {
    return 0.25;
  }

  return 0;
}

function isPaidAccount(accountOption: EverydayToolAccountOption, localOnly: boolean) {
  if (localOnly) {
    return false;
  }

  if (accountOption.tier === "small") {
    return false;
  }

  return !/\bfree\b|\bbasic\b/i.test(accountOption.label);
}

function isWorkAdminOnlyAccount(accountOption: EverydayToolAccountOption) {
  return /enterprise|business|team|api|savings/i.test(accountOption.label);
}

function toolkitRole(
  provider: EverydayToolProvider,
  accountOption: EverydayToolAccountOption,
  task: TaskIntake,
) {
  if (accountOption.localOnly || provider.id === "local") {
    return "Private/local fallback";
  }

  if (task.requiresCurrentFacts || task.requiresCitations || task.knowledgeWorkType === "research") {
    return accountOption.capabilityScores.research >= 5 ? "Current-facts checker" : "General drafting helper";
  }

  if (task.outputType === "code" || task.knowledgeWorkType === "coding") {
    return accountOption.capabilityScores.coding >= 5 ? "Code helper" : "Planning helper";
  }

  if (task.outputType === "table" || task.outputType === "slide outline" || task.knowledgeWorkType === "packaging") {
    return accountOption.capabilityScores.packaging >= 5 ? "Packaging helper" : "General drafting helper";
  }

  return "General planning helper";
}

function toolkitReason(
  provider: EverydayToolProvider,
  accountOption: EverydayToolAccountOption,
  task: TaskIntake,
) {
  if (accountOption.localOnly || provider.id === "local") {
    return "Keeps private work on a local or private setup when that matters more than maximum polish.";
  }

  if (task.requiresCurrentFacts || task.requiresCitations) {
    return accountOption.capabilityScores.research >= 5
      ? "Fits tasks that need current facts, source checking, or citations."
      : "Can draft or organize the work after the facts are checked.";
  }

  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return "Good for turning rough goals into ordered steps, assumptions, and next actions.";
  }

  return accountOption.note;
}

function toolkitSavingsAngle(accountOption: EverydayToolAccountOption, localOnly: boolean, paid: boolean) {
  if (localOnly) {
    return "Potentially saves provider spend and protects sensitive context, with more setup effort.";
  }

  if (!paid) {
    return "Use as a close-enough starter before paying for heavier help.";
  }

  if (accountOption.tier === "frontier") {
    return "Reserve for quality, risk, or rework savings when simpler tools are not enough.";
  }

  return "Use when modest paid capacity saves time compared with repeated free-tool attempts.";
}

function toolkitSummary(
  task: TaskIntake,
  recommended: RouteOption | undefined,
  starters: readonly SuggestedToolkitItem[],
  paidUpgrades: readonly SuggestedToolkitItem[],
) {
  const routeLabel = recommended?.label ?? "the safest available route";
  const starterText =
    starters.length > 0
      ? `${starters.length} close-enough starter choices`
      : "close-enough starter choices";
  const upgradeText =
    paidUpgrades.length > 0
      ? `${paidUpgrades.length} paid upgrade choices`
      : "paid upgrades only if the task deserves them";

  if (task.requiresCurrentFacts || task.requiresCitations) {
    return `For ${routeLabel}, build around ${starterText} plus ${upgradeText}, with at least one source-checking helper before drafting.`;
  }

  return `For ${routeLabel}, start with ${starterText} that can get near the needed quality, then keep ${upgradeText} for risk, polish, or repeated work.`;
}
