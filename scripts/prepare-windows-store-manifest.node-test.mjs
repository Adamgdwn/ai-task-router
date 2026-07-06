import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  applyWindowsStoreIdentityToManifest,
  createWindowsStoreManifestPaths,
  normalizeWindowsStoreIdentity,
} from "./prepare-windows-store-manifest.mjs";

const manifestFixture = `<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10">
  <Identity
    Name="GuidedAILabs.AITaskRouter"
    Publisher="CN=Guided AI Labs Ltd"
    Version="0.2.0.0" />
  <Properties>
    <DisplayName>AI Task Router</DisplayName>
    <PublisherDisplayName>Guided AI Labs Ltd</PublisherDisplayName>
    <Logo>Assets\\StoreLogo.png</Logo>
  </Properties>
  <Applications>
    <Application Id="App"
      Executable="$targetnametoken$.exe"
      EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="AI Task Router"
        Description="AI Task Router desktop proof package"
        BackgroundColor="transparent" />
    </Application>
  </Applications>
</Package>
`;

test("Windows Store manifest paths use the release identity manifest and MSIX manifest", () => {
  const paths = createWindowsStoreManifestPaths("C:/work/agent-picker");

  assert.equal(
    paths.identityPath,
    path.join("C:/work/agent-picker", "docs", "release", "windows-store-package-identity.json"),
  );
  assert.equal(
    paths.manifestPath,
    path.join("C:/work/agent-picker", "src-tauri", "windows-msix", "Package.appxmanifest"),
  );
});

test("Windows Store identity rejects template values", () => {
  assert.throws(
    () =>
      normalizeWindowsStoreIdentity({
        schemaVersion: 1,
        status: "template",
        productName: "AI Task Router",
        legalPublisher: "TO_BE_CONFIRMED",
        msix: {
          identityName: "<Partner Center identity name>",
          publisher: "<Partner Center publisher>",
          publisherDisplayName: "Guided AI Labs Ltd",
          version: "0.2.0.0",
          applicationId: "App",
          displayName: "AI Task Router",
          description: "AI Task Router",
        },
      }),
    /partner-center-confirmed/,
  );
});

test("Windows Store identity validates MSIX quad version and publisher shape", () => {
  assert.throws(
    () =>
      normalizeWindowsStoreIdentity({
        schemaVersion: 1,
        status: "partner-center-confirmed",
        productName: "AI Task Router",
        legalPublisher: "Guided AI Labs Ltd",
        msix: {
          identityName: "GuidedAILabs.AITaskRouter",
          publisher: "Guided AI Labs Ltd",
          publisherDisplayName: "Guided AI Labs Ltd",
          version: "0.2.0",
          applicationId: "App",
          displayName: "AI Task Router",
          description: "AI Task Router",
        },
      }),
    /publisher must be|version must use/,
  );
});

test("applies Partner Center identity to the MSIX manifest", () => {
  const identity = normalizeWindowsStoreIdentity({
    schemaVersion: 1,
    status: "partner-center-confirmed",
    productName: "AI Task Router",
    legalPublisher: "Guided AI Labs Ltd",
    msix: {
      identityName: "12345GuidedAILabs.AITaskRouter",
      publisher: "CN=12345678-90AB-CDEF-1234-567890ABCDEF",
      publisherDisplayName: "Guided AI Labs Ltd",
      version: "0.2.1.0",
      applicationId: "App",
      displayName: "AI Task Router",
      description: "AI Task Router for choosing right-sized AI help",
    },
  });

  const updated = applyWindowsStoreIdentityToManifest(manifestFixture, identity);

  assert.match(updated, /Name="12345GuidedAILabs\.AITaskRouter"/);
  assert.match(updated, /Publisher="CN=12345678-90AB-CDEF-1234-567890ABCDEF"/);
  assert.match(updated, /Version="0\.2\.1\.0"/);
  assert.match(updated, /<DisplayName>AI Task Router<\/DisplayName>/);
  assert.match(updated, /<PublisherDisplayName>Guided AI Labs Ltd<\/PublisherDisplayName>/);
  assert.match(updated, /Description="AI Task Router for choosing right-sized AI help"/);
});

test("escapes XML-sensitive manifest values", () => {
  const updated = applyWindowsStoreIdentityToManifest(manifestFixture, {
    identityName: "GuidedAILabs.AITaskRouter",
    publisher: "CN=Guided & AI Labs",
    publisherDisplayName: "Guided & AI Labs Ltd",
    version: "0.2.1.0",
    applicationId: "App",
    displayName: "AI Task Router <Preview>",
    description: 'AI Task Router "Preview" & report',
  });

  assert.match(updated, /Publisher="CN=Guided &amp; AI Labs"/);
  assert.match(updated, /<DisplayName>AI Task Router &lt;Preview&gt;<\/DisplayName>/);
  assert.match(updated, /Description="AI Task Router &quot;Preview&quot; &amp; report"/);
});
