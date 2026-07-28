import { formatUsd, formatWattHours } from "../../domain/format";
import type { ProjectStageGuidance } from "../../domain/types";

type StageGuidancePanelProps = {
  stages: readonly ProjectStageGuidance[];
  lead?: string;
};

export function StageGuidancePanel({
  stages,
  lead = "The work path, recommended help, expected output, and review gate for this task.",
}: StageGuidancePanelProps) {
  if (stages.length === 0) {
    return null;
  }

  return (
    <section className="routingSection stageGuidanceSection" aria-labelledby="stage-guidance-heading">
      <div className="sectionHeading">
        <h3 id="stage-guidance-heading">Recommended work path</h3>
        <p>{lead}</p>
      </div>
      <ol className="stageGuidanceList">
        {stages.map((stage, stageIndex) => (
          <StageGuidanceItem key={stage.id} stage={stage} stageIndex={stageIndex} />
        ))}
      </ol>
    </section>
  );
}

function StageGuidanceItem({
  stage,
  stageIndex,
}: {
  stage: ProjectStageGuidance;
  stageIndex: number;
}) {
  const primaryWorkItem = primaryStageWorkItem(stage);
  const selectionReason = primaryWorkItem?.selectionReasons[0];
  const routingDecision = primaryWorkItem ? stageDecisionLabel(primaryWorkItem) : null;

  return (
    <li className={`stageGuidanceItem stage-${stage.stage}`}>
      <div className="stageOverview">
        <span>Stage {stageIndex + 1}</span>
        {stage.methodLabel ? <strong className="methodPill">{stage.methodLabel}</strong> : null}
        <h4>{stage.label}</h4>
        <p>{stage.purpose}</p>
        <dl className="stageRecommended">
          <div>
            <dt>Recommended help</dt>
            <dd>{stage.recommendedModelLabel}</dd>
          </div>
        </dl>
        {routingDecision ? <p className="stageDecision">{routingDecision}</p> : null}
        {primaryWorkItem ? (
          <dl className="stageChoiceSummary">
            {primaryWorkItem.modeLabel ? (
              <div>
                <dt>Mode</dt>
                <dd>{primaryWorkItem.modeLabel}</dd>
              </div>
            ) : null}
            {selectionReason ? (
              <div>
                <dt>Why this help</dt>
                <dd>{selectionReason}</dd>
              </div>
            ) : null}
            {primaryWorkItem.upgradeTrigger ? (
              <div>
                <dt>Upgrade trigger</dt>
                <dd>{primaryWorkItem.upgradeTrigger}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
      <div className="stageActionGrid">
        {stage.actions.length ? (
          <div className="stageDetailBlock">
            <strong>Do this</strong>
            <ul>
              {stage.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {stage.reviewChecks.length ? (
          <div className="stageDetailBlock">
            <strong>Check</strong>
            <ul>
              {stage.reviewChecks.map((reviewCheck) => (
                <li key={reviewCheck}>{reviewCheck}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      {stage.workItems.length ? (
        <section className="stageWorkItems" aria-label={`${stage.label} path`}>
          <h5>Path for this stage</h5>
          <ol>
            {stage.workItems.map((item) => {
              const usesPrimaryRoute =
                primaryWorkItem?.recommendedModelLabel === item.recommendedModelLabel &&
                primaryWorkItem?.modeLabel === item.modeLabel &&
                primaryWorkItem?.selectionReasons[0] === item.selectionReasons[0] &&
                primaryWorkItem?.upgradeTrigger === item.upgradeTrigger;

              return (
                <li key={item.id}>
                  <div>
                    <span>{workRoleLabel(item.workRole)}</span>
                    <strong>{item.label}</strong>
                  </div>
                  <p>{item.expectedOutput}</p>
                  <dl>
                    <div>
                      <dt>Action</dt>
                      <dd>
                        {usesPrimaryRoute
                          ? `${item.label} using the recommended help above.`
                          : stageDecisionLabel(item)}
                      </dd>
                    </div>
                    {!usesPrimaryRoute ? (
                      <div>
                        <dt>Help</dt>
                        <dd>{item.recommendedModelLabel}</dd>
                      </div>
                    ) : null}
                    {!usesPrimaryRoute && item.modeLabel ? (
                      <div>
                        <dt>Mode</dt>
                        <dd>{item.modeLabel}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt>If metered</dt>
                      <dd>{workItemEstimateLabel(item)}</dd>
                    </div>
                    {!usesPrimaryRoute && item.selectionReasons[0] ? (
                      <div>
                        <dt>Why</dt>
                        <dd>{item.selectionReasons[0]}</dd>
                      </div>
                    ) : null}
                    {item.reviewChecks[0] ? (
                      <div>
                        <dt>Check</dt>
                        <dd>{item.reviewChecks[0]}</dd>
                      </div>
                    ) : null}
                    {!usesPrimaryRoute ? (
                      <div>
                        <dt>Upgrade trigger</dt>
                        <dd>{item.upgradeTrigger}</dd>
                      </div>
                    ) : null}
                  </dl>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </li>
  );
}

function primaryStageWorkItem(stage: ProjectStageGuidance) {
  return stage.workItems.find((item) => item.recommendedModelLabel === stage.recommendedModelLabel) ?? stage.workItems[0];
}

function stageDecisionLabel(item: ProjectStageGuidance["workItems"][number]) {
  return `Use ${item.recommendedModelLabel} to ${lowercaseFirst(item.label)}.`;
}

function lowercaseFirst(value: string) {
  return value.length ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
}

function workRoleLabel(workRole: ProjectStageGuidance["workItems"][number]["workRole"]) {
  const labels: Record<ProjectStageGuidance["workItems"][number]["workRole"], string> = {
    "scope-framing": "Scope",
    "evidence-check": "Evidence",
    "plan-synthesis": "Plan",
    "prompt-design": "Prompt",
    execution: "Use helper",
    "build-slice": "Build",
    "artifact-package": "Package",
    "quality-review": "Review",
    "next-action": "Act",
  };

  return labels[workRole];
}

function workItemEstimateLabel(item: ProjectStageGuidance["workItems"][number]) {
  const cost = item.estimatedCostUsd === undefined ? null : `about ${formatUsd(item.estimatedCostUsd)}`;
  const energy = item.estimatedEnergyWh === undefined ? null : formatWattHours(item.estimatedEnergyWh);

  if (!cost && !energy) {
    return "No estimate";
  }

  if (cost && energy) {
    return `${cost}; ${energy}`;
  }

  return cost ?? energy ?? "No estimate";
}
