export type ScreenDefinition = {
  id: string;
  label: string;
  title: string;
  stage: string;
  summary: string;
};

export const screenDefinitions: ScreenDefinition[] = [
  {
    id: "welcome",
    label: "Start Here",
    title: "Start Here",
    stage: "Setup",
    summary: "Walk the aisles: choose your tools, pick how recommendations should choose, then describe the job.",
  },
  {
    id: "tool-inventory",
    label: "My AI Tools",
    title: "My AI Tools",
    stage: "Setup",
    summary: "Add the AI apps you recognize, then choose account level and how often you use each one.",
  },
  {
    id: "policy-settings",
    label: "How To Choose",
    title: "How To Choose",
    stage: "Setup",
    summary: "Tell the app whether to favor lower cost, everyday balance, or stronger quality when options compete.",
  },
  {
    id: "task-intake",
    label: "My Task",
    title: "My Task",
    stage: "Route Planning",
    summary: "Describe the job in normal language, answer a few quick questions, and optionally choose what to include.",
  },
  {
    id: "route-results",
    label: "Best Options",
    title: "Best Options",
    stage: "Recommendation",
    summary: "Compare the practical ways to get the job done before you paste anything into an AI tool.",
  },
  {
    id: "route-card",
    label: "Decision Card",
    title: "Decision Card",
    stage: "Recommendation",
    summary: "Keep a readable record of the option you chose and the checks that came with it.",
  },
  {
    id: "prompt-package",
    label: "Copy-Ready Prompts",
    title: "Copy-Ready Prompts",
    stage: "Execution Support",
    summary: "Review the prompts you can copy manually into the AI tool you choose.",
  },
  {
    id: "route-log",
    label: "Past Choices",
    title: "Past Choices",
    stage: "Local Record",
    summary: "Look back at saved decisions and note whether the recommendation helped.",
  },
  {
    id: "reference",
    label: "Help",
    title: "Help",
    stage: "Reference",
    summary: "Plain-language answers about what this app does, what the routes and numbers mean, and where your saved choices live.",
  },
];
