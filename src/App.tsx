import { useMemo, useState } from "react";
import { createLocalStore, type LocalStore } from "./storage/localStore";
import {
  PlaceholderScreen,
  PolicySettingsScreen,
  SourcePermissionsScreen,
  ToolInventoryScreen,
} from "./ui/screens/SetupScreens";
import { screenDefinitions } from "./ui/screens/screenDefinitions";
import { useSetupConfiguration } from "./ui/state/useSetupConfiguration";

const boundaryItems = [
  "Recommends routes only",
  "No external AI API calls",
  "No connectors or execution mode",
  "No credentials or hidden telemetry",
];

const browserLocalStore = createLocalStore();

type AppProps = {
  store?: LocalStore;
};

export function App({ store = browserLocalStore }: AppProps) {
  const [activeScreenId, setActiveScreenId] = useState(screenDefinitions[0].id);
  const setup = useSetupConfiguration(store);
  const activeScreen = useMemo(
    () => screenDefinitions.find((screen) => screen.id === activeScreenId) ?? screenDefinitions[0],
    [activeScreenId],
  );

  return (
    <main className="appShell">
      <aside className="sideRail" aria-label="AI Task Router sections">
        <div className="brandBlock">
          <span className="versionTag">v0.2 local MVP</span>
          <h1>AI Task Router</h1>
          <p>Local-first route planning before any model, tool, or source is used.</p>
        </div>

        <nav className="screenTabs" aria-label="AI Task Router screens">
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

        {activeScreen.id === "tool-inventory" ? (
          <ToolInventoryScreen definition={activeScreen} setup={setup} />
        ) : null}
        {activeScreen.id === "source-permissions" ? (
          <SourcePermissionsScreen definition={activeScreen} setup={setup} />
        ) : null}
        {activeScreen.id === "policy-settings" ? (
          <PolicySettingsScreen definition={activeScreen} setup={setup} />
        ) : null}
        {!["tool-inventory", "source-permissions", "policy-settings"].includes(activeScreen.id) ? (
          <PlaceholderScreen definition={activeScreen} />
        ) : null}
      </section>
    </main>
  );
}
