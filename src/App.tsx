import { useEffect, useMemo, useState } from "react";
import { createLocalStore, type LocalStore } from "./storage/localStore";
import { SavedPromptPackageScreen, SavedRouteCardScreen } from "./ui/screens/RouteArtifactScreens";
import { RouteLogScreen } from "./ui/screens/RouteLogScreen";
import {
  PlaceholderScreen,
  PolicySettingsScreen,
  StartHereScreen,
  ToolInventoryScreen,
} from "./ui/screens/SetupScreens";
import { RouteResultsScreen, TaskIntakeScreen } from "./ui/screens/TaskRoutingScreens";
import { screenDefinitions } from "./ui/screens/screenDefinitions";
import { useRouteArtifacts } from "./ui/state/useRouteArtifacts";
import { useImpactCounter } from "./ui/state/useImpactCounter";
import { useSetupConfiguration } from "./ui/state/useSetupConfiguration";
import { useTaskRouting } from "./ui/state/useTaskRouting";

const boundaryItems = [
  "Your browser only",
  "You choose what to include",
  "We recommend; you decide",
  "No hidden AI calls or telemetry",
];

const browserLocalStore = createLocalStore();
const guidedAiLabsLogo = "/brand/guided-ai-labs-logo-dark-safe.svg";

type AppProps = {
  store?: LocalStore;
};

export function App({ store = browserLocalStore }: AppProps) {
  const [activeScreenId, setActiveScreenId] = useState(screenDefinitions[0].id);
  const setup = useSetupConfiguration(store);
  const taskRouting = useTaskRouting({ setup, store });
  const routeArtifacts = useRouteArtifacts({ store });
  const impactCounter = useImpactCounter(store);
  const activeScreen = useMemo(
    () => screenDefinitions.find((screen) => screen.id === activeScreenId) ?? screenDefinitions[0],
    [activeScreenId],
  );

  useEffect(() => {
    if (activeScreenId === "route-card" || activeScreenId === "prompt-package") {
      void routeArtifacts.refresh();
    }
  }, [activeScreenId, routeArtifacts.refresh]);

  return (
    <main className="appShell">
      <aside className="sideRail" aria-label="AI Task Router sections">
        <div className="brandBlock">
          <img alt="Guided AI Labs" className="brandLogo" src={guidedAiLabsLogo} />
          <div className="brandMeta">
            <span className="brandName">Guided AI Labs</span>
            <span className="versionTag">v0.2 local MVP</span>
          </div>
          <h1>AI Task Router</h1>
          <p>A guided aisle map for choosing the right AI path before you paste anything anywhere.</p>
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

        {activeScreen.id === "welcome" ? (
          <StartHereScreen definition={activeScreen} onNavigate={setActiveScreenId} />
        ) : null}
        {activeScreen.id === "tool-inventory" ? (
          <ToolInventoryScreen
            definition={activeScreen}
            onNextStep={() => setActiveScreenId("policy-settings")}
            setup={setup}
          />
        ) : null}
        {activeScreen.id === "policy-settings" ? (
          <PolicySettingsScreen definition={activeScreen} setup={setup} />
        ) : null}
        {activeScreen.id === "task-intake" ? (
          <TaskIntakeScreen
            definition={activeScreen}
            onRouteGenerated={() => setActiveScreenId("route-results")}
            routing={taskRouting}
            setup={setup}
          />
        ) : null}
        {activeScreen.id === "route-results" ? (
          <RouteResultsScreen
            definition={activeScreen}
            impactCounter={impactCounter}
            onOpenTaskIntake={() => setActiveScreenId("task-intake")}
            routing={taskRouting}
            setup={setup}
          />
        ) : null}
        {activeScreen.id === "route-card" ? (
          <SavedRouteCardScreen
            artifacts={routeArtifacts}
            definition={activeScreen}
            impactCounter={impactCounter}
            onOpenTaskIntake={() => setActiveScreenId("task-intake")}
          />
        ) : null}
        {activeScreen.id === "prompt-package" ? (
          <SavedPromptPackageScreen
            artifacts={routeArtifacts}
            definition={activeScreen}
            onOpenTaskIntake={() => setActiveScreenId("task-intake")}
          />
        ) : null}
        {activeScreen.id === "route-log" ? (
          <RouteLogScreen
            definition={activeScreen}
            onImpactChanged={() => void impactCounter.refresh()}
            onOpenRouteCard={(routeCardId) => {
              routeArtifacts.selectRouteCard(routeCardId);
              setActiveScreenId("route-card");
            }}
            onOpenTaskIntake={() => setActiveScreenId("task-intake")}
            store={store}
          />
        ) : null}
        {![
          "welcome",
          "tool-inventory",
          "policy-settings",
          "task-intake",
          "route-results",
          "route-card",
          "prompt-package",
          "route-log",
        ].includes(activeScreen.id) ? (
          <PlaceholderScreen definition={activeScreen} />
        ) : null}
      </section>
    </main>
  );
}
