/* OBERFLÄCHE + LOGIK: Router, Ansichten, Dialoge. Daten über CP.Storage, KI über CP.AI. */
(() => {
'use strict';
const S = CP.Storage, AI = CP.AI;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PLATFORMS = ['YouTube', 'TikTok', 'Instagram'];
const STATUS = ['Idee', 'Geplant', 'Veröffentlicht'];
const PSTATUS = ['Aktiv', 'Pausiert', 'Abgeschlossen'];
const pad = n => String(n).padStart(2, '0');
const dkey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayKey = () => { const t = new Date(); return dkey(t.getFullYear(), t.getMonth(), t.getDate()); };
const fmtDate = k => new Date(k + 'T00:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = iso => new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const opts = (list, sel) => list.map(v => `<option ${v === sel ? 'selected' : ''}>${esc(v)}</option>`).join('');

const ICONS = {
  home: '<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  text: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>'
};
const icon = n => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove('show'), 2000);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    const a = document.createElement('textarea'); a.value = text; document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); } catch (_) {} a.remove();
  }
  toast('Kopiert');
}

/* ---------- Dialog ---------- */
function modal({ title, body, onSave, onDelete }) {
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal-bg"><form class="modal"><h3>${title}</h3>${body}
    <div class="modal-actions">${onDelete ? '<button type="button" class="btn danger" data-del>Löschen</button>' : ''}<span class="sp"></span>
    <button type="button" class="btn ghost" data-close>Abbrechen</button><button class="btn primary">Speichern</button></div></form></div>`;
  const close = () => { root.innerHTML = ''; };
  const form = $('form', root);
  $('[data-close]', root).onclick = close;
  $('.modal-bg', root).addEventListener('click', e => { if (e.target.classList.contains('modal-bg')) close(); });
  if (onDelete) $('[data-del]', root).onclick = async () => { if (confirm('Wirklich löschen?')) { await onDelete(); close(); } };
  form.onsubmit = async e => { e.preventDefault(); await onSave(Object.fromEntries(new FormData(form))); close(); };
  const first = $('input,textarea', form); if (first) first.focus();
}

/* ---------- Ergebnisanzeige (Generatoren + Übersetzer) ---------- */
function showResult(out, res) {
  const p = AI.current(), items = res.items || [], tags = res.hashtags || [];
  out.innerHTML = `<div class="notice ${p.isDemo ? 'demo' : ''}">${p.isDemo ? 'Demo-Ergebnis: vorbereitete Vorlagen, keine echte KI.' : 'Erstellt von: ' + esc(p.label)}</div>
  <div class="results">${items.map((t, i) => `<div class="card result"><p>${esc(t)}</p><button class="icon-btn" data-i="${i}" aria-label="Kopieren" title="Kopieren">${icon('copy')}</button></div>`).join('')}</div>
  ${tags.length ? `<div class="card"><h3>Hashtag-Vorschläge</h3><div class="chips">${tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div><button class="btn ghost" id="copyTags">${icon('copy')} Alle kopieren</button></div>` : ''}`;
  $$('[data-i]', out).forEach(b => b.onclick = () => copy(items[b.dataset.i]));
  const ct = $('#copyTags', out); if (ct) ct.onclick = () => copy(tags.join(' '));
}
async function runTask(out, task, input, logText) {
  out.innerHTML = '<div class="card muted">Wird erstellt …</div>';
  try { showResult(out, await AI.run(task, input)); await S.log(logText); }
  catch (err) { out.innerHTML = `<div class="card error">Das hat nicht geklappt: ${esc(err.message)}. Prüfe die KI-Einstellung in ai.js.</div>`; }
}

/* ---------- Ansichten ---------- */
const GEN = {
  ideas: { label: 'Nische', ph: 'z. B. Home-Workouts für Anfänger', btn: 'Ideen generieren', sub: 'Gib deine Nische ein und erhalte mehrere Videoideen.' },
  titles: { label: 'Videothema', ph: 'z. B. Mein erstes Jahr als Creator', btn: 'Titel generieren', sub: 'Erstelle mehrere Titelvorschläge und kopiere den besten.' },
  descriptions: { label: 'Videothema', ph: 'z. B. Kamera-Setup für Anfänger', btn: 'Beschreibung generieren', sub: 'Erstelle Videobeschreibungen mit passenden Hashtags.' }
};
function viewGenerator(task, v) {
  const g = GEN[task];
  v.innerHTML = `<p class="lead">${g.sub}</p>
  <div class="card"><form id="gen" class="form-row">
    <label class="grow">${g.label}<input name="topic" required placeholder="${esc(g.ph)}"></label>
    <label>Plattform<select name="platform">${opts(PLATFORMS)}</select></label>
    <button class="btn primary">${icon('spark')} ${g.btn}</button></form></div><div id="out"></div>`;
  $('#gen', v).onsubmit = e => {
    e.preventDefault();
    const input = Object.fromEntries(new FormData(e.target));
    runTask($('#out', v), task, input, `${ROUTES[task].title}: „${input.topic}“`);
  };
}
function viewTranslator(v) {
  const L = { de: 'Deutsch', en: 'Englisch', ro: 'Rumänisch' };
  const lo = sel => Object.entries(L).map(([k, n]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${n}</option>`).join('');
  v.innerHTML = `<p class="lead">Übersetze Texte zwischen Deutsch, Englisch und Rumänisch.</p>
  <div class="card"><form id="tr"><div class="form-row"><label>Von<select name="from">${lo('de')}</select></label>
  <label>Nach<select name="to">${lo('en')}</select></label></div>
  <label>Text<textarea name="text" rows="5" required placeholder="Text hier eingeben …"></textarea></label>
  <button class="btn primary">${icon('globe')} Übersetzen</button></form></div><div id="out"></div>`;
  $('#tr', v).onsubmit = e => {
    e.preventDefault();
    const i = Object.fromEntries(new FormData(e.target));
    runTask($('#out', v), 'translate', i, `Übersetzung ${L[i.from]} → ${L[i.to]}`);
  };
}

let cal = { y: new Date().getFullYear(), m: new Date().getMonth() };
function openPost(post, projects, date) {
  const p = post || { date: date || todayKey(), platform: PLATFORMS[0], status: 'Geplant' };
  modal({
    title: post ? 'Beitrag bearbeiten' : 'Beitrag hinzufügen',
    body: `<label>Titel<input name="title" required value="${esc(p.title)}"></label>
    <div class="form-row"><label>Datum<input type="date" name="date" required value="${esc(p.date)}"></label>
    <label>Plattform<select name="platform">${opts(PLATFORMS, p.platform)}</select></label></div>
    <div class="form-row"><label>Status<select name="status">${opts(STATUS, p.status)}</select></label>
    <label>Projekt<select name="projectId"><option value="">Kein Projekt</option>${projects.map(x => `<option value="${x.id}" ${x.id === p.projectId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label></div>
    <label>Notizen<textarea name="notes" rows="3">${esc(p.notes)}</textarea></label>`,
    onSave: async f => {
      await S.save('posts', { ...(post ? { id: post.id } : {}), ...f });
      await S.log(`Beitrag ${post ? 'aktualisiert' : 'geplant'}: „${f.title}“`);
      toast('Gespeichert'); render();
    },
    onDelete: post && (async () => { await S.remove('posts', post.id); await S.log(`Beitrag gelöscht: „${post.title}“`); toast('Gelöscht'); render(); })
  });
}
async function viewCalendar(v) {
  const [posts, projects] = await Promise.all([S.list('posts'), S.list('projects')]);
  const first = new Date(cal.y, cal.m, 1), offset = (first.getDay() + 6) % 7, days = new Date(cal.y, cal.m + 1, 0).getDate(), tk = todayKey();
  let cells = '<div class="day empty"></div>'.repeat(offset);
  for (let d = 1; d <= days; d++) {
    const k = dkey(cal.y, cal.m, d), ps = posts.filter(p => p.date === k);
    cells += `<div class="day ${k === tk ? 'today' : ''}" data-date="${k}"><span class="dn">${d}</span>${ps.map(p => `<button class="pill s${STATUS.indexOf(p.status)}" data-id="${p.id}" title="${esc(p.platform)}">${esc(p.title)}</button>`).join('')}</div>`;
  }
  v.innerHTML = `<div class="bar"><button class="icon-btn" id="prev" aria-label="Vorheriger Monat">${icon('left')}</button>
  <h2>${first.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</h2>
  <button class="icon-btn" id="next" aria-label="Nächster Monat">${icon('right')}</button><span class="sp"></span>
  <button class="btn primary" id="addPost">${icon('plus')} Beitrag</button></div>
  <div class="card cal"><div class="dow">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(x => `<span>${x}</span>`).join('')}</div><div class="days">${cells}</div></div>
  <p class="muted small">Tippe auf einen Tag, um einen Beitrag zu planen, oder auf einen Beitrag, um ihn zu bearbeiten.</p>`;
  const shift = n => { cal.m += n; if (cal.m < 0) { cal.m = 11; cal.y--; } if (cal.m > 11) { cal.m = 0; cal.y++; } render(); };
  $('#prev', v).onclick = () => shift(-1); $('#next', v).onclick = () => shift(1);
  $('#addPost', v).onclick = () => openPost(null, projects);
  $('.days', v).onclick = e => {
    const pill = e.target.closest('.pill'), day = e.target.closest('.day[data-date]');
    if (pill) openPost(posts.find(p => p.id === pill.dataset.id), projects);
    else if (day) openPost(null, projects, day.dataset.date);
  };
}

function projectCard(p, posts, actions) {
  const n = posts.filter(x => x.projectId === p.id).length;
  return `<div class="card project" data-name="${esc(p.name.toLowerCase())}"><div class="bar"><h3>${esc(p.name)}</h3><span class="sp"></span><span class="tag st-${PSTATUS.indexOf(p.status)}">${esc(p.status)}</span></div>
  <p class="muted">${esc(p.description) || 'Keine Beschreibung'}</p>
  <div class="bar"><span class="muted small">${esc(p.platform)} · ${n} Beitrag${n === 1 ? '' : 'e'}</span><span class="sp"></span>
  ${actions ? `<button class="icon-btn" data-edit="${p.id}" aria-label="Bearbeiten">${icon('edit')}</button><button class="icon-btn" data-del="${p.id}" aria-label="Löschen">${icon('trash')}</button>` : ''}</div></div>`;
}
function openProject(p) {
  const x = p || { platform: PLATFORMS[0], status: 'Aktiv' };
  modal({
    title: p ? 'Projekt bearbeiten' : 'Projekt erstellen',
    body: `<label>Name<input name="name" required value="${esc(x.name)}"></label>
    <label>Beschreibung<textarea name="description" rows="3">${esc(x.description)}</textarea></label>
    <div class="form-row"><label>Hauptplattform<select name="platform">${opts(PLATFORMS, x.platform)}</select></label>
    <label>Status<select name="status">${opts(PSTATUS, x.status)}</select></label></div>`,
    onSave: async f => { await S.save('projects', { ...(p ? { id: p.id } : {}), ...f }); await S.log(`Projekt ${p ? 'aktualisiert' : 'erstellt'}: „${f.name}“`); toast('Gespeichert'); render(); }
  });
}
async function viewProjects(v) {
  const [projects, posts] = await Promise.all([S.list('projects'), S.list('posts')]);
  v.innerHTML = `<div class="bar"><input id="q" class="search" type="search" placeholder="Projekte suchen …"><span class="sp"></span>
  <button class="btn primary" id="addProj">${icon('plus')} Neues Projekt</button></div>
  <div class="grid cards" id="plist">${projects.length ? projects.map(p => projectCard(p, posts, true)).join('') : '<div class="card muted">Noch keine Projekte. Erstelle dein erstes Projekt mit „Neues Projekt“.</div>'}</div>`;
  $('#addProj', v).onclick = () => openProject();
  $('#q', v).oninput = e => $$('.project', v).forEach(c => c.style.display = c.dataset.name.includes(e.target.value.toLowerCase()) ? '' : 'none');
  $('#plist', v).onclick = async e => {
    const ed = e.target.closest('[data-edit]'), de = e.target.closest('[data-del]');
    if (ed) openProject(projects.find(p => p.id === ed.dataset.edit));
    if (de && confirm('Projekt wirklich löschen?')) {
      const p = projects.find(x => x.id === de.dataset.del);
      await S.remove('projects', p.id); await S.log(`Projekt gelöscht: „${p.name}“`); toast('Gelöscht'); render();
    }
  };
}

async function viewDashboard(v) {
  const [projects, posts, acts] = await Promise.all([S.list('projects'), S.list('posts'), S.list('activity')]);
  const h = new Date().getHours(), hi = h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend', tk = todayKey();
  const upcoming = posts.filter(p => p.date >= tk && p.status !== 'Veröffentlicht').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const stat = (n, l) => `<div class="card stat"><b>${n}</b><span>${l}</span></div>`;
  v.innerHTML = `<div class="hero"><div><h2>${hi}, Creator</h2><p>Plane deine Inhalte, finde neue Ideen und behalte alle Projekte im Blick.</p></div>
  <a class="btn primary" href="#ideas">${icon('spark')} Ideen finden</a></div>
  <div class="grid stats">${stat(projects.length, 'Projekte')}${stat(posts.filter(p => p.status === 'Geplant').length, 'Geplante Beiträge')}${stat(posts.filter(p => p.status === 'Veröffentlicht').length, 'Veröffentlicht')}${stat(posts.filter(p => p.status === 'Idee').length, 'Ideen')}</div>
  <h3 class="sec">Schnellzugriffe</h3>
  <div class="grid quick">${['ideas', 'titles', 'descriptions', 'translator', 'calendar', 'projects'].map(k => `<a class="card quick-item" href="#${k}">${icon(ROUTES[k].icon)}<span>${ROUTES[k].title}</span></a>`).join('')}</div>
  <div class="grid two">
    <div class="card"><h3>Nächste Veröffentlichungen</h3>${upcoming.length ? upcoming.map(p => `<div class="row"><span>${esc(p.title)}</span><span class="muted small">${fmtDate(p.date)} · ${esc(p.platform)}</span></div>`).join('') : '<p class="muted">Noch nichts geplant. <a href="#calendar">Beitrag planen</a></p>'}</div>
    <div class="card"><h3>Letzte Aktivität</h3>${acts.length ? acts.slice(0, 6).map(a => `<div class="row"><span>${esc(a.text)}</span><span class="muted small">${fmtTime(a.at)}</span></div>`).join('') : '<p class="muted">Noch keine Aktivität. Nutze einen Generator oder lege ein Projekt an.</p>'}</div>
  </div>
  <h3 class="sec">Deine Projekte</h3>
  <div class="grid cards">${projects.length ? projects.map(p => projectCard(p, posts, false)).join('') : '<div class="card muted">Noch keine Projekte. <a href="#projects">Projekt erstellen</a></div>'}</div>`;
}

/* ---------- Router ---------- */
const ROUTES = {
  dashboard: { title: 'Dashboard', icon: 'home', render: viewDashboard },
  ideas: { title: 'Idea Generator', icon: 'bulb', render: v => viewGenerator('ideas', v) },
  titles: { title: 'Title Generator', icon: 'type', render: v => viewGenerator('titles', v) },
  descriptions: { title: 'Description Generator', icon: 'text', render: v => viewGenerator('descriptions', v) },
  translator: { title: 'Translator', icon: 'globe', render: viewTranslator },
  calendar: { title: 'Content Calendar', icon: 'cal', render: viewCalendar },
  projects: { title: 'Projects', icon: 'folder', render: viewProjects }
};
async function render() {
  const hash = location.hash.slice(1), key = ROUTES[hash] ? hash : 'dashboard', r = ROUTES[key];
  $('#pageTitle').textContent = r.title;
  $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.r === key));
  document.body.classList.remove('nav-open');
  try { await r.render($('#view')); }
  catch (e) { console.error(e); $('#view').innerHTML = '<div class="card error">Die Ansicht konnte nicht geladen werden. Lade die Seite neu.</div>'; }
}
function init() {
  $('#nav').innerHTML = Object.entries(ROUTES).map(([k, r]) => `<a href="#${k}" data-r="${k}">${icon(r.icon)}<span>${r.title}</span></a>`).join('');
  const p = AI.current();
  $$('.mode-badge').forEach(b => { b.textContent = p.isDemo ? 'Demo-Modus: keine KI aktiv' : 'KI: ' + p.label; b.classList.toggle('demo', p.isDemo); });
  $('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
  $('#scrim').onclick = () => document.body.classList.remove('nav-open');
  window.addEventListener('hashchange', render);
  render();
}
init();
})();
