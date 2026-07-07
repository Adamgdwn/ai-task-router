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
            <div>
              <span>Stage {stageIndex + 1}</span>
              {stage.methodLabel ? <strong className="methodPill">{stage.methodLabel}</strong> : null}
              <h4>{stage.label}</h4>
              <p>{stage.purpose}</p>
            </div>
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
            <dl>
              <div>
                <dt>Recommended help</dt>
                <dd>{stage.recommendedModelLabel}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}
