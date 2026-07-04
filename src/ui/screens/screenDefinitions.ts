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
    label: "Start Here",
    title: "Start Here",
    stage: "Setup",
    summary: "Walk the aisles: choose your tools, choose what information feels okay, then describe the job.",
    purpose: "Give everyday users a natural path into the router before any recommendations are made.",
    placeholderState: "The guided path now opens each useful aisle directly.",
  },
  {
    id: "tool-inventory",
    label: "My AI Tools",
    title: "My AI Tools",
    stage: "Setup",
    summary: "Add the AI apps you recognize, then choose account level and how often you use each one.",
    purpose: "Prepare an editable local tool list without connecting accounts, calling providers, or storing credentials.",
    placeholderState: "The screen adds one app row at a time and keeps account level plus frequency up front.",
  },
  {
    id: "source-permissions",
    label: "What To Include",
    title: "What To Include",
    stage: "Setup",
    summary: "Choose the sites, drives, folders, documents, and personal context you want included.",
    purpose: "Keep privacy choices explicit without asking users to understand internal permission levels.",
    placeholderState: "The screen presents include/not-include selections first and keeps routing details tucked away.",
  },
  {
    id: "policy-settings",
    label: "Choosing Style",
    title: "Choosing Style",
    stage: "Setup",
    summary: "Pick how the app should make tradeoffs when more than one answer is possible.",
    purpose: "Translate routing policy into everyday choices about speed, cost, quality, and caution.",
    placeholderState: "Future policy presets will stay plain-language first and weight-based only in advanced details.",
  },
  {
    id: "task-intake",
    label: "My Task",
    title: "My Task",
    stage: "Route Planning",
    summary: "Describe the job in normal language, answer a few quick questions, and choose what to include.",
    purpose: "Create a clear local task record before any options are generated.",
    placeholderState: "The page now derives the local record from the user description instead of asking for internal IDs.",
  },
  {
    id: "route-results",
    label: "Best Options",
    title: "Best Options",
    stage: "Recommendation",
    summary: "Compare the practical ways to get the job done before you paste anything into an AI tool.",
    purpose: "Explain why each option fits, what tradeoffs shaped it, and where human review is needed.",
    placeholderState: "Future results will keep plain names on top of hard gates, candidate generation, and scoring.",
  },
  {
    id: "route-card",
    label: "Decision Card",
    title: "Decision Card",
    stage: "Recommendation",
    summary: "Keep a readable record of the option you chose and the checks that came with it.",
    purpose: "Give the user a durable decision artifact without executing anything.",
    placeholderState: "Future route cards will be exportable as Markdown and JSON.",
  },
  {
    id: "prompt-package",
    label: "Copy-Ready Prompts",
    title: "Copy-Ready Prompts",
    stage: "Execution Support",
    summary: "Review the prompts you can copy manually into the AI tool you choose.",
    purpose: "Support human-led execution while keeping the router out of external systems.",
    placeholderState: "Future prompt steps will include inputs, constraints, review points, and stop criteria.",
  },
  {
    id: "route-log",
    label: "Past Choices",
    title: "Past Choices",
    stage: "Local Record",
    summary: "Look back at saved decisions and note whether the recommendation helped.",
    purpose: "Preserve local decisions and lightweight feedback without sending notes anywhere.",
    placeholderState: "Past Choices now use browser-local saved records and quick feedback.",
  },
  {
    id: "reference",
    label: "Help",
    title: "Help",
    stage: "Reference",
    summary: "Plain-language explanations for the privacy, quality, and recommendation choices.",
    purpose: "Keep product language visible to users and future builders.",
    placeholderState: "Future reference pages will mirror the product brief and version-gate diagrams.",
  },
];
