import { defaultSources } from "../../domain/defaults/defaultSources";
import { buildTaskWorkPlan } from "../../domain/routing/taskWorkPlan";
import type { TaskIntake } from "../../domain/types";

const createdAt = "2026-07-27T21:51:31-06:00";

function buildTask(overrides: Partial<TaskIntake> = {}): TaskIntake {
  return {
    id: "task-work-plan",
    title: "Prepare useful work",
    description: "Create a useful result from this request.",
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

describe("task work planning", () => {
  it("turns a rough planning request into scope, plan synthesis, and a downstream action pass", () => {
    const task = buildTask({
      id: "task-rough-community-plan",
      title: "Plan a community open house",
      description:
        "Help me plan a community open house for local families this fall. I need something practical that I can use to get started.",
      knowledgeWorkType: "planning",
      outputType: "plan",
    });

    const plan = buildTaskWorkPlan(task);

    expect(plan.archetype).toBe("working-plan");
    expect(plan.stages.map((stage) => stage.workRole)).toEqual([
      "scope-framing",
      "plan-synthesis",
      "next-action",
    ]);
    expect(plan.stages[0]).toMatchObject({
      sourceNeed: "research-helpful",
      outputContract: expect.stringContaining("draft scope"),
    });
    expect(plan.stages[1]?.outputContract).toContain("dependencies");
    expect(plan.stages[1]?.outputContract).toContain("risks");
    expect(plan.stages[1]?.outputContract).toContain("measures");
    expect(plan.stages[2]?.outputContract).toContain("immediate action");
  });

  it("keeps a simple rewrite as one direct lightweight pass", () => {
    const plan = buildTaskWorkPlan(
      buildTask({
        id: "task-simple-rewrite",
        title: "Rewrite one paragraph",
        description: "Rewrite this paragraph in plain language.",
        qualityBar: "quick",
      }),
    );

    expect(plan.archetype).toBe("simple-output");
    expect(plan.stages.map((stage) => stage.workRole)).toEqual(["execution"]);
  });

  it("keeps evidence separate when research is the requested job", () => {
    const plan = buildTaskWorkPlan(
      buildTask({
        id: "task-research-answer",
        title: "Check the current permit requirements",
        description: "Research the current permit requirements and provide citations.",
        knowledgeWorkType: "research",
        outputType: "answer",
        requiresCurrentFacts: true,
        requiresCitations: true,
      }),
    );

    expect(plan.stages.map((stage) => stage.workRole)).toEqual([
      "evidence-check",
      "execution",
    ]);
    expect(plan.stages[0]?.sourceNeed).toBe("research-required");
  });

  it("plans software before build execution without inventing a prompt-only relay", () => {
    const plan = buildTaskWorkPlan(
      buildTask({
        id: "task-software-build",
        title: "Build a volunteer tracker",
        description:
          "Build a small volunteer tracker that imports a CSV, assigns volunteers to shifts, and shows gaps.",
        knowledgeWorkType: "coding",
        outputType: "code",
      }),
    );

    expect(plan.stages.map((stage) => stage.workRole)).toEqual([
      "scope-framing",
      "plan-synthesis",
      "build-slice",
      "quality-review",
    ]);
    expect(plan.stages.map((stage) => stage.workRole)).not.toContain("prompt-design");
  });

  it("uses prompt design only when a prompt is the output or an explicit handoff", () => {
    const plan = buildTaskWorkPlan(
      buildTask({
        id: "task-explicit-prompt-handoff",
        title: "Create a reusable planning prompt",
        description:
          "Create a master prompt for an event plan, then paste it into another model to produce the working plan.",
        knowledgeWorkType: "planning",
        outputType: "prompt package",
      }),
    );

    expect(plan.stages.map((stage) => stage.workRole)).toEqual(
      expect.arrayContaining(["scope-framing", "prompt-design", "execution"]),
    );
  });
});
