/* DATENSCHICHT (IndexedDB). Alle Datensätze liegen in einem Speicher und tragen
   ein Feld "col" (Sammlung, z. B. "tasks"). Neue Module brauchen keine Datenbank-Updates.
   API wie in CreatorPilot: list, save, remove – zusätzlich get und clear. */
const DB = 'nova', STORE = 'items';
let dbp;
export const open = () => dbp || (dbp = new Promise((res, rej) => {
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => { r.result.createObjectStore(STORE, { keyPath: 'id' }).createIndex('col', 'col'); };
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
}));
const run = (mode, fn) => open().then(db => new Promise((res, rej) => {
  const t = db.transaction(STORE, mode), req = fn(t.objectStore(STORE));
  t.oncomplete = () => res(req && req.result);
  t.onerror = t.onabort = () => rej(t.error);
}));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const list = col => run('readonly', s => s.index('col').getAll(col)).then(a => a || []);
export const get = id => run('readonly', s => s.get(id));
export async function save(col, item) {
  const old = item.id ? await get(item.id) : null;
  const now = new Date().toISOString();
  const rec = { ...(old || { createdAt: now }), ...item, col, id: item.id || uid(), updatedAt: now };
  await run('readwrite', s => s.put(rec));
  return rec;
}
export const remove = id => run('readwrite', s => s.delete(id));
export async function clear(col) {
  const ids = (await list(col)).map(x => x.id);
  await run('readwrite', s => { ids.forEach(id => s.delete(id)); });
}
