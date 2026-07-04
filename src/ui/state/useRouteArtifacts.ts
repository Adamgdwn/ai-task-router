import { useCallback, useMemo, useState } from "react";
import type { PromptPackage, RouteCard } from "../../domain/types";
import type { LocalRouteRecords, LocalStore } from "../../storage/localStore";

export type RouteArtifactsStatus = "idle" | "loading" | "ready" | "empty" | "error";
export type RouteArtifactCopyStatus = "idle" | "copying" | "copied" | "unavailable" | "error";

export type RouteArtifactsController = {
  status: RouteArtifactsStatus;
  statusMessage: string;
  copyStatus: RouteArtifactCopyStatus;
  copyMessage: string;
  routeRecords: LocalRouteRecords | null;
  routeCards: RouteCard[];
  selectedRouteCardId: string;
  selectedRouteCard: RouteCard | null;
  selectedPromptPackage: PromptPackage | null;
  selectedRouteCardMissing: boolean;
  refresh: () => Promise<void>;
  selectRouteCard: (routeCardId: string) => void;
  copyText: (text: string, label: string) => Promise<boolean>;
};

type UseRouteArtifactsInput = {
  store: LocalStore;
};

const emptyRouteRecords: LocalRouteRecords = {
  routeCards: [],
  promptPackages: [],
  routeLogEntries: [],
};

export function useRouteArtifacts({ store }: UseRouteArtifactsInput): RouteArtifactsController {
  const [status, setStatus] = useState<RouteArtifactsStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("Saved plans have not been loaded yet.");
  const [copyStatus, setCopyStatus] = useState<RouteArtifactCopyStatus>("idle");
  const [copyMessage, setCopyMessage] = useState("Nothing has been copied in this session.");
  const [routeRecords, setRouteRecords] = useState<LocalRouteRecords | null>(null);
  const [selectedRouteCardId, setSelectedRouteCardId] = useState("");

  const routeCards = routeRecords?.routeCards ?? emptyRouteRecords.routeCards;
  const selectedRouteCard = useMemo(
    () => routeCards.find((routeCard) => routeCard.id === selectedRouteCardId) ?? null,
    [routeCards, selectedRouteCardId],
  );
  const selectedPromptPackage = useMemo(() => {
    if (!selectedRouteCard) {
      return null;
    }

    return (
      routeRecords?.promptPackages.find((promptPackage) => promptPackage.id === selectedRouteCard.promptPackage.id) ??
      selectedRouteCard.promptPackage
    );
  }, [routeRecords, selectedRouteCard]);
  const selectedRouteCardMissing = selectedRouteCardId.length > 0 && routeCards.length > 0 && !selectedRouteCard;

  const refresh = useCallback(async () => {
    setStatus("loading");
    setStatusMessage("Loading saved decision cards and prompts from this browser.");

    try {
      const loadedRouteRecords = await store.loadRouteRecords();
      setRouteRecords(loadedRouteRecords);
      setSelectedRouteCardId((currentRouteCardId) => {
        if (currentRouteCardId) {
          return currentRouteCardId;
        }

        return loadedRouteRecords.routeCards[0]?.id ?? "";
      });

      if (loadedRouteRecords.routeCards.length === 0) {
        setStatus("empty");
        setStatusMessage("No saved plans are stored on this device yet.");
      } else {
        setStatus("ready");
        setStatusMessage(`${loadedRouteRecords.routeCards.length} saved plan(s) loaded on this device.`);
      }
    } catch (error) {
      setRouteRecords(null);
      setStatus("error");
      setStatusMessage(routeArtifactErrorMessage(error));
    }
  }, [store]);

  const selectRouteCard = useCallback((routeCardId: string) => {
    setSelectedRouteCardId(routeCardId);
    setCopyStatus("idle");
    setCopyMessage("Nothing has been copied in this session.");
  }, []);

  const copyText = useCallback(async (text: string, label: string) => {
    if (!navigator.clipboard?.writeText) {
      setCopyStatus("unavailable");
      setCopyMessage("Clipboard is not available in this browser. Select the prepared text and copy it manually.");
      return false;
    }

    setCopyStatus("copying");
    setCopyMessage(`Copying ${label}.`);

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
      setCopyMessage(`${label} copied on this device.`);
      return true;
    } catch (error) {
      setCopyStatus("error");
      setCopyMessage(routeArtifactErrorMessage(error));
      return false;
    }
  }, []);

  return {
    status,
    statusMessage,
    copyStatus,
    copyMessage,
    routeRecords,
    routeCards,
    selectedRouteCardId,
    selectedRouteCard,
    selectedPromptPackage,
    selectedRouteCardMissing,
    refresh,
    selectRouteCard,
    copyText,
  };
}

function routeArtifactErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Saved plans could not be loaded or copied. Refresh saved plans and try again.";
}
