export type ScreenDefinition = {
  id: string;
  label: string;
  title: string;
  stage: string;
  summary: string;
  purpose: string;
  placeholderState: string;
};

export const screenDefinitions: ScreenDefinition[] = [
  {
    id: "welcome",
    label: "Welcome",
    title: "Welcome",
    stage: "Setup",
    summary: "Confirm the router's local-first boundary before any recommendations are made.",
    purpose: "Set expectations that the app recommends routes and prompt packages without acting on them.",
    placeholderState: "Future setup checklist will live here after domain schemas and defaults exist.",
  },
  {
    id: "tool-inventory",
    label: "Tool Inventory",
    title: "Tool Inventory",
    stage: "Setup",
    summary: "Show which AI tools, models, and manual review paths are available for routing.",
    purpose: "Prepare an editable local registry without connecting to providers or storing credentials.",
    placeholderState: "Future inventory rows will show local capability metadata and enabled status.",
  },
  {
    id: "source-permissions",
    label: "Source Permissions",
    title: "Source Permissions",
    stage: "Setup",
    summary: "Define which source classes may be considered for a task recommendation.",
    purpose: "Keep source access explicit, least-privilege, and separate from any live connector behavior.",
    placeholderState: "Future controls will map sources to permission levels 0 through 4.",
  },
  {
    id: "policy-settings",
    label: "Policy Settings",
    title: "Policy Settings",
    stage: "Setup",
    summary: "Choose privacy, cost, quality, energy, and review preferences for recommendations.",
    purpose: "Provide the policy inputs that later routing logic will use for hard gates and scoring.",
    placeholderState: "Future policy presets will include least-resource, balanced, and quality-first modes.",
  },
  {
    id: "task-intake",
    label: "Task Intake",
    title: "Task Intake",
    stage: "Route Planning",
    summary: "Capture the task, sensitivity, allowed sources, quality need, and desired output.",
    purpose: "Create a clear local task record before any route candidates are generated.",
    placeholderState: "Future form fields will validate task scope and source permissions before routing.",
  },
  {
    id: "route-results",
    label: "Route Results",
    title: "Route Results",
    stage: "Recommendation",
    summary: "Compare lean, balanced, and premium route options side by side.",
    purpose: "Explain why each route fits, which constraints shaped it, and where human review is needed.",
    placeholderState: "Future results will be generated from hard gates, candidate generation, and scoring.",
  },
  {
    id: "route-card",
    label: "Route Card",
    title: "Route Card",
    stage: "Recommendation",
    summary: "Summarize the selected route, assumptions, source permissions, and review steps.",
    purpose: "Give the user a durable decision artifact without executing the route.",
    placeholderState: "Future route cards will be exportable as Markdown and JSON.",
  },
  {
    id: "prompt-package",
    label: "Prompt Package",
    title: "Prompt Package",
    stage: "Execution Support",
    summary: "Generate a step-by-step prompt package the user can run manually in chosen tools.",
    purpose: "Support human-led execution while keeping the router out of external systems.",
    placeholderState: "Future prompt steps will include inputs, constraints, review points, and stop criteria.",
  },
  {
    id: "route-log",
    label: "Route Log",
    title: "Route Log",
    stage: "Local Record",
    summary: "Track local route decisions, feedback, and exported artifacts.",
    purpose: "Preserve decisions locally so policy and recommendations can improve over time.",
    placeholderState: "Future logs will use IndexedDB and export Markdown, JSON, and CSV.",
  },
  {
    id: "reference",
    label: "Reference",
    title: "Reference",
    stage: "Reference",
    summary: "Explain route concepts, permission levels, sensitivity classes, and version gates.",
    purpose: "Keep product language visible to users and future builders.",
    placeholderState: "Future reference pages will mirror the product brief and version-gate diagrams.",
  },
];
