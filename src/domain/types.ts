import type { z } from "zod";
import type {
  blockedRouteSchema,
  capabilityScoresSchema,
  modelInventoryItemSchema,
  permissionLevelSchema,
  promptPackageSchema,
  promptStepSchema,
  routeCardSchema,
  routeLogEntrySchema,
  routeOptionSchema,
  routeStepSchema,
  sensitivityClassSchema,
  sourcePermissionSchema,
  taskIntakeSchema,
} from "./schemas";

export type PermissionLevel = z.infer<typeof permissionLevelSchema>;
export type SensitivityClass = z.infer<typeof sensitivityClassSchema>;
export type CapabilityScores = z.infer<typeof capabilityScoresSchema>;
export type ModelInventoryItem = z.infer<typeof modelInventoryItemSchema>;
export type SourcePermission = z.infer<typeof sourcePermissionSchema>;
export type TaskIntake = z.infer<typeof taskIntakeSchema>;
export type RouteStep = z.infer<typeof routeStepSchema>;
export type RouteOption = z.infer<typeof routeOptionSchema>;
export type PromptStep = z.infer<typeof promptStepSchema>;
export type PromptPackage = z.infer<typeof promptPackageSchema>;
export type BlockedRoute = z.infer<typeof blockedRouteSchema>;
export type RouteCard = z.infer<typeof routeCardSchema>;
export type RouteLogEntry = z.infer<typeof routeLogEntrySchema>;
