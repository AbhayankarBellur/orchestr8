import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(__dirname, "../..");
export const ARTIFACT_ROOT = resolve(PROJECT_ROOT, "artifacts");
export const REPORTS_DIR = resolve(ARTIFACT_ROOT, "reports");
export const DASHBOARDS_DIR = resolve(ARTIFACT_ROOT, "dashboards");

export const ALLOWED_ARTIFACT_TYPES = ["report", "dashboard"];

export async function ensureArtifactDirs() {
  await Promise.all([
    mkdir(REPORTS_DIR, { recursive: true }),
    mkdir(DASHBOARDS_DIR, { recursive: true })
  ]);
}

export function generateArtifactId(prefix = "art") {
  const ts = Date.now();
  const id = randomUUID().slice(0, 8);
  return `${prefix}_${ts}_${id}`;
}
