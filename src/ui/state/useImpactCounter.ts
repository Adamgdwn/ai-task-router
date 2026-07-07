import { useCallback, useEffect, useState } from "react";
import {
  buildTrackedImpactSummary,
  emptyTrackedImpactSummary,
  type TrackedImpactSummary,
} from "../../domain/impact/impactCounter";
import { buildDefaultPublicImpactSnapshot } from "../../domain/impact/publicImpactSnapshot";
import type { LocalStore } from "../../storage/localStore";

export type ImpactCounterController = {
  summary: TrackedImpactSummary;
  status: "idle" | "loading" | "ready" | "error";
  message: string;
  refresh: () => Promise<void>;
};

const publicImpactSnapshot = buildDefaultPublicImpactSnapshot();

export function useImpactCounter(store: LocalStore): ImpactCounterController {
  const [summary, setSummary] = useState<TrackedImpactSummary>(emptyTrackedImpactSummary);
  const [status, setStatus] = useState<ImpactCounterController["status"]>("idle");
  const [message, setMessage] = useState("Tracked impact has not been loaded yet.");

  const refresh = useCallback(async () => {
    setStatus("loading");
    setMessage("Refreshing followed-route impact from this browser.");

    try {
      const routeRecords = await store.loadRouteRecords();
      const nextSummary = buildTrackedImpactSummary(routeRecords, publicImpactSnapshot);

      setSummary(nextSummary);
      setStatus("ready");
      setMessage(
        nextSummary.followedPlanCount > 0
          ? `${nextSummary.followedPlanCount} followed recommendation(s) counted on this device.`
          : "No followed recommendations have been counted yet.",
      );
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

function impactCounterErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Tracked impact could not be loaded from this browser.";
}
