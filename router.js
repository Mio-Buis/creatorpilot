/* Hash-Router: Adressen wie #/dashboard oder #/m/aufgaben. */
const routes = [];
let still = false;
export const route = (re, fn) => routes.push([re, fn]);
export const consumeStill = () => { const s = still; still = false; return s; };
function run() {
  const path = location.hash.slice(1) || '/dashboard';
  for (const [re, fn] of routes) {
    const m = path.match(re);
    if (m) { fn(...m.slice(1)); return; }
  }
  location.hash = '#/dashboard';
}
/* Gleiche Ansicht neu zeichnen, ohne Einblend-Animation (z. B. nach Favorit-Wechsel). */
export function refresh() { still = true; run(); }
export function start() { addEventListener('hashchange', run); run(); }
