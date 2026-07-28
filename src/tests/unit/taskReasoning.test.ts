import { defaultSources } from "../../domain/defaults/defaultSources";
import {
  analyzeTaskReasoning,
  capabilityTargetForRole,
} from "../../domain/routing/taskReasoning";
import type { TaskIntake } from "../../domain/types";

const createdAt = "2026-07-27T20:00:00-06:00";

function buildTask(overrides: Partial<TaskIntake> = {}): TaskIntake {
  return {
    id: "task-reasoning-profile",
    title: "Assess a task",
    description: "Write a useful result.",
    dmaicPhase: "not applicable",
    lifecycleStage: "draft",
    knowledgeWorkType: "writing",
    outputType: "draft",
    qualityBar: "standard",
    sensitivityClass: "public",
    requiresCurrentFacts: false,
    requiresCitations: false,
    publicFacing: false,
    costPreference: "balanced",
    energyPreference: "balanced",
    sourcePermissions: defaultSources,
    requestedSourceIds: [],
    createdAt,
    ...overrides,
  };
}

describe("task reasoning assessment", () => {
  it("treats a short rewrite as one light direct-output job", () => {
    const task = buildTask({
      id: "task-light-rewrite",
      title: "Rewrite one paragraph",
      description: "Rewrite this paragraph in plain language.",
      qualityBar: "quick",
    });

    const profile = analyzeTaskReasoning(task);

    expect(profile).toMatchObject({
      demand: "light",
      primaryWorkRole: "execution",
      requiresEvidence: false,
      promptArtifactRequested: false,
      benefitsFromPromptHandoff: false,
      benefitsFromIndependentReview: false,
      benefitsFromSpecialistPackaging: false,
    });
  });

  it("recognizes a multi-part plan as moderate reasoning without inventing a prompt handoff", () => {
    const task = buildTask({
      id: "task-moderate-plan",
      title: "Plan a community open house",
      description:
        "Create a practical plan for a community open house with responsibilities, dependencies, risks, review points, and the first action.",
      knowledgeWorkType: "planning",
      outputType: "plan",
    });

    const profile = analyzeTaskReasoning(task);

    expect(profile).toMatchObject({
      demand: "moderate",
      archetype: "working-plan",
      primaryWorkRole: "plan-synthesis",
      requiresEvidence: false,
      needsScopeFraming: true,
      needsPlanSynthesis: true,
      needsDownstreamActionPass: true,
      promptArtifactRequested: false,
      benefitsFromPromptHandoff: false,
      benefitsFromIndependentReview: false,
    });
    expect(profile.assessmentReasons).toEqual(
      expect.arrayContaining([
        "It combines 8 distinct requested parts.",
        "The route must turn the rough request into a usable scope instead of asking the user to finish the brief.",
        "Dependencies or ordering have to be reasoned through.",
      ]),
    );
    expect(capabilityTargetForRole(task, profile, "plan-synthesis", "balanced")).toBe(4);
  });

  it("requires an evidence stage only when the task needs current or cited information", () => {
    const task = buildTask({
      id: "task-current-answer",
      title: "Check the current permit requirements",
      description: "Give me the current permit requirements with citations.",
      knowledgeWorkType: "research",
      outputType: "answer",
      requiresCurrentFacts: true,
      requiresCitations: true,
      requestedSourceIds: ["web"],
    });

    const profile = analyzeTaskReasoning(task);

    expect(profile.requiresEvidence).toBe(true);
    expect(profile.assessmentReasons.join(" ")).toContain("Current facts, citations");
  });

  it("recognizes a complex build as a specialist handoff and review problem", () => {
    const task = buildTask({
      id: "task-heavy-build",
      title: "Build a client operations dashboard",
      description:
        "Build a dashboard that imports CSV files, categorizes records, tracks changes over time, recommends next actions, and verifies the first usable code slice.",
      knowledgeWorkType: "coding",
      outputType: "code",
      qualityBar: "high",
    });

    const profile = analyzeTaskReasoning(task);

    expect(profile).toMatchObject({
      demand: "heavy",
      archetype: "software-build",
      primaryWorkRole: "build-slice",
      needsScopeFraming: true,
      needsPlanSynthesis: true,
      benefitsFromPromptHandoff: false,
      benefitsFromIndependentReview: true,
    });
    expect(capabilityTargetForRole(task, profile, "build-slice", "balanced")).toBeGreaterThan(4.4);
  });
});
