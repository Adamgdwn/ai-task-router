import type { PolicyDefault, RouteStep } from "../types";

export const defaultFinalApprovalRouteStep = {
  id: "final-human-approval",
  kind: "human review",
  label: "Final human approval",
  instruction: "Review the proposed route, prompt package, and any warnings before using the output.",
  requiredPermissionLevel: 4,
  sourceIds: [],
  warnings: ["Human approval is required before public, regulated, highly restricted, or high-impact use."],
} satisfies RouteStep;

export const defaultPolicies = [
  {
    id: "least-resource",
    label: "Least resource",
    strategy: "lean",
    description: "Prefer the smallest adequate route with low cost, low energy use, and human review for risky output.",
    scoringWeights: {
      cost: 0.3,
      energy: 0.25,
      quality: 0.15,
      speed: 0.15,
      sourceFit: 0.1,
      sensitivityFit: 0.2,
    },
    requiresCredentials: false,
    requiresExternalCall: false,
  },
  {
    id: "balanced",
    label: "Balanced",
    strategy: "balanced",
    description: "Balance quality, source fit, speed, and resource use for everyday work.",
    scoringWeights: {
      cost: 0.18,
      energy: 0.15,
      quality: 0.25,
      speed: 0.18,
      sourceFit: 0.24,
      sensitivityFit: 0.22,
    },
    requiresCredentials: false,
    requiresExternalCall: false,
  },
  {
    id: "quality-first",
    label: "Quality first",
    strategy: "premium",
    description: "Prefer stronger reasoning, source fit, and review when mistakes would be expensive.",
    scoringWeights: {
      cost: 0.08,
      energy: 0.08,
      quality: 0.35,
      speed: 0.12,
      sourceFit: 0.28,
      sensitivityFit: 0.28,
    },
    requiresCredentials: false,
    requiresExternalCall: false,
  },
] satisfies PolicyDefault[];
