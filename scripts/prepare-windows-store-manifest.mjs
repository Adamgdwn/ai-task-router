import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRootDir = process.cwd();

export function createWindowsStoreManifestPaths(rootDir = defaultRootDir) {
  const root = path.resolve(rootDir);

  return {
    root,
    identityPath: path.join(root, "docs", "release", "windows-store-package-identity.json"),
    manifestPath: path.join(root, "src-tauri", "windows-msix", "Package.appxmanifest"),
  };
}

export function normalizeWindowsStoreIdentity(rawIdentity) {
  const errors = [];
  const msix = rawIdentity?.msix ?? {};
  const identity = {
    status: stringValue(rawIdentity?.status),
    productName: stringValue(rawIdentity?.productName),
    legalPublisher: stringValue(rawIdentity?.legalPublisher),
    identityName: stringValue(msix.identityName),
    publisher: stringValue(msix.publisher),
    publisherDisplayName: stringValue(msix.publisherDisplayName),
    version: stringValue(msix.version),
    applicationId: stringValue(msix.applicationId ?? "App"),
    displayName: stringValue(msix.displayName ?? rawIdentity?.productName),
    description: stringValue(msix.description),
  };

  if (rawIdentity?.schemaVersion !== 1) {
    errors.push("schemaVersion must be 1.");
  }

  if (identity.status !== "partner-center-confirmed") {
    errors.push("status must be partner-center-confirmed after copying values from Partner Center.");
  }

  for (const [field, value] of Object.entries(identity)) {
    if (field === "status") {
      continue;
    }

    if (!value || isPlaceholder(value)) {
      errors.push(`${field} must be filled with a real Partner Center or app metadata value.`);
    }
  }

  if (identity.identityName && /\s/.test(identity.identityName)) {
    errors.push("identityName must not contain spaces.");
  }

  if (identity.publisher && !/^CN=/i.test(identity.publisher)) {
    errors.push("publisher must be the exact Partner Center Publisher value and usually starts with CN=.");
  }

  if (identity.version && !/^\d+\.\d+\.\d+\.\d+$/.test(identity.version)) {
    errors.push("version must use MSIX quad notation, for example 0.2.0.0.");
  }

  if (identity.applicationId && !/^[A-Za-z][A-Za-z0-9._-]{0,63}$/.test(identity.applicationId)) {
    errors.push("applicationId must start with a letter and contain only letters, numbers, dot, underscore, or hyphen.");
  }

  if (errors.length > 0) {
    throw new Error(`Windows Store package identity is not ready:\n- ${errors.join("\n- ")}`);
  }

  return identity;
}

export function applyWindowsStoreIdentityToManifest(manifestBody, identity) {
  let updated = manifestBody;

  updated = replaceXmlAttribute(updated, "Identity", "Name", identity.identityName);
  updated = replaceXmlAttribute(updated, "Identity", "Publisher", identity.publisher);
  updated = replaceXmlAttribute(updated, "Identity", "Version", identity.version);
  updated = replaceXmlElementText(updated, "DisplayName", identity.displayName);
  updated = replaceXmlElementText(updated, "PublisherDisplayName", identity.publisherDisplayName);
  updated = replaceXmlAttribute(updated, "Application", "Id", identity.applicationId);
  updated = replaceXmlAttribute(updated, "uap:VisualElements", "DisplayName", identity.displayName);
  updated = replaceXmlAttribute(updated, "uap:VisualElements", "Description", identity.description);

  return updated;
}

function stringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isPlaceholder(value) {
  return /^(TBD|TODO|TO_BE_|REPLACE|HOLD|N\/A)$/i.test(value) || /[<>]/.test(value);
}

function replaceXmlAttribute(manifestBody, elementName, attributeName, value) {
  const elementRegex = new RegExp(`<${escapeRegExp(elementName)}\\b[\\s\\S]*?>`, "m");
  const match = manifestBody.match(elementRegex);

  if (!match) {
    throw new Error(`Manifest is missing <${elementName}>.`);
  }

  const oldElement = match[0];
  const escapedValue = escapeXmlAttribute(value);
  const attributeRegex = new RegExp(`\\b${escapeRegExp(attributeName)}="[^"]*"`);
  const newElement = attributeRegex.test(oldElement)
    ? oldElement.replace(attributeRegex, `${attributeName}="${escapedValue}"`)
    : insertXmlAttribute(oldElement, attributeName, escapedValue);

  return manifestBody.replace(oldElement, newElement);
}

function replaceXmlElementText(manifestBody, elementName, value) {
  const elementRegex = new RegExp(
    `(<${escapeRegExp(elementName)}\\b[^>]*>)([\\s\\S]*?)(</${escapeRegExp(elementName)}>)`,
    "m",
  );

  if (!elementRegex.test(manifestBody)) {
    throw new Error(`Manifest is missing <${elementName}>.`);
  }

  return manifestBody.replace(elementRegex, `$1${escapeXmlText(value)}$3`);
}

function insertXmlAttribute(elementBody, attributeName, escapedValue) {
  if (/\/\s*>$/.test(elementBody)) {
    return elementBody.replace(/\/\s*>$/, ` ${attributeName}="${escapedValue}" />`);
  }

  return elementBody.replace(/\s*>$/, ` ${attributeName}="${escapedValue}">`);
}

function escapeXmlAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeXmlText(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseArgs(rawArgs) {
  const options = {
    write: false,
    print: false,
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === "--write") {
      options.write = true;
      continue;
    }

    if (arg === "--print") {
      options.print = true;
      continue;
    }

    if (arg === "--identity") {
      options.identityPath = rawArgs[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--identity=")) {
      options.identityPath = arg.slice("--identity=".length);
      continue;
    }

    if (arg === "--manifest") {
      options.manifestPath = rawArgs[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--manifest=")) {
      options.manifestPath = arg.slice("--manifest=".length);
      continue;
    }

    if (arg === "--output") {
      options.outputPath = rawArgs[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--output=")) {
      options.outputPath = arg.slice("--output=".length);
      continue;
    }

    throw new Error(`Unsupported argument: ${arg}`);
  }

  return options;
}

async function prepareWindowsStoreManifest(options = {}) {
  const paths = createWindowsStoreManifestPaths(options.rootDir);
  const identityPath = path.resolve(options.identityPath ?? paths.identityPath);
  const manifestPath = path.resolve(options.manifestPath ?? paths.manifestPath);
  const outputPath = options.write ? manifestPath : options.outputPath ? path.resolve(options.outputPath) : null;
  const identityBody = await readFile(identityPath, "utf8").catch((error) => {
    if (error && error.code === "ENOENT") {
      throw new Error(
        `Windows Store package identity is missing at ${path.relative(
          process.cwd(),
          identityPath,
        )}. Copy docs/release/windows-store-package-identity.template.json to that path after reserving the app in Partner Center.`,
      );
    }

    throw error;
  });
  const rawIdentity = JSON.parse(identityBody);
  const identity = normalizeWindowsStoreIdentity(rawIdentity);
  const manifestBody = await readFile(manifestPath, "utf8");
  const updatedManifest = applyWindowsStoreIdentityToManifest(manifestBody, identity);

  if (outputPath) {
    await writeFile(outputPath, updatedManifest);
  }

  return {
    identity,
    identityPath,
    manifestPath,
    outputPath,
    updatedManifest,
  };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
  prepareWindowsStoreManifest(parseArgs(process.argv.slice(2)))
    .then((result) => {
      console.log("Windows Store MSIX manifest identity validated.");
      console.log(`- identity: ${path.relative(process.cwd(), result.identityPath)}`);
      console.log(`- package: ${result.identity.identityName}`);
      console.log(`- publisher: ${result.identity.publisher}`);
      console.log(`- version: ${result.identity.version}`);

      if (result.outputPath) {
        console.log(`- wrote: ${path.relative(process.cwd(), result.outputPath)}`);
      } else {
        console.log("No manifest was written. Pass --write to update the checked-in MSIX manifest.");
      }

      if (process.argv.includes("--print")) {
        console.log(result.updatedManifest);
      }
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
