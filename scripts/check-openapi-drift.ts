import { readFile } from 'node:fs/promises';

interface OpenApiDocument {
  paths: Record<string, Record<string, unknown>>;
}

const HTTP_METHODS = ['delete', 'get', 'patch', 'post', 'put'];
const LIVE_DOCUMENT_URL = 'https://api.hotcodepush.com/openapi';
const TIMEOUT_MS = 10_000;

const snapshotOperations = resolveOperations(
  JSON.parse(
    await readFile(new URL('../openapi.json', import.meta.url), 'utf8'),
  ) as OpenApiDocument,
);
const liveDocument = await fetchLiveDocument();
if (liveDocument === undefined) {
  process.exit(0);
}
const liveOperations = resolveOperations(liveDocument);
const differences = [
  ...[...liveOperations]
    .filter(operation => !snapshotOperations.has(operation))
    .map(operation => `+ ${operation} (live only)`),
  ...[...snapshotOperations]
    .filter(operation => !liveOperations.has(operation))
    .map(operation => `- ${operation} (openapi.json only)`),
];
if (differences.length > 0) {
  console.error(
    `The operations of openapi.json differ from ${LIVE_DOCUMENT_URL}:\n${differences.join('\n')}`,
  );
  process.exit(1);
}
console.log(`openapi.json has the operations of ${LIVE_DOCUMENT_URL}.`);

// An unreachable API must not block the build, so a thrown fetch or a 5xx warns and skips.
// A 4xx means the document moved, so it fails.
async function fetchLiveDocument(): Promise<OpenApiDocument | undefined> {
  let response: Response;
  try {
    response = await fetch(LIVE_DOCUMENT_URL, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    warnSkippedCheck(String(error));
    return undefined;
  }
  if (response.status >= 500) {
    warnSkippedCheck(`it answered ${response.status}`);
    return undefined;
  }
  if (!response.ok) {
    console.error(`${LIVE_DOCUMENT_URL} answered ${response.status}.`);
    process.exit(1);
  }
  return (await response.json()) as OpenApiDocument;
}

function resolveOperations(document: OpenApiDocument): Set<string> {
  return new Set(
    Object.entries(document.paths).flatMap(([path, pathItem]) =>
      Object.keys(pathItem)
        .filter(method => HTTP_METHODS.includes(method))
        .map(method => `${method.toUpperCase()} ${path}`),
    ),
  );
}

function warnSkippedCheck(reason: string): void {
  console.log(
    `::warning::Skipped the drift check, ${LIVE_DOCUMENT_URL} could not be read: ${reason}`,
  );
}
