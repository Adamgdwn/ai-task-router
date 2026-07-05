type TauriAwareWindow = Window & {
  __TAURI__?: unknown;
  __TAURI_INTERNALS__?: unknown;
};

export type PwaServiceWorkerDecisionInput = {
  hasServiceWorker?: boolean;
  hostname?: string;
  isProduction?: boolean;
  isTauriRuntime?: boolean;
  protocol?: string;
};

export type RegisterPwaServiceWorkerOptions = {
  isProduction?: boolean;
  navigatorRef?: Navigator;
  serviceWorker?: ServiceWorkerContainer;
  windowRef?: Window;
};

export function isTauriRuntime(windowRef: Window = window): boolean {
  const tauriAwareWindow = windowRef as TauriAwareWindow;

  return Boolean(tauriAwareWindow.__TAURI_INTERNALS__ || tauriAwareWindow.__TAURI__);
}

export function shouldRegisterPwaServiceWorker(input: PwaServiceWorkerDecisionInput = {}): boolean {
  const isProduction = input.isProduction ?? import.meta.env.PROD;
  const hasServiceWorker = input.hasServiceWorker ?? ("serviceWorker" in navigator);
  const protocol = input.protocol ?? window.location.protocol;
  const hostname = input.hostname ?? window.location.hostname;
  const isHostedSecurely = protocol === "https:";
  const isLocalDevelopment =
    protocol === "http:" && (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]");

  return Boolean(isProduction && hasServiceWorker && !input.isTauriRuntime && (isHostedSecurely || isLocalDevelopment));
}

export function registerPwaServiceWorker(options: RegisterPwaServiceWorkerOptions = {}): boolean {
  const windowRef = options.windowRef ?? window;
  const navigatorRef = options.navigatorRef ?? windowRef.navigator;
  const serviceWorker = options.serviceWorker ?? navigatorRef.serviceWorker;
  const hasServiceWorker = Boolean(serviceWorker);

  if (
    !shouldRegisterPwaServiceWorker({
      hasServiceWorker,
      hostname: windowRef.location.hostname,
      isProduction: options.isProduction,
      isTauriRuntime: isTauriRuntime(windowRef),
      protocol: windowRef.location.protocol,
    }) ||
    !serviceWorker
  ) {
    return false;
  }

  const register = () => {
    serviceWorker.register("/service-worker.js").catch((error: unknown) => {
      console.warn("AI Task Router install support could not be prepared.", error);
    });
  };

  if (windowRef.document.readyState === "complete") {
    register();
    return true;
  }

  windowRef.addEventListener("load", register, { once: true });

  return true;
}
