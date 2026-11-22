/* DATENSCHICHT
   Aktuell: localStorage im Browser. Alle Methoden sind async, damit sie später
   ohne Änderung an der Oberfläche durch fetch()-Aufrufe an eine Datenbank-API
   (z. B. /api/projects) ersetzt werden können. Tabellen: projects, posts, activity. */
window.CP = window.CP || {};
CP.Storage = (() => {
  const KEY = 'creatorpilot.v1';
  const blank = () => ({ projects: [], posts: [], activity: [] });
  let db;
  try { db = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch (e) { console.error('Daten nicht lesbar', e); db = blank(); }

  const persist = () => {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { console.error('Speichern fehlgeschlagen', e); }
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const clone = x => JSON.parse(JSON.stringify(x));

  return {
    async list(table) { return clone(db[table]); },
    async save(table, item) {
      const i = item.id ? db[table].findIndex(x => x.id === item.id) : -1;
      if (i >= 0) { db[table][i] = { ...db[table][i], ...item }; item = db[table][i]; }
      else { item = { ...item, id: uid(), createdAt: new Date().toISOString() }; db[table].push(item); }
      persist();
      return clone(item);
    },
    async remove(table, id) { db[table] = db[table].filter(x => x.id !== id); persist(); },
    async log(text) {
      db.activity.unshift({ text, at: new Date().toISOString() });
      db.activity = db.activity.slice(0, 30);
      persist();
    }
  };
})();
