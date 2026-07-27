import type { EverydayToolAccountId } from "../defaults/everydayToolCatalog";

type ProviderGuidanceLabels = {
  minimumModelLabel: string;
  promptBuilderModelLabel: string;
  executionModelLabel: string;
  upgradeModelLabel: string;
};

export function chatGptGuidanceLabels(accountId: EverydayToolAccountId): ProviderGuidanceLabels {
  if (accountId === "pro" || accountId === "business" || accountId === "enterprise") {
    return {
      minimumModelLabel: "GPT-5.5 Instant for ordinary execution",
      promptBuilderModelLabel:
        "GPT-5.5 Pro Extended for the master prompt; Pro Standard only when conserving messages",
      executionModelLabel: "GPT-5.5 Instant after the master prompt is clear; GPT-5.5 Instant Mini only after limits",
      upgradeModelLabel: "GPT-5.5 Pro Extended or o3-pro legacy while it remains available in your picker",
    };
  }

  if (accountId === "plus") {
    return {
      minimumModelLabel: "GPT-5.5 Instant for ordinary execution",
      promptBuilderModelLabel: "the highest available GPT-5.5 Thinking level for the master prompt; usually Thinking High on Plus",
      executionModelLabel: "GPT-5.5 Instant after the master prompt is clear; GPT-5.5 Instant Mini only after limits",
      upgradeModelLabel: "GPT-5.5 Thinking High, then a Pro plan only if the review still fails",
    };
  }

  if (accountId === "go") {
    return {
      minimumModelLabel: "GPT-5.5 Instant for ordinary execution",
      promptBuilderModelLabel: "the highest Go Thinking level for the master prompt, usually GPT-5.5 Thinking Medium",
      executionModelLabel: "GPT-5.5 Instant after the master prompt is clear; GPT-5.5 Instant Mini only after limits",
      upgradeModelLabel: "GPT-5.5 Thinking Medium again, or Plus/Pro if the prompt still misses the job",
    };
  }

  return {
    minimumModelLabel: "GPT-5.5 Instant when available in the Free account",
    promptBuilderModelLabel: "the highest thinking level the free picker offers; keep the master prompt small",
    executionModelLabel: "GPT-5.5 Instant for execution; GPT-5.5 Instant Mini after free limits",
    upgradeModelLabel: "GPT-5.5 Thinking Medium or a paid tier when the first plan fails review",
  };
}

export function claudeGuidanceLabels(accountId: EverydayToolAccountId): ProviderGuidanceLabels {
  if (accountId === "max-5x" || accountId === "max-20x" || accountId === "team" || accountId === "enterprise") {
    return {
      minimumModelLabel: "Claude Sonnet 5 for most work",
      promptBuilderModelLabel: "Claude Opus 5 with effort high/xhigh for the master prompt",
      executionModelLabel: "Claude Sonnet 5 after the prompt is clear; Haiku 4.5 for tiny mechanical passes",
      upgradeModelLabel: "Claude Opus 5 effort xhigh for stuck, wide, or high-autonomy work",
    };
  }

  if (accountId === "pro") {
    return {
      minimumModelLabel: "Claude Sonnet 5 when available in Pro",
      promptBuilderModelLabel: "Claude Sonnet 5 for the master prompt; Opus only if your plan exposes it and review fails",
      executionModelLabel: "Claude Sonnet 5 after the prompt is clear; Haiku 4.5 for quick mechanical work when available",
      upgradeModelLabel: "Claude Opus 5 or a Max tier when the work is genuinely stuck or cross-cutting",
    };
  }

  return {
    minimumModelLabel: "Claude Haiku 4.5 or the fastest Claude model offered",
    promptBuilderModelLabel: "Claude Sonnet if offered; otherwise Haiku 4.5 with a clear upgrade trigger",
    executionModelLabel: "Claude Haiku 4.5 or the fastest Claude model after the prompt is clear",
    upgradeModelLabel: "Claude Sonnet 5, then Opus 5 only for hard review failures",
  };
}

export function geminiGuidanceLabels(accountId: EverydayToolAccountId): ProviderGuidanceLabels {
  if (accountId === "google-ai-pro" || accountId === "google-ai-ultra" || accountId === "team" || accountId === "enterprise") {
    return {
      minimumModelLabel: "Gemini 3 Flash on Fast for ordinary execution",
      promptBuilderModelLabel: "Gemini 3 Pro for the master prompt",
      executionModelLabel: "Gemini 3 Flash on Fast after the prompt is clear; Thinking only when a step needs reasoning",
      upgradeModelLabel: "Gemini 3 Pro at the Extended thinking level, or the top reasoning model your picker exposes",
    };
  }

  return {
    minimumModelLabel: "Gemini 3 Flash on Fast, or the fastest free Gemini model offered",
    promptBuilderModelLabel: "Gemini 3 Flash on Thinking for the master prompt, with a clear upgrade trigger",
    executionModelLabel: "Gemini 3 Flash on Fast after the prompt is clear",
    upgradeModelLabel: "Gemini 3 Pro when the review fails or the task becomes complex, if your account offers it",
  };
}

export function perplexityGuidanceLabels(accountId: EverydayToolAccountId): ProviderGuidanceLabels {
  if (accountId === "pro" || accountId === "max" || accountId === "enterprise-pro" || accountId === "enterprise-max") {
    return {
      minimumModelLabel: "Perplexity Sonar Pro for evidence checks",
      promptBuilderModelLabel:
        "Perplexity Sonar Pro or Sonar Reasoning Pro for source-backed framing, not final app execution",
      executionModelLabel: "Perplexity Sonar Pro only for evidence checks; use a general model to execute builds",
      upgradeModelLabel: "Perplexity Sonar Deep Research when the evidence base is broad or citation-heavy",
    };
  }

  return {
    minimumModelLabel: "Perplexity Sonar for evidence checks",
    promptBuilderModelLabel: "Perplexity Sonar for current-facts framing, not final app execution",
    executionModelLabel: "Perplexity Sonar only for evidence checks; use a general model to execute builds",
    upgradeModelLabel: "Perplexity Sonar Pro or Sonar Reasoning Pro when citations or current facts are thin",
  };
}

export function grokGuidanceLabels(accountId: EverydayToolAccountId): ProviderGuidanceLabels {
  if (accountId === "supergrok" || accountId === "x-premium-plus" || accountId === "xai-api") {
    return {
      minimumModelLabel: "Grok 4.3 with reasoning low or auto for ordinary execution",
      promptBuilderModelLabel: "Grok 4.3 with reasoning high for the master prompt",
      executionModelLabel: "Grok 4.3 with reasoning none/low after the prompt is clear",
      upgradeModelLabel: "Grok 4.5 for hard reasoning, or Grok Build 0.1 for code/build execution",
    };
  }

  return {
    minimumModelLabel: "Grok 4.3 when available in the Free account",
    promptBuilderModelLabel: "Grok 4.3 with the highest reasoning setting offered for the master prompt",
    executionModelLabel: "Grok 4.3 with reasoning none/low after the prompt is clear",
    upgradeModelLabel: "SuperGrok with Grok 4.5, or Grok Build 0.1 for code/build execution",
  };
}
