import { defineConfig } from '@playwright/test';

function readWorkers() {
  const raw = process.env.E2E_WORKERS ?? process.env.PLAYWRIGHT_WORKERS;
  if (!raw) return 4;

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid E2E_WORKERS value: ${raw}`);
  }
  return value;
}

export default defineConfig({
  workers: readWorkers(),
});
