import { useCallback, useState } from "react";
import { z } from "zod";
import { defaultTaskTemplates } from "../../domain/defaults/defaultTaskTemplates";
import { generatePromptPackage } from "../../domain/prompting/promptPackageGenerator";
import { generateRouteCandidates, type RouteCandidateGenerationResult } from "../../domain/routing/candidateGeneration";
import { evaluateHardGates, type HardGateResult } from "../../domain/routing/hardGates";
import {
  buildManualReviewFallbackRouteOption,
  generateRouteCard,
} from "../../domain/routing/routeCardGenerator";
import { scoreRouteCandidates, type RouteScoringResult } from "../../domain/routing/scoring";
import { taskIntakeSchema } from "../../domain/schemas";
import type {
  PromptPackage,
  RouteCard,
  RouteLogEntry,
  RouteOption,
  SensitivityClass,
  TaskIntake,
  TaskTemplate,
} from "../../domain/types";
import type { LocalStore } from "../../storage/localStore";
import type { SetupConfigurationController } from "./useSetupConfiguration";

export type TaskRoutingDraft = {
  templateId: TaskTemplate["id"] | "custom";
  id: string;
  title: string;
  description: string;
  dmaicPhase: TaskIntake["dmaicPhase"];
  lifecycleStage: TaskIntake["lifecycleStage"];
  knowledgeWorkType: TaskIntake["knowledgeWorkType"];
  outputType: TaskIntake["outputType"];
  qualityBar: TaskIntake["qualityBar"];
  sensitivityClass: SensitivityClass;
  requiresCurrentFacts: boolean;
  requiresCitations: boolean;
  publicFacing: boolean;
  costPreference: TaskIntake["costPreference"];
  energyPreference: TaskIntake["energyPreference"];
  requestedSourceIds: string[];
};

export type TaskRoutingErrorField =
  | keyof TaskRoutingDraft
  | "sourcePermissions"
  | "createdAt"
  | "form";

export type TaskRoutingValidationErrors = Partial<Record<TaskRoutingErrorField, string[]>>;

export type GeneratedRouteResult = {
  task: TaskIntake;
  hardGateResult: HardGateResult;
  candidateResult: RouteCandidateGenerationResult;
  scoringResult: RouteScoringResult;
  selectedRoute: RouteOption;
  promptPackage: PromptPackage;
  routeCard: RouteCard;
  generatedAt: string;
  noSafeGeneratedRoute: boolean;
};

export type TaskRoutingStatus = "idle" | "invalid" | "success" | "error";
export type GeneratedRouteSaveStatus = "idle" | "saving" | "saved" | "error";

export type TaskRoutingController = {
  draft: TaskRoutingDraft;
  templates: readonly TaskTemplate[];
  routeResult: GeneratedRouteResult | null;
  validationErrors: TaskRoutingValidationErrors;
  routingStatus: TaskRoutingStatus;
  routingMessage: string;
  saveStatus: GeneratedRouteSaveStatus;
  saveMessage: string;
  canRoute: boolean;
  updateDraftField: <Key extends keyof TaskRoutingDraft>(field: Key, value: TaskRoutingDraft[Key]) => void;
  applyTemplate: (templateId: TaskTemplate["id"] | "custom") => void;
  toggleRequestedSource: (sourceId: string) => void;
  generateRoute: () => Promise<boolean>;
  saveGeneratedRoute: () => Promise<boolean>;
};

type UseTaskRoutingInput = {
  setup: SetupConfigurationController;
  store: LocalStore;
};

type BuildTaskResult =
  | {
      ok: true;
      task: TaskIntake;
      createdAt: string;
    }
  | {
      ok: false;
      errors: TaskRoutingValidationErrors;
      message: string;
    };

const initialDraft: TaskRoutingDraft = {
  templateId: "custom",
  id: "",
  title: "",
  description: "",
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
  requestedSourceIds: [],
};

const fieldLabels: Partial<Record<TaskRoutingErrorField, string>> = {
  id: "Saved plan ID",
  title: "Short name",
  description: "What you need help with",
  dmaicPhase: "Work stage",
  lifecycleStage: "Stage",
  knowledgeWorkType: "Kind of work",
  outputType: "Finished format",
  qualityBar: "Quality need",
  sensitivityClass: "Privacy level",
  requestedSourceIds: "Information ingredients",
  form: "Task details",
};

export function useTaskRouting({ setup, store }: UseTaskRoutingInput): TaskRoutingController {
  const [draft, setDraft] = useState<TaskRoutingDraft>(initialDraft);
  const [routeResult, setRouteResult] = useState<GeneratedRouteResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<TaskRoutingValidationErrors>({});
  const [routingStatus, setRoutingStatus] = useState<TaskRoutingStatus>("idle");
  const [routingMessage, setRoutingMessage] = useState("No options have been prepared yet.");
  const [saveStatus, setSaveStatus] = useState<GeneratedRouteSaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("The decision card and prompts are not saved yet.");

  const resetGeneratedRoute = useCallback((nextDraft: TaskRoutingDraft) => {
    setValidationErrors({});
    setRouteResult(null);
    setRoutingStatus("idle");
    setRoutingMessage("Task details changed. Ask for options again to refresh results.");
    setSaveStatus("idle");
    setSaveMessage("The decision card and prompts are not saved yet.");

    return nextDraft;
  }, []);

  const updateDraftField = useCallback(
    <Key extends keyof TaskRoutingDraft>(field: Key, value: TaskRoutingDraft[Key]) => {
      setDraft((currentDraft) =>
        resetGeneratedRoute({
          ...currentDraft,
          templateId: field === "templateId" ? (value as TaskRoutingDraft["templateId"]) : currentDraft.templateId,
          [field]: value,
        }),
      );
    },
    [resetGeneratedRoute],
  );

  const applyTemplate = useCallback(
    (templateId: TaskTemplate["id"] | "custom") => {
      if (templateId === "custom") {
        updateDraftField("templateId", "custom");
        return;
      }

      const template = defaultTaskTemplates.find((candidateTemplate) => candidateTemplate.id === templateId);
      if (!template) {
        return;
      }

      const availableSourceIds = new Set(
        setup.configuration?.sourcePermissionRegistry.map((sourcePermission) => sourcePermission.id) ?? [],
      );

      setDraft((currentDraft) =>
        resetGeneratedRoute({
          ...currentDraft,
          templateId,
          title: template.label,
          description: template.description,
          dmaicPhase: template.dmaicPhase,
          lifecycleStage: template.lifecycleStage,
          knowledgeWorkType: template.knowledgeWorkType,
          outputType: template.outputType,
          qualityBar: template.qualityBar,
          sensitivityClass: template.defaultSensitivityClass,
          requiresCurrentFacts: template.requiresCurrentFacts,
          requiresCitations: template.requiresCitations,
          publicFacing: template.publicFacing,
          costPreference: template.costPreference,
          energyPreference: template.energyPreference,
          requestedSourceIds: template.suggestedSourceIds.filter((sourceId) => availableSourceIds.has(sourceId)),
        }),
      );
    },
    [resetGeneratedRoute, setup.configuration, updateDraftField],
  );

  const toggleRequestedSource = useCallback(
    (sourceId: string) => {
      setDraft((currentDraft) => {
        const sourceIdSet = new Set(currentDraft.requestedSourceIds);
        if (sourceIdSet.has(sourceId)) {
          sourceIdSet.delete(sourceId);
        } else {
          sourceIdSet.add(sourceId);
        }

        return resetGeneratedRoute({
          ...currentDraft,
          requestedSourceIds: [...sourceIdSet],
        });
      });
    },
    [resetGeneratedRoute],
  );

  const generateRoute = useCallback(async () => {
    const taskResult = buildTaskFromDraft(draft, setup);

    if (!taskResult.ok) {
      setValidationErrors(taskResult.errors);
      setRouteResult(null);
      setRoutingStatus("invalid");
      setRoutingMessage(taskResult.message);
      setSaveStatus("idle");
      setSaveMessage("The decision card and prompts are not saved yet.");
      return false;
    }

    try {
      const task = taskResult.task;
      const configuration = setup.configuration;
      const activePolicy = setup.activePolicy;

      if (!configuration || !activePolicy) {
        throw new Error("Your saved choices are not available for recommendations.");
      }

      const hardGateResult = evaluateHardGates({
        task,
        models: configuration.modelInventory,
      });
      const candidateResult = generateRouteCandidates({
        task,
        models: configuration.modelInventory,
        policies: configuration.policySettings,
        hardGateResult,
      });
      const scoringResult = scoreRouteCandidates({
        task,
        candidateResult,
        models: configuration.modelInventory,
        policy: activePolicy,
      });
      const selectedRoute =
        scoringResult.recommendedCandidate ?? buildManualReviewFallbackRouteOption(task, hardGateResult);
      const promptPackage = generatePromptPackage({
        task,
        selectedRoute,
        hardGateResult,
      });
      const routeCard = generateRouteCard({
        task,
        hardGateResult,
        scoringResult,
        promptPackage,
        createdAt: taskResult.createdAt,
      });

      setValidationErrors({});
      setRouteResult({
        task,
        hardGateResult,
        candidateResult,
        scoringResult,
        selectedRoute,
        promptPackage,
        routeCard,
        generatedAt: taskResult.createdAt,
        noSafeGeneratedRoute: scoringResult.recommendedCandidate === null,
      });
      setRoutingStatus("success");
      setRoutingMessage("Your options are ready.");
      setSaveStatus("idle");
      setSaveMessage("The decision card and prompts are not saved yet.");

      return true;
    } catch (error) {
      setValidationErrors({ form: [routingErrorMessage(error)] });
      setRouteResult(null);
      setRoutingStatus("error");
      setRoutingMessage("Your options could not be prepared.");
      setSaveStatus("idle");
      setSaveMessage("The decision card and prompts are not saved yet.");

      return false;
    }
  }, [draft, setup]);

  const saveGeneratedRoute = useCallback(async () => {
    if (!routeResult) {
      setSaveStatus("error");
      setSaveMessage("Prepare options before saving a decision card.");
      return false;
    }

    setSaveStatus("saving");
    setSaveMessage("Saving the decision card and prompts on this device.");

    try {
      await store.saveRouteCard(routeResult.routeCard);
      await store.saveRouteLogEntry(buildRouteLogEntry(routeResult));
      setSaveStatus("saved");
      setSaveMessage("Decision card, prompts, and Past Choices record saved on this device.");
      return true;
    } catch (error) {
      setSaveStatus("error");
      setSaveMessage(routingErrorMessage(error));
      return false;
    }
  }, [routeResult, store]);

  return {
    draft,
    templates: defaultTaskTemplates,
    routeResult,
    validationErrors,
    routingStatus,
    routingMessage,
    saveStatus,
    saveMessage,
    canRoute: setup.status !== "loading" && setup.status !== "saving",
    updateDraftField,
    applyTemplate,
    toggleRequestedSource,
    generateRoute,
    saveGeneratedRoute,
  };
}

function buildRouteLogEntry(routeResult: GeneratedRouteResult): RouteLogEntry {
  const selectedRoute =
    routeResult.routeCard.options.find((option) => option.id === routeResult.routeCard.recommendedOptionId) ??
    routeResult.selectedRoute;

  return {
    id: `route-log-${routeResult.task.id}`,
    taskId: routeResult.task.id,
    routeCardId: routeResult.routeCard.id,
    selectedOptionId: selectedRoute.id,
    selectedStrategy: selectedRoute.strategy,
    outcome: "deferred",
    createdAt: routeResult.generatedAt,
  };
}

function buildTaskFromDraft(draft: TaskRoutingDraft, setup: SetupConfigurationController): BuildTaskResult {
  if (!setup.configuration) {
    return {
      ok: false,
      errors: {
        form: ["Your choices must finish loading before options can be prepared."],
      },
      message: "Your choices are not ready.",
    };
  }

  if (!setup.activePolicy) {
    return {
      ok: false,
      errors: {
        form: ["Choose an available deciding style before preparing options."],
      },
      message: "Deciding style is not ready.",
    };
  }

  if (!draft.description.trim()) {
    return {
      ok: false,
      errors: {
        description: ["Describe what you are trying to do."],
      },
      message: "The task needs a short description before options can be prepared.",
    };
  }

  const createdAt = new Date().toISOString();
  const title = titleFromDraft(draft);
  const id = idFromDraft(draft, title, createdAt);
  const result = taskIntakeSchema.safeParse({
    id,
    title,
    description: draft.description,
    dmaicPhase: draft.dmaicPhase,
    lifecycleStage: draft.lifecycleStage,
    knowledgeWorkType: draft.knowledgeWorkType,
    outputType: draft.outputType,
    qualityBar: draft.qualityBar,
    sensitivityClass: draft.sensitivityClass,
    requiresCurrentFacts: draft.requiresCurrentFacts,
    requiresCitations: draft.requiresCitations,
    publicFacing: draft.publicFacing,
    costPreference: draft.costPreference,
    energyPreference: draft.energyPreference,
    sourcePermissions: setup.configuration.sourcePermissionRegistry,
    requestedSourceIds: draft.requestedSourceIds,
    createdAt,
  });

  if (!result.success) {
    return {
      ok: false,
      errors: validationErrorsFromIssues(result.error.issues),
      message: "Task details need correction before options can be prepared.",
    };
  }

  return {
    ok: true,
    task: result.data,
    createdAt,
  };
}

function validationErrorsFromIssues(issues: z.ZodIssue[]): TaskRoutingValidationErrors {
  const errors: TaskRoutingValidationErrors = {};

  for (const issue of issues) {
    const field = fieldForIssue(issue);
    const messages = errors[field] ?? [];
    messages.push(friendlyValidationMessage(field, issue));
    errors[field] = messages;
  }

  return errors;
}

function fieldForIssue(issue: z.ZodIssue): TaskRoutingErrorField {
  const [field] = issue.path;

  if (typeof field === "string" && isTaskRoutingField(field)) {
    return field;
  }

  return "form";
}

function isTaskRoutingField(field: string): field is TaskRoutingErrorField {
  return (
    field === "templateId" ||
    field === "id" ||
    field === "title" ||
    field === "description" ||
    field === "dmaicPhase" ||
    field === "lifecycleStage" ||
    field === "knowledgeWorkType" ||
    field === "outputType" ||
    field === "qualityBar" ||
    field === "sensitivityClass" ||
    field === "requiresCurrentFacts" ||
    field === "requiresCitations" ||
    field === "publicFacing" ||
    field === "costPreference" ||
    field === "energyPreference" ||
    field === "requestedSourceIds" ||
    field === "sourcePermissions" ||
    field === "createdAt" ||
    field === "form"
  );
}

function friendlyValidationMessage(field: TaskRoutingErrorField, issue: z.ZodIssue) {
  if (issue.code === "too_small" && (field === "id" || field === "title" || field === "description")) {
    return `${fieldLabels[field]} is required.`;
  }

  if (field === "requestedSourceIds") {
    return issue.message.replace("sourcePermissions", "information choices");
  }

  return issue.message;
}

function titleFromDraft(draft: TaskRoutingDraft) {
  const explicitTitle = draft.title.trim();

  if (explicitTitle) {
    return explicitTitle;
  }

  return firstReadableLine(draft.description);
}

function idFromDraft(draft: TaskRoutingDraft, title: string, createdAt: string) {
  const explicitId = draft.id.trim();

  if (explicitId) {
    return explicitId;
  }

  const slug = slugify(title) || "task";
  const timestamp = createdAt.replace(/[^0-9]/g, "").slice(0, 14);

  return `${slug}-${timestamp}`;
}

function firstReadableLine(value: string) {
  const firstLine = value
    .trim()
    .split(/\r?\n/)
    .find((line) => line.trim());

  if (!firstLine) {
    return "";
  }

  const compactLine = firstLine.replace(/\s+/g, " ").trim();

  return compactLine.length > 88 ? `${compactLine.slice(0, 85).trim()}...` : compactLine;
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.slice(0, 56).replace(/-+$/g, "");
}

function routingErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Your options could not be prepared or saved. Refresh your choices and try again.";
}
