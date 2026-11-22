/* SHELL: Seitenleiste, Menü, Modulsuche und die Funktion show() zum Anzeigen einer Ansicht. */
import { MODULES, GROUPS } from '../core/registry.js';
import { icon, esc, toast } from '../core/ui.js';
import * as settings from '../core/settings.js';
import { consumeStill, refresh } from '../core/router.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NAV = [['dashboard', 'Dashboard', 'home'], ['modules', 'Modulübersicht', 'apps'], ['favorites', 'Favoriten', 'star'], ['recent', 'Zuletzt verwendet', 'clock'], ['settings', 'Einstellungen', 'sliders']];
let timer;

export const every = (fn, ms) => { timer = setInterval(fn, ms); };

export function show(active, html, bind) {
  clearInterval(timer);
  const still = consumeStill(), v = $('#view');
  document.body.classList.remove('nav-open');
  $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === active));
  v.innerHTML = `<div class="page${still ? ' still' : ''}">${html}</div>`;
  if (!still) scrollTo(0, 0);
  if (bind) bind(v);
}

function initSearch() {
  const i = $('#q'), box = $('#results');
  const close = () => { box.hidden = true; i.value = ''; i.blur(); };
  i.addEventListener('input', () => {
    const t = i.value.trim().toLowerCase();
    if (!t) { box.hidden = true; return; }
    const hits = MODULES.filter(m => `${m.name} ${m.desc} ${GROUPS[m.group]}`.toLowerCase().includes(t)).slice(0, 8);
    box.innerHTML = hits.length
      ? hits.map(m => `<a href="#/m/${m.id}">${icon(m.icon)}<span><b>${esc(m.name)}</b><small>${esc(GROUPS[m.group])}</small></span></a>`).join('')
      : '<p class="empty">Kein Modul gefunden. Die Suche in eigenen Inhalten folgt mit Lieferung 3.</p>';
    box.hidden = false;
  });
  i.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter') { const a = $('a', box); if (a && !box.hidden) { location.hash = a.getAttribute('href'); close(); } }
  });
  box.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) box.hidden = true; });
}

export function init() {
  $('#sidebar').innerHTML = `<div class="brand"><span class="logo">N</span><div><b>NOVA</b><small>All-in-One Plattform</small></div></div>
    <nav id="nav" aria-label="Hauptnavigation">${NAV.map(([k, n, ic]) => `<a href="#/${k}" data-nav="${k}">${icon(ic)}<span>${n}</span></a>`).join('')}</nav>
    <div class="side-foot">Version 0.1 · Grundgerüst</div>`;
  $('#menuBtn').innerHTML = icon('menu');
  $('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
  $('#scrim').onclick = () => document.body.classList.remove('nav-open');
  $('#view').addEventListener('click', e => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    toast(settings.toggleFav(b.dataset.fav) ? 'Zu Favoriten hinzugefügt' : 'Aus Favoriten entfernt');
    refresh();
  });
  initSearch();
}
