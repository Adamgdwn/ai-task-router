import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { RouteCard, RouteLogEntry, RouteOption } from "../../domain/types";
import type { LocalRouteRecords, LocalStore } from "../../storage/localStore";
import { ScreenHeader } from "./SetupScreens";
import type { ScreenDefinition } from "./screenDefinitions";

type RouteLogScreenProps = {
  definition: ScreenDefinition;
  store: LocalStore;
  onOpenRouteCard: (routeCardId: string) => void;
  onOpenTaskIntake: () => void;
};

type RouteLogStatus = "idle" | "loading" | "ready" | "empty" | "error";
type FeedbackSaveStatus = "idle" | "saving" | "saved" | "error";
type OutcomeFilter = RouteLogEntry["outcome"] | "all";
type RouteLogSort = "recent" | "oldest" | "title";
type RatingDraft = "" | "1" | "2" | "3" | "4" | "5";

type FeedbackDraft = {
  outcome: RouteLogEntry["outcome"];
  rating: RatingDraft;
  notes: string;
};

type RouteLogRow = {
  entry: RouteLogEntry;
  routeCard: RouteCard | null;
  selectedOption: RouteOption | null;
};

const emptyRouteRecords: LocalRouteRecords = {
  routeCards: [],
  promptPackages: [],
  routeLogEntries: [],
};

const initialFeedbackDraft: FeedbackDraft = {
  outcome: "deferred",
  rating: "",
  notes: "",
};

const outcomeOptions: Array<{ value: RouteLogEntry["outcome"]; label: string }> = [
  { value: "deferred", label: "Deferred - still deciding" },
  { value: "accepted", label: "Accepted - used it as-is" },
  { value: "edited", label: "Edited - used it after changes" },
  { value: "rejected", label: "Rejected - did not use it" },
];

const ratingOptions: Array<{ value: RatingDraft; label: string }> = [
  { value: "", label: "No rating yet" },
  { value: "5", label: "5 - Very helpful" },
  { value: "4", label: "4 - Helpful" },
  { value: "3", label: "3 - Mixed" },
  { value: "2", label: "2 - Not very helpful" },
  { value: "1", label: "1 - Not useful" },
];

export function RouteLogScreen({
  definition,
  store,
  onOpenRouteCard,
  onOpenTaskIntake,
}: RouteLogScreenProps) {
  const [status, setStatus] = useState<RouteLogStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("Past choices have not been loaded yet.");
  const [routeRecords, setRouteRecords] = useState<LocalRouteRecords>(emptyRouteRecords);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>("all");
  const [sortOrder, setSortOrder] = useState<RouteLogSort>("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackDraft, setFeedbackDraft] = useState<FeedbackDraft>(initialFeedbackDraft);
  const [feedbackSaveStatus, setFeedbackSaveStatus] = useState<FeedbackSaveStatus>("idle");
  const [feedbackSaveMessage, setFeedbackSaveMessage] = useState("Choose a past choice to add a quick note.");
  const lastDraftEntryId = useRef("");

  const routeCardsById = useMemo(
    () => new Map(routeRecords.routeCards.map((routeCard) => [routeCard.id, routeCard])),
    [routeRecords.routeCards],
  );

  const rows = useMemo(
    () =>
      routeRecords.routeLogEntries.map((entry) => {
        const routeCard = routeCardsById.get(entry.routeCardId) ?? null;
        const selectedOption = routeCard?.options.find((option) => option.id === entry.selectedOptionId) ?? null;

        return {
          entry,
          routeCard,
          selectedOption,
        };
      }),
    [routeCardsById, routeRecords.routeLogEntries],
  );

  const visibleRows = useMemo(
    () => filterAndSortRows(rows, { outcomeFilter, searchTerm, sortOrder }),
    [outcomeFilter, rows, searchTerm, sortOrder],
  );

  const selectedRow = useMemo(
    () => rows.find((row) => row.entry.id === selectedEntryId) ?? null,
    [rows, selectedEntryId],
  );

  const loadRecords = useCallback(async () => {
    setStatus("loading");
    setStatusMessage("Loading Past Choices from this browser.");

    try {
      const loadedRouteRecords = await store.loadRouteRecords();
      setRouteRecords(loadedRouteRecords);
      setSelectedEntryId((currentEntryId) =>
        loadedRouteRecords.routeLogEntries.some((entry) => entry.id === currentEntryId)
          ? currentEntryId
          : loadedRouteRecords.routeLogEntries[0]?.id ?? "",
      );

      if (loadedRouteRecords.routeLogEntries.length === 0) {
        setStatus("empty");
        setStatusMessage("No Past Choices are stored on this device yet.");
      } else {
        setStatus("ready");
        setStatusMessage(`${loadedRouteRecords.routeLogEntries.length} Past Choice record(s) loaded on this device.`);
      }
    } catch (error) {
      setRouteRecords(emptyRouteRecords);
      setSelectedEntryId("");
      setStatus("error");
      setStatusMessage(routeLogErrorMessage(error));
    }
  }, [store]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    if (visibleRows.length === 0) {
      return;
    }

    if (!visibleRows.some((row) => row.entry.id === selectedEntryId)) {
      setSelectedEntryId(visibleRows[0].entry.id);
    }
  }, [selectedEntryId, visibleRows]);

  useEffect(() => {
    if (!selectedRow) {
      lastDraftEntryId.current = "";
      setFeedbackDraft(initialFeedbackDraft);
      setFeedbackSaveStatus("idle");
      setFeedbackSaveMessage("Choose a past choice to add a quick note.");
      return;
    }

    if (lastDraftEntryId.current === selectedRow.entry.id) {
      return;
    }

    lastDraftEntryId.current = selectedRow.entry.id;
    setFeedbackDraft({
      outcome: selectedRow.entry.outcome,
      rating: selectedRow.entry.feedback?.rating ? (String(selectedRow.entry.feedback.rating) as RatingDraft) : "",
      notes: selectedRow.entry.feedback?.notes ?? "",
    });
    setFeedbackSaveStatus("idle");
    setFeedbackSaveMessage("Feedback stays in this browser.");
  }, [selectedRow]);

  const handleFeedbackSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRow) {
      setFeedbackSaveStatus("error");
      setFeedbackSaveMessage("Choose a past choice before saving feedback.");
      return;
    }

    setFeedbackSaveStatus("saving");
    setFeedbackSaveMessage("Saving feedback in this browser.");

    try {
      const updatedEntry = await store.updateRouteLogFeedback(selectedRow.entry.id, {
        outcome: feedbackDraft.outcome,
        feedback: feedbackFromDraft(feedbackDraft),
      });

      setRouteRecords((currentRecords) => ({
        ...currentRecords,
        routeLogEntries: currentRecords.routeLogEntries.map((entry) =>
          entry.id === updatedEntry.id ? updatedEntry : entry,
        ),
      }));
      setSelectedEntryId(updatedEntry.id);
      if (outcomeFilter !== "all" && outcomeFilter !== updatedEntry.outcome) {
        setOutcomeFilter(updatedEntry.outcome);
      }
      setFeedbackSaveStatus("saved");
      setFeedbackSaveMessage("Feedback saved in this browser.");
    } catch (error) {
      setFeedbackSaveStatus("error");
      setFeedbackSaveMessage(routeLogErrorMessage(error));
    }
  };

  return (
    <article className="screenPanel routeLogPanel">
      <ScreenHeader definition={definition} />

      <section className="routeLogToolbar" aria-labelledby="route-log-toolbar-heading">
        <div>
          <h3 id="route-log-toolbar-heading">Saved recommendations</h3>
          <p aria-live="polite" role="status">
            {statusMessage}
          </p>
        </div>

        <div className="routeLogControls">
          <label>
            <span>Search past choices</span>
            <input
              aria-label="Search past choices"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Task, note, or route"
              value={searchTerm}
            />
          </label>

          <label>
            <span>Show only</span>
            <select
              aria-label="Show only"
              onChange={(event) => setOutcomeFilter(event.target.value as OutcomeFilter)}
              value={outcomeFilter}
            >
              <option value="all">All outcomes</option>
              {outcomeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Sort by</span>
            <select
              aria-label="Sort by"
              onChange={(event) => setSortOrder(event.target.value as RouteLogSort)}
              value={sortOrder}
            >
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Task title</option>
            </select>
          </label>
        </div>

        <button disabled={status === "loading"} onClick={() => void loadRecords()} type="button">
          Refresh Past Choices
        </button>
      </section>

      <p className="setupBoundaryNote">
        Past Choices are local decision records. Your notes stay in this browser and are not sent anywhere.
      </p>

      <RouteLogStatus
        onOpenTaskIntake={onOpenTaskIntake}
        routeCardCount={routeRecords.routeCards.length}
        routeLogCount={routeRecords.routeLogEntries.length}
        status={status}
        statusMessage={statusMessage}
      />

      {routeRecords.routeLogEntries.length > 0 && visibleRows.length === 0 ? (
        <section className="emptyResultsState" aria-labelledby="route-log-no-match-heading">
          <h3 id="route-log-no-match-heading">No choices match that view</h3>
          <p>Clear the search or outcome filter to see more saved recommendations.</p>
        </section>
      ) : null}

      {visibleRows.length > 0 ? (
        <div className="routeLogWorkspace">
          <section className="routeLogList" aria-label="Past Choices list">
            {visibleRows.map((row) => (
              <RouteLogListItem
                key={row.entry.id}
                onOpenRouteCard={onOpenRouteCard}
                onSelectEntry={setSelectedEntryId}
                row={row}
                selected={row.entry.id === selectedEntryId}
              />
            ))}
          </section>

          <FeedbackPanel
            draft={feedbackDraft}
            onDraftChange={setFeedbackDraft}
            onSubmit={handleFeedbackSubmit}
            row={selectedRow}
            saveMessage={feedbackSaveMessage}
            saveStatus={feedbackSaveStatus}
          />
        </div>
      ) : null}
    </article>
  );
}

function RouteLogStatus({
  onOpenTaskIntake,
  routeCardCount,
  routeLogCount,
  status,
  statusMessage,
}: {
  onOpenTaskIntake: () => void;
  routeCardCount: number;
  routeLogCount: number;
  status: RouteLogStatus;
  statusMessage: string;
}) {
  if (status === "loading" && routeLogCount === 0) {
    return <div className="loadingPanel">Loading Past Choices from this browser.</div>;
  }

  if (status === "error") {
    return (
      <div className="setupAlert" role="alert">
        {statusMessage}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <section className="emptyResultsState" aria-labelledby="empty-route-log-heading">
        <h3 id="empty-route-log-heading">No Past Choices yet</h3>
        <p>
          {routeCardCount > 0
            ? "Saved decision cards are available, but feedback records start with plans saved in this version."
            : "Describe a task, save a plan, then come back here to note how it worked."}
        </p>
        <button onClick={onOpenTaskIntake} type="button">
          Describe my task
        </button>
      </section>
    );
  }

  return null;
}

function RouteLogListItem({
  onOpenRouteCard,
  onSelectEntry,
  row,
  selected,
}: {
  onOpenRouteCard: (routeCardId: string) => void;
  onSelectEntry: (entryId: string) => void;
  row: RouteLogRow;
  selected: boolean;
}) {
  const title = routeLogTitle(row);

  return (
    <article
      aria-labelledby={`${row.entry.id}-heading`}
      className={selected ? "routeLogEntry selectedRouteLogEntry" : "routeLogEntry"}
    >
      <div className="routeLogEntryHeader">
        <div>
          <p className="screenKicker">{formatTimestamp(row.entry.createdAt)}</p>
          <h3 id={`${row.entry.id}-heading`}>{title}</h3>
        </div>
        <span>{outcomeLabel(row.entry.outcome)}</span>
      </div>

      <dl className="routeLogMetaGrid">
        <div>
          <dt>Choice</dt>
          <dd>{row.selectedOption?.label ?? strategyLabel(row.entry.selectedStrategy)}</dd>
        </div>
        <div>
          <dt>Rating</dt>
          <dd>{row.entry.feedback?.rating ? `${row.entry.feedback.rating}/5` : "Not rated"}</dd>
        </div>
        <div>
          <dt>Note</dt>
          <dd>{row.entry.feedback?.notes?.trim() || "No note yet"}</dd>
        </div>
      </dl>

      <div className="routeLogEntryActions">
        <button onClick={() => onSelectEntry(row.entry.id)} type="button">
          {selected ? "Editing this note" : "Add or edit note"}
        </button>
        <button
          disabled={!row.routeCard}
          onClick={() => row.routeCard ? onOpenRouteCard(row.routeCard.id) : undefined}
          type="button"
        >
          Open decision card
        </button>
      </div>
    </article>
  );
}

function FeedbackPanel({
  draft,
  onDraftChange,
  onSubmit,
  row,
  saveMessage,
  saveStatus,
}: {
  draft: FeedbackDraft;
  onDraftChange: (draft: FeedbackDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  row: RouteLogRow | null;
  saveMessage: string;
  saveStatus: FeedbackSaveStatus;
}) {
  if (!row) {
    return (
      <section className="feedbackPanel" aria-labelledby="feedback-panel-heading">
        <h3 id="feedback-panel-heading">Quick feedback</h3>
        <p>Choose a saved recommendation to record what happened.</p>
      </section>
    );
  }

  return (
    <form className="feedbackPanel" onSubmit={onSubmit}>
      <div>
        <p className="screenKicker">Quick feedback</p>
        <h3 id="feedback-panel-heading">What happened with this choice?</h3>
        <p>{routeLogTitle(row)}</p>
      </div>

      <div className="feedbackFormGrid">
        <label>
          <span>What happened?</span>
          <select
            aria-label="What happened?"
            onChange={(event) =>
              onDraftChange({ ...draft, outcome: event.target.value as RouteLogEntry["outcome"] })
            }
            value={draft.outcome}
          >
            {outcomeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Usefulness rating</span>
          <select
            aria-label="Usefulness rating"
            onChange={(event) => onDraftChange({ ...draft, rating: event.target.value as RatingDraft })}
            value={draft.rating}
          >
            {ratingOptions.map((option) => (
              <option key={option.value || "none"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span>Private note</span>
        <textarea
          aria-label="Private note"
          onChange={(event) => onDraftChange({ ...draft, notes: event.target.value })}
          rows={5}
          value={draft.notes}
        />
      </label>

      <button disabled={saveStatus === "saving"} type="submit">
        Save feedback
      </button>
      <span aria-live="polite" role="status">
        {saveMessage}
      </span>
    </form>
  );
}

function filterAndSortRows(
  rows: RouteLogRow[],
  {
    outcomeFilter,
    searchTerm,
    sortOrder,
  }: {
    outcomeFilter: OutcomeFilter;
    searchTerm: string;
    sortOrder: RouteLogSort;
  },
) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return rows
    .filter((row) => outcomeFilter === "all" || row.entry.outcome === outcomeFilter)
    .filter((row) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        routeLogTitle(row),
        row.selectedOption?.label ?? "",
        strategyLabel(row.entry.selectedStrategy),
        outcomeLabel(row.entry.outcome),
        row.entry.feedback?.notes ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    })
    .sort((left, right) => {
      if (sortOrder === "oldest") {
        return left.entry.createdAt.localeCompare(right.entry.createdAt) || left.entry.id.localeCompare(right.entry.id);
      }

      if (sortOrder === "title") {
        return routeLogTitle(left).localeCompare(routeLogTitle(right)) || right.entry.createdAt.localeCompare(left.entry.createdAt);
      }

      return right.entry.createdAt.localeCompare(left.entry.createdAt) || left.entry.id.localeCompare(right.entry.id);
    });
}

function feedbackFromDraft(draft: FeedbackDraft): RouteLogEntry["feedback"] {
  const rating = draft.rating ? Number(draft.rating) : undefined;
  const notes = draft.notes.trim();

  if (rating === undefined && notes.length === 0) {
    return undefined;
  }

  return {
    ...(rating === undefined ? {} : { rating }),
    ...(notes.length === 0 ? {} : { notes }),
  };
}

function routeLogTitle(row: RouteLogRow) {
  return row.routeCard?.title ?? `Saved choice ${row.entry.routeCardId}`;
}

function strategyLabel(strategy: RouteLogEntry["selectedStrategy"]) {
  return `${strategy.charAt(0).toUpperCase()}${strategy.slice(1)} route`;
}

function outcomeLabel(outcome: RouteLogEntry["outcome"]) {
  switch (outcome) {
    case "accepted":
      return "Accepted - used it as-is";
    case "edited":
      return "Edited - used it after changes";
    case "rejected":
      return "Rejected - did not use it";
    case "deferred":
      return "Deferred - still deciding";
  }
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function routeLogErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Past Choices could not be loaded or saved. Refresh and try again.";
}
