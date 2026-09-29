// Fetches the API's OpenAPI document into `openapi.json`, the snapshot the
// client's types are generated from and its contract test reads.
import { writeFile } from 'node:fs/promises';

const apiBaseUrl =
  process.env.HOTCODEPUSH_API_BASE_URL ?? 'http://localhost:8787';
const snapshotUrl = new URL('../openapi.json', import.meta.url);
const TIMEOUT_MS = 10_000;

const response = await fetch(new URL('/openapi', apiBaseUrl), {
  signal: AbortSignal.timeout(TIMEOUT_MS),
});
if (!response.ok) {
  throw new Error(
    `${apiBaseUrl}/openapi answered ${response.status}; is the API running?`,
  );
}
const openApiDocument: unknown = await response.json();
await writeFile(snapshotUrl, `${JSON.stringify(openApiDocument, null, 2)}\n`);
console.log(`Wrote the OpenAPI document of ${apiBaseUrl} to openapi.json.`);
