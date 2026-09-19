import { openDB } from "idb";

const DB_NAME = "library-desk-offline";
const DB_VERSION = 1;

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Cached read-only data, refreshed whenever the app is online
      if (!db.objectStoreNames.contains("students")) {
        db.createObjectStore("students", { keyPath: "matricule" });
      }
      if (!db.objectStoreNames.contains("catalog")) {
        db.createObjectStore("catalog", { keyPath: "barcodeSerial" });
      }
      // Write queue: checkouts made while offline, waiting to sync
      if (!db.objectStoreNames.contains("pendingCheckouts")) {
        db.createObjectStore("pendingCheckouts", { keyPath: "clientSyncId" });
      }
    },
  });
}

export async function cacheStudentDirectory(students) {
  const db = await getDb();
  const tx = db.transaction("students", "readwrite");
  await Promise.all(students.map((s) => tx.store.put(s)));
  await tx.done;
}

export async function cacheCatalog(items) {
  const db = await getDb();
  const tx = db.transaction("catalog", "readwrite");
  await Promise.all(items.map((i) => tx.store.put(i)));
  await tx.done;
}

export async function findCachedStudent(matricule) {
  const db = await getDb();
  return db.get("students", matricule);
}

export async function findCachedItemByBarcode(barcodeSerial) {
  const db = await getDb();
  return db.get("catalog", barcodeSerial);
}

export function makeClientSyncId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function queueOfflineCheckout(entry) {
  const db = await getDb();
  const clientSyncId = makeClientSyncId();
  await db.put("pendingCheckouts", { ...entry, clientSyncId, borrowedAt: new Date().toISOString() });
  return clientSyncId;
}

export async function getPendingCheckouts() {
  const db = await getDb();
  return db.getAll("pendingCheckouts");
}

export async function clearSyncedCheckouts(clientSyncIds) {
  const db = await getDb();
  const tx = db.transaction("pendingCheckouts", "readwrite");
  await Promise.all(clientSyncIds.map((id) => tx.store.delete(id)));
  await tx.done;
}
