import { invoke } from "@tauri-apps/api/core";
import {
  desktopDiscoveryErrorSchema,
  desktopDiscoveryOptionsResponseSchema,
  desktopDiscoveryRequestSchema,
  desktopDiscoveryResponseSchema,
} from "../domain/schemas";
import type {
  DesktopDiscoveryError,
  DesktopDiscoveryOptionsResponse,
  DesktopDiscoveryRequest,
  DesktopDiscoveryResponse,
} from "../domain/types";

type TauriRuntimeWindow = Window & {
  __TAURI__?: unknown;
  __TAURI_INTERNALS__?: unknown;
};

export class DesktopDiscoveryUnavailableError extends Error {
  constructor() {
    super("Computer checking is available in the desktop app. Add tools manually in this browser.");
    this.name = "DesktopDiscoveryUnavailableError";
  }
}

export class DesktopDiscoveryCommandError extends Error {
  constructor(readonly error: DesktopDiscoveryError) {
    super(error.message);
    this.name = "DesktopDiscoveryCommandError";
  }
}

export function isDesktopDiscoveryAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const runtimeWindow = window as TauriRuntimeWindow;

  return Boolean(runtimeWindow.__TAURI_INTERNALS__ || runtimeWindow.__TAURI__);
}

export async function getDesktopDiscoveryOptions(): Promise<DesktopDiscoveryOptionsResponse> {
  if (!isDesktopDiscoveryAvailable()) {
    throw new DesktopDiscoveryUnavailableError();
  }

  try {
    return desktopDiscoveryOptionsResponseSchema.parse(await invoke("get_desktop_discovery_options"));
  } catch (error) {
    throw normalizeDesktopDiscoveryError(error);
  }
}

export async function runDesktopDiscovery(request: DesktopDiscoveryRequest): Promise<DesktopDiscoveryResponse> {
  if (!isDesktopDiscoveryAvailable()) {
    throw new DesktopDiscoveryUnavailableError();
  }

  const safeRequest = desktopDiscoveryRequestSchema.parse(request);

  try {
    return desktopDiscoveryResponseSchema.parse(
      await invoke("run_desktop_discovery", {
        request: safeRequest,
      }),
    );
  } catch (error) {
    throw normalizeDesktopDiscoveryError(error, safeRequest.requestId);
  }
}

function normalizeDesktopDiscoveryError(error: unknown, requestId?: string): Error {
  const parsedError = desktopDiscoveryErrorSchema.safeParse(error);

  if (parsedError.success) {
    return new DesktopDiscoveryCommandError(parsedError.data);
  }

  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string" && error.trim()) {
    return new DesktopDiscoveryCommandError({
      schemaVersion: 1,
      requestId,
      code: "internal-error",
      message: "The local check could not finish.",
      safeDetail: error.trim().slice(0, 240),
      retryable: true,
    });
  }

  return new DesktopDiscoveryCommandError({
    schemaVersion: 1,
    requestId,
    code: "internal-error",
    message: "The local check could not finish.",
    retryable: true,
  });
}
