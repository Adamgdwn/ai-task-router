import { defaultSources } from "../../domain/defaults/defaultSources";
import { decomposeTask, deliverablesForWorkRole } from "../../domain/routing/taskDecomposition";
import type { TaskIntake } from "../../domain/types";

const createdAt = "2026-07-06T23:24:00-06:00";

function buildTask(overrides: Partial<TaskIntake> = {}): TaskIntake {
  const sourcePermissions = overrides.sourcePermissions ?? defaultSources;

  return {
    id: "task-decomposition-001",
    title: "Prepare a decomposition fixture",
    description: "Create a practical plan from the user request.",
    dmaicPhase: "define",
    lifecycleStage: "draft",
    knowledgeWorkType: "planning",
    outputType: "plan",
    qualityBar: "standard",
    sensitivityClass: "public",
    requiresCurrentFacts: false,
    requiresCitations: false,
    publicFacing: false,
    costPreference: "balanced",
    energyPreference: "balanced",
    sourcePermissions,
    requestedSourceIds: sourcePermissions.map((source) => source.id),
    createdAt,
    ...overrides,
  };
}

function labelsFor(task: TaskIntake) {
  return decomposeTask(task).deliverables.map((deliverable) => deliverable.label);
}

describe("task decomposition", () => {
  it("keeps finance tracker prompt, build, data, tracking, insight, model, and privacy work visible", () => {
    const task = buildTask({
      id: "task-decomposition-finance-tracker",
      title: "Personal finance tracker",
      description:
        "Build a prompt that creates a tool to import monthly finances from a spreadsheet, categorize expenses, track month over month trends, show where I need to improve, show where I am doing well, recommend the best model, and protect private financial data.",
      requiresCurrentFacts: true,
    });
    const labels = labelsFor(task);
    const promptItems = deliverablesForWorkRole(task, "prompt-design");
    const buildItems = deliverablesForWorkRole(task, "build-slice");

    expect(labels).toEqual(
      expect.arrayContaining([
        "copy-ready master prompt",
        "first usable tool or app build",
        "spreadsheet import or paste-in data flow",
        "categorization rules",
        "month-over-month tracking",
        "improvement and strength insights",
        "model/tool choice for execution",
        "privacy check for sensitive data",
        "current facts and source notes",
      ]),
    );
    expect(decomposeTask(task).complexBuildPlan).toBe(true);
    expect(promptItems.length).toBeGreaterThanOrEqual(labels.length - 1);
    expect(buildItems.map((item) => item.label)).toEqual(
      expect.arrayContaining([
        "first usable tool or app build",
        "spreadsheet import or paste-in data flow",
        "categorization rules",
        "month-over-month tracking",
      ]),
    );
  });

  it("decomposes CRM dashboard builds without relying on finance-specific words", () => {
    const task = buildTask({
      id: "task-decomposition-crm-dashboard",
      title: "CRM dashboard build",
      description:
        "Create a dashboard app that imports lead data, tracks pipeline trends, recommends next actions, and packages the first build slice for review.",
      knowledgeWorkType: "coding",
      outputType: "code",
      qualityBar: "high",
    });
    const labels = labelsFor(task);

    expect(labels).toEqual(
      expect.arrayContaining([
        "first usable tool or app build",
        "spreadsheet import or paste-in data flow",
        "month-over-month tracking",
        "improvement and strength insights",
        "review and acceptance checks",
      ]),
    );
    expect(decomposeTask(task).complexBuildPlan).toBe(true);
  });

  it("maps research-heavy policy memos to evidence, writing, and review roles", () => {
    const task = buildTask({
      id: "task-decomposition-policy-memo",
      title: "Research-heavy policy memo",
      description: "Research current policy sources, include citations, summarize tradeoffs, and write a short memo.",
      knowledgeWorkType: "research",
      outputType: "brief",
      requiresCurrentFacts: true,
      requiresCitations: true,
    });

    expect(labelsFor(task)).toEqual(
      expect.arrayContaining(["current facts and source notes", "finished written output"]),
    );
    expect(deliverablesForWorkRole(task, "evidence-check").map((item) => item.label)).toContain(
      "current facts and source notes",
    );
    expect(deliverablesForWorkRole(task, "quality-review").map((item) => item.label)).toContain(
      "current facts and source notes",
    );
  });

  it("adds review work for public copy drafts", () => {
    const task = buildTask({
      id: "task-decomposition-public-copy",
      title: "Public launch copy",
      description: "Draft public-facing launch copy and check it before publication.",
      knowledgeWorkType: "writing",
      outputType: "draft",
      publicFacing: true,
    });

    expect(labelsFor(task)).toEqual(expect.arrayContaining(["finished written output", "review and acceptance checks"]));
    expect(deliverablesForWorkRole(task, "quality-review").map((item) => item.label)).toContain(
      "review and acceptance checks",
    );
  });

  it("keeps unmatched code review clauses as generic deliverables instead of dropping them", () => {
    const task = buildTask({
      id: "task-decomposition-code-review",
      title: "Code review and repo plan",
      description:
        "Review the repo; identify risky files; map the migration path; explain rollback steps; create a first safe pull request plan.",
      knowledgeWorkType: "review",
      outputType: "code",
      qualityBar: "high",
    });
    const decomposition = decomposeTask(task);

    expect(decomposition.deliverables.map((deliverable) => deliverable.kind)).toContain("review");
    expect(decomposition.deliverables.map((deliverable) => deliverable.label).some((label) => label.startsWith("address:"))).toBe(
      true,
    );
    expect(deliverablesForWorkRole(task, "quality-review").length).toBeGreaterThan(0);
  });
});
