import type { z } from "zod";
import type {
  blockedRouteSchema,
  capabilityScoresSchema,
  modelInventoryItemSchema,
  permissionLevelSchema,
  policyDefaultSchema,
  promptPackageSchema,
  promptStepSchema,
  routeCardSchema,
  routeLogEntrySchema,
  routeOptionSchema,
  routeStepSchema,
  scoringWeightsSchema,
  sensitivityClassSchema,
  sourcePermissionSchema,
  taskTemplateSchema,
  taskIntakeSchema,
} from "./schemas";

export type PermissionLevel = z.infer<typeof permissionLevelSchema>;
export type SensitivityClass = z.infer<typeof sensitivityClassSchema>;
export type CapabilityScores = z.infer<typeof capabilityScoresSchema>;
export type ModelInventoryItem = z.infer<typeof modelInventoryItemSchema>;
export type SourcePermission = z.infer<typeof sourcePermissionSchema>;
export type ScoringWeights = z.infer<typeof scoringWeightsSchema>;
export type PolicyDefault = z.infer<typeof policyDefaultSchema>;
export type TaskTemplate = z.infer<typeof taskTemplateSchema>;
export type TaskIntake = z.infer<typeof taskIntakeSchema>;
export type RouteStep = z.infer<typeof routeStepSchema>;
export type RouteOption = z.infer<typeof routeOptionSchema>;
export type PromptStep = z.infer<typeof promptStepSchema>;
export type PromptPackage = z.infer<typeof promptPackageSchema>;
export type BlockedRoute = z.infer<typeof blockedRouteSchema>;
export type RouteCard = z.infer<typeof routeCardSchema>;
export type RouteLogEntry = z.infer<typeof routeLogEntrySchema>;
