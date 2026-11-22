/* Gemeinsame Einstellungen, Favoriten und zuletzt verwendete Module (localStorage). */
const KEY = 'nova.settings.v1';
const defaults = { name: '', lang: 'de', favorites: [], recents: [] };
let s;
try { s = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { s = { ...defaults }; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { console.error('Einstellungen nicht gespeichert', e); } };

export const get = k => s[k];
export const set = (k, v) => { s[k] = v; save(); };
export const isFav = id => s.favorites.includes(id);
export function toggleFav(id) {
  s.favorites = isFav(id) ? s.favorites.filter(x => x !== id) : [...s.favorites, id];
  save();
  return isFav(id);
}
export function pushRecent(id) {
  s.recents = [id, ...s.recents.filter(x => x !== id)].slice(0, 8);
  save();
}
