import { useMemo, useState } from "react";
import { screenDefinitions } from "./ui/screens/screenDefinitions";

const boundaryItems = [
  "Recommends routes only",
  "No external AI API calls",
  "No connectors or execution mode",
  "No credentials or hidden telemetry",
];

export function App() {
  const [activeScreenId, setActiveScreenId] = useState(screenDefinitions[0].id);
  const activeScreen = useMemo(
    () => screenDefinitions.find((screen) => screen.id === activeScreenId) ?? screenDefinitions[0],
    [activeScreenId],
  );

  return (
    <main className="appShell">
      <aside className="sideRail" aria-label="AI Task Router sections">
        <div className="brandBlock">
          <span className="versionTag">v0.2 skeleton</span>
          <h1>AI Task Router</h1>
          <p>Local-first route planning before any model, tool, or source is used.</p>
        </div>

        <nav className="screenTabs" aria-label="Placeholder screens">
          {screenDefinitions.map((screen) => (
            <button
              aria-current={screen.id === activeScreen.id ? "page" : undefined}
              className="screenTab"
              key={screen.id}
              onClick={() => setActiveScreenId(screen.id)}
              type="button"
            >
              <span>{screen.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace" aria-labelledby="screen-title">
        <div className="boundaryStrip" aria-label="Product boundary">
          {boundaryItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <article className="screenPanel">
          <p className="screenKicker">{activeScreen.stage}</p>
          <h2 id="screen-title">{activeScreen.title}</h2>
          <p className="screenSummary">{activeScreen.summary}</p>

          <div className="detailGrid">
            <section aria-labelledby="screen-purpose">
              <h3 id="screen-purpose">Purpose</h3>
              <p>{activeScreen.purpose}</p>
            </section>

            <section aria-labelledby="screen-placeholder-state">
              <h3 id="screen-placeholder-state">Placeholder State</h3>
              <p>{activeScreen.placeholderState}</p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
