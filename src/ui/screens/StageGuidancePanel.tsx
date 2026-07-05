import type { ProjectStageGuidance } from "../../domain/types";

type StageGuidancePanelProps = {
  stages: readonly ProjectStageGuidance[];
  lead?: string;
};

export function StageGuidancePanel({
  stages,
  lead = "A rough path only, with the recommended help beside each stage.",
}: StageGuidancePanelProps) {
  if (stages.length === 0) {
    return null;
  }

  return (
    <section className="routingSection stageGuidanceSection" aria-labelledby="stage-guidance-heading">
      <div className="sectionHeading">
        <h3 id="stage-guidance-heading">Suggested stages</h3>
        <p>{lead}</p>
      </div>
      <ol className="stageGuidanceList">
        {stages.map((stage, stageIndex) => (
          <li key={stage.id}>
            <div>
              <span>Stage {stageIndex + 1}</span>
              <h4>{stage.label}</h4>
              <p>{stage.purpose}</p>
            </div>
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
