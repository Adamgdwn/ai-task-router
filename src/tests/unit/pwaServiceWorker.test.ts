import { shouldRegisterPwaServiceWorker } from "../../pwa/registerServiceWorker";

describe("PWA service worker registration", () => {
  it("allows production registration on HTTPS hosts", () => {
    expect(
      shouldRegisterPwaServiceWorker({
        hasServiceWorker: true,
        hostname: "oldskoolai.com",
        isProduction: true,
        protocol: "https:",
      }),
    ).toBe(true);
  });

  it("allows production registration on local preview hosts", () => {
    expect(
      shouldRegisterPwaServiceWorker({
        hasServiceWorker: true,
        hostname: "127.0.0.1",
        isProduction: true,
        protocol: "http:",
      }),
    ).toBe(true);
  });

  it("blocks registration in development, insecure public HTTP, missing support, or Tauri", () => {
    expect(
      shouldRegisterPwaServiceWorker({
        hasServiceWorker: true,
        hostname: "oldskoolai.com",
        isProduction: false,
        protocol: "https:",
      }),
    ).toBe(false);
    expect(
      shouldRegisterPwaServiceWorker({
        hasServiceWorker: true,
        hostname: "oldskoolai.com",
        isProduction: true,
        protocol: "http:",
      }),
    ).toBe(false);
    expect(
      shouldRegisterPwaServiceWorker({
        hasServiceWorker: false,
        hostname: "oldskoolai.com",
        isProduction: true,
        protocol: "https:",
      }),
    ).toBe(false);
    expect(
      shouldRegisterPwaServiceWorker({
        hasServiceWorker: true,
        hostname: "oldskoolai.com",
        isProduction: true,
        isTauriRuntime: true,
        protocol: "https:",
      }),
    ).toBe(false);
  });
});
