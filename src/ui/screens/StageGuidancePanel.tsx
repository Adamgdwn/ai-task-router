import type { ProjectStageGuidance } from "../../domain/types";

type StageGuidancePanelProps = {
  stages: readonly ProjectStageGuidance[];
  lead?: string;
};

export function StageGuidancePanel({
  stages,
  lead = "A beginner-friendly checklist with the recommended help beside each stage.",
}: StageGuidancePanelProps) {
  if (stages.length === 0) {
    return null;
  }

  return (
    <section className="routingSection stageGuidanceSection" aria-labelledby="stage-guidance-heading">
      <div className="sectionHeading">
        <h3 id="stage-guidance-heading">Quick project plan</h3>
        <p>{lead}</p>
      </div>
      <ol className="stageGuidanceList">
        {stages.map((stage, stageIndex) => (
          <li className={`stageGuidanceItem stage-${stage.stage}`} key={stage.id}>
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
              <details className="stageWorkItems" aria-label={`${stage.label} routing detail`}>
                <summary>Routing detail</summary>
                <ol>
                  {stage.workItems.map((item) => (
                    <li key={item.id}>
                      <div>
                        <span>{workRoleLabel(item.workRole)}</span>
                        <strong>{item.label}</strong>
                      </div>
                      <p>{item.expectedOutput}</p>
                      <dl>
                        <div>
                          <dt>Help</dt>
                          <dd>{item.recommendedModelLabel}</dd>
                        </div>
                        {item.modeLabel ? (
                          <div>
                            <dt>Mode</dt>
                            <dd>{item.modeLabel}</dd>
                          </div>
                        ) : null}
                        <div>
                          <dt>Estimate</dt>
                          <dd>{workItemEstimateLabel(item)}</dd>
                        </div>
                        <div>
                          <dt>Upgrade trigger</dt>
                          <dd>{item.upgradeTrigger}</dd>
                        </div>
                      </dl>
                      {item.selectionReasons.length ? (
                        <ul className="stageWorkItemReasons">
                          {item.selectionReasons.slice(0, 2).map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      ) : null}
                      {item.reviewChecks.length ? (
                        <ul className="stageWorkItemChecks">
                          {item.reviewChecks.slice(0, 2).map((check) => (
                            <li key={check}>{check}</li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function workRoleLabel(workRole: ProjectStageGuidance["workItems"][number]["workRole"]) {
  const labels: Record<ProjectStageGuidance["workItems"][number]["workRole"], string> = {
    "evidence-check": "Evidence",
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
  const cost = item.estimatedCostUsd === undefined ? null : formatUsd(item.estimatedCostUsd);
  const energy = item.estimatedEnergyWh === undefined ? null : `${formatNumber(item.estimatedEnergyWh)} Wh`;

  if (!cost && !energy) {
    return "No extra estimate";
  }

  if (cost && energy) {
    return `${cost}; ${energy}`;
  }

  return cost ?? energy ?? "No extra estimate";
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 10 ? 2 : 3,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 10 ? 1 : 3,
  }).format(value);
}
