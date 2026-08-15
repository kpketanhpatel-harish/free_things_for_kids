import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseEnvFile(contents) {
  const env = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

/**
 * Load `.env.local` into process.env without overriding values already set
 * (CI / GitHub Actions secrets win).
 */
export function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return process.env;
  }

  const fromFile = parseEnvFile(readFileSync(envPath, "utf8"));
  for (const [key, value] of Object.entries(fromFile)) {
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }

  return process.env;
}
