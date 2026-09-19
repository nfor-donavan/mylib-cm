import { getPendingCheckouts, clearSyncedCheckouts } from "./db";
import api from "../api";

export async function syncPendingCheckouts() {
  const pending = await getPendingCheckouts();
  if (pending.length === 0) return { synced: 0 };

  const { data } = await api.post("/sync", { checkouts: pending });

  const succeeded = data.results
    .filter((r) => r.status === "synced" || r.status === "already_synced")
    .map((r) => r.clientSyncId);

  await clearSyncedCheckouts(succeeded);

  const failed = data.results.filter((r) => r.status === "error");
  if (failed.length > 0) {
    console.warn("[sync] Some offline checkouts failed to sync:", failed);
  }

  return { synced: succeeded.length, failed: failed.length };
}

/**
 * Call once at app startup. Attempts a sync immediately, then again every
 * time the browser regains connectivity.
 */
export function registerAutoSync(onResult) {
  const attempt = () => {
    syncPendingCheckouts()
      .then((result) => onResult && onResult(result))
      .catch((err) => console.warn("[sync] Sync attempt failed, will retry later:", err.message));
  };

  if (navigator.onLine) attempt();
  window.addEventListener("online", attempt);
  return () => window.removeEventListener("online", attempt);
}
