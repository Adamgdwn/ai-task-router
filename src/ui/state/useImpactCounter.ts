import { useCallback, useEffect, useState } from "react";
import {
  buildTrackedImpactSummary,
  emptyTrackedImpactSummary,
  type TrackedImpactSummary,
} from "../../domain/impact/impactCounter";
import type { LocalStore } from "../../storage/localStore";

export type ImpactCounterController = {
  summary: TrackedImpactSummary;
  status: "idle" | "loading" | "ready" | "error";
  message: string;
  refresh: () => Promise<void>;
};

export function useImpactCounter(store: LocalStore): ImpactCounterController {
  const [summary, setSummary] = useState<TrackedImpactSummary>(emptyTrackedImpactSummary);
  const [status, setStatus] = useState<ImpactCounterController["status"]>("idle");
  const [message, setMessage] = useState("Tracked impact has not been loaded yet.");

  const refresh = useCallback(async () => {
    setStatus("loading");
    setMessage("Refreshing followed-route impact from this browser.");

    try {
      const routeRecords = await store.loadRouteRecords();
      const nextSummary = buildTrackedImpactSummary(routeRecords);

      setSummary(nextSummary);
      setStatus("ready");
      setMessage(impactCounterMessage(nextSummary));
    } catch (error) {
      setSummary(emptyTrackedImpactSummary);
      setStatus("error");
      setMessage(impactCounterErrorMessage(error));
    }
  }, [store]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    summary,
    status,
    message,
    refresh,
  };
}

function impactCounterMessage(summary: TrackedImpactSummary) {
  const notCounted = Math.max(0, summary.savedPlanCount - summary.followedPlanCount);

  if (summary.followedPlanCount > 0) {
    const countedLabel =
      summary.followedPlanCount === 1
        ? "1 accepted or edited choice counted on this device."
        : `${summary.followedPlanCount} accepted or edited choices counted on this device.`;

    if (notCounted === 0) {
      return countedLabel;
    }

    const otherLabel =
      notCounted === 1
        ? "1 other saved choice is marked Deferred or Rejected and is not included."
        : `${notCounted} other saved choices are marked Deferred or Rejected and are not included.`;

    return `${countedLabel} ${otherLabel}`;
  }

  if (summary.savedPlanCount > 0) {
    return summary.savedPlanCount === 1
      ? '1 saved choice is marked Deferred or Rejected, so this stays at zero. Review Past Choices and update "What happened?" after you use a route.'
      : `${summary.savedPlanCount} saved choices are marked Deferred or Rejected, so this stays at zero. Review Past Choices and update "What happened?" after you use a route.`;
  }

  return "No choices counted yet. Accept and save a selected route to start this history.";
}

function impactCounterErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Tracked impact could not be loaded from this browser.";
}
