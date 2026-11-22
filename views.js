/* ANSICHTEN der Shell: Dashboard, Modulübersicht, Favoriten, Zuletzt verwendet, Modulseite, Einstellungen. */
import { MODULES, GROUPS, byId } from '../core/registry.js';
import { icon, esc, toast } from '../core/ui.js';
import * as st from '../core/settings.js';
import { show, every } from './shell.js';

const tag = m => m.href ? '<span class="tag ok">Bisherige Version verfügbar</span>'
  : m.live ? '<span class="tag ok">Verfügbar</span>' : `<span class="tag">Geplant · Stufe ${m.stufe}</span>`;
const tile = (m, i = 0) => `<div class="tile" style="--i:${Math.min(i, 12)}">
  <button class="star ${st.isFav(m.id) ? 'on' : ''}" data-fav="${m.id}" aria-label="Favorit umschalten" title="Favorit">${icon('star')}</button>
  <a class="tl" href="#/m/${m.id}"><span class="ti">${icon(m.icon)}</span><b>${esc(m.name)}</b><p>${esc(m.desc)}</p>${tag(m)}</a></div>`;
const tiles = list => `<div class="tiles">${list.map(tile).join('')}</div>`;
const empty = text => `<div class="card muted">${text}</div>`;
const ids = key => st.get(key).map(byId).filter(Boolean);

export function dashboard() {
  const h = new Date().getHours(), hi = h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend', name = st.get('name');
  const favs = ids('favorites'), rec = ids('recents').slice(0, 4);
  const quick = ['aufgaben', 'kalender', 'notizen', 'finanzen', 'vokabeln', 'creatorpilot'].map(byId);
  show('dashboard', `<section class="hero"><div><h1>${hi}${name ? ', ' + esc(name) : ''}</h1><p id="date" class="muted"></p></div><div class="clock" id="clock"></div></section>
    <h2 class="sec">Schnellzugriffe</h2>${tiles(quick)}
    <h2 class="sec">Favoriten</h2>${favs.length ? tiles(favs) : empty('Noch keine Favoriten. Tippe bei einem Modul auf den Stern.')}
    <h2 class="sec">Zuletzt verwendet</h2>${rec.length ? tiles(rec) : empty('Noch kein Modul geöffnet.')}
    <h2 class="sec">Widgets</h2><div class="card planned"><h3>Geplant</h3><p>Aufgabenübersicht, nächste Termine, persönliche Statistiken, Benachrichtigungen und anpassbare Widgets folgen, sobald die zugehörigen Module gebaut sind. Das Wetter bleibt ein optionales späteres Feature.</p></div>`,
  v => {
    const tick = () => {
      const d = new Date();
      v.querySelector('#clock').textContent = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      v.querySelector('#date').textContent = d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };
    tick(); every(tick, 15000);
  });
}

export function modules() {
  let i = 0;
  show('modules', `<h1>Modulübersicht</h1><p class="lead">${MODULES.length} Module in ${GROUPS.length} Bereichen. Die Plattform-Grundlage steht, die Module werden in Stufen ergänzt (Stufe 1 zuerst).</p>
    ${GROUPS.map((g, gi) => `<h2 class="sec">${esc(g)}</h2><div class="tiles">${MODULES.filter(m => m.group === gi).map(m => tile(m, i++)).join('')}</div>`).join('')}`);
}

export function favorites() {
  const f = ids('favorites');
  show('favorites', `<h1>Favoriten</h1>${f.length ? tiles(f) : empty('Noch keine Favoriten. Tippe in der Modulübersicht auf den Stern, um ein Modul hier anzuheften.')}`);
}

export function recent() {
  const r = ids('recents');
  show('recent', `<h1>Zuletzt verwendet</h1>${r.length ? tiles(r) : empty('Noch kein Modul geöffnet. Geöffnete Module erscheinen hier.')}`);
}

export function modulePage(id) {
  const m = byId(id);
  if (!m) { show('modules', `<h1>Modul nicht gefunden</h1><a class="btn" href="#/modules">Zur Modulübersicht</a>`); return; }
  st.pushRecent(id);
  const on = st.isFav(id);
  show('modules', `<a class="back" href="#/modules">${icon('left')} Modulübersicht</a>
    <section class="mhead"><span class="ti big">${icon(m.icon)}</span><div><h1>${esc(m.name)}</h1><p class="muted">${esc(GROUPS[m.group])}</p></div>
    <button class="btn ${on ? 'on' : ''}" data-fav="${m.id}">${icon('star')} ${on ? 'Favorit' : 'Favorisieren'}</button></section>
    <div class="card"><p>${esc(m.desc)}</p></div>
    ${m.href ? `<div class="card"><h3>Bisherige Version</h3><p>CreatorPilot läuft aktuell noch als eigene Seite. Alle Funktionen und deine gespeicherten Daten sind dort unverändert. Die Integration in NOVA folgt mit Lieferung 2.</p><a class="btn primary" href="${m.href}">CreatorPilot öffnen</a></div>`
      : `<div class="card planned"><h3>Geplant</h3><p>Dieses Modul ist noch nicht gebaut (Stufe ${m.stufe} von 4). Bis dahin gibt es hier bewusst keine Bedienelemente.</p></div>`}`);
}

export function settings() {
  show('settings', `<h1>Einstellungen</h1>
    <div class="card"><h3>Profil</h3><label>Name für die Begrüßung<input id="nm" maxlength="40" value="${esc(st.get('name'))}" placeholder="z. B. Alex"></label></div>
    <div class="card"><h3>Sprache und Darstellung</h3><label>Sprache<select id="lg"><option selected>Deutsch</option><option disabled>Englisch (geplant)</option><option disabled>Rumänisch (geplant)</option></select></label>
    <p class="muted small">Dark Mode ist der Standard und aktuell die einzige Darstellung.</p></div>
    <div class="card"><h3>Speicher und Datensicherung</h3>
    <p>Alle Daten liegen nur in diesem Browser auf diesem Gerät (IndexedDB und localStorage). Sie werden nicht synchronisiert. Sie können verloren gehen, wenn du Browserdaten löschst, der Gerätespeicher knapp wird oder du einen anderen Browser oder ein anderes Gerät nutzt. Export und Import als Sicherung folgen mit Lieferung 3.</p>
    <p id="usage" class="muted small"></p>
    <button class="btn" id="persist">Dauerhaften Speicher anfordern</button>
    <p class="muted small">Das senkt das Risiko eines automatischen Löschens, ersetzt aber keine Sicherung.</p></div>`,
  v => {
    v.querySelector('#nm').onchange = e => { st.set('name', e.target.value.trim()); toast('Gespeichert'); };
    const usage = v.querySelector('#usage'), mb = n => (n / 1048576).toFixed(1).replace('.', ',') + ' MB';
    if (navigator.storage && navigator.storage.estimate)
      navigator.storage.estimate().then(e => { usage.textContent = `Belegt: ${mb(e.usage || 0)} von etwa ${mb(e.quota || 0)} verfügbar.`; });
    v.querySelector('#persist').onclick = async () => {
      if (!(navigator.storage && navigator.storage.persist)) { toast('Dieser Browser unterstützt die Funktion nicht'); return; }
      toast(await navigator.storage.persist() ? 'Speicher als dauerhaft markiert' : 'Der Browser hat die Anfrage abgelehnt');
    };
  });
}
